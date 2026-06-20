'use client';

import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/components/page-header';
import { api, rupiah } from '@/lib/api';

type ProductReport = {
  productId: string;
  _sum: { quantity: number | null; subtotal: number | null };
};

export default function ReportsPage() {
  const products = useQuery({
    queryKey: ['top-products'],
    queryFn: () => api<ProductReport[]>('/reports/top-products'),
  });
  const inventory = useQuery({
    queryKey: ['inventory-report'],
    queryFn: () => api<any[]>('/reports/inventory'),
  });
  return (
    <>
      <PageHeader
        title="Laporan & analitik"
        description="KPI penjualan dan inventaris dengan filter periode melalui API laporan."
      />
      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-2xl border bg-white p-5 shadow-sm">
          <h2 className="font-bold">Produk terlaris</h2>
          <div className="mt-4 space-y-3">
            {products.data?.map((item, index) => (
              <div
                key={item.productId}
                className="flex items-center justify-between rounded-xl bg-slate-50 p-3"
              >
                <div>
                  <span className="mr-3 font-bold text-teal-700">#{index + 1}</span>
                  <span className="font-mono text-xs">{item.productId.slice(0, 8)}</span>
                </div>
                <div className="text-right">
                  <p className="font-bold">{item._sum.quantity ?? 0} unit</p>
                  <p className="text-xs text-slate-500">{rupiah(item._sum.subtotal ?? 0)}</p>
                </div>
              </div>
            ))}
            {!products.isPending && products.data?.length === 0 && (
              <p className="text-sm text-slate-500">Belum ada transaksi.</p>
            )}
          </div>
        </section>
        <section className="rounded-2xl border bg-white p-5 shadow-sm">
          <h2 className="font-bold">Kondisi inventaris</h2>
          <div className="mt-4 space-y-3">
            {inventory.data?.slice(0, 10).map((item) => {
              const available = item.quantity - item.reserved;
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-xl bg-slate-50 p-3"
                >
                  <div>
                    <p className="font-semibold">{item.product.name}</p>
                    <p className="text-xs text-slate-500">{item.warehouse.name}</p>
                  </div>
                  <span
                    className={
                      available <= item.product.minimumStock
                        ? 'font-bold text-red-700'
                        : 'font-bold text-emerald-700'
                    }
                  >
                    {available} unit
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </>
  );
}
