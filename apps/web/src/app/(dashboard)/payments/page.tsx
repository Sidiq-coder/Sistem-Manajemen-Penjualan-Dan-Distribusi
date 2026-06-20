'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { BadgeCheck, Plus, X } from 'lucide-react';
import { useState } from 'react';
import { PageHeader } from '@/components/page-header';
import { ResourceTable } from '@/components/resource-table';
import { StatusBadge } from '@/components/status-badge';
import { api, dateTime, rupiah } from '@/lib/api';
import type { ApiList } from '@/types';
import { useRoles } from '@/hooks/use-roles';

type Payment = {
  id: string;
  paymentNumber: string;
  amount: number;
  method: string;
  status: string;
  reference: string;
  createdAt: string;
  invoice: { invoiceNumber: string; salesOrder: { customer: { name: string } } };
};

export default function PaymentsPage() {
  const client = useQueryClient();
  const { hasAny } = useRoles();
  const canCreate = hasAny('SUPER_ADMIN', 'ADMIN', 'FINANCE', 'SALES');
  const canVerify = hasAny('SUPER_ADMIN', 'ADMIN', 'FINANCE');
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  const invoices = useQuery({
    queryKey: ['invoices', 'payment-options'],
    queryFn: () =>
      api<
        ApiList<{
          id: string;
          invoiceNumber: string;
          amount: number;
          status: string;
          salesOrder: { customer: { name: string } };
        }>
      >('/invoices?limit=100'),
  });
  const create = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      api('/payments', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ['payments'] });
      setOpen(false);
    },
    onError: (cause) => setError(cause.message),
  });
  const verify = useMutation({
    mutationFn: (id: string) => api(`/payments/${id}/verify`, { method: 'POST' }),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ['payments'] });
      await client.invalidateQueries({ queryKey: ['orders'] });
    },
  });

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setError('');
    create.mutate({
      invoiceId: form.get('invoiceId'),
      amount: Number(form.get('amount')),
      method: form.get('method'),
      reference: form.get('reference'),
    });
  }

  return (
    <>
      <PageHeader
        title="Invoice & pembayaran"
        description="Pembayaran manual dan verifikasi finance yang tercatat di audit log."
        action={
          canCreate ? (
            <button
              onClick={() => setOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white"
            >
              <Plus size={18} /> Catat pembayaran
            </button>
          ) : undefined
        }
      />
      {verify.isError && (
        <p className="mb-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">{verify.error.message}</p>
      )}
      <ResourceTable<Payment>
        endpoint="/payments"
        queryKey="payments"
        columns={[
          {
            key: 'number',
            label: 'Pembayaran',
            render: (row) => (
              <div>
                <p className="font-mono font-semibold">{row.paymentNumber}</p>
                <p className="text-xs text-slate-500">{row.invoice.invoiceNumber}</p>
              </div>
            ),
          },
          {
            key: 'customer',
            label: 'Pelanggan',
            render: (row) => row.invoice.salesOrder.customer.name,
          },
          { key: 'amount', label: 'Jumlah', render: (row) => rupiah(row.amount) },
          { key: 'method', label: 'Metode', render: (row) => row.method.replaceAll('_', ' ') },
          { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
          { key: 'date', label: 'Diajukan', render: (row) => dateTime(row.createdAt) },
          {
            key: 'action',
            label: 'Aksi',
            render: (row) =>
              canVerify && row.status === 'PENDING_VERIFICATION' ? (
                <button
                  onClick={() => verify.mutate(row.id)}
                  disabled={verify.isPending}
                  className="flex items-center gap-1 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800"
                >
                  <BadgeCheck size={15} /> Verifikasi
                </button>
              ) : (
                <span className="text-xs text-slate-400">—</span>
              ),
          },
        ]}
      />
      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/55 p-4">
          <form onSubmit={submit} className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Catat pembayaran</h2>
              <button type="button" onClick={() => setOpen(false)} aria-label="Tutup">
                <X />
              </button>
            </div>
            <label className="mt-6 block text-sm font-semibold">
              Invoice
              <select
                name="invoiceId"
                required
                className="mt-2 w-full rounded-xl border px-3 py-2.5"
              >
                <option value="">Pilih invoice</option>
                {invoices.data?.data
                  .filter((invoice) => invoice.status !== 'PAID')
                  .map((invoice) => (
                    <option key={invoice.id} value={invoice.id}>
                      {invoice.invoiceNumber} — {invoice.salesOrder.customer.name} —{' '}
                      {rupiah(invoice.amount)}
                    </option>
                  ))}
              </select>
            </label>
            <label className="mt-4 block text-sm font-semibold">
              Jumlah (Rp)
              <input
                name="amount"
                type="number"
                min="1"
                required
                className="mt-2 w-full rounded-xl border px-3 py-2.5"
              />
            </label>
            <label className="mt-4 block text-sm font-semibold">
              Metode
              <select
                name="method"
                defaultValue="BANK_TRANSFER"
                className="mt-2 w-full rounded-xl border px-3 py-2.5"
              >
                <option value="BANK_TRANSFER">Transfer bank</option>
                <option value="CASH">Tunai</option>
                <option value="EWALLET">E-wallet</option>
              </select>
            </label>
            <label className="mt-4 block text-sm font-semibold">
              Referensi
              <input
                name="reference"
                required
                minLength={3}
                className="mt-2 w-full rounded-xl border px-3 py-2.5"
              />
            </label>
            {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
            <button
              disabled={create.isPending}
              className="mt-6 rounded-xl bg-teal-700 px-5 py-3 font-semibold text-white disabled:opacity-60"
            >
              {create.isPending ? 'Menyimpan...' : 'Ajukan pembayaran'}
            </button>
          </form>
        </div>
      )}
    </>
  );
}
