import { describe, expect, it } from 'vitest';
import { calculateOrder } from '../src/modules/orders/order-calculator';

describe('calculateOrder', () => {
  it('menghitung subtotal, diskon, pajak, dan total di server', () => {
    expect(
      calculateOrder(
        [
          { productId: 'a', quantity: 2, unitPrice: 10_000 },
          { productId: 'b', quantity: 1, unitPrice: 5_000 },
        ],
        5_000,
        11,
      ),
    ).toMatchObject({
      subtotal: 25_000,
      discountAmount: 5_000,
      taxAmount: 2_200,
      grandTotal: 22_200,
    });
  });

  it('menolak diskon yang melebihi subtotal', () => {
    expect(() =>
      calculateOrder([{ productId: 'a', quantity: 1, unitPrice: 10_000 }], 10_001, 11),
    ).toThrow('Diskon tidak valid');
  });

  it('menolak kuantitas nol atau negatif', () => {
    expect(() =>
      calculateOrder([{ productId: 'a', quantity: 0, unitPrice: 10_000 }], 0, 11),
    ).toThrow('Item order tidak valid');
  });
});
