import { BadRequestException, Injectable } from '@nestjs/common';
import { ComplaintStatus, OrderStatus, ReturnStatus } from '@prisma/client';
import { customAlphabet } from 'nanoid';
import { paginationMeta } from '../../common/pagination';
import { PrismaService } from '../../database/prisma.service';
import { AuditService } from '../audit/audit.service';

const sequence = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 8);

@Injectable()
export class SupportService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async listComplaints(query: { page: number; limit: number }) {
    const [data, total] = await this.prisma.$transaction([
      this.prisma.complaint.findMany({
        include: {
          salesOrder: { include: { customer: true } },
          messages: { orderBy: { createdAt: 'asc' } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      this.prisma.complaint.count(),
    ]);
    return { data, meta: paginationMeta(query.page, query.limit, total) };
  }

  async createComplaint(data: any, actorId: string) {
    const { message, ...complaintData } = data;
    const order = await this.prisma.salesOrder.findUniqueOrThrow({
      where: { id: data.salesOrderId },
    });
    if (order.status !== OrderStatus.DELIVERED && order.status !== OrderStatus.COMPLETED) {
      throw new BadRequestException('Keluhan order hanya dapat dibuat setelah pengiriman');
    }
    const complaint = await this.prisma.complaint.create({
      data: {
        ...complaintData,
        ticketNumber: `CMP-${sequence()}`,
        createdById: actorId,
        messages: { create: { senderId: actorId, message } },
      },
      include: { messages: true },
    });
    await this.audit.record({
      actorId,
      action: 'COMPLAINT_CREATED',
      entity: 'Complaint',
      entityId: complaint.id,
    });
    return complaint;
  }

  addMessage(complaintId: string, message: string, senderId: string) {
    return this.prisma.complaintMessage.create({ data: { complaintId, senderId, message } });
  }

  async updateComplaintStatus(id: string, status: ComplaintStatus, actorId: string) {
    const complaint = await this.prisma.complaint.update({ where: { id }, data: { status } });
    await this.audit.record({
      actorId,
      action: 'COMPLAINT_STATUS_CHANGED',
      entity: 'Complaint',
      entityId: id,
      metadata: { status },
    });
    return complaint;
  }

  async listReturns(query: { page: number; limit: number }) {
    const [data, total] = await this.prisma.$transaction([
      this.prisma.return.findMany({
        include: {
          salesOrder: { include: { customer: true } },
          items: { include: { product: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      this.prisma.return.count(),
    ]);
    return { data, meta: paginationMeta(query.page, query.limit, total) };
  }

  async createReturn(data: any, actorId: string) {
    const order = await this.prisma.salesOrder.findUniqueOrThrow({
      where: { id: data.salesOrderId },
      include: { items: true },
    });
    if (order.status !== OrderStatus.DELIVERED && order.status !== OrderStatus.COMPLETED) {
      throw new BadRequestException('Retur hanya dapat diajukan untuk order delivered/completed');
    }
    const itemMap = new Map(order.items.map((item) => [item.id, item]));
    const items = data.items.map((item: any) => {
      const orderItem = itemMap.get(item.salesOrderItemId);
      if (!orderItem || item.quantity > orderItem.quantity) {
        throw new BadRequestException('Item retur tidak valid atau melebihi jumlah pembelian');
      }
      return { ...item, productId: orderItem.productId };
    });
    const created = await this.prisma.return.create({
      data: {
        returnNumber: `RET-${sequence()}`,
        salesOrderId: data.salesOrderId,
        reason: data.reason,
        resolution: data.resolution,
        items: { create: items },
      },
      include: { items: true },
    });
    await this.audit.record({
      actorId,
      action: 'RETURN_CREATED',
      entity: 'Return',
      entityId: created.id,
    });
    return created;
  }

  async updateReturnStatus(id: string, status: ReturnStatus, actorId: string) {
    const result = await this.prisma.return.update({ where: { id }, data: { status } });
    await this.audit.record({
      actorId,
      action: 'RETURN_STATUS_CHANGED',
      entity: 'Return',
      entityId: id,
      metadata: { status },
    });
    return result;
  }
}
