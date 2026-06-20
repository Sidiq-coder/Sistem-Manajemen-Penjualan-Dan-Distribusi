# Sistem Manajemen Penjualan dan Distribusi

Modular monolith untuk mengelola katalog, pelanggan, stok multi-gudang, sales order, invoice,
pembayaran, shipment, retur, keluhan, audit log, dan laporan manajemen.

## Stack

- Web: Next.js App Router, React, TypeScript, Tailwind CSS, TanStack Query, Recharts.
- API: NestJS, TypeScript, REST/OpenAPI, Zod, JWT cookie authentication, RBAC.
- Data: PostgreSQL, Prisma ORM, Redis siap untuk cache/queue.
- Quality: Vitest, ESLint, Prettier, GitHub Actions, Docker Compose.

Prototype statis lama dipertahankan di `legacy/static-prototype`.

## Menjalankan secara lokal

Prasyarat: Node.js 22+, pnpm 11+, PostgreSQL 15+ (atau Docker).

```bash
copy .env.example .env
pnpm install
docker compose up -d postgres redis
pnpm prisma:generate
pnpm prisma:migrate
pnpm seed
pnpm dev
```

- Web: <http://localhost:3000>
- API: <http://localhost:4000/api>
- Swagger: <http://localhost:4000/api/docs>
- Health: <http://localhost:4000/api/health/live>
- Metrics: <http://localhost:4000/api/metrics>

Akun seed default:

```txt
admin@smpd.local
Admin123!
```

Ubah `SEED_ADMIN_PASSWORD` sebelum seed di lingkungan bersama. Jangan gunakan kredensial demo di
production.

## Perintah kualitas

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

## Struktur

```txt
apps/
  api/       NestJS + Prisma
  web/       Next.js
packages/
  shared/    schema Zod dan kontrak bersama
infra/
  docker/    image API dan web
docs/        arsitektur, API, proses bisnis, deployment
legacy/      prototype awal
```

## Status ruang lingkup

MVP operasional tersedia untuk auth/RBAC, master data, inventory ledger, reservasi stok, order,
invoice, verifikasi pembayaran, shipment, retur/keluhan, dashboard, dan laporan dasar.

Fitur fase lanjut yang sengaja belum dinyatakan production-ready: payment gateway, S3 upload,
BullMQ export besar, 2FA/TOTP, notifikasi email/SMS, forecasting ML, route optimization,
Kubernetes/Terraform, serta backup/restore terotomasi. Lihat [roadmap](docs/ROADMAP.md).
