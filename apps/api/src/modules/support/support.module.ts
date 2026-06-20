import { Module } from '@nestjs/common';
import { ComplaintsController, ReturnsController } from './support.controller';
import { SupportService } from './support.service';

@Module({
  controllers: [ComplaintsController, ReturnsController],
  providers: [SupportService],
})
export class SupportModule {}
