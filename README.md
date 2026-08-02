# KasirKu - Aplikasi Kasir & POS Modern

Aplikasi Point of Sale (POS) / Kasir berbasis React, Tailwind CSS, dan Vite yang siap di-host di GitHub Pages, Vercel, atau Netlify.

## Fitur Utama
1. **Autentikasi Pengguna**: Login & Daftar akun dengan validasi aman.
2. **Kasir (POS)**: Keranjang belanja, pencarian produk, scan barcode kamera/manual, kalkulasi kembalian & PPN 11%.
3. **Manajemen Produk**: Tambah, edit, hapus produk, restock dengan pencatatan otomatis ke buku kas, serta **Rekomendasi Harga Jual Cerdas** berdasarkan margin keuntungan.
4. **Riwayat Transaksi**: Daftar transaksi lengkap dengan pencetakan Struk PDF ukuran thermal (80mm) dan kirim struk via WhatsApp.
5. **Keuangan & Buku Kas (Ledger)**: Saldo kas, pemasukan, pengeluaran, dan grafik interaktif 7 hari terakhir.
6. **AI Assistant Insights**: Analisa profit dan rekomendasi stok minimum otomatis.
7. **Backup & Restore**: Export dan Import data toko dalam format JSON.

## Cara Deploy ke GitHub (GitHub Pages / Vercel / Netlify)

### 1. Menjalankan Secara Lokal (Development)
```bash
# Install dependencies
npm install

# Jalankan server lokal
npm run dev
```

### 2. Build untuk Production
```bash
npm run build
```
```
