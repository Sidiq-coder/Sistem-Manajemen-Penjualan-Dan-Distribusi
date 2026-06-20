import { Module } from '@nestjs/common';
import { InvoicesController, PaymentsController } from './finance.controller';
import { FinanceService } from './finance.service';

@Module({
  controllers: [InvoicesController, PaymentsController],
  providers: [FinanceService],
})
export class FinanceModule {}
