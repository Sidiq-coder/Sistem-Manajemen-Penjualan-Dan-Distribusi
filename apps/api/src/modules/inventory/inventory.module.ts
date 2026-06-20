import { Module } from '@nestjs/common';
import { InventoryController, WarehousesController } from './inventory.controller';
import { InventoryService } from './inventory.service';

@Module({
  controllers: [WarehousesController, InventoryController],
  providers: [InventoryService],
})
export class InventoryModule {}
