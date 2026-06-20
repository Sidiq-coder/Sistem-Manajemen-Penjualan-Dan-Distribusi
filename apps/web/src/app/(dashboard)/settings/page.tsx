'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Eye, EyeOff, Plus, ShieldCheck, X } from 'lucide-react';
import { useState } from 'react';
import { PageHeader } from '@/components/page-header';
import { ResourceTable } from '@/components/resource-table';
import { StatusBadge } from '@/components/status-badge';
import { useRoles } from '@/hooks/use-roles';
import { api, dateTime } from '@/lib/api';

type User = {
  id: string;
  name: string;
  email: string;
  status: string;
  lastLoginAt?: string;
  roles: Array<{ role: { code: string; name: string } }>;
};

type Role = {
  id: string;
  code: string;
  name: string;
  description?: string | null;
};

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const { hasAny } = useRoles();
  const isSuperAdmin = hasAny('SUPER_ADMIN');
  const [open, setOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const roles = useQuery({
    queryKey: ['roles'],
    queryFn: () => api<Role[]>('/roles'),
    enabled: isSuperAdmin,
  });

  const createUser = useMutation({
    mutationFn: (data: { name: string; email: string; password: string; roleCodes: string[] }) =>
      api('/users', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['users'] });
      setOpen(false);
      setSuccess('Akun berhasil dibuat dan sudah dapat digunakan untuk login.');
    },
    onError: (cause) => {
      setError(cause instanceof Error ? cause.message : 'Gagal membuat akun');
    },
  });

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setSuccess('');
    const form = new FormData(event.currentTarget);
    const password = String(form.get('password'));
    const confirmation = String(form.get('passwordConfirmation'));
    if (password !== confirmation) {
      setError('Konfirmasi password tidak sama');
      return;
    }
    createUser.mutate({
      name: String(form.get('name')),
      email: String(form.get('email')),
      password,
      roleCodes: [String(form.get('roleCode'))],
    });
  }

  const assignableRoles = roles.data?.filter((role) => role.code !== 'SUPER_ADMIN') ?? [];

  return (
    <>
      <PageHeader
        title="User & role"
        description="Kelola akun, status akses, dan role pengguna."
        action={
          isSuperAdmin ? (
            <button
              onClick={() => {
                setError('');
                setSuccess('');
                setOpen(true);
              }}
              className="flex items-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800"
            >
              <Plus size={18} />
              Buat akun
            </button>
          ) : undefined
        }
      />
      {success && (
        <p
          role="status"
          className="mb-5 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
        >
          <ShieldCheck size={18} />
          {success}
        </p>
      )}
      <ResourceTable<User>
        endpoint="/users"
        queryKey="users"
        columns={[
          {
            key: 'name',
            label: 'Pengguna',
            render: (row) => (
              <div>
                <p className="font-semibold">{row.name}</p>
                <p className="text-xs text-slate-500">{row.email}</p>
              </div>
            ),
          },
          {
            key: 'roles',
            label: 'Role',
            render: (row) => row.roles.map(({ role }) => role.name).join(', '),
          },
          { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
          { key: 'lastLogin', label: 'Login terakhir', render: (row) => dateTime(row.lastLoginAt) },
        ]}
      />
      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <form
            onSubmit={submit}
            className="w-full max-w-xl rounded-2xl border bg-white p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold">Buat akun pengguna</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Tentukan identitas dan role sesuai tanggung jawab pengguna.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Tutup form"
                className="grid size-9 shrink-0 place-items-center rounded-lg text-slate-500 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Field label="Nama lengkap" name="name" minLength={2} required />
              <Field label="Email" name="email" type="email" autoComplete="off" required />
            </div>

            <label className="mt-4 block text-sm font-semibold">
              Role
              <select
                name="roleCode"
                required
                disabled={roles.isPending || assignableRoles.length === 0}
                className="mt-2 w-full rounded-xl border bg-white px-3 py-2.5 disabled:bg-slate-100"
              >
                <option value="">
                  {roles.isPending ? 'Memuat role...' : 'Pilih role pengguna'}
                </option>
                {assignableRoles.map((role) => (
                  <option key={role.id} value={role.code}>
                    {formatRole(role.name)}
                  </option>
                ))}
              </select>
            </label>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <PasswordField
                label="Password sementara"
                name="password"
                visible={showPassword}
                onToggle={() => setShowPassword((value) => !value)}
              />
              <PasswordField
                label="Konfirmasi password"
                name="passwordConfirmation"
                visible={showPassword}
                onToggle={() => setShowPassword((value) => !value)}
              />
            </div>
            <p className="mt-2 text-xs leading-5 text-slate-500">
              Password minimal 8 karakter. Kirim password sementara melalui kanal yang aman.
            </p>

            {roles.isError && (
              <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">
                Gagal memuat daftar role: {roles.error.message}
              </p>
            )}
            {error && (
              <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">
                {error}
              </p>
            )}

            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-xl border px-5 py-2.5 text-sm font-semibold hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                disabled={createUser.isPending || roles.isPending || assignableRoles.length === 0}
                className="rounded-xl bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {createUser.isPending ? 'Membuat akun...' : 'Buat akun pengguna'}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

function Field({
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="block text-sm font-semibold">
      {label}
      <input {...props} className="mt-2 w-full rounded-xl border px-3 py-2.5" />
    </label>
  );
}

function PasswordField({
  label,
  name,
  visible,
  onToggle,
}: {
  label: string;
  name: string;
  visible: boolean;
  onToggle: () => void;
}) {
  return (
    <label className="block text-sm font-semibold">
      {label}
      <span className="relative mt-2 block">
        <input
          name={name}
          type={visible ? 'text' : 'password'}
          minLength={8}
          maxLength={128}
          autoComplete="new-password"
          required
          className="w-full rounded-xl border px-3 py-2.5 pr-11"
        />
        <button
          type="button"
          onClick={onToggle}
          aria-label={visible ? 'Sembunyikan password' : 'Tampilkan password'}
          className="absolute right-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-lg text-slate-500 hover:bg-slate-100"
        >
          {visible ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </span>
    </label>
  );
}

function formatRole(value: string) {
  return value
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}
