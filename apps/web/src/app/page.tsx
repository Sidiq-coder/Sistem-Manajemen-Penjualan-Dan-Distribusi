import type { Metadata } from 'next';
import Image from 'next/image';
import {
  ArrowRight,
  BarChart3,
  Boxes,
  Check,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  FileCheck2,
  Gauge,
  Headphones,
  Layers3,
  LockKeyhole,
  Menu,
  PackageSearch,
  PackageCheck,
  PlayCircle,
  RefreshCcw,
  ShieldCheck,
  Store,
  Truck,
  UserCog,
  Users,
  Warehouse,
  X,
  Zap,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'SMPD — Sistem Manajemen Penjualan & Distribusi',
  description:
    'Satukan penjualan, inventaris, pembayaran, dan distribusi dalam satu platform operasional yang aman dan real-time.',
};

const features = [
  {
    icon: PackageCheck,
    title: 'Produk & penjualan',
    description:
      'Kelola katalog, kategori, harga, pelanggan, dan pesanan dari berbagai kanal secara terpusat.',
    color: 'teal',
  },
  {
    icon: Warehouse,
    title: 'Stok multi-gudang',
    description:
      'Pantau saldo, reservasi, mutasi stok, dan peringatan stok rendah dengan ledger yang dapat diaudit.',
    color: 'blue',
  },
  {
    icon: CircleDollarSign,
    title: 'Invoice & pembayaran',
    description:
      'Terbitkan invoice otomatis, catat pembayaran, dan jalankan verifikasi finance dengan aman.',
    color: 'amber',
  },
  {
    icon: Truck,
    title: 'Distribusi terkontrol',
    description:
      'Buat shipment, tetapkan kurir, dan lacak status pengiriman hingga diterima pelanggan.',
    color: 'violet',
  },
  {
    icon: RefreshCcw,
    title: 'Retur & keluhan',
    description:
      'Tangani retur, refund, replacement, dan komunikasi pelanggan dalam alur yang terdokumentasi.',
    color: 'rose',
  },
  {
    icon: BarChart3,
    title: 'Laporan bisnis',
    description:
      'Lihat KPI, tren penjualan, performa produk, kondisi stok, dan pengiriman dari satu dashboard.',
    color: 'cyan',
  },
];

const roles = [
  {
    icon: ShieldCheck,
    label: 'Super Admin',
    text: 'Mengelola akun, role, akses, konfigurasi, dan pengawasan seluruh sistem.',
  },
  {
    icon: UserCog,
    label: 'Admin',
    text: 'Mengelola master data produk, kategori, pelanggan, dan kebutuhan operasional.',
  },
  {
    icon: Store,
    label: 'Sales',
    text: 'Mengelola pelanggan, membuat pesanan, dan memantau proses penjualan.',
  },
  {
    icon: Warehouse,
    label: 'Warehouse',
    text: 'Menjaga akurasi stok, melakukan adjustment, dan memantau inventory ledger.',
  },
  {
    icon: Truck,
    label: 'Distribution',
    text: 'Membuat shipment, mengatur kurir, dan mengendalikan proses distribusi.',
  },
  {
    icon: PackageSearch,
    label: 'Courier',
    text: 'Memperbarui status perjalanan barang hingga diterima oleh pelanggan.',
  },
  {
    icon: Gauge,
    label: 'Manager',
    text: 'Memantau KPI, laporan penjualan, inventaris, dan performa operasional.',
  },
  {
    icon: CircleDollarSign,
    label: 'Finance',
    text: 'Memverifikasi pembayaran, memantau invoice, dan menangani proses refund.',
  },
  {
    icon: Headphones,
    label: 'Support',
    text: 'Menangani keluhan, retur, komunikasi, dan penyelesaian layanan pelanggan.',
  },
  {
    icon: Users,
    label: 'Customer',
    text: 'Mendapatkan akses layanan untuk pesanan, pengiriman, retur, dan keluhan.',
  },
];

