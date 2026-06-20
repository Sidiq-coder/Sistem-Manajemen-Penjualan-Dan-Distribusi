# Roadmap

## Selesai dalam MVP

- Fondasi monorepo, Docker Compose, CI, health, metrics.
- Auth cookie, refresh rotation, reset password, RBAC, user/role, audit log.
- Produk, kategori, pelanggan, gudang, saldo stok, ledger, reservasi.
- Sales order, invoice, pembayaran manual, shipment.
- Retur, keluhan, dashboard, laporan dasar.

## Berikutnya

1. Upload S3 untuk gambar, bukti bayar, POD, dan dokumen retur.
2. BullMQ untuk export CSV/XLSX/PDF dan notifikasi.
3. 2FA/TOTP untuk admin, finance, dan manager.
4. Permission guard granular di samping role guard.
5. OpenTelemetry, JSON logger, Sentry, Grafana dashboard, dan alert.
6. E2E Playwright penuh dengan fixture database.
7. Backup/restore drill, load test, dan OWASP ASVS verification.
8. Kubernetes/Helm dan infrastructure as code.
9. Forecast moving average, safety stock, dan rekomendasi explainable.
10. Portal customer terisolasi dengan relasi akun-pelanggan dan policy kepemilikan data.
