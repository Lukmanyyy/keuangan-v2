# UANGKU — Cloudflare full-stack

Pencatatan keuangan React/Vite dengan **Cloudflare Pages + Pages Functions + D1 + R2 opsional**, tanpa VPS atau server Express.

## Mulai di sini

**[Panduan deploy lengkap: DEPLOY.md](DEPLOY.md)** — pembuatan database, migration, konfigurasi binding, secrets AI, Google login, admin, domain, backup, dan troubleshooting.

> ID database di `wrangler.toml` masih placeholder. Ganti dengan ID D1 milik akun Cloudflare Anda sebelum deployment. Jangan langsung menggabungkan branch ke production sebelum database siap.

## Fitur

- Akun email/password dan login Google dengan verifikasi ID token di server.
- Sesi cookie HttpOnly/Secure/SameSite, token acak dan hash token di D1.
- Password PBKDF2-SHA256 dengan salt unik; tidak pernah dikembalikan ke browser.
- Dompet, transaksi, transfer, kategori, dan pengaturan per akun di D1.
- Trigger SQLite menjaga perubahan saldo dan pembalikan transfer tetap atomik.
- Foto struk opsional di R2 privat dengan pemeriksaan kepemilikan.
- Scan struk Gemini/OpenAI di server, tanpa hasil contoh saat API gagal.
- Laporan PDF/XLSX/CSV berdasarkan periode yang dipilih, serta ekspor JSON transaksi.
- Admin dengan role D1, reset sandi yang mencabut sesi, serta penghapusan akun.
- Rate limit autentikasi dan AI, validasi input, proteksi CSRF, dan security headers.

## Development lokal

Node.js **24 LTS** direkomendasikan.

```sh
npm ci
npm run db:local
```

Salin `.dev.vars.example` menjadi `.dev.vars` jika membutuhkan Google/AI lokal. Isi hanya di komputer sendiri, jangan commit.

```sh
npm run dev
```

Buka alamat yang ditampilkan Wrangler (biasanya `http://localhost:8788`). `npm run dev` membangun frontend lalu menjalankan Pages + D1 lokal. Setelah mengedit frontend, jalankan `npm run build` lagi. `npm run dev:ui` hanya untuk mengerjakan tampilan, bukan pengujian backend.

```sh
npm run lint
npm test
npm run build
npm run test:cloudflare
```

Perintah terakhir memerlukan Wrangler lokal yang sedang berjalan di `http://127.0.0.1:8788`. Ia membuat akun/data pengujian lokal, bukan mengakses database produksi.

## Struktur

```text
cloudflare/                 Router API, keamanan, integrasi AI
functions/api/[[path]].ts   Entrypoint Pages Functions untuk /api/*
migrations/                Skema D1, indeks, dan trigger saldo
src/                       React, kategori, API client, laporan
tests/                     Tes keamanan, SQLite/API, dan utilitas keuangan
scripts/smoke.ts            Smoke test HTTP dengan workerd/D1 lokal
wrangler.toml              Sumber konfigurasi binding production/preview
DEPLOY.md                  Tutorial operasional
```

## Batasan yang perlu diketahui

- Tidak ada mode penyimpanan offline: UI tidak akan mengaku berhasil jika server gagal.
- Tidak ada verifikasi email/password-reset melalui email otomatis. Pengguna lupa sandi menghubungi admin; gunakan Google untuk identitas email terverifikasi.
- Email akun tidak dapat diganti tanpa verifikasi ulang. Akun email dan Google tidak digabung otomatis.
- Preferensi notifikasi tersimpan, tetapi layanan push/scheduler belum tersedia. Tampilan aplikasi menggunakan tema terang.
- Maksimal gambar yang diterima server 5 MB (frontend mengompresi foto); JPEG/PNG/WebP.
- Scan dibatasi 20/jam per akun dan 200/hari secara global. Kuota/biaya provider tetap berlaku.
- API transaksi memakai pagination 500 baris; UI mengambil semua halaman. Ekspor API CSV/JSON maksimal 10.000 transaksi per permintaan, dapat difilter tanggal. Ekspor dari layar laporan menggunakan data yang sudah dimuat browser.
- Ringkasan admin menampilkan maksimal 1.000 akun. API key tidak dapat diedit/dilihat di panel admin; gunakan Cloudflare Secrets.
- `0001_initial.sql` untuk database baru. Tidak mengimpor `data_store.json` atau tabel versi lama secara otomatis. Backup dan rencanakan migrasi jika sudah memiliki data.
- Deployment produksi, OAuth Google, AI berbayar, dan R2 nyata tetap perlu diuji menggunakan konfigurasi akun pemilik. Build lokal bukan jaminan semua layanan eksternal aktif.
