'use client';

import { useQuery } from '@tanstack/react-query';
import {
  AlertTriangle,
  CircleDollarSign,
  ClipboardList,
  MessageSquareWarning,
  Truck,
  Users,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { PageHeader } from '@/components/page-header';
import { OperationalDashboard } from '@/components/operational-dashboard';
import { useRoles } from '@/hooks/use-roles';
import { api, rupiah } from '@/lib/api';

type Dashboard = {
  revenue: number;
  orderCount: number;
  customerCount: number;
  lowStockCount: number;
  pendingShipments: number;
  openComplaints: number;
};
type SalesPoint = { date: string; orders: number; revenue: number };

export default function DashboardPage() {
  const { roles, hasAny } = useRoles();
  const canViewReports = hasAny('SUPER_ADMIN', 'ADMIN', 'MANAGER', 'FINANCE');
  const summary = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api<Dashboard>('/reports/dashboard'),
    enabled: canViewReports,
  });
  const sales = useQuery({
    queryKey: ['sales-summary'],
    queryFn: () => api<SalesPoint[]>('/reports/sales-summary'),
    enabled: canViewReports,
  });
  const cards = [
    {
      label: 'Pendapatan terverifikasi',
      value: rupiah(summary.data?.revenue ?? 0),
      icon: CircleDollarSign,
    },
    { label: 'Total pesanan', value: summary.data?.orderCount ?? 0, icon: ClipboardList },
    { label: 'Pelanggan aktif', value: summary.data?.customerCount ?? 0, icon: Users },
    { label: 'Stok rendah', value: summary.data?.lowStockCount ?? 0, icon: AlertTriangle },
    { label: 'Pengiriman berjalan', value: summary.data?.pendingShipments ?? 0, icon: Truck },
    {
      label: 'Keluhan terbuka',
      value: summary.data?.openComplaints ?? 0,
      icon: MessageSquareWarning,
    },
  ];

  if (!canViewReports) {
    return <OperationalDashboard roles={roles} />;
  }

  return (
    <>
      <PageHeader
        title="Dashboard operasional"
        description="Ringkasan KPI penjualan, stok, pengiriman, dan layanan pelanggan."
      />
      {summary.isError && (
        <p className="mb-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">
          {summary.error.message}
        </p>
      )}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <article key={card.label} className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500">{card.label}</p>
                <p className="mt-3 text-2xl font-bold">{summary.isPending ? '—' : card.value}</p>
              </div>
              <span className="grid size-11 place-items-center rounded-xl bg-teal-50 text-teal-700">
                <card.icon size={21} />
              </span>
            </div>
          </article>
        ))}
      </section>
      <section className="mt-6 rounded-2xl border bg-white p-5 shadow-sm">
        <div className="mb-5">
          <h2 className="text-lg font-bold">Tren penjualan</h2>
          <p className="text-sm text-slate-500">Nilai order paid pada periode berjalan.</p>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sales.data ?? []}>
              <defs>
                <linearGradient id="sales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0f766e" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#0f766e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => `${value / 1_000_000}jt`} />
              <Tooltip formatter={(value) => rupiah(Number(value))} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#0f766e"
                fill="url(#sales)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>
    </>
  );
}
