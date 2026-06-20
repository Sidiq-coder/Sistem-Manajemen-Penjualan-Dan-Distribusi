import { Module } from '@nestjs/common';
import { CategoriesController, ProductsController } from './catalog.controller';
import { CatalogService } from './catalog.service';

@Module({
  controllers: [CategoriesController, ProductsController],
  providers: [CatalogService],
})
export class CatalogModule {}
