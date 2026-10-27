# Tutorial deploy UANGKU: Cloudflare tanpa VPS

Arsitektur: **GitHub → Cloudflare Pages (React + Functions) → D1**, ditambah **R2 privat** untuk arsip foto dan **Gemini/OpenAI** untuk scan. Tidak perlu MySQL, Nginx, PM2, atau server Express.

Ikuti urutan ini. Membuat database/binding saja tidak menjalankan migration. Jangan memasukkan password, API key, atau backup database ke GitHub.

## 1. Persiapan

- Akun GitHub yang dapat mengubah repo ini.
- Akun Cloudflare dengan akses Pages, D1, dan opsional R2.
- Git dan Node.js 24 LTS di komputer. Tidak perlu komputer terus menyala setelah deploy.
- API key AI untuk scan; scan tidak tersedia jika key tidak diisi.
- Google Cloud project jika ingin login Google; login email/password tetap tersedia tanpa Google.

Jika sudah ada deployment Pages, **gunakan project yang sama**, tidak perlu membuat project duplikat.

### Mengambil kode revisi

Selama revisi belum digabung, gunakan branch `feat/cloudflare-fullstack`. Setelah merge, gunakan `main`.

```sh
git clone https://github.com/Lukmanyyy/keuangan-v2.git
cd keuangan-v2
git switch feat/cloudflare-fullstack
npm ci
```

Jika folder repo sudah ada, jangan clone di dalamnya. Buka folder itu, pastikan tidak ada pekerjaan lokal yang belum disimpan, lalu checkout/pull branch yang sesuai. Jangan reset paksa.

## 2. Login Cloudflare dari terminal

```sh
npx wrangler login
npx wrangler whoami
```

Browser akan dibuka. Pilih akun Cloudflare pemilik project dan setujui akses. Tidak perlu mengirim token melalui chat. `whoami` harus menampilkan akun yang benar sebelum melanjutkan.

## 3. Buat D1 production dan preview

Cara terminal:

```sh
npx wrangler d1 create uangku-db
npx wrangler d1 create uangku-db-preview
```

Atau melalui dashboard **Storage & Databases → D1 → Create database**, dengan nama yang sama. Jika tersedia, pilih location hint dekat pengguna Indonesia; ini hint, bukan jaminan kota tertentu.

Catat **Database ID** masing-masing. Jika Wrangler menawarkan menambahkan konfigurasi otomatis, pastikan hasil akhirnya tidak menduplikasi binding `DB`.

**Sudah punya database versi lama?** Jangan hapus atau menjalankan SQL reset. Buat database baru, misalnya `uangku-db-v2` dan `uangku-db-v2-preview`, lalu sesuaikan nama konfigurasi. Revisi ini tidak otomatis memindahkan data lama.

## 4. Isi konfigurasi binding

Edit `wrangler.toml`:

```toml
name = "keuangan-v2"
pages_build_output_dir = "./dist"
compatibility_date = "2026-10-27"
compatibility_flags = ["nodejs_compat"]

[[d1_databases]]
binding = "DB"
database_name = "uangku-db"
database_id = "ID_DATABASE_PRODUCTION"
migrations_dir = "migrations"

[[env.preview.d1_databases]]
binding = "DB"
database_name = "uangku-db-preview"
database_id = "ID_DATABASE_PREVIEW"
migrations_dir = "migrations"
```

- `name` samakan dengan nama project Pages yang digunakan.
- Ganti kedua ID placeholder dengan ID asli dari langkah 3.
- Nama binding harus persis `DB`, huruf besar.
- ID/nama database bukan password dan boleh berada di repo; isinya tidak otomatis dapat dibaca publik.
- **File Wrangler menjadi sumber konfigurasi binding.** Jangan membuat konfigurasi dashboard yang bertentangan; deployment berikutnya mengikuti file ini.
- Production dan Preview jangan menggunakan D1 yang sama.

## 5. Jalankan migration

Uji lokal lebih dahulu:

```sh
npm run db:local
npm run lint
npm test
npm run build
```

Lalu buat tabel di database Cloudflare:

```sh
npx wrangler d1 migrations apply DB --remote
npx wrangler d1 migrations apply DB --remote --env preview
```

