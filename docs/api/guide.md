# Panduan API

Dokumentasi interaktif tersedia di `/api/docs`.

Format sukses:

```json
{ "success": true, "data": {}, "meta": {} }
```

Format error:

```json
{
  "success": false,
  "error": { "code": "VALIDATION_ERROR", "message": "Input tidak valid", "details": [] }
}
```

List endpoint menerima `page`, `limit`, dan `search`. Endpoint pembuatan order menerima header
`Idempotency-Key`. Harga dan total order selalu dihitung ulang oleh API.

Flow utama:

1. `POST /api/auth/login`
2. `POST /api/products`, `/api/customers`, `/api/warehouses`
3. `POST /api/inventory/adjustments`
4. `POST /api/sales-orders`
5. `POST /api/sales-orders/:id/confirm`
6. `POST /api/payments`
7. `POST /api/payments/:id/verify`
8. `POST /api/shipments`
9. `PATCH /api/shipments/:id/status`