const steps = [
  {
    number: '01',
    title: 'Pesanan dibuat',
    text: 'Sales memilih pelanggan, gudang, dan produk. Harga serta total dihitung ulang oleh server.',
  },
  {
    number: '02',
    title: 'Stok diamankan',
    text: 'Sistem memvalidasi ketersediaan dan mereservasi stok agar tidak terjadi double-selling.',
  },
  {
    number: '03',
    title: 'Pembayaran diverifikasi',
    text: 'Invoice dibuat otomatis dan finance mengonfirmasi pembayaran dengan jejak audit.',
  },
  {
    number: '04',
    title: 'Pesanan dikirim',
    text: 'Tim distribusi membuat shipment dan status dapat dipantau sampai barang diterima.',
  },
];

const moduleGroups = [
  {
    number: '01',
    title: 'Master data',
    description: 'Fondasi informasi yang digunakan oleh seluruh proses transaksi.',
    items: ['Produk & kategori', 'Pelanggan & alamat', 'Gudang & lokasi', 'User & role'],
  },
  {
    number: '02',
    title: 'Operasi penjualan',
    description: 'Alur komersial dari permintaan pelanggan sampai pembayaran diterima.',
    items: ['Sales order', 'Kalkulasi harga', 'Invoice otomatis', 'Verifikasi pembayaran'],
  },
  {
    number: '03',
    title: 'Inventaris',
    description: 'Kontrol ketersediaan barang dengan pencatatan pergerakan yang konsisten.',
    items: ['Saldo per gudang', 'Reservasi stok', 'Stock adjustment', 'Inventory ledger'],
  },
  {
    number: '04',
    title: 'Distribusi & layanan',
    description: 'Pengelolaan pemenuhan pesanan dan layanan setelah penjualan.',
    items: ['Shipment & tracking', 'Status kurir', 'Retur & refund', 'Keluhan pelanggan'],
  },
  {
    number: '05',
    title: 'Kontrol manajemen',
    description: 'Informasi terukur untuk pengawasan dan pengambilan keputusan.',
    items: ['Dashboard KPI', 'Tren penjualan', 'Laporan stok', 'Performa pengiriman'],
  },
  {
    number: '06',
    title: 'Keamanan sistem',
    description: 'Lapisan perlindungan untuk akun, data, dan operasi bisnis sensitif.',
    items: ['RBAC', 'Audit log', 'Rate limiting', 'Validasi berlapis'],
  },
];

