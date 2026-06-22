'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  Boxes,
  Check,
  CheckCircle2,
  CircleDollarSign,
  ClipboardList,
  PackageCheck,
  Play,
  ShieldCheck,
  Truck,
  Warehouse,
} from 'lucide-react';
import { useState } from 'react';

const chapters = [
  {
    id: 'order',
    step: '01',
    role: 'Sales',
    title: 'Order dibuat dari data yang sudah terhubung.',
    description:
      'Sales memilih pelanggan, gudang, dan produk. Harga aktif, diskon, pajak, serta total dihitung ulang oleh server.',
    note: 'Tidak ada total transaksi yang hanya dipercaya dari input browser.',
    icon: ClipboardList,
    color: 'bg-blue-500',
  },
  {
    id: 'stock',
    step: '02',
    role: 'Warehouse',
    title: 'Stok tersedia langsung direservasi.',
    description:
      'Sistem membandingkan stok fisik dengan stok yang sudah dipesan. Barang yang lolos validasi ditahan untuk order ini.',
    note: 'Reservasi mencegah barang yang sama dijanjikan ke dua pelanggan.',
    icon: Warehouse,
    color: 'bg-amber-500',
  },
  {
    id: 'payment',
    step: '03',
    role: 'Finance',
    title: 'Pembayaran diverifikasi dengan jejak audit.',
    description:
      'Invoice terbit otomatis. Finance mencatat dan memverifikasi pembayaran sebelum order dinyatakan siap dipenuhi.',
    note: 'Waktu, pengguna, dan perubahan status tersimpan untuk penelusuran.',
    icon: CircleDollarSign,
    color: 'bg-emerald-500',
  },
  {
    id: 'delivery',
    step: '04',
    role: 'Distribution',
    title: 'Pengiriman bergerak dengan status yang jelas.',
    description:
      'Tim distribusi membuat shipment dan nomor tracking. Kurir memperbarui status sampai paket diterima pelanggan.',
    note: 'Sales, support, dan pelanggan membaca status dari sumber yang sama.',
    icon: Truck,
    color: 'bg-violet-500',
  },
];

const statusRows = [
  ['Draft order', 'Selesai'],
  ['Reservasi stok', 'Selesai'],
  ['Verifikasi pembayaran', 'Selesai'],
  ['Siap dikirim', 'Aktif'],
];

