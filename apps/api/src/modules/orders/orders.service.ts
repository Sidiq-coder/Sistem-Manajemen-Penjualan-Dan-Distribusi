import { BadRequestException, Injectable } from '@nestjs/common';
import { InventoryMovementType, OrderStatus, Prisma } from '@prisma/client';
import { customAlphabet } from 'nanoid';
import { paginationMeta } from '../../common/pagination';
import { PrismaService } from '../../database/prisma.service';
import { AuditService } from '../audit/audit.service';
import { calculateOrder } from './order-calculator';

const sequence = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 8);

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async list(query: { page: number; limit: number; search?: string }) {
    const where: Prisma.SalesOrderWhereInput = query.search
      ? {
          OR: [
            { orderNumber: { contains: query.search, mode: 'insensitive' } },
            { customer: { name: { contains: query.search, mode: 'insensitive' } } },
          ],
        }
      : {};
    const [data, total] = await this.prisma.$transaction([
      this.prisma.salesOrder.findMany({
        where,
        include: { customer: true, warehouse: true, invoice: true, shipment: true },
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      this.prisma.salesOrder.count({ where }),
    ]);
    return { data, meta: paginationMeta(query.page, query.limit, total) };
  }

  detail(id: string) {
    return this.prisma.salesOrder.findUniqueOrThrow({
      where: { id },
      include: {
        customer: { include: { addresses: true } },
        warehouse: true,
        items: { include: { product: true } },
        invoice: { include: { payments: true } },
        shipment: { include: { events: true } },
      },
    });
  }

  async create(data: any, actorId: string, idempotencyKey?: string) {
    if (idempotencyKey) {
      const existing = await this.prisma.salesOrder.findFirst({ where: { idempotencyKey } });
      if (existing) return existing;
    }
    const productIds = [...new Set<string>(data.items.map((item: any) => item.productId))];
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds }, isActive: true, deletedAt: null },
    });
    if (products.length !== productIds.length) {
      throw new BadRequestException('Satu atau lebih produk tidak valid');
    }
    const priceMap = new Map(products.map((product) => [product.id, product.sellingPrice]));
    const pricedItems = data.items.map((item: any) => {
      const unitPrice = priceMap.get(item.productId)!;
      return { ...item, unitPrice };
    });
    let totals;
    try {
      totals = calculateOrder(pricedItems, data.discountAmount, data.taxRate);
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Kalkulasi order gagal',
      );
    }
    const order = await this.prisma.salesOrder.create({
      data: {
        orderNumber: `SO-${new Date().toISOString().slice(0, 10).replaceAll('-', '')}-${sequence()}`,
        customerId: data.customerId,
        warehouseId: data.warehouseId,
        createdById: actorId,
        channel: data.channel,
        subtotal: totals.subtotal,
        discountAmount: totals.discountAmount,
        taxAmount: totals.taxAmount,
        grandTotal: totals.grandTotal,
        notes: data.notes,
        idempotencyKey,
        items: { create: totals.items },
      },
      include: { items: true },
    });
    await this.audit.record({
      actorId,
      action: 'SALES_ORDER_CREATED',
      entity: 'SalesOrder',
      entityId: order.id,
      metadata: { orderNumber: order.orderNumber, grandTotal: totals.grandTotal },
    });
    return order;
  }

  async confirm(id: string, actorId: string) {
    const order = await this.prisma.$transaction(async (tx) => {
      const current = await tx.salesOrder.findUniqueOrThrow({
        where: { id },
        include: { items: true, invoice: true },
      });
      if (
        current.status !== OrderStatus.DRAFT &&
        current.status !== OrderStatus.PENDING_CONFIRMATION
      ) {
        throw new BadRequestException('Order tidak berada pada status yang dapat dikonfirmasi');
      }
      for (const item of current.items) {
        const balance = await tx.inventoryBalance.findUnique({
          where: {
            warehouseId_productId: {
              warehouseId: current.warehouseId,
              productId: item.productId,
            },
          },
        });
        if (!balance || balance.quantity - balance.reserved < item.quantity) {
          throw new BadRequestException(`Stok tidak cukup untuk produk ${item.productId}`);
        }
        await tx.inventoryBalance.update({
          where: { id: balance.id },
          data: { reserved: { increment: item.quantity } },
        });
        await tx.stockReservation.create({
          data: {
            salesOrderId: current.id,
            warehouseId: current.warehouseId,
            productId: item.productId,
            quantity: item.quantity,
          },
        });
        await tx.inventoryMovement.create({
          data: {
            warehouseId: current.warehouseId,
            productId: item.productId,
            type: InventoryMovementType.RESERVATION,
            quantity: item.quantity,
            balanceAfter: balance.quantity,
            reference: current.orderNumber,
            actorId,
          },
        });
      }
      const updated = await tx.salesOrder.update({
        where: { id },
        data: { status: OrderStatus.WAITING_PAYMENT, confirmedAt: new Date() },
      });
      if (!current.invoice) {
        await tx.invoice.create({
          data: {
            invoiceNumber: `INV-${new Date().toISOString().slice(0, 10).replaceAll('-', '')}-${sequence()}`,
            salesOrderId: id,
            amount: current.grandTotal,
            dueAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        });
      }
      return updated;
    });
    await this.audit.record({
      actorId,
      action: 'SALES_ORDER_CONFIRMED',
      entity: 'SalesOrder',
      entityId: id,
    });
    return this.detail(order.id);
  }

  async cancel(id: string, actorId: string) {
    const order = await this.prisma.$transaction(async (tx) => {
      const current = await tx.salesOrder.findUniqueOrThrow({
        where: { id },
        include: { reservations: { where: { releasedAt: null } } },
      });
      if (
        current.status === OrderStatus.SHIPPED ||
        current.status === OrderStatus.DELIVERED ||
        current.status === OrderStatus.COMPLETED
      ) {
        throw new BadRequestException('Order yang sudah dikirim tidak dapat dibatalkan');
      }
      for (const reservation of current.reservations) {
        const balance = await tx.inventoryBalance.update({
          where: {
            warehouseId_productId: {
              warehouseId: reservation.warehouseId,
              productId: reservation.productId,
            },
          },
          data: { reserved: { decrement: reservation.quantity } },
        });
        await tx.stockReservation.update({
          where: { id: reservation.id },
          data: { releasedAt: new Date() },
        });
        await tx.inventoryMovement.create({
          data: {
            warehouseId: reservation.warehouseId,
            productId: reservation.productId,
            type: InventoryMovementType.RESERVATION_RELEASE,
            quantity: reservation.quantity,
            balanceAfter: balance.quantity,
            reference: current.orderNumber,
            actorId,
          },
        });
      }
      return tx.salesOrder.update({
        where: { id },
        data: { status: OrderStatus.CANCELLED, cancelledAt: new Date() },
      });
    });
    await this.audit.record({
      actorId,
      action: 'SALES_ORDER_CANCELLED',
      entity: 'SalesOrder',
      entityId: id,
    });
    return order;
  }
}