Periksa nama database pada output sebelum menyetujui. Tabel aplikasi: `users`, `sessions`, `wallets`, `transactions`, `user_settings`, `app_settings`, `rate_limits`, ditambah tabel pelacakan migration milik Wrangler.

Migration juga memasang trigger SQL untuk memastikan perubahan saldo/transaksi atomik dan transfer dibalik dengan benar saat dihapus.

Verifikasi:

```sh
npx wrangler d1 execute DB --remote --command="SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
```

Jika muncul `table ... already exists`, berhenti: kemungkinan database sudah berisi skema lama atau SQL sudah dijalankan manual. Jangan menambahkan `DROP TABLE`. Backup dan gunakan database baru atau siapkan migration khusus untuk data yang ada.

## 6. R2 untuk foto struk (opsional)

Tanpa R2, akun/dompet/transaksi/scan tetap bekerja; yang disimpan hanya hasil transaksi, **bukan arsip foto**.

Jika ingin foto tersimpan:

1. Buka **R2 Object Storage** di dashboard. Aktifkan layanan dan periksa persyaratan billing jika diminta.
2. Buat dua bucket **privat**: `uangku-receipts` dan `uangku-receipts-preview`.
3. Tambahkan/uncomment bagian berikut di `wrangler.toml`:

```toml
[[r2_buckets]]
binding = "RECEIPTS_BUCKET"
bucket_name = "uangku-receipts"

[[env.preview.r2_buckets]]
binding = "RECEIPTS_BUCKET"
bucket_name = "uangku-receipts-preview"
```

4. Jangan aktifkan public `r2.dev` atau public custom domain untuk bucket struk.
5. Aplikasi mengunggah foto setelah transaksi scan disimpan. Riwayat transaksi memiliki tautan **Lihat struk**, diperiksa berdasarkan pemilik akun.

Tidak perlu membuat S3 access key. Binding R2 memberi akses dari Functions. Foto lama yang tidak pernah disimpan tidak bisa dipulihkan hanya dengan mengaktifkan R2.

## 7. Simpan konfigurasi kode ke GitHub

Setelah ID database dan opsional R2 siap, commit konfigurasi yang sudah benar. Jangan `git add .` jika terdapat file rahasia atau pekerjaan lain yang belum diperiksa.

```sh
git add wrangler.toml
git commit -m "chore: configure Cloudflare database bindings"
git push origin feat/cloudflare-fullstack
```

Jika branch revisi sudah digabung, gunakan branch kerja/PR baru, bukan menimpa history. Review perubahan dan gabungkan PR ke `main` setelah database remote siap. Jangan push paksa.

**Project Pages yang sudah terhubung `main` akan otomatis deploy saat merge/push ke main.** Siapkan secrets terlebih dahulu (langkah 9) sebelum merge agar fitur AI/Google langsung tersedia.

## 8. Hubungkan repo ke Cloudflare Pages

### Project baru

1. Dashboard → **Workers & Pages → Create application → Pages**.
2. Pilih **Connect to Git / Import repository**.
3. Otorisasi GitHub, pilih `Lukmanyyy/keuangan-v2`.
4. Isi:

| Pengaturan | Nilai |
|---|---|
| Project name | Sama dengan `name` di Wrangler |
| Production branch | `main` (setelah revisi di-merge) |
| Framework | Vite/React jika tersedia |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | Kosong/root repo |
| Node version / `NODE_VERSION` | `24` |

5. Tambahkan variabel/secrets langkah 9, lalu **Save and Deploy**.

Pilih **Pages**, bukan Worker-only dengan perintah `wrangler deploy`. Folder `functions/` berada di root repo dan diproses otomatis oleh Pages. Jangan memindahkannya ke `dist/` dan jangan mengunggah ZIP `dist` lewat dashboard: itu bukan alur Git Functions yang dipakai panduan ini.

### Project yang sudah ada

Periksa **Settings → Builds / Git integration**: repo yang benar, production branch `main`, build `npm run build`, output `dist`, Node 24, automatic deployments aktif. Setelah merge, cek deployment menggunakan commit revisi terbaru.

## 9. Atur variables dan secrets

Buka project Pages → **Settings → Variables and Secrets** untuk secrets dan variabel build. Konfigurasi runtime non-rahasia berada di bagian `[vars]` dan `[env.preview.vars]` dalam `wrangler.toml`, agar tidak bertentangan dengan sumber konfigurasi binding. Preview memiliki konfigurasi sendiri; gunakan key pengujian/limit rendah atau kosongkan layanan opsional.

