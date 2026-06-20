import { describe, expect, it } from 'vitest';
import { productSchema, stockAdjustmentSchema } from '@smpd/shared';

describe('shared validation', () => {
  it('menolak SKU dengan karakter ilegal', () => {
    const result = productSchema.safeParse({
      sku: 'SKU 01',
      name: 'Produk',
      categoryId: 'b3d4db4d-2da5-4445-97fc-a39b3bdd60a6',
      sellingPrice: 10_000,
      minimumStock: 5,
      isActive: true,
    });
    expect(result.success).toBe(false);
  });

  it('menolak stock adjustment nol', () => {
    const result = stockAdjustmentSchema.safeParse({
      warehouseId: 'b3d4db4d-2da5-4445-97fc-a39b3bdd60a6',
      productId: '72e0f35d-5540-4028-b26b-3eb08c9fe54c',
      quantity: 0,
      reason: 'Penyesuaian stok',
    });
    expect(result.success).toBe(false);
  });
});
