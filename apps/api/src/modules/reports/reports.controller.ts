import { Controller, Get, Query } from '@nestjs/common';
import { z } from 'zod';
import { ZodValidationPipe } from '../../common/zod-validation.pipe';
import { Roles } from '../auth/roles.decorator';
import { ReportsService } from './reports.service';

const rangeSchema = z.object({
  from: z.coerce.date().default(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1)),
  to: z.coerce.date().default(() => new Date()),
});

@Roles('SUPER_ADMIN', 'ADMIN', 'MANAGER', 'FINANCE')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reports: ReportsService) {}

  @Get('dashboard')
  dashboard() {
    return this.reports.dashboard();
  }

  @Get('sales-summary')
  salesSummary(@Query(new ZodValidationPipe(rangeSchema)) range: any) {
    return this.reports.salesSummary(range.from, range.to);
  }

  @Get('top-products')
  topProducts(@Query(new ZodValidationPipe(rangeSchema)) range: any) {
    return this.reports.topProducts(range.from, range.to);
  }

  @Get('inventory')
  inventory() {
    return this.reports.inventory();
  }

  @Get('shipment-performance')
  shipmentPerformance(@Query(new ZodValidationPipe(rangeSchema)) range: any) {
    return this.reports.shipmentPerformance(range.from, range.to);
  }
}
