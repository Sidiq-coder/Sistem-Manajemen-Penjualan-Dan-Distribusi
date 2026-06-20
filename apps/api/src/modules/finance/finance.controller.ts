import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { paginationSchema, paymentSchema } from '@smpd/shared';
import { CurrentUser, type AuthUser } from '../../common/current-user.decorator';
import { ZodValidationPipe } from '../../common/zod-validation.pipe';
import { Roles } from '../auth/roles.decorator';
import { FinanceService } from './finance.service';

@Roles('SUPER_ADMIN', 'ADMIN', 'FINANCE', 'SALES', 'MANAGER')
@Controller('invoices')
export class InvoicesController {
  constructor(private readonly finance: FinanceService) {}

  @Get()
  list(@Query(new ZodValidationPipe(paginationSchema)) query: any) {
    return this.finance.listInvoices(query);
  }

  @Get(':id')
  detail(@Param('id') id: string) {
    return this.finance.invoiceDetail(id);
  }
}

@Roles('SUPER_ADMIN', 'ADMIN', 'FINANCE', 'SALES', 'MANAGER')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly finance: FinanceService) {}

  @Get()
  list(@Query(new ZodValidationPipe(paginationSchema)) query: any) {
    return this.finance.listPayments(query);
  }

  @Roles('SUPER_ADMIN', 'ADMIN', 'FINANCE', 'SALES')
  @Post()
  create(@Body(new ZodValidationPipe(paymentSchema)) body: any, @CurrentUser() user: AuthUser) {
    return this.finance.createPayment(body, user.sub);
  }

  @Roles('SUPER_ADMIN', 'ADMIN', 'FINANCE')
  @Post(':id/verify')
  verify(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.finance.verifyPayment(id, user.sub);
  }

  @Roles('SUPER_ADMIN', 'ADMIN', 'FINANCE')
  @Post(':id/refund')
  refund(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.finance.refundPayment(id, user.sub);
  }
}