| Nama | Jenis | Fungsi |
|---|---|---|
| `NODE_VERSION` | Plain text: `24` | Build Node |
| `GOOGLE_CLIENT_ID` | Plain text di `[vars]` Wrangler, opsional | Login Google; harus sama dengan Client ID Google Cloud |
| `GEMINI_API_KEY` | Secret/encrypted | Scan Gemini |
| `OPENAI_API_KEY` | Secret/encrypted, opsional | Scan/fallback OpenAI |
| `GEMINI_MODEL` | Plain text di `[vars]` Wrangler | Default `gemini-2.5-flash` |
| `OPENAI_MODEL` | Plain text di `[vars]` Wrangler | Default `gpt-4o-mini` |

Setelah mengubah konfigurasi, **redeploy** agar deployment baru memakainya. Pastikan model yang dipilih tersedia bagi key/akun Anda.

Jangan memakai `VITE_GEMINI_API_KEY`/`VITE_OPENAI_API_KEY`: awalan `VITE_` bisa memasukkan nilai ke JavaScript browser. Repo ini tidak membutuhkan `APP_URL`, `ADMIN_PIN`, atau `JWT_SECRET`; sesi disimpan di D1 dan cookie hanya berisi token acak.

Panel admin tidak menampilkan API key dan tidak menyimpan key di database/browser. Ia hanya mengatur preferensi provider global. Jika belum ada pengaturan global, preferensi tiap pengguna digunakan.

## 10. Konfigurasi login Google (opsional)

1. Buka Google Cloud Console, buat/pilih project.
2. Buka **Google Auth Platform** (atau **APIs & Services → OAuth consent screen / Credentials**).
3. Isi nama aplikasi, email dukungan, audience, dan informasi pengembang. Jika masih Testing, tambahkan test users.
4. Buat OAuth Client ID bertipe **Web application**.
5. Tambahkan **Authorized JavaScript origins** sesuai origin nyata:

```text
https://NAMA_PROJECT.pages.dev
https://uangku.domainkamu.com
http://localhost:8788
http://127.0.0.1:8788
```

Gunakan origin yang memang dipakai. Jangan memasukkan path `/privacy` atau `/api/auth/google` sebagai JavaScript origin. Client menggunakan tombol Google Identity Services dengan ID token, bukan alur redirect server; tidak perlu membuat client secret di frontend.

6. Cantumkan URL privasi `https://DOMAIN/privacy` dan ketentuan `https://DOMAIN/terms` sesuai persyaratan consent/branding Google. Domain dan aplikasi mungkin memerlukan verifikasi Google.
7. Masukkan Client ID ke `GOOGLE_CLIENT_ID` di bagian `[vars]` `wrangler.toml`; commit/push melalui branch kerja, lalu deploy. Client ID bukan rahasia dan boleh masuk repo. Untuk preview, isi bagian `[env.preview.vars]` dengan client pengujian yang sesuai.
8. Untuk preview, gunakan origin preview yang terdaftar dan client pengujian. Origin acak tidak otomatis diizinkan Google.

Backend memverifikasi signature, issuer, audience, expiry, dan email verified. Mengirim nama/email palsu tidak akan menghasilkan sesi. Jika email sudah terdaftar dengan password, gunakan login password: penggabungan akun Google tidak dilakukan otomatis.

Tanpa konfigurasi Google, aplikasi menampilkan informasi bahwa Google belum tersedia dan tetap menyediakan login email/password.

## 11. Buat administrator pertama

1. Buka situs hasil deployment dan daftar akun pemilik. Password minimal 10 dan maksimal 128 karakter. Gunakan password unik.
2. Buka **D1 → database production → Console**.
3. Ganti email contoh lalu jalankan:

```sql
UPDATE users SET role='admin' WHERE email='email-pemilik@example.com';
SELECT id, name, email, role FROM users WHERE email='email-pemilik@example.com';
```

4. Pastikan tepat akun pemilik yang berubah menjadi `admin`.
5. Logout lalu login kembali agar UI memuat role terbaru.
6. Buka **Profil → Panel admin** atau `/admin`, lalu klik Buka panel.

