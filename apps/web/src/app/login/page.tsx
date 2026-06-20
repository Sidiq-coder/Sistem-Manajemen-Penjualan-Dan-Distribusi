'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogIn, PackageCheck } from 'lucide-react';
import { api } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@smpd.local');
  const [password, setPassword] = useState('Admin123!');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      router.replace('/dashboard');
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Login gagal');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <section className="hidden bg-slate-950 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center gap-3 text-lg font-bold">
          <span className="grid size-11 place-items-center rounded-xl bg-teal-500">
            <PackageCheck />
          </span>
          SMPD Enterprise
        </div>
        <div>
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-teal-300">
            Operasi terpadu
          </p>
          <h1 className="max-w-xl text-5xl font-semibold leading-tight">
            Penjualan, stok, pembayaran, dan distribusi dalam satu sistem.
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-8 text-slate-300">
            Data transaksi yang konsisten, jejak audit, dan KPI operasional untuk keputusan yang
            lebih cepat.
          </p>
        </div>
        <p className="text-sm text-slate-400">Sistem Manajemen Penjualan dan Distribusi</p>
      </section>
      <section className="flex items-center justify-center p-6">
        <form
          onSubmit={submit}
          className="w-full max-w-md rounded-2xl border bg-white p-8 shadow-xl shadow-slate-200/70"
        >
          <div className="mb-8 lg:hidden">
            <PackageCheck className="mb-4 text-teal-700" size={36} />
          </div>
          <p className="text-sm font-semibold uppercase tracking-widest text-teal-700">
            Akses aman
          </p>
          <h2 className="mt-2 text-3xl font-bold">Masuk ke dashboard</h2>
          <p className="mt-2 text-sm text-slate-500">Gunakan akun dan role yang telah diberikan.</p>
          <label className="mt-8 block text-sm font-semibold" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-2 w-full rounded-xl border px-4 py-3"
          />
          <label className="mt-5 block text-sm font-semibold" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-2 w-full rounded-xl border px-4 py-3"
          />
          {error && (
            <p role="alert" className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          )}
          <button
            disabled={loading}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 py-3 font-semibold text-white hover:bg-teal-800 disabled:opacity-60"
          >
            <LogIn size={18} />
            {loading ? 'Memeriksa...' : 'Masuk'}
          </button>
        </form>
      </section>
    </main>
  );
}
