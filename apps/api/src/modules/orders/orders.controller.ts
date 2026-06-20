import { Body, Controller, Get, Headers, Param, Post, Query } from '@nestjs/common';
import { paginationSchema, salesOrderSchema } from '@smpd/shared';
import { CurrentUser, type AuthUser } from '../../common/current-user.decorator';
import { ZodValidationPipe } from '../../common/zod-validation.pipe';
import { Roles } from '../auth/roles.decorator';
import { OrdersService } from './orders.service';

@Roles(
  'SUPER_ADMIN',
  'ADMIN',
  'SALES',
  'WAREHOUSE',
  'DISTRIBUTION',
  'MANAGER',
  'FINANCE',
  'SUPPORT',
)
@Controller('sales-orders')
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Get()
  list(@Query(new ZodValidationPipe(paginationSchema)) query: any) {
    return this.orders.list(query);
  }

  @Get(':id')
  detail(@Param('id') id: string) {
    return this.orders.detail(id);
  }

  @Roles('SUPER_ADMIN', 'ADMIN', 'SALES')
  @Post()
  create(
    @Body(new ZodValidationPipe(salesOrderSchema)) body: any,
    @CurrentUser() user: AuthUser,
    @Headers('idempotency-key') idempotencyKey?: string,
  ) {
    return this.orders.create(body, user.sub, idempotencyKey);
  }

  @Roles('SUPER_ADMIN', 'ADMIN', 'SALES')
  @Post(':id/confirm')
  confirm(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.orders.confirm(id, user.sub);
  }

  @Roles('SUPER_ADMIN', 'ADMIN', 'SALES')
  @Post(':id/cancel')
  cancel(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.orders.cancel(id, user.sub);
  }
}
