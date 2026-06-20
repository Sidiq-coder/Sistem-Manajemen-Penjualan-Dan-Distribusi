# Deployment lokal

1. Salin `.env.example` menjadi `.env` dan ganti seluruh secret.
2. Jalankan `docker compose up -d postgres redis`.
3. Jalankan migration dan seed dari host.
4. Jalankan `pnpm dev`, atau build seluruh container dengan `docker compose up --build`.

Production wajib memakai TLS pada reverse proxy, `COOKIE_SECURE=true`, secret manager, database
terkelola dengan backup terenkripsi, object storage, monitoring, dan approval deployment.
