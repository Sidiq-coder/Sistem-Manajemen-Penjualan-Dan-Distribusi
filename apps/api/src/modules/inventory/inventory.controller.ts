import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { paginationSchema, stockAdjustmentSchema, warehouseSchema } from '@smpd/shared';
import { CurrentUser, type AuthUser } from '../../common/current-user.decorator';
import { ZodValidationPipe } from '../../common/zod-validation.pipe';
import { Roles } from '../auth/roles.decorator';
import { InventoryService } from './inventory.service';

@Roles('SUPER_ADMIN', 'ADMIN', 'WAREHOUSE', 'SALES', 'MANAGER')
@Controller('warehouses')
export class WarehousesController {
  constructor(private readonly inventory: InventoryService) {}

  @Get()
  list() {
    return this.inventory.listWarehouses();
  }

  @Roles('SUPER_ADMIN', 'ADMIN', 'WAREHOUSE')
  @Post()
  create(@Body(new ZodValidationPipe(warehouseSchema)) body: any, @CurrentUser() user: AuthUser) {
    return this.inventory.createWarehouse(body, user.sub);
  }

  @Roles('SUPER_ADMIN', 'ADMIN', 'WAREHOUSE')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(warehouseSchema.partial())) body: any,
    @CurrentUser() user: AuthUser,
  ) {
    return this.inventory.updateWarehouse(id, body, user.sub);
  }
}

@Roles('SUPER_ADMIN', 'ADMIN', 'WAREHOUSE', 'SALES', 'MANAGER')
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventory: InventoryService) {}

  @Get()
  list(@Query(new ZodValidationPipe(paginationSchema)) query: any) {
    return this.inventory.listInventory(query);
  }

  @Get('movements')
  movements(@Query(new ZodValidationPipe(paginationSchema)) query: any) {
    return this.inventory.listMovements(query);
  }

  @Get(':productId')
  byProduct(@Param('productId') productId: string) {
    return this.inventory.byProduct(productId);
  }

  @Roles('SUPER_ADMIN', 'ADMIN', 'WAREHOUSE')
  @Post('adjustments')
  adjust(
    @Body(new ZodValidationPipe(stockAdjustmentSchema)) body: any,
    @CurrentUser() user: AuthUser,
  ) {
    return this.inventory.adjust(body, user.sub);
  }
}
