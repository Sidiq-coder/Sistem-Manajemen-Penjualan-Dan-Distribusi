import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { complaintSchema, paginationSchema } from '@smpd/shared';
import { z } from 'zod';
import { CurrentUser, type AuthUser } from '../../common/current-user.decorator';
import { ZodValidationPipe } from '../../common/zod-validation.pipe';
import { Roles } from '../auth/roles.decorator';
import { SupportService } from './support.service';

const complaintStatusSchema = z.object({
  status: z.enum(['OPEN', 'IN_PROGRESS', 'WAITING_CUSTOMER', 'RESOLVED', 'CLOSED']),
});
const messageSchema = z.object({ message: z.string().trim().min(2).max(3000) });
const returnSchema = z.object({
  salesOrderId: z.uuid(),
  reason: z.string().trim().min(10).max(1000),
  resolution: z.enum(['REFUND', 'REPLACEMENT']).optional(),
  items: z
    .array(
      z.object({
        salesOrderItemId: z.uuid(),
        quantity: z.number().int().positive(),
        reason: z.string().trim().min(5).max(500),
      }),
    )
    .min(1),
});
const returnStatusSchema = z.object({
  status: z.enum([
    'REQUESTED',
    'UNDER_REVIEW',
    'APPROVED',
    'REJECTED',
    'ITEM_RECEIVED',
    'REPLACEMENT_SENT',
    'REFUNDED',
    'CLOSED',
  ]),
});

@Roles('SUPER_ADMIN', 'ADMIN', 'SUPPORT', 'SALES', 'MANAGER')
@Controller('complaints')
export class ComplaintsController {
  constructor(private readonly support: SupportService) {}

  @Get()
  list(@Query(new ZodValidationPipe(paginationSchema)) query: any) {
    return this.support.listComplaints(query);
  }

  @Post()
  create(@Body(new ZodValidationPipe(complaintSchema)) body: any, @CurrentUser() user: AuthUser) {
    return this.support.createComplaint(body, user.sub);
  }

  @Post(':id/messages')
  addMessage(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(messageSchema)) body: any,
    @CurrentUser() user: AuthUser,
  ) {
    return this.support.addMessage(id, body.message, user.sub);
  }

  @Roles('SUPER_ADMIN', 'ADMIN', 'SUPPORT')
  @Patch(':id/status')
  status(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(complaintStatusSchema)) body: any,
    @CurrentUser() user: AuthUser,
  ) {
    return this.support.updateComplaintStatus(id, body.status, user.sub);
  }
}

@Roles('SUPER_ADMIN', 'ADMIN', 'SUPPORT', 'FINANCE', 'SALES', 'MANAGER')
@Controller('returns')
export class ReturnsController {
  constructor(private readonly support: SupportService) {}

  @Get()
  list(@Query(new ZodValidationPipe(paginationSchema)) query: any) {
    return this.support.listReturns(query);
  }

  @Post()
  create(@Body(new ZodValidationPipe(returnSchema)) body: any, @CurrentUser() user: AuthUser) {
    return this.support.createReturn(body, user.sub);
  }

  @Roles('SUPER_ADMIN', 'ADMIN', 'SUPPORT', 'FINANCE')
  @Patch(':id/status')
  status(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(returnStatusSchema)) body: any,
    @CurrentUser() user: AuthUser,
  ) {
    return this.support.updateReturnStatus(id, body.status, user.sub);
  }
}