Tidak ada PIN default, hardcoded password, atau pemberian admin otomatis kepada pendaftar pertama. API tetap memeriksa role di server walaupun seseorang membuka URL `/admin` langsung.

Admin dapat melihat ringkasan akun, mengubah provider global, reset password (mencabut semua sesi pengguna), dan menghapus akun/data aktif. Admin tidak dapat melihat password asli atau API key. Jangan berikan role admin ke pengguna umum.

## 12. Uji deployment sebelum dipakai untuk data asli

1. Buka `https://DOMAIN/api/health`. Harus menghasilkan `success: true` dan `database: "ready"`. `receiptStorage: true` jika R2 dikonfigurasi.
2. Buat akun penguji, tambah dua dompet.
3. Tambah pemasukan dan pengeluaran; refresh, pastikan transaksi/saldo tetap ada.
4. Transfer antar dompet; hapus transfer, pastikan kedua saldo kembali.
5. Logout/login dari perangkat lain dengan akun yang sama: data harus sama.
6. Pakai akun berbeda: data tidak boleh bocor antar akun; admin harus ditolak untuk pengguna biasa.
7. Tambah kategori; login kembali/perangkat lain dan pastikan kategori tersimpan.
8. Pindai foto struk yang terbaca. Periksa hasil, koreksi jika perlu, simpan.
9. Jika R2 aktif, buka Lihat struk. Setelah logout atau memakai akun lain, foto harus tidak dapat diakses.
10. Uji PDF, XLSX, dan CSV dari periode yang dipilih. Ekspor tidak boleh menampilkan periode/nama file contoh lama.
11. Periksa **Functions logs / runtime logs** jika ada error, bukan hanya build log.

`/api/config` dan `/api/health` tidak menguji key/kuota Google atau AI. Scan gagal harus menampilkan error, bukan data Indomaret/Kopi Kenangan palsu.

## 13. Domain sendiri dan HTTPS

Pages project → **Custom domains → Set up a custom domain**. Ikuti konfigurasi DNS yang diminta Cloudflare dan tunggu status aktif/sertifikat siap. Gunakan URL HTTPS untuk kamera dan cookie Secure.

Tambahkan origin domain baru ke Google Cloud. Login ulang di domain baru: cookie tidak dipindahkan otomatis dari `pages.dev`, tetapi data D1 tetap sama jika deployment memakai binding yang sama.

## 14. Backup, migration berikutnya, dan rollback

Sebelum mengubah skema produksi:

```sh
npx wrangler d1 export DB --remote --output=backup-uangku.sql
```

Simpan backup di lokasi privat di luar repo. File ini dapat berisi hash password, transaksi, dan data pribadi. Backup D1 tidak mencakup foto R2; kelola backup/lifecycle R2 terpisah. Periksa juga fasilitas Time Travel D1 sesuai paket dan retensi akun.

Untuk perubahan skema berikutnya, **buat file migration baru**, jangan mengedit migration yang sudah diterapkan. Jalankan di local dan preview sebelum production. Push kode tidak otomatis mengeksekusi migration: langkah ini sengaja manual untuk mencegah perubahan data yang tidak disengaja.

Rollback deployment lewat Pages hanya mengembalikan kode, **bukan database**. Rancang migration kompatibel dengan kode lama/baru dan jangan menjalankan perintah reset/drop terhadap database produksi.

Jika sudah ada `data_store.json` dari versi Express atau tabel README lama: jangan commit/upload file itu ke repo publik. Export/backup secara privat dan siapkan proses import khusus; skema revisi ini berbeda.

## 15. Update harian dan CI

Alur normal: **branch kerja → edit → lint/test/build → PR → merge main → Cloudflare auto deploy**. GitHub Actions sudah disertakan untuk memeriksa lint, tes, build, dan migration lokal; workflow ini tidak menyimpan token Cloudflare atau mengubah database produksi.

Opsional: jadikan Checks sebagai required check dalam branch protection GitHub agar kode gagal tes tidak digabung. Cloudflare Git deployment dan GitHub Checks terpisah; tanpa branch protection, push langsung main tetap dapat memicu deploy sebelum checks selesai.

Untuk uji backend lokal:

```sh
npm run db:local
npm run dev
```

Terminal kedua:

