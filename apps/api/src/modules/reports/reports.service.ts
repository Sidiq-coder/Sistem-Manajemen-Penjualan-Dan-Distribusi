import { Injectable } from '@nestjs/common';
import { OrderStatus, PaymentStatus, ShipmentStatus } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async dashboard() {
    const [paidRevenue, orderCount, customerCount, lowStock, pendingShipments, openComplaints] =
      await Promise.all([
        this.prisma.payment.aggregate({
          where: { status: PaymentStatus.PAID },
          _sum: { amount: true },
        }),
        this.prisma.salesOrder.count(),
        this.prisma.customer.count({ where: { deletedAt: null } }),
        this.prisma.$queryRaw<Array<{ count: bigint }>>`
          SELECT COUNT(*)::bigint AS count
          FROM inventory_balances ib
          JOIN products p ON p.id = ib.product_id
          WHERE (ib.quantity - ib.reserved) <= p.minimum_stock
        `,
        this.prisma.shipment.count({
          where: {
            status: { notIn: [ShipmentStatus.DELIVERED, ShipmentStatus.RETURNED_TO_WAREHOUSE] },
          },
        }),
        this.prisma.complaint.count({ where: { status: { in: ['OPEN', 'IN_PROGRESS'] } } }),
      ]);
    return {
      revenue: paidRevenue._sum.amount ?? 0,
      orderCount,
      customerCount,
      lowStockCount: Number(lowStock[0]?.count ?? 0),
      pendingShipments,
      openComplaints,
    };
  }

  async salesSummary(from: Date, to: Date) {
    const orders = await this.prisma.salesOrder.findMany({
      where: {
        createdAt: { gte: from, lte: to },
        status: { not: OrderStatus.CANCELLED },
      },
      select: { createdAt: true, grandTotal: true, status: true },
      orderBy: { createdAt: 'asc' },
    });
    const daily = new Map<string, { date: string; orders: number; revenue: number }>();
    for (const order of orders) {
      const date = order.createdAt.toISOString().slice(0, 10);
      const item = daily.get(date) ?? { date, orders: 0, revenue: 0 };
      item.orders += 1;
      if (
        order.status === OrderStatus.PAID ||
        order.status === OrderStatus.SHIPPED ||
        order.status === OrderStatus.DELIVERED ||
        order.status === OrderStatus.COMPLETED
      ) {
        item.revenue += order.grandTotal;
      }
      daily.set(date, item);
    }
    return Array.from(daily.values());
  }

  async topProducts(from: Date, to: Date) {
    return this.prisma.salesOrderItem.groupBy({
      by: ['productId'],
      where: {
        salesOrder: {
          createdAt: { gte: from, lte: to },
          status: { not: OrderStatus.CANCELLED },
        },
      },
      _sum: { quantity: true, subtotal: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 10,
    });
  }

  inventory() {
    return this.prisma.inventoryBalance.findMany({
      include: { product: true, warehouse: true },
      orderBy: { quantity: 'asc' },
    });
  }

  shipmentPerformance(from: Date, to: Date) {
    return this.prisma.shipment.groupBy({
      by: ['status'],
      where: { createdAt: { gte: from, lte: to } },
      _count: { _all: true },
    });
  }
}
