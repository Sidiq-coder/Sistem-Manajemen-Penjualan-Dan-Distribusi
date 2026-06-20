# Arsitektur

Sistem menggunakan modular monolith. Web Next.js berkomunikasi dengan REST API NestJS. API menjadi
satu-satunya pemilik aturan transaksi dan mengakses PostgreSQL melalui Prisma.

## Batas domain

- Auth/users: sesi cookie HttpOnly, refresh rotation, RBAC, reset password.
- Catalog/customers: master data dengan soft delete.
- Inventory: saldo per gudang, ledger append-only, dan reservasi.
- Orders/finance: kalkulasi server-side, invoice immutable, verifikasi pembayaran.
- Shipment/support: lifecycle pengiriman, retur, keluhan, dan komunikasi.
- Reports/audit: query KPI dan jejak operasi penting.

Operasi konfirmasi order, pembatalan, verifikasi pembayaran, dan pembuatan shipment memakai
transaksi database agar saldo dan status tidak terpisah.

## Keamanan

- Password di-hash dengan Argon2.
- Access/refresh token disimpan di cookie HttpOnly.
- CORS dibatasi ke `WEB_ORIGIN`.
- Helmet, validasi Zod, Prisma parameterization, rate limit, RBAC, dan audit log aktif.
- Secret hanya melalui environment variable.

## Observability

Endpoint health liveness/readiness, request ID, dan metrics Prometheus tersedia. Integrasi tracing
OpenTelemetry dan centralized logging adalah pekerjaan hardening berikutnya.
