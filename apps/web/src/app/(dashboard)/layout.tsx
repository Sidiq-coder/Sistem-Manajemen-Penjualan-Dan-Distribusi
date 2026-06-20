'use client';

import { useQuery } from '@tanstack/react-query';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  BarChart3,
  Boxes,
  CircleDollarSign,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquareWarning,
  Package,
  RotateCcw,
  Settings,
  Truck,
  Users,
  Warehouse,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import type { SessionUser } from '@/types';

const navigation = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: [] },
  {
    href: '/products',
    label: 'Produk',
    icon: Package,
    roles: ['SUPER_ADMIN', 'ADMIN', 'SALES', 'WAREHOUSE'],
  },
  {
    href: '/customers',
    label: 'Pelanggan',
    icon: Users,
    roles: ['SUPER_ADMIN', 'ADMIN', 'SALES', 'SUPPORT'],
  },
  {
    href: '/inventory',
    label: 'Gudang & Stok',
    icon: Warehouse,
    roles: ['SUPER_ADMIN', 'ADMIN', 'WAREHOUSE', 'MANAGER'],
  },
  {
    href: '/orders',
    label: 'Pesanan',
    icon: ClipboardList,
    roles: ['SUPER_ADMIN', 'ADMIN', 'SALES', 'MANAGER'],
  },
  {
    href: '/payments',
    label: 'Invoice & Bayar',
    icon: CircleDollarSign,
    roles: ['SUPER_ADMIN', 'ADMIN', 'FINANCE', 'SALES'],
  },
  {
    href: '/shipments',
    label: 'Pengiriman',
    icon: Truck,
    roles: ['SUPER_ADMIN', 'ADMIN', 'DISTRIBUTION', 'COURIER'],
  },
  {
    href: '/returns',
    label: 'Retur',
    icon: RotateCcw,
    roles: ['SUPER_ADMIN', 'ADMIN', 'SUPPORT', 'FINANCE'],
  },
  {
    href: '/complaints',
    label: 'Keluhan',
    icon: MessageSquareWarning,
    roles: ['SUPER_ADMIN', 'ADMIN', 'SUPPORT'],
  },
  {
    href: '/reports',
    label: 'Laporan',
    icon: BarChart3,
    roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'FINANCE'],
  },
  { href: '/settings', label: 'User & Role', icon: Settings, roles: ['SUPER_ADMIN', 'ADMIN'] },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const session = useQuery({
    queryKey: ['session'],
    queryFn: () => api<SessionUser>('/auth/me'),
    retry: false,
  });
  useEffect(() => {
    if (session.isError) router.replace('/login');
  }, [router, session.isError]);
  const roleCodes = useMemo(
    () =>
      (session.data?.roles ?? []).map((role) => (typeof role === 'string' ? role : role.role.code)),
    [session.data],
  );
  const visible = navigation.filter(
    (item) => item.roles.length === 0 || item.roles.some((role) => roleCodes.includes(role)),
  );

  if (session.isPending) {
    return (
      <div className="grid min-h-screen place-items-center text-slate-500">Memuat sesi...</div>
    );
  }
  if (!session.data) return null;

  async function logout() {
    await api('/auth/logout', { method: 'POST' });
    router.replace('/login');
  }

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[270px_1fr]">
      {open && (
        <button
          aria-label="Tutup menu"
          className="fixed inset-0 z-30 bg-slate-950/50 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[270px] flex-col bg-slate-950 text-slate-200 transition-transform lg:static lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-20 items-center justify-between border-b border-slate-800 px-6">
          <div className="flex items-center gap-3 font-bold text-white">
            <span className="grid size-10 place-items-center rounded-xl bg-teal-500 text-slate-950">
              <Boxes size={22} />
            </span>
            <span>SMPD</span>
          </div>
          <button className="lg:hidden" onClick={() => setOpen(false)} aria-label="Tutup sidebar">
            <X />
          </button>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {visible.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium ${
                  active ? 'bg-teal-500 text-slate-950' : 'hover:bg-slate-900 hover:text-white'
                }`}
              >
                <item.icon size={19} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-slate-800 p-4">
          <p className="truncate px-3 text-sm font-semibold text-white">{session.data.name}</p>
          <p className="truncate px-3 text-xs text-slate-400">{session.data.email}</p>
          <button
            onClick={logout}
            className="mt-4 flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm hover:bg-slate-900"
          >
            <LogOut size={18} />
            Keluar
          </button>
        </div>
      </aside>
      <div className="min-w-0">
        <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b bg-white/90 px-5 backdrop-blur lg:px-8">
          <button className="lg:hidden" onClick={() => setOpen(true)} aria-label="Buka sidebar">
            <Menu />
          </button>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-teal-700">
              Operations Control
            </p>
            <p className="hidden text-sm text-slate-500 sm:block">
              Sistem Manajemen Penjualan dan Distribusi
            </p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold">
            {roleCodes[0]?.replaceAll('_', ' ') ?? 'USER'}
          </span>
        </header>
        <main className="p-5 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