```sh
npm run test:cloudflare
```

Ini menggunakan workerd dan D1 lokal, bukan Express. Jangan gunakan `npm run dev:ui` untuk membuktikan login/database berfungsi. Setelah frontend diedit, bangun ulang `npm run build` atau restart `npm run dev`.

## Troubleshooting

| Gejala | Pemeriksaan |
|---|---|
| `npm ci` gagal | Node 24, gunakan package-lock revisi terbaru; jangan mencampur manifest/lock versi lama |
| Binding `DB` tidak ditemukan | Pastikan file Wrangler berada di root, ID asli diisi, production/preview tepat; redeploy |
| `no such table` / health belum siap | Jalankan migration **remote** pada database/environment yang benar; local bukan production |
| `table already exists` | Ada skema lama/manual; backup dan gunakan database baru atau migration khusus |
| `/api/*` mengembalikan HTML | Deployment bukan versi Functions terbaru, root repo/output salah, atau hanya upload static dist |
| Login gagal | Password 10–128 karakter untuk pendaftaran, cookie diaktifkan, domain/origin konsisten, cek runtime logs |
| Google origin/audience error | Authorized JavaScript origins dan `GOOGLE_CLIENT_ID` harus sesuai origin dan client yang sama |
| Google belum tersedia | Isi `GOOGLE_CLIENT_ID`, deploy ulang, izinkan script Google; login email tetap tersedia |
| Scan 503 | Secret provider belum diatur atau provider global dipilih tanpa key yang cocok |
| Scan 502 | Gambar tidak terbaca, key/model salah, billing/kuota provider, atau provider timeout |
| Scan 429 | Limit 20/jam per akun atau 200/hari global tercapai; tunggu reset UTC/bucket berikutnya |
| Kas gagal dihapus | Masih ada transaksi yang merujuk kas tersebut; hapus transaksi terkait terlebih dahulu |
| Foto tidak tersimpan | R2 belum terpasang ketika transaksi dibuat; cek hasReceiptStorage dan konfigurasi bucket |
| CPU limit/runtime exceeded | Periksa metrik dan paket Workers; password hashing memerlukan CPU. Pertimbangkan paket berbayar sesuai trafik; jangan melemahkan hashing untuk mengakali limit |
| Kamera gagal | HTTPS, izin kamera browser/OS; alternatif pilih foto dari galeri |
| Preview mengubah data production | Binding salah; hentikan preview, pisahkan ID database dan bucket |

## Biaya, batasan, dan keamanan operasional

- Tanpa VPS **bukan berarti semua layanan gratis tanpa batas**. D1/Functions/R2 punya kuota, billing, dan batas CPU/penyimpanan. AI mengikuti tagihan provider. Pantau penggunaan dan atur budget/alerts.
- Password menggunakan PBKDF2-SHA256, salt unik, 100.000 iterasi sesuai batas WebCrypto Workers. Sesi 7 hari, cookie HttpOnly/SameSite=Strict dan Secure pada HTTPS. Rate limit dasar tersedia; untuk situs publik dengan trafik besar tambahkan perlindungan abuse/WAF/Turnstile sesuai kebutuhan akun.
- Akun email/password belum memiliki verifikasi email dan reset email otomatis. Pengguna yang lupa password menghubungi admin. Untuk identitas email terverifikasi, gunakan login Google.
- Pengaturan notifikasi disimpan, tetapi push notification/scheduler belum diimplementasikan. Tidak ada mode offline atau klaim transaksi berhasil ketika server gagal.
- Ekspor API CSV/JSON dibatasi 10.000 transaksi per permintaan; pakai rentang tanggal bila lebih besar. UI memuat transaksi bertahap dan ekspor layar laporan mengikuti periode terpilih. JSON export bukan backup penuh akun/sesi/R2.
- Tidak ada jaminan layanan eksternal selalu aktif. Sebelum go-live, selesaikan checklist langkah 12 dengan akun Cloudflare, Google, AI, dan domain nyata.

Referensi: [Pages bindings](https://developers.cloudflare.com/pages/functions/bindings/), [Pages Wrangler config](https://developers.cloudflare.com/pages/functions/wrangler-configuration/), [D1 migrations](https://developers.cloudflare.com/d1/reference/migrations/), [R2](https://developers.cloudflare.com/r2/).
