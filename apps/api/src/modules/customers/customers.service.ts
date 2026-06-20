import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { paginationMeta } from '../../common/pagination';
import { PrismaService } from '../../database/prisma.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class CustomersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async list(query: { page: number; limit: number; search?: string }) {
    const where: Prisma.CustomerWhereInput = {
      deletedAt: null,
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: 'insensitive' } },
              { code: { contains: query.search, mode: 'insensitive' } },
              { phone: { contains: query.search } },
            ],
          }
        : {}),
    };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.customer.findMany({
        where,
        include: { addresses: { where: { isPrimary: true }, take: 1 } },
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      this.prisma.customer.count({ where }),
    ]);
    return { data, meta: paginationMeta(query.page, query.limit, total) };
  }

  detail(id: string) {
    return this.prisma.customer.findFirstOrThrow({
      where: { id, deletedAt: null },
      include: {
        addresses: true,
        orders: { orderBy: { createdAt: 'desc' }, take: 20 },
      },
    });
  }

  orders(id: string) {
    return this.prisma.salesOrder.findMany({
      where: { customerId: id },
      include: { items: { include: { product: true } }, invoice: true, shipment: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: any, actorId: string) {
    const { address, city, province, ...customerData } = data;
    const customer = await this.prisma.customer.create({
      data: {
        ...customerData,
        addresses: { create: { address, city, province, label: 'Utama', isPrimary: true } },
      },
      include: { addresses: true },
    });
    await this.audit.record({
      actorId,
      action: 'CUSTOMER_CREATED',
      entity: 'Customer',
      entityId: customer.id,
    });
    return customer;
  }

  async update(id: string, data: any, actorId: string) {
    const { address, city, province, ...customerData } = data;
    const customer = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.customer.update({ where: { id }, data: customerData });
      if (address || city || province) {
        const primary = await tx.customerAddress.findFirst({
          where: { customerId: id, isPrimary: true },
        });
        if (primary) {
          await tx.customerAddress.update({
            where: { id: primary.id },
            data: {
              ...(address ? { address } : {}),
              ...(city ? { city } : {}),
              ...(province ? { province } : {}),
            },
          });
        }
      }
      return updated;
    });
    await this.audit.record({
      actorId,
      action: 'CUSTOMER_UPDATED',
      entity: 'Customer',
      entityId: id,
    });
    return customer;
  }

  async remove(id: string, actorId: string) {
    const customer = await this.prisma.customer.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    await this.audit.record({
      actorId,
      action: 'CUSTOMER_ARCHIVED',
      entity: 'Customer',
      entityId: id,
    });
    return customer;
  }
}
