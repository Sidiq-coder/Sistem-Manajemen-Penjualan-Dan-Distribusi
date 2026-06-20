import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { categorySchema, paginationSchema, productSchema } from '@smpd/shared';
import { CurrentUser, type AuthUser } from '../../common/current-user.decorator';
import { ZodValidationPipe } from '../../common/zod-validation.pipe';
import { Roles } from '../auth/roles.decorator';
import { CatalogService } from './catalog.service';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly catalog: CatalogService) {}

  @Get()
  list() {
    return this.catalog.listCategories();
  }

  @Roles('SUPER_ADMIN', 'ADMIN')
  @Post()
  create(@Body(new ZodValidationPipe(categorySchema)) body: any, @CurrentUser() user: AuthUser) {
    return this.catalog.createCategory(body, user.sub);
  }

  @Roles('SUPER_ADMIN', 'ADMIN')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(categorySchema.partial())) body: any,
    @CurrentUser() user: AuthUser,
  ) {
    return this.catalog.updateCategory(id, body, user.sub);
  }

  @Roles('SUPER_ADMIN', 'ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.catalog.removeCategory(id, user.sub);
  }
}

@Controller('products')
export class ProductsController {
  constructor(private readonly catalog: CatalogService) {}

  @Get()
  list(@Query(new ZodValidationPipe(paginationSchema)) query: any) {
    return this.catalog.listProducts(query);
  }

  @Get(':id')
  detail(@Param('id') id: string) {
    return this.catalog.getProduct(id);
  }

  @Roles('SUPER_ADMIN', 'ADMIN')
  @Post()
  create(@Body(new ZodValidationPipe(productSchema)) body: any, @CurrentUser() user: AuthUser) {
    return this.catalog.createProduct(body, user.sub);
  }

  @Roles('SUPER_ADMIN', 'ADMIN')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(productSchema.partial())) body: any,
    @CurrentUser() user: AuthUser,
  ) {
    return this.catalog.updateProduct(id, body, user.sub);
  }

  @Roles('SUPER_ADMIN', 'ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.catalog.removeProduct(id, user.sub);
  }
}
