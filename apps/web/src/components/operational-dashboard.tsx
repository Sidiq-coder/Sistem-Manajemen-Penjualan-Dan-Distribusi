import Link from 'next/link';
import {
  ArrowRight,
  BarChart3,
  Boxes,
  CircleDollarSign,
  ClipboardList,
  Headphones,
  Package,
  RotateCcw,
  ShieldCheck,
  Truck,
  Users,
  Warehouse,
} from 'lucide-react';
import { PageHeader } from './page-header';

const operationalActions = [
  {
    href: '/products',
    title: 'Katalog produk',
    description: 'Lihat produk, kategori, dan harga jual aktif.',
    icon: Package,
    roles: ['SALES', 'WAREHOUSE'],
  },
  {
    href: '/customers',
    title: 'Data pelanggan',
    description: 'Kelola kontak, alamat, dan segmentasi pelanggan.',
    icon: Users,
    roles: ['SALES', 'SUPPORT'],
  },
  {
    href: '/orders',
    title: 'Pesanan penjualan',
    description: 'Buat dan konfirmasi order sesuai ketersediaan stok.',
    icon: ClipboardList,
    roles: ['SALES'],
  },
  {
    href: '/payments',
    title: 'Invoice & pembayaran',
    description: 'Catat pembayaran atau pantau status invoice.',
    icon: CircleDollarSign,
    roles: ['SALES'],
  },
  {
    href: '/inventory',
    title: 'Gudang & stok',
    description: 'Pantau saldo, reservasi, dan penyesuaian stok.',
    icon: Warehouse,
    roles: ['WAREHOUSE'],
  },
  {
    href: '/shipments',
    title: 'Pengiriman',
    description: 'Kelola shipment dan perbarui status perjalanan.',
    icon: Truck,
    roles: ['DISTRIBUTION', 'COURIER'],
  },
  {
    href: '/returns',
    title: 'Retur pelanggan',
    description: 'Review pengajuan retur dan tindak lanjut penyelesaian.',
    icon: RotateCcw,
    roles: ['SUPPORT'],
  },
  {
    href: '/complaints',
    title: 'Keluhan pelanggan',
    description: 'Tanggapi tiket dan pantau status penyelesaian.',
    icon: Headphones,
    roles: ['SUPPORT'],
  },
];

const roleDescriptions: Record<string, string> = {
  SALES: 'Kelola pelanggan, pesanan, dan pencatatan pembayaran dari satu tempat.',
  WAREHOUSE: 'Pastikan stok akurat dan setiap perubahan tercatat dalam inventory ledger.',
  DISTRIBUTION: 'Siapkan pengiriman dan pantau pergerakan barang hingga tujuan.',
  COURIER: 'Perbarui status pengiriman agar progres dapat dipantau oleh tim.',
  SUPPORT: 'Tangani retur dan keluhan pelanggan secara terstruktur.',
  CUSTOMER: 'Pantau aktivitas akun dan layanan pelanggan Anda.',
};

export function OperationalDashboard({ roles }: { roles: string[] }) {
  const primaryRole = roles[0] ?? 'USER';
  const actions = operationalActions.filter((action) =>
    action.roles.some((role) => roles.includes(role)),
  );

  return (
    <>
      <PageHeader
        title={`Dashboard ${formatRole(primaryRole)}`}
        description={
          roleDescriptions[primaryRole] ??
          'Akses fitur operasional yang tersedia sesuai dengan role akun Anda.'
        }
      />

      <section className="relative overflow-hidden rounded-2xl bg-slate-950 p-6 text-white shadow-xl sm:p-8">
        <div className="absolute -right-16 -top-20 size-64 rounded-full bg-teal-400/15 blur-3xl" />
        <div className="relative flex flex-col justify-between gap-8 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-teal-300">
              <ShieldCheck size={18} />
              Akses berbasis role aktif
            </div>
            <h2 className="mt-4 max-w-xl text-2xl font-bold sm:text-3xl">
              Fokus pada pekerjaan yang relevan, tanpa akses ke data manajemen yang sensitif.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
              Menu dan API dibatasi berdasarkan tanggung jawab akun. Dashboard ini hanya menampilkan
              pintasan yang memang dapat Anda gunakan.
            </p>
          </div>
          <span className="grid size-20 shrink-0 place-items-center rounded-2xl bg-teal-400 text-slate-950">
            <Boxes size={34} />
          </span>
        </div>
      </section>

      {actions.length > 0 ? (
        <section className="mt-6">
          <h2 className="text-lg font-bold">Pintasan operasional</h2>
          <p className="mt-1 text-sm text-slate-500">Pilih aktivitas yang ingin dikerjakan.</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {actions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="group rounded-2xl border bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-teal-300 hover:shadow-lg"
              >
                <div className="flex items-start justify-between">
                  <span className="grid size-11 place-items-center rounded-xl bg-teal-50 text-teal-700">
                    <action.icon size={21} />
                  </span>
                  <ArrowRight
                    size={18}
                    className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-teal-700"
                  />
                </div>
                <h3 className="mt-5 font-bold">{action.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">{action.description}</p>
              </Link>
            ))}
          </div>
        </section>
      ) : (
        <section className="mt-6 rounded-2xl border bg-white p-8 text-center shadow-sm">
          <BarChart3 className="mx-auto text-slate-300" size={38} />
          <h2 className="mt-4 text-lg font-bold">Belum ada modul operasional untuk role ini</h2>
          <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
            Akun berhasil masuk, tetapi portal khusus role ini belum diaktifkan. Hubungi Super Admin
            jika memerlukan perubahan role atau akses tambahan.
          </p>
        </section>
      )}
    </>
  );
}

function formatRole(role: string) {
  return role
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}
