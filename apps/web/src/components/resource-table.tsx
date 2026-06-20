'use client';

import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { useState } from 'react';
import { api } from '@/lib/api';
import type { ApiList } from '@/types';

export type Column<T> = {
  key: string;
  label: string;
  render: (row: T) => React.ReactNode;
};

export function ResourceTable<T extends { id: string }>({
  endpoint,
  queryKey,
  columns,
  emptyMessage = 'Belum ada data.',
}: {
  endpoint: string;
  queryKey: string;
  columns: Column<T>[];
  emptyMessage?: string;
}) {
  const [search, setSearch] = useState('');
  const result = useQuery({
    queryKey: [queryKey, search],
    queryFn: () =>
      api<ApiList<T>>(`${endpoint}?page=1&limit=50&search=${encodeURIComponent(search)}`),
  });

  return (
    <section className="overflow-hidden rounded-2xl border bg-white shadow-sm">
      <div className="border-b p-4">
        <label className="relative block max-w-sm">
          <span className="sr-only">Cari</span>
          <Search className="absolute left-3 top-3 text-slate-400" size={18} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Cari data..."
            className="w-full rounded-xl border py-2.5 pl-10 pr-4 text-sm"
          />
        </label>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="px-5 py-3 font-semibold">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {result.data?.data.map((row) => (
              <tr key={row.id} className="hover:bg-slate-50/70">
                {columns.map((column) => (
                  <td key={column.key} className="px-5 py-4">
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {result.isPending && <p className="p-8 text-center text-slate-500">Memuat data...</p>}
      {result.isError && (
        <p className="m-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">{result.error.message}</p>
      )}
      {!result.isPending && result.data?.data.length === 0 && (
        <p className="p-10 text-center text-slate-500">{emptyMessage}</p>
      )}
      {result.data?.meta && (
        <div className="border-t px-5 py-3 text-xs text-slate-500">
          Menampilkan {result.data.data.length} dari {result.data.meta.total} data
        </div>
      )}
    </section>
  );
}
