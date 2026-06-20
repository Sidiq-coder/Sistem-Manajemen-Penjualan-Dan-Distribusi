import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { paginationMeta } from '../../common/pagination';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class CatalogService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  listCategories() {
    return this.prisma.category.findMany({
      where: { deletedAt: null },
      orderBy: { name: 'asc' },
    });
  }

  async createCategory(data: Prisma.CategoryCreateInput, actorId: string) {
    const category = await this.prisma.category.create({ data });
    await this.audit.record({
      actorId,
      action: 'CATEGORY_CREATED',
      entity: 'Category',
      entityId: category.id,
    });
    return category;
  }

  async updateCategory(id: string, data: Prisma.CategoryUpdateInput, actorId: string) {
    const category = await this.prisma.category.update({ where: { id }, data });
    await this.audit.record({
      actorId,
      action: 'CATEGORY_UPDATED',
      entity: 'Category',
      entityId: id,
      metadata: data as Prisma.InputJsonValue,
    });
    return category;
  }

  async removeCategory(id: string, actorId: string) {
    const category = await this.prisma.category.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
    await this.audit.record({
      actorId,
      action: 'CATEGORY_ARCHIVED',
      entity: 'Category',
      entityId: id,
    });
    return category;
  }

  async listProducts(query: { page: number; limit: number; search?: string }) {
    const where: Prisma.ProductWhereInput = {
      deletedAt: null,
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: 'insensitive' } },
              { sku: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        include: { category: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      this.prisma.product.count({ where }),
    ]);
    return { data, meta: paginationMeta(query.page, query.limit, total) };
  }

  getProduct(id: string) {
    return this.prisma.product.findFirstOrThrow({
      where: { id, deletedAt: null },
      include: {
        category: true,
        prices: { orderBy: { validFrom: 'desc' }, take: 20 },
        balances: { include: { warehouse: true } },
      },
    });
  }

  async createProduct(data: any, actorId: string) {
    const product = await this.prisma.product.create({
      data: {
        ...data,
        prices: { create: { price: data.sellingPrice, changedBy: actorId } },
      },
      include: { category: true },
    });
    await this.audit.record({
      actorId,
      action: 'PRODUCT_CREATED',
      entity: 'Product',
      entityId: product.id,
    });
    return product;
  }

  async updateProduct(id: string, data: any, actorId: string) {
    const current = await this.prisma.product.findUniqueOrThrow({ where: { id } });
    const product = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.product.update({ where: { id }, data });
      if (data.sellingPrice !== undefined && data.sellingPrice !== current.sellingPrice) {
        await tx.productPrice.create({
          data: { productId: id, price: data.sellingPrice, changedBy: actorId },
        });
      }
      return updated;
    });
    await this.audit.record({
      actorId,
      action: 'PRODUCT_UPDATED',
      entity: 'Product',
      entityId: id,
      metadata: { changedFields: Object.keys(data) },
    });
    return product;
  }

  async removeProduct(id: string, actorId: string) {
    const product = await this.prisma.product.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
    await this.audit.record({
      actorId,
      action: 'PRODUCT_ARCHIVED',
      entity: 'Product',
      entityId: id,
    });
    return product;
  }
}
