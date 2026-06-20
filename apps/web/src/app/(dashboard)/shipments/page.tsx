'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowRight, Plus, X } from 'lucide-react';
import { useState } from 'react';
import { PageHeader } from '@/components/page-header';
import { ResourceTable } from '@/components/resource-table';
import { StatusBadge } from '@/components/status-badge';
import { api, dateTime } from '@/lib/api';
import type { ApiList } from '@/types';
import { useRoles } from '@/hooks/use-roles';

type Shipment = {
  id: string;
  shipmentNumber: string;
  trackingNumber: string;
  courierName: string;
  status: string;
  createdAt: string;
  salesOrder: { orderNumber: string; customer: { name: string } };
};

export default function ShipmentsPage() {
  const client = useQueryClient();
  const { hasAny } = useRoles();
  const canCreate = hasAny('SUPER_ADMIN', 'ADMIN', 'DISTRIBUTION');
  const canUpdate = hasAny('SUPER_ADMIN', 'ADMIN', 'DISTRIBUTION', 'COURIER');
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  const orders = useQuery({
    queryKey: ['orders', 'shipment-options'],
    queryFn: () =>
      api<
        ApiList<{
          id: string;
          orderNumber: string;
          status: string;
          customer: { name: string };
        }>
      >('/sales-orders?limit=100'),
  });
  const create = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      api('/shipments', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ['shipments'] });
      await client.invalidateQueries({ queryKey: ['orders'] });
      setOpen(false);
    },
    onError: (cause) => setError(cause.message),
  });
  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api(`/shipments/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, note: `Status diperbarui ke ${status}` }),
      }),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ['shipments'] });
      await client.invalidateQueries({ queryKey: ['orders'] });
    },
  });

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setError('');
    create.mutate({
      salesOrderId: form.get('salesOrderId'),
      courierName: form.get('courierName'),
      trackingNumber: form.get('trackingNumber'),
      scheduledAt: form.get('scheduledAt')
        ? new Date(String(form.get('scheduledAt'))).toISOString()
        : null,
    });
  }

  return (
    <>
      <PageHeader
        title="Distribusi & pengiriman"
        description="Assignment kurir, tracking, dan lifecycle pengiriman."
        action={
          canCreate ? (
            <button
              onClick={() => setOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white"
            >
              <Plus size={18} /> Buat shipment
            </button>
          ) : undefined
        }
      />
      {updateStatus.isError && (
        <p className="mb-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">
          {updateStatus.error.message}
        </p>
      )}
      <ResourceTable<Shipment>
        endpoint="/shipments"
        queryKey="shipments"
        columns={[
          {
            key: 'number',
            label: 'Shipment',
            render: (row) => (
              <div>
                <p className="font-mono font-semibold">{row.shipmentNumber}</p>
                <p className="text-xs text-slate-500">{row.trackingNumber}</p>
              </div>
            ),
          },
          { key: 'order', label: 'Order', render: (row) => row.salesOrder.orderNumber },
          { key: 'customer', label: 'Pelanggan', render: (row) => row.salesOrder.customer.name },
          { key: 'courier', label: 'Kurir', render: (row) => row.courierName },
          { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
          { key: 'date', label: 'Dibuat', render: (row) => dateTime(row.createdAt) },
          {
            key: 'action',
            label: 'Aksi',
            render: (row) => {
              const next = nextShipmentStatus(row.status);
              return next && canUpdate ? (
                <button
                  onClick={() => updateStatus.mutate({ id: row.id, status: next })}
                  disabled={updateStatus.isPending}
                  className="flex items-center gap-1 rounded-lg bg-teal-50 px-3 py-2 text-xs font-semibold text-teal-800"
                >
                  {next.replaceAll('_', ' ')} <ArrowRight size={14} />
                </button>
              ) : (
                <span className="text-xs text-slate-400">Selesai</span>
              );
            },
          },
        ]}
      />
      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/55 p-4">
          <form onSubmit={submit} className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Buat shipment</h2>
              <button type="button" onClick={() => setOpen(false)} aria-label="Tutup">
                <X />
              </button>
            </div>
            <label className="mt-6 block text-sm font-semibold">
              Order paid
              <select
                name="salesOrderId"
                required
                className="mt-2 w-full rounded-xl border px-3 py-2.5"
              >
                <option value="">Pilih order</option>
                {orders.data?.data
                  .filter((order) => order.status === 'PAID' || order.status === 'READY_TO_SHIP')
                  .map((order) => (
                    <option key={order.id} value={order.id}>
                      {order.orderNumber} — {order.customer.name}
                    </option>
                  ))}
              </select>
            </label>
            <label className="mt-4 block text-sm font-semibold">
              Kurir / armada
              <input
                name="courierName"
                required
                className="mt-2 w-full rounded-xl border px-3 py-2.5"
              />
            </label>
            <label className="mt-4 block text-sm font-semibold">
              Nomor tracking
              <input
                name="trackingNumber"
                required
                className="mt-2 w-full rounded-xl border px-3 py-2.5"
              />
            </label>
            <label className="mt-4 block text-sm font-semibold">
              Jadwal
              <input
                name="scheduledAt"
                type="datetime-local"
                className="mt-2 w-full rounded-xl border px-3 py-2.5"
              />
            </label>
            {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
            <button
              disabled={create.isPending}
              className="mt-6 rounded-xl bg-teal-700 px-5 py-3 font-semibold text-white disabled:opacity-60"
            >
              {create.isPending ? 'Menyimpan...' : 'Buat shipment'}
            </button>
          </form>
        </div>
      )}
    </>
  );
}

function nextShipmentStatus(status: string) {
  const next: Record<string, string | undefined> = {
    PENDING: 'SCHEDULED',
    SCHEDULED: 'PICKED_UP',
    PICKED_UP: 'IN_TRANSIT',
    IN_TRANSIT: 'DELIVERED',
  };
  return next[status];
}
