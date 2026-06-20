'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, Plus, X } from 'lucide-react';
import { useState } from 'react';
import { PageHeader } from '@/components/page-header';
import { ResourceTable } from '@/components/resource-table';
import { StatusBadge } from '@/components/status-badge';
import { api, dateTime, rupiah } from '@/lib/api';
import type { ApiList } from '@/types';
import { useRoles } from '@/hooks/use-roles';

type Order = {
  id: string;
  orderNumber: string;
  grandTotal: number;
  status: string;
  channel: string;
  createdAt: string;
  customer: { name: string };
  warehouse: { name: string };
};

export default function OrdersPage() {
  const client = useQueryClient();
  const { hasAny } = useRoles();
  const canManage = hasAny('SUPER_ADMIN', 'ADMIN', 'SALES');
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  const customers = useQuery({
    queryKey: ['customers', 'order-options'],
    queryFn: () => api<ApiList<{ id: string; code: string; name: string }>>('/customers?limit=100'),
  });
  const warehouses = useQuery({
    queryKey: ['warehouses'],
    queryFn: () => api<Array<{ id: string; code: string; name: string }>>('/warehouses'),
  });
  const products = useQuery({
    queryKey: ['products', 'order-options'],
    queryFn: () =>
      api<ApiList<{ id: string; sku: string; name: string; sellingPrice: number }>>(
        '/products?limit=100',
      ),
  });
  const create = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      api('/sales-orders', {
        method: 'POST',
        headers: { 'idempotency-key': crypto.randomUUID() },
        body: JSON.stringify(data),
      }),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ['orders'] });
      setOpen(false);
    },
    onError: (cause) => setError(cause.message),
  });
  const confirm = useMutation({
    mutationFn: (id: string) => api(`/sales-orders/${id}/confirm`, { method: 'POST' }),
    onSuccess: () => client.invalidateQueries({ queryKey: ['orders'] }),
  });

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setError('');
    create.mutate({
      customerId: form.get('customerId'),
      warehouseId: form.get('warehouseId'),
      channel: form.get('channel'),
      discountAmount: Number(form.get('discountAmount')),
      taxRate: Number(form.get('taxRate')),
      notes: form.get('notes') || null,
      items: [{ productId: form.get('productId'), quantity: Number(form.get('quantity')) }],
    });
  }

  return (
    <>
      <PageHeader
        title="Pesanan penjualan"
        description="Order multi-channel dengan kalkulasi server dan reservasi stok."
        action={
          canManage ? (
            <button
              onClick={() => setOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white"
            >
              <Plus size={18} /> Buat order
            </button>
          ) : undefined
        }
      />
      {confirm.isError && (
        <p className="mb-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">
          {confirm.error.message}
        </p>
      )}
      <ResourceTable<Order>
        endpoint="/sales-orders"
        queryKey="orders"
        columns={[
          {
            key: 'number',
            label: 'Nomor',
            render: (row) => <span className="font-mono font-semibold">{row.orderNumber}</span>,
          },
          { key: 'customer', label: 'Pelanggan', render: (row) => row.customer.name },
          { key: 'warehouse', label: 'Gudang', render: (row) => row.warehouse.name },
          { key: 'total', label: 'Total', render: (row) => rupiah(row.grandTotal) },
          { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
          { key: 'date', label: 'Dibuat', render: (row) => dateTime(row.createdAt) },
          {
            key: 'action',
            label: 'Aksi',
            render: (row) =>
              canManage && (row.status === 'DRAFT' || row.status === 'PENDING_CONFIRMATION') ? (
                <button
                  onClick={() => confirm.mutate(row.id)}
                  disabled={confirm.isPending}
                  className="flex items-center gap-1 rounded-lg bg-teal-50 px-3 py-2 text-xs font-semibold text-teal-800"
                >
                  <CheckCircle2 size={15} /> Konfirmasi
                </button>
              ) : (
                <span className="text-xs text-slate-400">—</span>
              ),
          },
        ]}
      />
      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/55 p-4">
          <form
            onSubmit={submit}
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Buat sales order</h2>
              <button type="button" onClick={() => setOpen(false)} aria-label="Tutup">
                <X />
              </button>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Select
                name="customerId"
                label="Pelanggan"
                options={
                  customers.data?.data.map((item) => ({
                    value: item.id,
                    label: `${item.code} — ${item.name}`,
                  })) ?? []
                }
              />
              <Select
                name="warehouseId"
                label="Gudang"
                options={
                  warehouses.data?.map((item) => ({
                    value: item.id,
                    label: `${item.code} — ${item.name}`,
                  })) ?? []
                }
              />
              <Select
                name="productId"
                label="Produk"
                options={
                  products.data?.data.map((item) => ({
                    value: item.id,
                    label: `${item.sku} — ${item.name} (${rupiah(item.sellingPrice)})`,
                  })) ?? []
                }
              />
              <Input
                name="quantity"
                label="Jumlah"
                type="number"
                min="1"
                defaultValue="1"
                required
              />
              <Select
                name="channel"
                label="Channel"
                options={[
                  { value: 'SALES', label: 'Sales' },
                  { value: 'WEB', label: 'Web' },
                  { value: 'PHONE', label: 'Telepon' },
                  { value: 'MARKETPLACE', label: 'Marketplace' },
                ]}
              />
              <Input
                name="discountAmount"
                label="Diskon (Rp)"
                type="number"
                min="0"
                defaultValue="0"
                required
              />
              <Input
                name="taxRate"
                label="Pajak (%)"
                type="number"
                min="0"
                max="100"
                defaultValue="11"
                required
              />
            </div>
            <label className="mt-4 block text-sm font-semibold">
              Catatan
              <textarea
                name="notes"
                className="mt-2 min-h-20 w-full rounded-xl border px-3 py-2.5"
              />
            </label>
            <p className="mt-3 text-xs text-slate-500">
              Harga dan total dihitung ulang oleh server. Form cepat ini membuat satu item per
              order.
            </p>
            {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
            <button
              disabled={create.isPending}
              className="mt-6 rounded-xl bg-teal-700 px-5 py-3 font-semibold text-white disabled:opacity-60"
            >
              {create.isPending ? 'Menyimpan...' : 'Simpan draft order'}
            </button>
          </form>
        </div>
      )}
    </>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  const { label, ...input } = props;
  return (
    <label className="text-sm font-semibold">
      {label}
      <input {...input} className="mt-2 w-full rounded-xl border px-3 py-2.5" />
    </label>
  );
}

function Select({
  name,
  label,
  options,
}: {
  name: string;
  label: string;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <label className="text-sm font-semibold">
      {label}
      <select name={name} required className="mt-2 w-full rounded-xl border px-3 py-2.5">
        <option value="">Pilih {label.toLowerCase()}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
