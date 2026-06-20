# Proses Order-to-Delivery

1. Sales membuat draft order. API mengambil harga produk aktif dan menghitung subtotal, diskon,
   pajak, serta grand total.
2. Konfirmasi order memeriksa saldo tersedia (`quantity - reserved`) dan membuat reservasi per item.
3. Invoice diterbitkan otomatis dan order masuk `WAITING_PAYMENT`.
4. Finance memverifikasi pembayaran. Setelah invoice lunas, order menjadi `PAID`.
5. Distribution membuat shipment. Reservasi dikonsumsi menjadi stock movement `SALE`.
6. Courier mengubah status secara berurutan hingga `DELIVERED`.
7. Order delivered dapat memiliki retur atau keluhan.

Pembatalan sebelum pengiriman melepaskan seluruh reservasi dan menulis movement
`RESERVATION_RELEASE`.
