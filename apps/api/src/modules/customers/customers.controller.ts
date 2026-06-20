import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { customerSchema, paginationSchema } from '@smpd/shared';
import { CurrentUser, type AuthUser } from '../../common/current-user.decorator';
import { ZodValidationPipe } from '../../common/zod-validation.pipe';
import { Roles } from '../auth/roles.decorator';
import { CustomersService } from './customers.service';

@Roles('SUPER_ADMIN', 'ADMIN', 'SALES', 'SUPPORT', 'MANAGER')
@Controller('customers')
export class CustomersController {
  constructor(private readonly customers: CustomersService) {}

  @Get()
  list(@Query(new ZodValidationPipe(paginationSchema)) query: any) {
    return this.customers.list(query);
  }

  @Get(':id')
  detail(@Param('id') id: string) {
    return this.customers.detail(id);
  }

  @Get(':id/orders')
  orders(@Param('id') id: string) {
    return this.customers.orders(id);
  }

  @Roles('SUPER_ADMIN', 'ADMIN', 'SALES')
  @Post()
  create(@Body(new ZodValidationPipe(customerSchema)) body: any, @CurrentUser() user: AuthUser) {
    return this.customers.create(body, user.sub);
  }

  @Roles('SUPER_ADMIN', 'ADMIN', 'SALES')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(customerSchema.partial())) body: any,
    @CurrentUser() user: AuthUser,
  ) {
    return this.customers.update(id, body, user.sub);
  }

  @Roles('SUPER_ADMIN', 'ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.customers.remove(id, user.sub);
  }
}
