'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, X } from 'lucide-react';
import { useState } from 'react';
import { PageHeader } from '@/components/page-header';
import { ResourceTable } from '@/components/resource-table';
import { StatusBadge } from '@/components/status-badge';
import { api, rupiah } from '@/lib/api';
import { useRoles } from '@/hooks/use-roles';

type Product = {
  id: string;
  sku: string;
  name: string;
  sellingPrice: number;
  minimumStock: number;
  isActive: boolean;
  category: { name: string };
};
type Category = { id: string; name: string };

export default function ProductsPage() {
  const client = useQueryClient();
  const { hasAny } = useRoles();
  const canManage = hasAny('SUPER_ADMIN', 'ADMIN');
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  const categories = useQuery({
    queryKey: ['categories'],
    queryFn: () => api<Category[]>('/categories'),
  });
  const create = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      api('/products', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ['products'] });
      setOpen(false);
    },
    onError: (cause) => setError(cause.message),
  });

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    const form = new FormData(event.currentTarget);
    create.mutate({
      sku: form.get('sku'),
      name: form.get('name'),
      categoryId: form.get('categoryId'),
      sellingPrice: Number(form.get('sellingPrice')),
      purchasePrice: Number(form.get('purchasePrice')) || null,
      minimumStock: Number(form.get('minimumStock')),
      description: form.get('description') || null,
      isActive: true,
    });
  }

  return (
    <>
      <PageHeader
        title="Produk"
        description="Kelola katalog, harga, kategori, dan batas stok minimum."
        action={
          canManage ? (
            <button
              onClick={() => setOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white"
            >
              <Plus size={18} /> Tambah produk
            </button>
          ) : undefined
        }
      />
      <ResourceTable<Product>
        endpoint="/products"
        queryKey="products"
        columns={[
          {
            key: 'sku',
            label: 'SKU',
            render: (row) => <span className="font-mono font-semibold">{row.sku}</span>,
          },
          {
            key: 'name',
            label: 'Produk',
            render: (row) => <span className="font-semibold">{row.name}</span>,
          },
          { key: 'category', label: 'Kategori', render: (row) => row.category.name },
          { key: 'price', label: 'Harga', render: (row) => rupiah(row.sellingPrice) },
          { key: 'minimum', label: 'Min. stok', render: (row) => row.minimumStock },
          {
            key: 'status',
            label: 'Status',
            render: (row) => <StatusBadge status={row.isActive ? 'ACTIVE' : 'DISABLED'} />,
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
              <h2 className="text-xl font-bold">Tambah produk</h2>
              <button type="button" onClick={() => setOpen(false)} aria-label="Tutup">
                <X />
              </button>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Field name="sku" label="SKU" required />
              <Field name="name" label="Nama produk" required />
              <label className="text-sm font-semibold">
                Kategori
                <select
                  name="categoryId"
                  required
                  className="mt-2 w-full rounded-xl border px-3 py-2.5"
                >
                  <option value="">Pilih kategori</option>
                  {categories.data?.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>
              <Field name="sellingPrice" label="Harga jual (Rp)" type="number" min="0" required />
              <Field name="purchasePrice" label="Harga beli (Rp)" type="number" min="0" />
              <Field
                name="minimumStock"
                label="Stok minimum"
                type="number"
                min="0"
                defaultValue="0"
                required
              />
            </div>
            <label className="mt-4 block text-sm font-semibold">
              Deskripsi
              <textarea
                name="description"
                className="mt-2 min-h-24 w-full rounded-xl border px-3 py-2.5"
              />
            </label>
            {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
            <button
              disabled={create.isPending}
              className="mt-6 rounded-xl bg-teal-700 px-5 py-3 font-semibold text-white disabled:opacity-60"
            >
              {create.isPending ? 'Menyimpan...' : 'Simpan produk'}
            </button>
          </form>
        </div>
      )}
    </>
  );
}

function Field(props: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  const { label, ...input } = props;
  return (
    <label className="text-sm font-semibold">
      {label}
      <input {...input} className="mt-2 w-full rounded-xl border px-3 py-2.5" />
    </label>
  );
}