export default function LandingPage() {
  return (
    <main className="landing-page overflow-hidden bg-[#f7faf9] text-slate-950">
      <header className="absolute inset-x-0 top-0 z-50">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8">
          <a href="/" className="flex items-center gap-3 font-bold text-white">
            <span className="grid size-10 place-items-center rounded-xl bg-teal-400 text-slate-950 shadow-lg shadow-teal-950/20">
              <Boxes size={22} />
            </span>
            <span className="text-lg tracking-tight">SMPD</span>
          </a>

          <nav className="hidden items-center gap-8 text-sm font-medium text-slate-300 lg:flex">
            <a href="#fitur" className="transition hover:text-white">
              Fitur
            </a>
            <a href="#cakupan" className="transition hover:text-white">
              Modul
            </a>
            <a href="#cara-kerja" className="transition hover:text-white">
              Cara kerja
            </a>
            <a href="/demo" className="transition hover:text-white">
              Demo
            </a>
            <a href="#keamanan" className="transition hover:text-white">
              Keamanan
            </a>
            <a href="#pengguna" className="transition hover:text-white">
              Pengguna
            </a>
          </nav>

          <div className="hidden items-center gap-3 sm:flex">
            <a
              href="/demo"
              className="rounded-xl bg-teal-400 px-5 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-teal-300"
            >
              Lihat demo
            </a>
          </div>

          <details className="group relative sm:hidden">
            <summary className="grid size-10 cursor-pointer list-none place-items-center rounded-xl border border-white/20 text-white">
              <Menu className="group-open:hidden" size={20} />
              <X className="hidden group-open:block" size={20} />
            </summary>
            <nav className="absolute right-0 top-14 w-64 rounded-2xl border border-white/10 bg-slate-950 p-3 text-sm text-white shadow-2xl">
              {[
                ['#fitur', 'Fitur'],
                ['#cakupan', 'Cakupan modul'],
                ['#cara-kerja', 'Cara kerja'],
                ['/demo', 'Demo interaktif'],
                ['#keamanan', 'Keamanan'],
                ['#pengguna', 'Role pengguna'],
              ].map(([href, label]) => (
                <a key={href} href={href} className="block rounded-lg px-4 py-3 hover:bg-white/10">
                  {label}
                </a>
              ))}
              <a
                href="/demo"
                className="mt-2 block rounded-lg bg-teal-400 px-4 py-3 text-center font-bold text-slate-950"
              >
                Lihat demo
              </a>
            </nav>
          </details>
        </div>
      </header>

      <section className="landing-hero relative min-h-[780px] bg-slate-950 pt-20 text-white">
        <div className="landing-grid absolute inset-0 opacity-25" />
        <div className="landing-glow landing-glow-one" />
        <div className="landing-glow landing-glow-two" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 pb-28 pt-20 lg:grid-cols-[1.02fr_0.98fr] lg:px-8 lg:pb-36 lg:pt-28">
          <div className="landing-fade-up max-w-2xl">
            <div className="mb-7 inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-teal-200">
              <span className="size-2 rounded-full bg-teal-300 shadow-[0_0_0_6px_rgba(94,234,212,0.1)]" />
              Order → stok → invoice → pengiriman
            </div>
            <h1 className="text-5xl font-semibold leading-[1.05] tracking-[-0.045em] sm:text-6xl lg:text-7xl">
              Satu alur kerja. <span className="text-teal-300">Tidak ada status yang hilang</span>{' '}
              di tengah jalan.
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-slate-300">
              Saat order dikonfirmasi, stok langsung direservasi. Saat pembayaran diverifikasi,
              distribusi dapat bergerak. Setiap perubahan tercatat dan dapat ditelusuri.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a
                href="/demo"
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-teal-400 px-6 py-3.5 font-bold text-slate-950 transition hover:bg-teal-300"
              >
                Buka demo sistem
                <ArrowRight className="transition group-hover:translate-x-1" size={18} />
              </a>
              <a
                href="#cara-kerja"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 py-3.5 font-semibold text-white transition hover:bg-white/10"
              >
                Pelajari alurnya
                <ChevronRight size={18} />
              </a>
            </div>
            <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-sm text-slate-300">
              {['Reservasi stok otomatis', 'Akses sesuai peran', 'Jejak audit per transaksi'].map(
                (item) => (
                  <span key={item} className="flex items-center gap-2">
                    <span className="grid size-5 place-items-center rounded-full bg-teal-400/15 text-teal-300">
                      <Check size={13} strokeWidth={3} />
                    </span>
                    {item}
                  </span>
                ),
              )}
            </div>
          </div>

          <DashboardPreview />
        </div>

        <div className="absolute inset-x-0 bottom-0 translate-y-1/2">
          <div className="mx-auto grid max-w-5xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-slate-200 bg-slate-200 shadow-2xl shadow-slate-950/10 sm:grid-cols-4">
            {[
              ['6 domain', 'Dalam satu alur'],
              ['10 role', 'Akses sesuai tugas'],
              ['1 ledger', 'Riwayat pergerakan stok'],
              ['End-to-end', 'Order sampai diterima'],
            ].map(([value, label]) => (
              <div key={label} className="bg-white px-5 py-6 text-center">
                <p className="text-2xl font-bold tracking-tight text-slate-950">{value}</p>
                <p className="mt-1 text-xs font-medium text-slate-500">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 pb-6 pt-40 lg:px-8 lg:pt-44">
        <div className="mx-auto max-w-7xl">
          <div className="grid overflow-hidden rounded-[2rem] bg-[#d9efe9] lg:grid-cols-[1.08fr_0.92fr]">
            <div className="relative min-h-[430px] overflow-hidden">
              <Image
                src="/images/warehouse-operations-demo.png"
                alt="Tim gudang memindai paket dan memeriksa stok pada tablet"
                fill
                priority
                className="object-cover"
                sizes="(min-width: 1024px) 54vw, 100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950/10 to-transparent" />
              <div className="absolute bottom-5 left-5 rounded-xl bg-white/90 px-4 py-3 text-xs font-semibold text-slate-700 shadow-xl backdrop-blur">
                Gambaran operasional gudang
              </div>
            </div>
            <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-14">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-800">
                Lihat sebelum menggunakan
              </p>
              <h2 className="mt-4 text-3xl font-bold tracking-[-0.035em] sm:text-4xl">
                Demo yang menjelaskan kerja sistem, bukan sekadar memamerkan dashboard.
              </h2>
              <p className="mt-5 leading-7 text-slate-700">
                Ikuti satu pesanan dari meja sales sampai paket diterima. Setiap tahap menunjukkan
                siapa yang bekerja, data apa yang berubah, dan kontrol apa yang dijalankan sistem.
              </p>
              <div className="mt-7 grid grid-cols-2 gap-3 text-sm">
                {['Order dibuat', 'Stok direservasi', 'Invoice diverifikasi', 'Paket dilacak'].map(
                  (item, index) => (
                    <div
                      key={item}
                      className="flex items-center gap-3 border-t border-teal-900/15 pt-3"
                    >
                      <span className="font-mono text-xs text-teal-800">0{index + 1}</span>
                      <span className="font-semibold">{item}</span>
                    </div>
                  ),
                )}
              </div>
              <a
                href="/demo"
                className="group mt-9 inline-flex w-fit items-center gap-3 rounded-xl bg-slate-950 px-5 py-3.5 font-bold text-white transition hover:bg-slate-800"
              >
                <PlayCircle size={19} className="text-teal-300" />
                Mulai tur demo
                <ArrowRight size={17} className="transition group-hover:translate-x-1" />
              </a>
            </div>
          </div>
        </div>
      </section>

      <section id="fitur" className="scroll-mt-20 px-5 pb-24 pt-40 lg:px-8 lg:pb-32">
        <div className="mx-auto max-w-7xl">
          <SectionIntro
            eyebrow="Satu sumber data"
            title="Semua yang dibutuhkan untuk menggerakkan operasional."
            text="Hilangkan spreadsheet terpisah dan proses manual. Setiap tim bekerja pada alur dan data yang sama."
          />
          <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <article
                key={feature.title}
                className="landing-card group rounded-2xl border border-slate-200 bg-white p-7 shadow-sm"
              >
                <span
                  className={`feature-icon feature-icon-${feature.color} grid size-12 place-items-center rounded-xl`}
                >
                  <feature.icon size={23} />
                </span>
                <h3 className="mt-6 text-xl font-bold tracking-tight">{feature.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{feature.description}</p>
                <div className="mt-6 flex items-center gap-2 text-sm font-bold text-teal-700">
                  Terintegrasi penuh
                  <ArrowRight
                    size={16}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="cakupan"
        className="scroll-mt-20 bg-slate-950 px-5 py-24 text-white lg:px-8 lg:py-32"
      >
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:gap-16">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-teal-300">
                Cakupan platform
              </p>
              <h2 className="mt-4 text-4xl font-bold tracking-[-0.035em] sm:text-5xl">
                Modul yang saling terhubung, bukan aplikasi yang terpisah.
              </h2>
              <p className="mt-6 text-base leading-8 text-slate-300">
                Setiap modul menggunakan sumber data dan aturan bisnis yang sama. Perubahan pada
                pesanan dapat langsung memengaruhi reservasi stok, invoice, pembayaran, pengiriman,
                dan laporan.
              </p>
              <div className="mt-8 rounded-2xl border border-teal-300/15 bg-teal-300/10 p-6">
                <Layers3 className="text-teal-300" size={26} />
                <p className="mt-4 font-bold">Modular monolith enterprise-ready</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Domain dipisahkan secara jelas agar mudah dipelihara dan dapat dikembangkan
                  bertahap tanpa menambah kompleksitas yang tidak diperlukan.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {moduleGroups.map((group) => (
                <article
                  key={group.number}
                  className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold tracking-[0.2em] text-teal-300">
                      MODUL {group.number}
                    </span>
                    <span className="size-2 rounded-full bg-teal-300" />
                  </div>
                  <h3 className="mt-4 text-xl font-bold">{group.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{group.description}</p>
                  <ul className="mt-5 space-y-2">
                    {group.items.map((item) => (
                      <li key={item} className="flex items-center gap-2 text-sm text-slate-200">
                        <Check size={14} className="text-teal-300" strokeWidth={3} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="cara-kerja" className="scroll-mt-20 bg-white px-5 py-24 lg:px-8 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-16 lg:grid-cols-[0.82fr_1.18fr] lg:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-teal-700">
                Order-to-delivery
              </p>
              <h2 className="mt-4 text-4xl font-bold tracking-[-0.035em] sm:text-5xl">
                Satu alur, tanpa kehilangan kendali.
              </h2>
              <p className="mt-6 text-base leading-8 text-slate-600">
                Setiap perubahan status terhubung dengan stok, invoice, pembayaran, dan pengiriman.
                Tim tidak perlu menyalin data atau menebak kondisi terakhir.
              </p>
              <div className="mt-8 rounded-2xl bg-slate-950 p-6 text-white">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="text-teal-300" />
                  <p className="font-bold">Transaksi aman dan konsisten</p>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  Validasi stok, reservasi, pembayaran, dan pengiriman diproses oleh server dengan
                  database transaction.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="absolute bottom-8 left-6 top-8 w-px bg-gradient-to-b from-teal-300 via-teal-600 to-slate-200 sm:left-8" />
              <div className="space-y-4">
                {steps.map((step) => (
                  <article
                    key={step.number}
                    className="relative flex gap-5 rounded-2xl border border-slate-200 bg-[#f8fbfa] p-5 sm:gap-7 sm:p-7"
                  >
                    <span className="relative z-10 grid size-12 shrink-0 place-items-center rounded-xl bg-slate-950 text-sm font-bold text-teal-300 shadow-lg sm:size-14">
                      {step.number}
                    </span>
                    <div>
                      <h3 className="text-lg font-bold">{step.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{step.text}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="keamanan"
        className="scroll-mt-20 bg-slate-950 px-5 py-24 text-white lg:px-8 lg:py-32"
      >
        <div className="mx-auto max-w-7xl">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            <SecurityVisual />
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-teal-300">
                Dibangun untuk dipercaya
              </p>
              <h2 className="mt-4 text-4xl font-bold tracking-[-0.035em] sm:text-5xl">
                Keamanan bukan fitur tambahan.
              </h2>
              <p className="mt-6 max-w-xl text-base leading-8 text-slate-300">
                Kontrol akses, validasi, dan audit menjadi bagian dari setiap alur penting—mulai
                dari autentikasi hingga perubahan stok dan verifikasi pembayaran.
              </p>
              <div className="mt-9 grid gap-4 sm:grid-cols-2">
                {[
                  [LockKeyhole, 'Autentikasi aman', 'HttpOnly cookie dan refresh rotation'],
                  [Users, 'RBAC', 'Navigasi dan endpoint sesuai role'],
                  [FileCheck2, 'Audit log', 'Jejak operasi bisnis penting'],
                  [ShieldCheck, 'Validasi berlapis', 'Input diverifikasi di client dan server'],
                ].map(([Icon, title, text]) => {
                  const SecurityIcon = Icon as typeof LockKeyhole;
                  return (
                    <div
                      key={String(title)}
                      className="rounded-xl border border-white/10 bg-white/5 p-5"
                    >
                      <SecurityIcon size={20} className="text-teal-300" />
                      <p className="mt-4 font-bold">{String(title)}</p>
                      <p className="mt-1 text-xs leading-5 text-slate-400">{String(text)}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="pengguna" className="scroll-mt-20 px-5 py-24 lg:px-8 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <SectionIntro
            eyebrow="Kolaborasi lintas tim"
            title="Sepuluh role dengan tanggung jawab yang jelas."
            text="Setiap pengguna hanya melihat menu dan data yang relevan dengan pekerjaannya, sehingga operasional lebih fokus dan risiko akses berlebihan dapat dikurangi."
          />
          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {roles.map((role) => (
              <article
                key={role.label}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-teal-300 hover:shadow-lg"
              >
                <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-teal-50 text-teal-700">
                  <role.icon size={22} />
                </span>
                <h3 className="mt-5 font-bold">{role.label}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">{role.text}</p>
              </article>
            ))}
          </div>

          <div
            id="ringkasan"
            className="relative mt-24 overflow-hidden rounded-[2rem] bg-teal-500 px-6 py-14 text-slate-950 shadow-2xl shadow-teal-900/15 sm:px-12 lg:px-16 lg:py-16"
          >
            <div className="landing-cta-grid absolute inset-0 opacity-20" />
            <div className="relative flex flex-col items-start justify-between gap-9 lg:flex-row lg:items-center">
              <div className="max-w-2xl">
                <p className="text-sm font-bold uppercase tracking-[0.2em]">
                  Platform operasional terpadu
                </p>
                <h2 className="mt-3 text-4xl font-bold tracking-[-0.04em] sm:text-5xl">
                  Satu sistem untuk seluruh siklus penjualan dan distribusi.
                </h2>
                <p className="mt-5 max-w-xl leading-7 text-teal-950/80">
                  Dirancang untuk membantu organisasi mengurangi proses manual, meningkatkan
                  visibilitas data, dan menjaga setiap aktivitas tetap tercatat.
                </p>
              </div>
              <a
                href="#cara-kerja"
                className="group inline-flex shrink-0 items-center gap-2 rounded-xl bg-slate-950 px-6 py-4 font-bold text-white shadow-xl transition hover:bg-slate-800"
              >
                Pelajari alur sistem
                <ArrowRight className="transition group-hover:translate-x-1" size={19} />
              </a>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white px-5 py-12 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-slate-950 text-teal-300">
              <Boxes size={21} />
            </span>
            <div>
              <p className="font-bold">SMPD Enterprise</p>
              <p className="text-xs text-slate-500">Penjualan dan distribusi terintegrasi</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-500">
            <a href="#fitur" className="hover:text-slate-950">
              Fitur
            </a>
            <a href="#keamanan" className="hover:text-slate-950">
              Keamanan
            </a>
            <a href="#pengguna" className="hover:text-slate-950">
              Role pengguna
            </a>
            <a href="#cara-kerja" className="hover:text-slate-950">
              Cara kerja
            </a>
          </div>
          <p className="text-xs text-slate-400">© 2026 SMPD. Seluruh hak dilindungi.</p>
        </div>
      </footer>
    </main>
  );
}

function SectionIntro({ eyebrow, title, text }: { eyebrow: string; title: string; text: string }) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <p className="text-sm font-bold uppercase tracking-[0.2em] text-teal-700">{eyebrow}</p>
      <h2 className="mt-4 text-4xl font-bold tracking-[-0.035em] sm:text-5xl">{title}</h2>
      <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-slate-600">{text}</p>
    </div>
  );
}

function DashboardPreview() {
  return (
    <div className="landing-preview relative mx-auto w-full max-w-[620px] lg:ml-auto">
      <div className="absolute -left-6 top-16 z-20 hidden rounded-2xl border border-white/10 bg-slate-900/90 p-4 shadow-2xl backdrop-blur sm:block">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-emerald-400/15 text-emerald-300">
            <Zap size={18} />
          </span>
          <div>
            <p className="text-xs text-slate-400">Status stok</p>
            <p className="text-sm font-bold text-white">Tersinkron real-time</p>
          </div>
        </div>
      </div>
      <div className="absolute -right-3 bottom-16 z-20 hidden rounded-2xl border border-white/10 bg-slate-900/90 p-4 shadow-2xl backdrop-blur sm:block">
        <p className="text-xs text-slate-400">Dalam perjalanan</p>
        <p className="mt-1 text-2xl font-bold text-white">18 shipment</p>
        <p className="mt-1 text-xs font-semibold text-emerald-300">6 tiba hari ini</p>
      </div>

      <div className="rotate-[1.5deg] rounded-[1.7rem] border border-white/15 bg-white/10 p-2 shadow-[0_40px_100px_rgba(0,0,0,0.45)] backdrop-blur">
        <div className="overflow-hidden rounded-[1.3rem] bg-[#f4f7fb] text-slate-950">
          <div className="flex h-12 items-center justify-between border-b border-slate-200 bg-white px-4">
            <div className="flex items-center gap-2">
              <span className="size-2.5 rounded-full bg-red-400" />
              <span className="size-2.5 rounded-full bg-amber-400" />
              <span className="size-2.5 rounded-full bg-emerald-400" />
            </div>
            <div className="h-6 w-40 rounded-md bg-slate-100" />
            <div className="size-7 rounded-full bg-teal-100" />
          </div>
          <div className="grid grid-cols-[64px_1fr] sm:grid-cols-[150px_1fr]">
            <div className="min-h-[430px] bg-slate-950 p-3 sm:p-4">
              <div className="mb-7 hidden items-center gap-2 text-xs font-bold text-white sm:flex">
                <Boxes size={18} className="text-teal-300" />
                SMPD
              </div>
              <div className="space-y-2">
                {[Gauge, PackageCheck, Warehouse, CircleDollarSign, Truck, BarChart3].map(
                  (Icon, index) => (
                    <div
                      key={index}
                      className={`flex h-10 items-center gap-2 rounded-lg px-2.5 ${
                        index === 0 ? 'bg-teal-400 text-slate-950' : 'text-slate-500'
                      }`}
                    >
                      <Icon size={16} />
                      <span className="hidden text-[10px] font-semibold sm:block">
                        {
                          [
                            'Dashboard',
                            'Pesanan',
                            'Inventaris',
                            'Pembayaran',
                            'Pengiriman',
                            'Laporan',
                          ][index]
                        }
                      </span>
                    </div>
                  ),
                )}
              </div>
            </div>
            <div className="p-4 sm:p-6">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-teal-700">
                    Dashboard · data ilustrasi
                  </p>
                  <p className="mt-1 text-lg font-bold">Ringkasan operasional</p>
                </div>
                <div className="hidden rounded-lg border border-slate-200 bg-white px-3 py-2 text-[9px] text-slate-500 sm:block">
                  Bulan berjalan
                </div>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3">
                {[
                  ['Pendapatan', 'Rp 284,6 jt', 'emerald'],
                  ['Pesanan', '1.248', 'blue'],
                  ['Stok rendah', '12', 'amber'],
                  ['Pengiriman', '86', 'violet'],
                ].map(([label, value, color]) => (
                  <div key={label} className="rounded-xl border border-slate-200 bg-white p-3">
                    <div className="flex items-center justify-between">
                      <p className="text-[9px] text-slate-500">{label}</p>
                      <span className={`preview-dot preview-dot-${color}`} />
                    </div>
                    <p className="mt-2 text-sm font-bold sm:text-base">{value}</p>
                  </div>
                ))}
              </div>
              <div className="mt-3 rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold">Tren penjualan</p>
                  <p className="text-[9px] font-semibold text-emerald-600">+18.2%</p>
                </div>
                <div className="mt-6 flex h-28 items-end gap-2">
                  {[28, 43, 35, 58, 52, 72, 64, 88, 78, 96, 86, 108].map((height, index) => (
                    <div
                      key={index}
                      className="flex-1 rounded-t-sm bg-gradient-to-t from-teal-600 to-teal-300"
                      style={{ height }}
                    />
                  ))}
                </div>
                <div className="mt-2 flex justify-between text-[8px] text-slate-400">
                  <span>Jan</span>
                  <span>Mar</span>
                  <span>Mei</span>
                  <span>Jul</span>
                  <span>Sep</span>
                  <span>Nov</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SecurityVisual() {
  return (
    <div className="relative mx-auto w-full max-w-lg">
      <div className="absolute inset-12 rounded-full bg-teal-400/15 blur-3xl" />
      <div className="relative rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur sm:p-9">
        <div className="mx-auto grid size-28 place-items-center rounded-[2rem] border border-teal-300/20 bg-teal-300/10 text-teal-300 shadow-2xl shadow-teal-950/40">
          <ShieldCheck size={50} strokeWidth={1.5} />
        </div>
        <div className="mt-9 space-y-3">
          {[
            [LockKeyhole, 'Sesi terenkripsi', 'Aktif'],
            [Users, 'Kontrol akses berbasis role', 'Aktif'],
            [FileCheck2, 'Audit aktivitas pengguna', 'Aktif'],
            [Layers3, 'Validasi data berlapis', 'Aktif'],
          ].map(([Icon, label, status]) => {
            const RowIcon = Icon as typeof LockKeyhole;
            return (
              <div
                key={String(label)}
                className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-950/50 px-4 py-3.5"
              >
                <div className="flex items-center gap-3">
                  <RowIcon size={17} className="text-slate-400" />
                  <span className="text-sm font-medium">{String(label)}</span>
                </div>
                <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-300">
                  <span className="size-1.5 rounded-full bg-emerald-300" />
                  {String(status)}
                </span>
              </div>
            );
          })}
        </div>
        <div className="mt-5 flex items-center justify-center gap-2 text-xs text-slate-400">
          <Clock3 size={14} />
          Pemantauan keamanan berkelanjutan
        </div>
      </div>
    </div>
  );
}
