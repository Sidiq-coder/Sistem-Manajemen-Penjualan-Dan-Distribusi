import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { paginationSchema, shipmentSchema } from '@smpd/shared';
import { z } from 'zod';
import { CurrentUser, type AuthUser } from '../../common/current-user.decorator';
import { ZodValidationPipe } from '../../common/zod-validation.pipe';
import { Roles } from '../auth/roles.decorator';
import { ShipmentsService } from './shipments.service';

const statusSchema = z.object({
  status: z.enum([
    'PENDING',
    'SCHEDULED',
    'PICKED_UP',
    'IN_TRANSIT',
    'DELIVERED',
    'FAILED_DELIVERY',
    'RETURNED_TO_WAREHOUSE',
  ]),
  note: z.string().max(500).optional(),
  location: z.string().max(150).optional(),
});

@Roles('SUPER_ADMIN', 'ADMIN', 'DISTRIBUTION', 'COURIER', 'MANAGER', 'SALES')
@Controller('shipments')
export class ShipmentsController {
  constructor(private readonly shipments: ShipmentsService) {}

  @Get()
  list(@Query(new ZodValidationPipe(paginationSchema)) query: any) {
    return this.shipments.list(query);
  }

  @Get(':id')
  detail(@Param('id') id: string) {
    return this.shipments.detail(id);
  }

  @Roles('SUPER_ADMIN', 'ADMIN', 'DISTRIBUTION')
  @Post()
  create(@Body(new ZodValidationPipe(shipmentSchema)) body: any, @CurrentUser() user: AuthUser) {
    return this.shipments.create(body, user.sub);
  }

  @Roles('SUPER_ADMIN', 'ADMIN', 'DISTRIBUTION', 'COURIER')
  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(statusSchema)) body: any,
    @CurrentUser() user: AuthUser,
  ) {
    return this.shipments.updateStatus(id, body, user.sub);
  }
}