export function DemoTour() {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = chapters[activeIndex]!;
  const ActiveIcon = active.icon;

  function move(direction: number) {
    setActiveIndex((current) => (current + direction + chapters.length) % chapters.length);
  }

  return (
    <main className="demo-page min-h-screen bg-[#f3f0e8] text-slate-950">
      <header className="border-b border-slate-950/10">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8">
          <Link href="/" className="flex items-center gap-3 font-bold">
            <span className="grid size-10 place-items-center rounded-xl bg-slate-950 text-teal-300">
              <Boxes size={21} />
            </span>
            <span>SMPD</span>
          </Link>
          <p className="hidden text-sm text-slate-600 sm:block">Tur sistem · skenario contoh</p>
          <Link
            href="/login"
            className="rounded-xl border border-slate-950/15 px-4 py-2.5 text-sm font-bold transition hover:bg-white"
          >
            Masuk ke aplikasi
          </Link>
        </div>
      </header>

      <section className="px-5 pb-20 pt-14 lg:px-8 lg:pb-28 lg:pt-20">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-950"
          >
            <ArrowLeft size={17} />
            Kembali ke halaman utama
          </Link>

          <div className="mt-10 grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-800">
                Demo publik · tanpa login
              </p>
              <h1 className="mt-5 text-5xl font-semibold leading-[1.02] tracking-[-0.05em] sm:text-6xl">
                Ikuti satu pesanan, dari klik pertama sampai tiba.
              </h1>
            </div>
            <div className="lg:pb-2">
              <p className="max-w-2xl text-lg leading-8 text-slate-700">
                Tur ini menunjukkan hubungan antarmodul melalui satu skenario. Data di bawah adalah
                ilustrasi, tetapi aturan prosesnya mengikuti sistem utama.
              </p>
              <div className="mt-6 flex flex-wrap gap-3 text-sm font-semibold text-slate-700">
                {['± 3 menit', '4 tahap', 'Tidak mengubah data'].map((item) => (
                  <span key={item} className="rounded-full border border-slate-950/15 px-4 py-2">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-14 overflow-hidden rounded-[2rem] bg-slate-950 text-white">
            <div className="relative min-h-[420px]">
              <Image
                src="/images/warehouse-operations-demo.png"
                alt="Tim gudang memindai paket dan memeriksa inventaris"
                fill
                priority
                className="object-cover opacity-70"
                sizes="(min-width: 1280px) 1280px, 100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/65 to-transparent" />
              <div className="absolute inset-0 flex items-end p-7 sm:p-10 lg:p-14">
                <div className="max-w-xl">
                  <span className="grid size-12 place-items-center rounded-full bg-teal-300 text-slate-950">
                    <Play fill="currentColor" size={18} />
                  </span>
                  <p className="mt-6 text-sm font-bold uppercase tracking-[0.18em] text-teal-200">
                    Skenario: Order SO-260622-014
                  </p>
                  <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                    24 karton produk dikirim dari Gudang Jakarta ke pelanggan Bandung.
                  </h2>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-20 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[320px_1fr] lg:gap-16">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-800">
                Pilih tahap
              </p>
              <div className="mt-6 space-y-2">
                {chapters.map((chapter, index) => (
                  <button
                    key={chapter.id}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    className={`flex w-full items-center gap-4 rounded-xl px-4 py-4 text-left transition ${
                      activeIndex === index
                        ? 'bg-slate-950 text-white'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
                    }`}
                  >
                    <span
                      className={`grid size-9 shrink-0 place-items-center rounded-lg text-xs font-bold ${
                        activeIndex === index ? 'bg-teal-300 text-slate-950' : 'bg-slate-100'
                      }`}
                    >
                      {chapter.step}
                    </span>
                    <span>
                      <span className="block text-xs opacity-65">{chapter.role}</span>
                      <span className="mt-0.5 block text-sm font-bold">
                        {chapter.title.split('.')[0]}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="min-w-0">
              <div className="flex flex-col justify-between gap-7 sm:flex-row sm:items-start">
                <div className="max-w-2xl">
                  <div className="flex items-center gap-3">
                    <span
                      className={`grid size-11 place-items-center rounded-xl text-white ${active.color}`}
                    >
                      <ActiveIcon size={21} />
                    </span>
                    <p className="text-sm font-bold text-slate-500">
                      Tahap {active.step} · {active.role}
                    </p>
                  </div>
                  <h2 className="mt-6 text-3xl font-bold tracking-[-0.03em] sm:text-4xl">
                    {active.title}
                  </h2>
                  <p className="mt-5 text-base leading-8 text-slate-600">{active.description}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    aria-label="Tahap sebelumnya"
                    onClick={() => move(-1)}
                    className="grid size-11 place-items-center rounded-full border border-slate-200 hover:bg-slate-100"
                  >
                    <ArrowLeft size={18} />
                  </button>
                  <button
                    type="button"
                    aria-label="Tahap berikutnya"
                    onClick={() => move(1)}
                    className="grid size-11 place-items-center rounded-full bg-slate-950 text-white hover:bg-slate-800"
                  >
                    <ArrowRight size={18} />
                  </button>
                </div>
              </div>

              <div className="mt-10 grid overflow-hidden rounded-2xl border border-slate-200 bg-[#f5f7f8] shadow-[0_20px_60px_rgba(15,23,42,0.08)] md:grid-cols-[1fr_260px]">
                <div className="border-b border-slate-200 p-5 sm:p-7 md:border-b-0 md:border-r">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-5">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-teal-700">
                        Order detail
                      </p>
                      <p className="mt-1 font-bold">SO-260622-014</p>
                    </div>
                    <span className="rounded-full bg-amber-100 px-3 py-1.5 text-xs font-bold text-amber-800">
                      Diproses
                    </span>
                  </div>
                  <div className="mt-6 grid gap-3 sm:grid-cols-3">
                    {[
                      ['Pelanggan', 'CV Maju Bersama'],
                      ['Gudang', 'Jakarta Utama'],
                      ['Total', 'Rp 18.720.000'],
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-xl bg-white p-4">
                        <p className="text-xs text-slate-500">{label}</p>
                        <p className="mt-1 text-sm font-bold">{value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 rounded-xl bg-white p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="grid size-10 place-items-center rounded-lg bg-teal-50 text-teal-700">
                          <PackageCheck size={19} />
                        </span>
                        <div>
                          <p className="text-sm font-bold">Produk A · 24 karton</p>
                          <p className="text-xs text-slate-500">
                            48 unit tersedia setelah reservasi
                          </p>
                        </div>
                      </div>
                      <CheckCircle2 className="text-emerald-500" size={20} />
                    </div>
                  </div>
                </div>
                <aside className="bg-white p-5 sm:p-6">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                    Status proses
                  </p>
                  <div className="mt-5 space-y-5">
                    {statusRows.map(([label, status], index) => {
                      const complete = index <= activeIndex;
                      return (
                        <div key={label} className="flex gap-3">
                          <span
                            className={`mt-0.5 grid size-6 shrink-0 place-items-center rounded-full ${
                              complete ? 'bg-teal-500 text-white' : 'bg-slate-100 text-slate-400'
                            }`}
                          >
                            {complete ? <Check size={13} strokeWidth={3} /> : index + 1}
                          </span>
                          <div>
                            <p className="text-sm font-bold">{label}</p>
                            <p className="mt-0.5 text-xs text-slate-500">
                              {complete ? status : 'Menunggu'}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </aside>
              </div>

              <div className="mt-5 flex items-start gap-3 rounded-xl border border-teal-200 bg-teal-50 p-4 text-sm leading-6 text-teal-950">
                <ShieldCheck className="mt-0.5 shrink-0 text-teal-700" size={19} />
                <p>
                  <strong>Kontrol sistem:</strong> {active.note}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-20 lg:px-8 lg:py-28">
        <div className="mx-auto grid max-w-7xl gap-8 rounded-[2rem] bg-teal-400 p-7 sm:p-10 lg:grid-cols-[1fr_auto] lg:items-center lg:p-14">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-950/70">
              Akhir tur
            </p>
            <h2 className="mt-3 max-w-3xl text-3xl font-bold tracking-[-0.035em] sm:text-4xl">
              Satu transaksi menghasilkan satu riwayat yang dapat diikuti semua tim.
            </h2>
          </div>
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-6 py-4 font-bold text-white hover:bg-slate-800"
          >
            Buka aplikasi
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      <footer className="border-t border-slate-950/10 px-5 py-8 text-sm text-slate-500 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p>SMPD · Sistem Manajemen Penjualan dan Distribusi</p>
          <p>Data pada demo merupakan ilustrasi.</p>
        </div>
      </footer>
    </main>
  );
}
