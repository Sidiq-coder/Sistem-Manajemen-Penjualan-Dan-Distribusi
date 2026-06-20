'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, X } from 'lucide-react';
import { useState } from 'react';
import { PageHeader } from '@/components/page-header';
import { ResourceTable } from '@/components/resource-table';
import { api } from '@/lib/api';
import { rupiah } from '@/lib/api';
import { useRoles } from '@/hooks/use-roles';

type Customer = {
  id: string;
  code: string;
  name: string;
  phone: string;
  email?: string;
  segment: string;
  creditLimit: number;
  addresses: Array<{ city: string; province: string }>;
};

export default function CustomersPage() {
  const client = useQueryClient();
  const { hasAny } = useRoles();
  const canManage = hasAny('SUPER_ADMIN', 'ADMIN', 'SALES');
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  const create = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      api('/customers', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ['customers'] });
      setOpen(false);
    },
    onError: (cause) => setError(cause.message),
  });

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setError('');
    create.mutate({
      code: form.get('code'),
      name: form.get('name'),
      email: form.get('email') || null,
      phone: form.get('phone'),
      segment: form.get('segment'),
      creditLimit: Number(form.get('creditLimit')),
      address: form.get('address'),
      city: form.get('city'),
      province: form.get('province'),
    });
  }

  return (
    <>
      <PageHeader
        title="Pelanggan"
        description="Data pelanggan, segmentasi, alamat, dan limit kredit."
        action={
          canManage ? (
            <button
              onClick={() => setOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white"
            >
              <Plus size={18} /> Tambah pelanggan
            </button>
          ) : undefined
        }
      />
      <ResourceTable<Customer>
        endpoint="/customers"
        queryKey="customers"
        columns={[
          {
            key: 'code',
            label: 'Kode',
            render: (row) => <span className="font-mono font-semibold">{row.code}</span>,
          },
          {
            key: 'name',
            label: 'Pelanggan',
            render: (row) => (
              <div>
                <p className="font-semibold">{row.name}</p>
                <p className="text-xs text-slate-500">{row.email ?? '-'}</p>
              </div>
            ),
          },
          { key: 'phone', label: 'Telepon', render: (row) => row.phone },
          { key: 'segment', label: 'Segmen', render: (row) => row.segment },
          {
            key: 'city',
            label: 'Wilayah',
            render: (row) =>
              row.addresses[0] ? `${row.addresses[0].city}, ${row.addresses[0].province}` : '-',
          },
          { key: 'credit', label: 'Limit kredit', render: (row) => rupiah(row.creditLimit) },
        ]}
      />
      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/55 p-4">
          <form
            onSubmit={submit}
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Tambah pelanggan</h2>
              <button type="button" onClick={() => setOpen(false)} aria-label="Tutup">
                <X />
              </button>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Input name="code" label="Kode pelanggan" required />
              <Input name="name" label="Nama pelanggan" required />
              <Input name="email" label="Email" type="email" />
              <Input name="phone" label="Nomor telepon" required />
              <label className="text-sm font-semibold">
                Segmen
                <select
                  name="segment"
                  className="mt-2 w-full rounded-xl border px-3 py-2.5"
                  defaultValue="RETAIL"
                >
                  <option value="RETAIL">Retail</option>
                  <option value="WHOLESALE">Wholesale</option>
                  <option value="DISTRIBUTOR">Distributor</option>
                </select>
              </label>
              <Input
                name="creditLimit"
                label="Limit kredit (Rp)"
                type="number"
                min="0"
                defaultValue="0"
                required
              />
              <Input name="city" label="Kota" required />
              <Input name="province" label="Provinsi" required />
            </div>
            <label className="mt-4 block text-sm font-semibold">
              Alamat
              <textarea
                name="address"
                required
                className="mt-2 min-h-24 w-full rounded-xl border px-3 py-2.5"
              />
            </label>
            {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
            <button
              disabled={create.isPending}
              className="mt-6 rounded-xl bg-teal-700 px-5 py-3 font-semibold text-white disabled:opacity-60"
            >
              {create.isPending ? 'Menyimpan...' : 'Simpan pelanggan'}
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
