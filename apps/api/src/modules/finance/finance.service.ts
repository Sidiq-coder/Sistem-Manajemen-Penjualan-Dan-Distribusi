import { BadRequestException, Injectable } from '@nestjs/common';
import { InvoiceStatus, OrderStatus, PaymentStatus, Prisma } from '@prisma/client';
import { customAlphabet } from 'nanoid';
import { paginationMeta } from '../../common/pagination';
import { PrismaService } from '../../database/prisma.service';
import { AuditService } from '../audit/audit.service';

const sequence = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 8);

@Injectable()
export class FinanceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async listInvoices(query: { page: number; limit: number; search?: string }) {
    const where: Prisma.InvoiceWhereInput = query.search
      ? {
          OR: [
            { invoiceNumber: { contains: query.search, mode: 'insensitive' } },
            { salesOrder: { orderNumber: { contains: query.search, mode: 'insensitive' } } },
          ],
        }
      : {};
    const [data, total] = await this.prisma.$transaction([
      this.prisma.invoice.findMany({
        where,
        include: { salesOrder: { include: { customer: true } }, payments: true },
        orderBy: { issuedAt: 'desc' },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      this.prisma.invoice.count({ where }),
    ]);
    return { data, meta: paginationMeta(query.page, query.limit, total) };
  }

  invoiceDetail(id: string) {
    return this.prisma.invoice.findUniqueOrThrow({
      where: { id },
      include: {
        payments: true,
        salesOrder: {
          include: {
            customer: { include: { addresses: true } },
            items: { include: { product: true } },
          },
        },
      },
    });
  }

  async listPayments(query: { page: number; limit: number; search?: string }) {
    const where: Prisma.PaymentWhereInput = query.search
      ? {
          OR: [
            { paymentNumber: { contains: query.search, mode: 'insensitive' } },
            { reference: { contains: query.search, mode: 'insensitive' } },
          ],
        }
      : {};
    const [data, total] = await this.prisma.$transaction([
      this.prisma.payment.findMany({
        where,
        include: { invoice: { include: { salesOrder: { include: { customer: true } } } } },
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      this.prisma.payment.count({ where }),
    ]);
    return { data, meta: paginationMeta(query.page, query.limit, total) };
  }

  async createPayment(data: any, actorId: string) {
    const invoice = await this.prisma.invoice.findUniqueOrThrow({
      where: { id: data.invoiceId },
      include: { payments: true },
    });
    const paid = invoice.payments
      .filter((payment) => payment.status === PaymentStatus.PAID)
      .reduce((sum, payment) => sum + payment.amount, 0);
    if (data.amount > invoice.amount - paid) {
      throw new BadRequestException('Jumlah pembayaran melebihi sisa invoice');
    }
    const payment = await this.prisma.payment.create({
      data: {
        ...data,
        paymentNumber: `PAY-${new Date().toISOString().slice(0, 10).replaceAll('-', '')}-${sequence()}`,
      },
    });
    await this.audit.record({
      actorId,
      action: 'PAYMENT_SUBMITTED',
      entity: 'Payment',
      entityId: payment.id,
    });
    return payment;
  }

  async verifyPayment(id: string, actorId: string) {
    const result = await this.prisma.$transaction(async (tx) => {
      const payment = await tx.payment.findUniqueOrThrow({
        where: { id },
        include: { invoice: { include: { payments: true, salesOrder: true } } },
      });
      if (payment.status !== PaymentStatus.PENDING_VERIFICATION) {
        throw new BadRequestException('Pembayaran tidak menunggu verifikasi');
      }
      await tx.payment.update({
        where: { id },
        data: { status: PaymentStatus.PAID, verifiedById: actorId, verifiedAt: new Date() },
      });
      const totalPaid =
        payment.invoice.payments
          .filter((item) => item.status === PaymentStatus.PAID)
          .reduce((sum, item) => sum + item.amount, 0) + payment.amount;
      if (totalPaid >= payment.invoice.amount) {
        await tx.invoice.update({
          where: { id: payment.invoiceId },
          data: { status: InvoiceStatus.PAID, paidAt: new Date() },
        });
        await tx.salesOrder.update({
          where: { id: payment.invoice.salesOrderId },
          data: { status: OrderStatus.PAID },
        });
      }
      return { paymentId: id, totalPaid, invoiceAmount: payment.invoice.amount };
    });
    await this.audit.record({
      actorId,
      action: 'PAYMENT_VERIFIED',
      entity: 'Payment',
      entityId: id,
      metadata: result,
    });
    return result;
  }

  async refundPayment(id: string, actorId: string) {
    const payment = await this.prisma.payment.findUniqueOrThrow({ where: { id } });
    if (payment.status !== PaymentStatus.PAID) {
      throw new BadRequestException('Hanya pembayaran paid yang dapat direfund');
    }
    const updated = await this.prisma.payment.update({
      where: { id },
      data: { status: PaymentStatus.REFUNDED },
    });
    await this.audit.record({
      actorId,
      action: 'PAYMENT_REFUNDED',
      entity: 'Payment',
      entityId: id,
    });
    return updated;
  }
}
