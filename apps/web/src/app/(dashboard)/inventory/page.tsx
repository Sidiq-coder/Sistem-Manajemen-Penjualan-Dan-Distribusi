'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { SlidersHorizontal, X } from 'lucide-react';
import { useState } from 'react';
import { PageHeader } from '@/components/page-header';
import { ResourceTable } from '@/components/resource-table';
import { api } from '@/lib/api';
import type { ApiList } from '@/types';
import { useRoles } from '@/hooks/use-roles';

type Balance = {
  id: string;
  quantity: number;
  reserved: number;
  available: number;
  lowStock: boolean;
  product: { sku: string; name: string; minimumStock: number };
  warehouse: { code: string; name: string };
};

export default function InventoryPage() {
  const client = useQueryClient();
  const { hasAny } = useRoles();
  const canAdjust = hasAny('SUPER_ADMIN', 'ADMIN', 'WAREHOUSE');
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  const warehouses = useQuery({
    queryKey: ['warehouses'],
    queryFn: () => api<Array<{ id: string; name: string; code: string }>>('/warehouses'),
  });
  const products = useQuery({
    queryKey: ['products', 'adjustment-options'],
    queryFn: () => api<ApiList<{ id: string; name: string; sku: string }>>('/products?limit=100'),
  });
  const adjust = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      api('/inventory/adjustments', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ['inventory'] });
      setOpen(false);
    },
    onError: (cause) => setError(cause.message),
  });

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setError('');
    adjust.mutate({
      warehouseId: form.get('warehouseId'),
      productId: form.get('productId'),
      quantity: Number(form.get('quantity')),
      reason: form.get('reason'),
    });
  }

  return (
    <>
      <PageHeader
        title="Gudang & stok"
        description="Saldo stok real-time, reservasi order, dan indikator stok rendah."
        action={
          canAdjust ? (
            <button
              onClick={() => setOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white"
            >
              <SlidersHorizontal size={18} /> Penyesuaian stok
            </button>
          ) : undefined
        }
      />
      <ResourceTable<Balance>
        endpoint="/inventory"
        queryKey="inventory"
        columns={[
          {
            key: 'warehouse',
            label: 'Gudang',
            render: (row) => (
              <div>
                <p className="font-semibold">{row.warehouse.name}</p>
                <p className="text-xs text-slate-500">{row.warehouse.code}</p>
              </div>
            ),
          },
          {
            key: 'product',
            label: 'Produk',
            render: (row) => (
              <div>
                <p className="font-semibold">{row.product.name}</p>
                <p className="font-mono text-xs text-slate-500">{row.product.sku}</p>
              </div>
            ),
          },
          { key: 'quantity', label: 'Fisik', render: (row) => row.quantity },
          { key: 'reserved', label: 'Reservasi', render: (row) => row.reserved },
          {
            key: 'available',
            label: 'Tersedia',
            render: (row) => (
              <span
                className={row.lowStock ? 'font-bold text-red-700' : 'font-bold text-emerald-700'}
              >
                {row.available}
              </span>
            ),
          },
          { key: 'minimum', label: 'Minimum', render: (row) => row.product.minimumStock },
        ]}
      />
      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/55 p-4">
          <form onSubmit={submit} className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Penyesuaian stok</h2>
              <button type="button" onClick={() => setOpen(false)} aria-label="Tutup">
                <X />
              </button>
            </div>
            <label className="mt-6 block text-sm font-semibold">
              Gudang
              <select
                name="warehouseId"
                required
                className="mt-2 w-full rounded-xl border px-3 py-2.5"
              >
                <option value="">Pilih gudang</option>
                {warehouses.data?.map((warehouse) => (
                  <option key={warehouse.id} value={warehouse.id}>
                    {warehouse.code} — {warehouse.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="mt-4 block text-sm font-semibold">
              Produk
              <select
                name="productId"
                required
                className="mt-2 w-full rounded-xl border px-3 py-2.5"
              >
                <option value="">Pilih produk</option>
                {products.data?.data.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.sku} — {product.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="mt-4 block text-sm font-semibold">
              Perubahan jumlah
              <input
                name="quantity"
                type="number"
                required
                placeholder="Contoh: 20 atau -5"
                className="mt-2 w-full rounded-xl border px-3 py-2.5"
              />
            </label>
            <label className="mt-4 block text-sm font-semibold">
              Alasan
              <textarea
                name="reason"
                required
                minLength={5}
                className="mt-2 min-h-24 w-full rounded-xl border px-3 py-2.5"
              />
            </label>
            {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
            <button
              disabled={adjust.isPending}
              className="mt-6 rounded-xl bg-teal-700 px-5 py-3 font-semibold text-white disabled:opacity-60"
            >
              {adjust.isPending ? 'Memproses...' : 'Simpan adjustment'}
            </button>
          </form>
        </div>
      )}
    </>
  );
}
