import { BadRequestException, Injectable } from '@nestjs/common';
import { InventoryMovementType, Prisma } from '@prisma/client';
import { paginationMeta } from '../../common/pagination';
import { PrismaService } from '../../database/prisma.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class InventoryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  listWarehouses() {
    return this.prisma.warehouse.findMany({
      where: { deletedAt: null },
      orderBy: { name: 'asc' },
    });
  }

  async createWarehouse(data: Prisma.WarehouseCreateInput, actorId: string) {
    const warehouse = await this.prisma.warehouse.create({ data });
    await this.audit.record({
      actorId,
      action: 'WAREHOUSE_CREATED',
      entity: 'Warehouse',
      entityId: warehouse.id,
    });
    return warehouse;
  }

  async updateWarehouse(id: string, data: Prisma.WarehouseUpdateInput, actorId: string) {
    const warehouse = await this.prisma.warehouse.update({ where: { id }, data });
    await this.audit.record({
      actorId,
      action: 'WAREHOUSE_UPDATED',
      entity: 'Warehouse',
      entityId: id,
    });
    return warehouse;
  }

  async listInventory(query: { page: number; limit: number; search?: string }) {
    const where: Prisma.InventoryBalanceWhereInput = query.search
      ? {
          OR: [
            { product: { name: { contains: query.search, mode: 'insensitive' } } },
            { product: { sku: { contains: query.search, mode: 'insensitive' } } },
            { warehouse: { name: { contains: query.search, mode: 'insensitive' } } },
          ],
        }
      : {};
    const [data, total] = await this.prisma.$transaction([
      this.prisma.inventoryBalance.findMany({
        where,
        include: { product: true, warehouse: true },
        orderBy: { updatedAt: 'desc' },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      this.prisma.inventoryBalance.count({ where }),
    ]);
    return {
      data: data.map((row) => ({
        ...row,
        available: row.quantity - row.reserved,
        lowStock: row.quantity - row.reserved <= row.product.minimumStock,
      })),
      meta: paginationMeta(query.page, query.limit, total),
    };
  }

  byProduct(productId: string) {
    return this.prisma.inventoryBalance.findMany({
      where: { productId },
      include: { warehouse: true, product: true },
    });
  }

  async listMovements(query: { page: number; limit: number; search?: string }) {
    const where: Prisma.InventoryMovementWhereInput = query.search
      ? { reference: { contains: query.search, mode: 'insensitive' } }
      : {};
    const [data, total] = await this.prisma.$transaction([
      this.prisma.inventoryMovement.findMany({
        where,
        include: { product: true, warehouse: true },
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      this.prisma.inventoryMovement.count({ where }),
    ]);
    return { data, meta: paginationMeta(query.page, query.limit, total) };
  }

  async adjust(
    data: { warehouseId: string; productId: string; quantity: number; reason: string },
    actorId: string,
  ) {
    const balance = await this.prisma.$transaction(async (tx) => {
      const current = await tx.inventoryBalance.upsert({
        where: {
          warehouseId_productId: {
            warehouseId: data.warehouseId,
            productId: data.productId,
          },
        },
        update: {},
        create: { warehouseId: data.warehouseId, productId: data.productId },
      });
      const nextQuantity = current.quantity + data.quantity;
      if (nextQuantity < current.reserved || nextQuantity < 0) {
        throw new BadRequestException(
          'Penyesuaian menyebabkan stok negatif atau di bawah reservasi',
        );
      }
      const updated = await tx.inventoryBalance.update({
        where: { id: current.id },
        data: { quantity: nextQuantity },
      });
      await tx.inventoryMovement.create({
        data: {
          warehouseId: data.warehouseId,
          productId: data.productId,
          type:
            data.quantity > 0
              ? InventoryMovementType.ADJUSTMENT_IN
              : InventoryMovementType.ADJUSTMENT_OUT,
          quantity: data.quantity,
          balanceAfter: nextQuantity,
          reason: data.reason,
          actorId,
        },
      });
      return updated;
    });
    await this.audit.record({
      actorId,
      action: 'INVENTORY_ADJUSTED',
      entity: 'InventoryBalance',
      entityId: balance.id,
      metadata: data,
    });
    return { ...balance, available: balance.quantity - balance.reserved };
  }
}
