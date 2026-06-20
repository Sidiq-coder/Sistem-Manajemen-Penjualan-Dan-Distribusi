import { BadRequestException, Injectable } from '@nestjs/common';
import { InventoryMovementType, OrderStatus, Prisma, ShipmentStatus } from '@prisma/client';
import { customAlphabet } from 'nanoid';
import { paginationMeta } from '../../common/pagination';
import { PrismaService } from '../../database/prisma.service';
import { AuditService } from '../audit/audit.service';

const sequence = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 8);
const transitions: Record<ShipmentStatus, ShipmentStatus[]> = {
  PENDING: ['SCHEDULED', 'PICKED_UP'],
  SCHEDULED: ['PICKED_UP'],
  PICKED_UP: ['IN_TRANSIT'],
  IN_TRANSIT: ['DELIVERED', 'FAILED_DELIVERY'],
  FAILED_DELIVERY: ['IN_TRANSIT', 'RETURNED_TO_WAREHOUSE'],
  DELIVERED: [],
  RETURNED_TO_WAREHOUSE: [],
};

@Injectable()
export class ShipmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async list(query: { page: number; limit: number; search?: string }) {
    const where: Prisma.ShipmentWhereInput = query.search
      ? {
          OR: [
            { shipmentNumber: { contains: query.search, mode: 'insensitive' } },
            { trackingNumber: { contains: query.search, mode: 'insensitive' } },
          ],
        }
      : {};
    const [data, total] = await this.prisma.$transaction([
      this.prisma.shipment.findMany({
        where,
        include: { salesOrder: { include: { customer: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      this.prisma.shipment.count({ where }),
    ]);
    return { data, meta: paginationMeta(query.page, query.limit, total) };
  }

  detail(id: string) {
    return this.prisma.shipment.findUniqueOrThrow({
      where: { id },
      include: {
        events: { orderBy: { createdAt: 'desc' } },
        salesOrder: { include: { customer: true, items: { include: { product: true } } } },
      },
    });
  }

  async create(data: any, actorId: string) {
    const shipment = await this.prisma.$transaction(async (tx) => {
      const order = await tx.salesOrder.findUniqueOrThrow({
        where: { id: data.salesOrderId },
        include: { reservations: { where: { releasedAt: null } } },
      });
      if (order.status !== OrderStatus.PAID && order.status !== OrderStatus.READY_TO_SHIP) {
        throw new BadRequestException('Shipment hanya dapat dibuat untuk order paid/ready to ship');
      }
      for (const reservation of order.reservations) {
        const balance = await tx.inventoryBalance.findUniqueOrThrow({
          where: {
            warehouseId_productId: {
              warehouseId: reservation.warehouseId,
              productId: reservation.productId,
            },
          },
        });
        if (balance.quantity < reservation.quantity || balance.reserved < reservation.quantity) {
          throw new BadRequestException('Konsistensi reservasi stok tidak valid');
        }
        const updated = await tx.inventoryBalance.update({
          where: { id: balance.id },
          data: {
            quantity: { decrement: reservation.quantity },
            reserved: { decrement: reservation.quantity },
          },
        });
        await tx.stockReservation.update({
          where: { id: reservation.id },
          data: { releasedAt: new Date() },
        });
        await tx.inventoryMovement.create({
          data: {
            warehouseId: reservation.warehouseId,
            productId: reservation.productId,
            type: InventoryMovementType.SALE,
            quantity: -reservation.quantity,
            balanceAfter: updated.quantity,
            reference: order.orderNumber,
            actorId,
          },
        });
      }
      const created = await tx.shipment.create({
        data: {
          ...data,
          scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
          shipmentNumber: `SHP-${new Date().toISOString().slice(0, 10).replaceAll('-', '')}-${sequence()}`,
          events: { create: { status: ShipmentStatus.PENDING, note: 'Shipment dibuat' } },
        },
      });
      await tx.salesOrder.update({
        where: { id: order.id },
        data: { status: OrderStatus.READY_TO_SHIP },
      });
      return created;
    });
    await this.audit.record({
      actorId,
      action: 'SHIPMENT_CREATED',
      entity: 'Shipment',
      entityId: shipment.id,
    });
    return shipment;
  }

  async updateStatus(
    id: string,
    data: { status: ShipmentStatus; note?: string; location?: string },
    actorId: string,
  ) {
    const shipment = await this.prisma.$transaction(async (tx) => {
      const current = await tx.shipment.findUniqueOrThrow({ where: { id } });
      if (!transitions[current.status].includes(data.status)) {
        throw new BadRequestException(
          `Transisi ${current.status} ke ${data.status} tidak diizinkan`,
        );
      }
      const updated = await tx.shipment.update({
        where: { id },
        data: {
          status: data.status,
          ...(data.status === ShipmentStatus.DELIVERED ? { deliveredAt: new Date() } : {}),
        },
      });
      await tx.shipmentEvent.create({
        data: { shipmentId: id, status: data.status, note: data.note, location: data.location },
      });
      const orderStatus =
        data.status === ShipmentStatus.DELIVERED
          ? OrderStatus.DELIVERED
          : data.status === ShipmentStatus.PICKED_UP || data.status === ShipmentStatus.IN_TRANSIT
            ? OrderStatus.SHIPPED
            : undefined;
      if (orderStatus) {
        await tx.salesOrder.update({
          where: { id: current.salesOrderId },
          data: { status: orderStatus },
        });
      }
      return updated;
    });
    await this.audit.record({
      actorId,
      action: 'SHIPMENT_STATUS_CHANGED',
      entity: 'Shipment',
      entityId: id,
      metadata: { status: data.status },
    });
    return shipment;
  }
}
