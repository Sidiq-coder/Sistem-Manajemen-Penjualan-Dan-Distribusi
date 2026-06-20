export type PricedItem = {
  productId: string;
  quantity: number;
  unitPrice: number;
};

export function calculateOrder(items: PricedItem[], discountAmount: number, taxRate: number) {
  if (items.length === 0) throw new Error('Order harus memiliki item');
  if (items.some((item) => item.quantity <= 0 || item.unitPrice < 0)) {
    throw new Error('Item order tidak valid');
  }
  const normalizedItems = items.map((item) => ({
    ...item,
    subtotal: item.quantity * item.unitPrice,
  }));
  const subtotal = normalizedItems.reduce((sum, item) => sum + item.subtotal, 0);
  if (discountAmount < 0 || discountAmount > subtotal) {
    throw new Error('Diskon tidak valid');
  }
  if (taxRate < 0 || taxRate > 100) throw new Error('Pajak tidak valid');
  const taxable = subtotal - discountAmount;
  const taxAmount = Math.round((taxable * taxRate) / 100);
  return {
    items: normalizedItems,
    subtotal,
    discountAmount,
    taxAmount,
    grandTotal: taxable + taxAmount,
  };
}
