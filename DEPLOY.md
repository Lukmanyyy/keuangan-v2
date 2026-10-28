# Deploy UANGKU lewat WEB Cloudflare — tanpa terminal dan tanpa VPS

Semua pengaturan produksi dilakukan di website Cloudflare: database, binding, API key, dan build. Tidak perlu menjalankan Git/Node/Wrangler di komputer untuk deploy.

**Satu hal yang tetap perlu disalin:** SQL pembuat tabel, ditempel ke **D1 Console** di website Cloudflare. Membuat database kosong dan mengaitkan binding belum otomatis membuat tabel.

Arsitektur: GitHub → **Cloudflare Pages + Functions → D1**, dengan **R2 privat** opsional untuk foto struk. Gemini/OpenAI hanya digunakan saat scan.

## 1. Gunakan kode revisi yang benar

Revisi tersedia di branch **`feat/cloudflare-fullstack`**. Siapkan database dan pengaturan berikut pada project Pages yang sudah ada sebelum menggabungkan revisi ke `main`.

Anda bisa mengelola perubahan/merge melalui website GitHub; tidak perlu terminal. Setelah merge, Cloudflare yang sudah terhubung ke `main` akan otomatis build dan deploy.

**Penting:** repo sengaja tidak memiliki `wrangler.toml`/`wrangler.json` sebagai konfigurasi deployment. `wrangler.local.toml` hanya dipakai pengembang ketika menjalankan tes lokal dan tidak perlu diedit untuk deploy lewat dashboard.

Jika sudah terlanjur deploy versi dengan file Wrangler production sebelumnya, deployment revisi ini menghapus kontrol file tersebut. Sesudah deployment baru selesai, buka ulang Settings; Cloudflare mempertahankan konfigurasi deployment terakhir dan Anda dapat mengelolanya kembali lewat dashboard. Periksa binding agar tidak masih menunjuk placeholder.

## 2. Buat database D1 melalui dashboard

1. Buka https://dash.cloudflare.com/ dan pilih akun yang memiliki project Pages.
2. Buka **Storage & Databases → D1 SQL Database**.
3. Klik **Create database**.
4. Nama: `uangku-db`.
5. Jika tersedia, pilih location hint dekat pengguna Indonesia. Ini hint geografis, bukan jaminan kota tertentu.
6. Klik **Create**.

**Sudah ada database/tabel versi lama?** Jangan hapus atau menimpa data. Buat database baru, misalnya `uangku-db-v2`. Nama database bebas; yang wajib tepat nanti adalah nama binding `DB`. Revisi tidak otomatis mengimpor `data_store.json` atau skema lama.

Jika menggunakan deployment preview, buat database kedua bernama `uangku-db-preview`. Jangan gunakan database production untuk testing preview.

## 3. Buat tabel lewat D1 Console

1. Di GitHub buka file **[migrations/0001_initial.sql](migrations/0001_initial.sql)** pada branch revisi ini.
2. Klik **Raw**, lalu salin seluruh isinya. Tidak perlu mengubah isinya.
3. Di Cloudflare buka **D1 → database yang baru dibuat → Console**.
4. Tempel SQL tersebut, lalu klik **Execute / Run**.
5. Pastikan tidak ada error. Jika console membatasi multi-statement, jalankan per pernyataan SQL lengkap. Khusus `CREATE TRIGGER ... BEGIN ... END;`, salin satu blok trigger utuh, jangan dipotong pada titik koma di dalam bloknya.

Tabel yang dibuat:

| Tabel | Isi |
|---|---|
| `users` | Akun, hash password, identitas Google, role admin |
| `sessions` | Hash token sesi dan masa berlaku |
| `wallets` | Dompet dan saldo |
| `transactions` | Transaksi dan referensi foto struk |
| `user_settings` | Preferensi serta kategori per akun |
| `app_settings` | Preferensi provider AI global |
| `rate_limits` | Pembatasan login dan scan |

SQL juga memasang indeks dan trigger yang memperbarui saldo secara atomik, termasuk pembalikan transfer saat transaksi dihapus. **Jangan menyalin tabel saja dan melewatkan trigger.**

Untuk memeriksa, jalankan di Console:

```sql
SELECT type, name
FROM sqlite_master
WHERE type IN ('table', 'trigger')
ORDER BY type, name;
```

Jalankan SQL awal **sekali saja pada database baru**. Jika muncul `table already exists`, jangan menambahkan `DROP TABLE`. Periksa apakah tabel sudah dibuat atau database berisi versi lama. Bila ragu, gunakan database baru tanpa menghapus database sebelumnya.

Lakukan langkah yang sama pada database preview jika akan digunakan. Catat bahwa migration `0001_initial.sql` telah diterapkan melalui dashboard. Jangan kelak menjalankan CLI migrations terhadap database yang sama tanpa menyelaraskan pelacakan migration; CLI tidak otomatis mengetahui SQL yang ditempel manual.

## 4. Hubungkan database ke Pages

Untuk project yang sudah ada:

1. **Workers & Pages → pilih project Pages Anda**.
2. Buka **Settings → Bindings → Add binding → D1 database**. Pada tampilan lama bisa berada di **Settings → Functions → D1 database bindings**.
3. Pilih environment **Production**.
4. Isi:

```text
Variable / Binding name: DB
Database: uangku-db (atau database baru yang Anda buat)
```

5. Simpan.
6. Untuk **Preview**, tambahkan binding `DB` yang menunjuk `uangku-db-preview`, bukan production. Jika tidak memakai preview, matikan preview builds atau biarkan fitur database preview belum tersedia; jangan mengarahkannya ke data asli.

**`DB` harus persis huruf besar.** Tidak perlu menulis Database ID ke GitHub, membuat username/password database, atau mengatur connection string.

Perubahan binding berlaku pada deployment berikutnya; lakukan redeploy setelah seluruh pengaturan selesai.

### Kalau belum punya project Pages

**Workers & Pages → Create application → Pages → Connect to Git / Import repository**. Otorisasi GitHub, pilih `Lukmanyyy/keuangan-v2`, kemudian gunakan pengaturan build di langkah 7. Setelah project ada, tambahkan binding di Settings.

Pilih **Pages**, bukan Worker-only dengan deploy command `wrangler deploy`. Jangan hanya upload ZIP `dist` melalui dashboard: panduan ini menggunakan Git integration agar folder `functions/` diproses bersama frontend.

## 5. Buat dan kaitkan R2 lewat web (opsional)

Tanpa R2, login/dompet/transaksi/scan tetap berjalan. Yang tidak tersedia adalah arsip foto struk asli.

1. Buka **R2 Object Storage**. Aktifkan layanan jika diminta dan periksa persyaratan billing/biaya.
2. Klik **Create bucket**, beri nama `uangku-receipts`.
3. **Biarkan bucket privat.** Jangan aktifkan public `r2.dev` atau public custom domain untuk foto struk.
4. Buka project Pages → **Settings → Bindings → Add binding → R2 bucket**.
5. Pada Production, isi:

```text
Variable / Binding name: RECEIPTS_BUCKET
Bucket: uangku-receipts
```

6. Simpan. Jika menggunakan preview, buat bucket `uangku-receipts-preview` dan binding bernama sama di environment Preview.

Tidak perlu membuat S3 access key atau mengubah kode. Setelah redeploy, Profil menampilkan status R2. Foto disimpan saat hasil scan disimpan menjadi transaksi; buka melalui tautan **Lihat struk** di riwayat transaksi. Server memeriksa pemilik akun setiap kali foto diakses.

## 6. Isi variables dan secrets di website Cloudflare

Buka **Pages project → Settings → Variables and Secrets → Add**. Pilih **Production**.

| Nama | Jenis | Nilai / fungsi |
|---|---|---|
| `NODE_VERSION` | Plain text | `24` untuk build |
| `ADMIN_EMAIL` | Plain text, opsional | Email akun pemilik yang akan dikelola sebagai admin |
| `ADMIN_PASSWORD` | **Secret / Encrypt**, opsional | Password admin 6–128 karakter; wajib berpasangan dengan `ADMIN_EMAIL` |
| `GOOGLE_CLIENT_ID` | Plain text, opsional | Client ID Google Cloud milik Anda |
| `GEMINI_API_KEY` | **Secret / Encrypt** | Key Gemini untuk scan |
| `OPENAI_API_KEY` | **Secret / Encrypt**, opsional | Key OpenAI untuk scan/fallback |
| `GEMINI_MODEL` | Plain text, opsional | Default kode: `gemini-2.5-flash` |
| `OPENAI_MODEL` | Plain text, opsional | Default kode: `gpt-4o-mini` |

Tambahkan konfigurasi Preview secara terpisah jika dibutuhkan; gunakan key uji/limit rendah. Pastikan model tersedia pada akun provider Anda. Mengisi key tidak otomatis menjamin billing/kuotanya aktif.

- API key hanya ditempel di Cloudflare, **bukan GitHub atau chat**.
- Jangan memakai nama `VITE_GEMINI_API_KEY` atau `VITE_OPENAI_API_KEY`: variabel `VITE_` dapat masuk JavaScript browser.
- Tidak perlu `APP_URL`, `ADMIN_PIN`, `JWT_SECRET`, atau `VITE_GOOGLE_CLIENT_ID`.
- Panel admin hanya memilih provider global dan menampilkan status pemasangan key, tidak menampilkan/menyimpan key asli.
- Tanpa key AI, scan menampilkan error konfigurasi; transaksi manual tetap bisa dipakai.

## 7. Atur build dan runtime Pages

**Settings → Builds / Build configuration / Git integration**, sesuaikan dengan tampilan dashboard:

| Pengaturan | Nilai |
|---|---|
| Repository | `Lukmanyyy/keuangan-v2` |
| Production branch | `main`, setelah revisi digabung |
| Automatic production deployments | Aktif |
| Framework preset | Vite/React jika tersedia |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | Kosong/root repo |
| Node.js | `NODE_VERSION=24` dari langkah 6 |

Jika ada menu **Functions → Compatibility date / Compatibility flags**, gunakan tanggal `2026-10-27` atau tanggal yang sudah didukung runtime Anda, dan tambahkan `nodejs_compat`. Ini pengaturan runtime Functions, bukan variabel bernama `NODE_VERSION`.

Frontend menggunakan fallback SPA bawaan Pages (tanpa top-level `404.html`). Tidak perlu aturan `/* /index.html 200` yang dapat terdeteksi sebagai loop. Folder `functions/api/[[path]].ts` menangani `/api/*` sehingga error API tetap JSON, bukan halaman HTML.

## 8. Gabungkan revisi dan deploy

1. Pastikan D1 sudah berisi tabel/trigger dan binding production sudah benar.
2. Di GitHub buka branch **`feat/cloudflare-fullstack`**.
3. Klik **Compare & pull request** menuju `main`.
4. Review perubahan dan hasil **Checks**, lalu merge jika konfigurasi Cloudflare sudah siap.
5. Buka Cloudflare → project Pages → **Deployments**.
6. Tunggu deployment commit revisi berstatus **Success**.

Jika baru mengubah binding/secret setelah deployment selesai, pilih **Retry deployment / Redeploy** pada deployment terbaru. Jangan me-redeploy commit lama yang belum berisi backend revisi.

Tidak perlu mengunggah file manual, membuka terminal, atau menyalakan komputer terus-menerus. Cloudflare mengambil kode dari GitHub dan menjalankan build.

## 9. Atur login Google lewat Google Cloud (opsional)

1. Buka https://console.cloud.google.com/, buat/pilih project.
2. Buka **Google Auth Platform**, atau **APIs & Services → OAuth consent screen / Credentials**.
3. Isi nama aplikasi, email dukungan, audience, dan developer contact. Jika masih Testing, tambahkan test users.
4. Buat **OAuth Client ID → Web application**.
5. Pada **Authorized JavaScript origins**, isi origin situs yang benar, misalnya:

```text
https://NAMA_PROJECT.pages.dev
https://uangku.domainkamu.com
```

Gunakan alamat nyata Anda, tanpa path `/api`, `/privacy`, atau `/terms`. Client memakai tombol Google Identity Services dengan ID token, bukan alur redirect server; jangan menaruh client secret di frontend.

6. Jika diminta Google, isi URL kebijakan privasi `https://DOMAIN/privacy` dan ketentuan `https://DOMAIN/terms`. Verifikasi domain/aplikasi mungkin diperlukan.
7. Salin **Client ID** ke `GOOGLE_CLIENT_ID` pada Settings Cloudflare Production.
8. Redeploy Pages, lalu uji login memakai akun penguji.

Server memverifikasi signature, issuer, audience, expiry, dan email verified. Nama/email yang dikirim begitu saja tidak menghasilkan sesi. Email yang sudah memiliki akun password tidak digabung otomatis dengan Google; gunakan login password untuk akun tersebut.

Preview membutuhkan origin Google yang didaftarkan juga. Origin preview acak tidak otomatis diizinkan. Tanpa Google, login email/password tetap tersedia.

## 10. Login administrator lewat Variables and Secrets — tanpa SQL role

1. Buka **Pages → project Anda → Settings → Variables and Secrets → Production**.
2. Tambahkan **`ADMIN_EMAIL`** sebagai Plain text, isi email admin milik Anda.
3. Tambahkan **`ADMIN_PASSWORD`** sebagai **Secret / Encrypt**, isi password **6–128 karakter**, bukan hanya spasi. Password lebih panjang dan unik tetap lebih aman. Tidak ada password bawaan. Jangan kirim nilai password ke chat atau GitHub.
4. Simpan keduanya lalu **redeploy commit terbaru**. Untuk Preview, konfigurasi terpisah; jangan gunakan password admin production di deployment pengujian.
5. Buka halaman utama website → **Mulai Sekarang → Masuk** (bukan Daftar).
6. Login menggunakan email dan password persis sesuai kedua variabel tersebut.
7. Pada login pertama yang berhasil, server membuat akun beserta pengaturannya dengan role `admin` di D1. Jika email sudah memiliki akun, ID/data dompet tetap dipertahankan, password diganti dengan hash secret, dan seluruh sesi serta tautan Google lama dicabut agar tidak ikut mendapat hak admin.
8. Buka **Profil → Panel admin** setelah login. Panel dibuka di dalam aplikasi tanpa mengubah URL. Alamat lama `/admin` (termasuk subpath) dialihkan ke beranda; hash `#admin` tidak membuka panel. Refresh atau membuka ulang website mengembalikan pengguna ke dashboard, bukan panel.

Tidak perlu daftar akun terlebih dahulu atau menjalankan `UPDATE users`. Database dan tabel D1 tetap harus sudah siap; variabel admin tidak menggantikan pembuatan skema. Bila login masih gagal, periksa `/api/health` dan runtime logs.

**Keamanan dan perubahan pengaturan:**

- Mengetahui/mendaftarkan email admin saja tidak cukup. Akun baru hanya dibuat/dipromosikan setelah secret cocok; pendaftaran publik untuk email yang dikonfigurasi ditolak.
- Akun admin konfigurasi harus login dengan password secret, bukan Google atau password lama, termasuk jika memakai alias nama akun.
- Menyembunyikan URL bukan pengganti otorisasi. Endpoint `/api/admin/*` tetap digunakan aplikasi dan memeriksa sesi serta role admin di server; akun biasa tetap ditolak.
- Untuk mengganti password admin, ubah `ADMIN_PASSWORD` di Cloudflare, redeploy, lalu **login sekali dengan password baru**. Login berhasil tersebut mencabut sesi-sesi sebelumnya. Mengubah secret saja tidak otomatis mengakhiri cookie sesi yang sudah diterbitkan.
- Jika `ADMIN_EMAIL` diganti, akses akun admin konfigurasi lama ditolak; login pertama pemilik baru menurunkan role akun terkelola sebelumnya menjadi user dan mencabut sesinya. Data lamanya tidak dihapus.
- Menghapus pasangan variabel menonaktifkan login/sesi admin terkelola, bukan menghapus datanya. Admin lain yang sengaja diberi role melalui D1 tetap terpisah dari mekanisme ini.
- Password akun admin terkelola tidak bisa direset dari panel; ubah secret di Cloudflare. Tidak ada PIN default atau pemberian admin kepada pendaftar pertama.

Admin dapat melihat ringkasan akun, reset password pengguna (mencabut seluruh sesi pengguna), menghapus akun pengguna, dan mengatur provider global. Password asli dan API key tidak pernah ditampilkan. Cara SQL untuk memberi role admin ke akun lain tetap didukung jika memang dibutuhkan, tetapi tidak wajib untuk pemilik yang memakai variabel.

## 11. Checklist sebelum menggunakan data asli

- Buka `https://DOMAIN/api/health`: `success: true`, `database: "ready"`. `receiptStorage: true` jika R2 dipasang.
- Buat akun uji, tambah dua dompet, buat pemasukan/pengeluaran, lalu refresh.
- Transfer antar dompet, hapus transfer, pastikan kedua saldo kembali.
- Logout/login di perangkat lain: data akun yang sama harus tetap ada.
- Akun lain tidak boleh melihat data/foto akun pertama dan tidak dapat membuka API admin.
- Tambah kategori dan cek kembali setelah login ulang.
- Scan foto struk, periksa hasil, koreksi bila perlu, simpan; jika R2 aktif, uji Lihat struk.
- Uji PDF/XLSX/CSV dari periode yang dipilih serta ekspor JSON di Profil.
- Periksa **runtime / Functions logs**, bukan build log saja, jika ada error.

Health tidak menguji billing/key/kuota AI atau konfigurasi Google. Scan gagal harus menampilkan error, bukan hasil belanja contoh palsu.

Jika health mengembalikan `database: "not_ready"`, periksa daftar `checks`: `missing_table` berarti tabel tersebut tidak ditemukan pada database yang dipakai deployment, sedangkan `query_failed` berarti pembacaan D1 gagal karena sebab lain. Gunakan `diagnosticId` untuk mencari detail di runtime/Functions logs. Jangan menghapus tabel atau menjalankan ulang SQL awal tanpa memeriksa database/environment yang benar.

## 12. Domain, backup, dan update selanjutnya

**Domain:** Pages → **Custom domains → Set up a custom domain**. Ikuti DNS dan tunggu HTTPS aktif. Tambahkan origin domain baru ke Google Cloud. Login ulang di domain baru: cookie tidak pindah dari `pages.dev`, tetapi data D1 tetap sama jika binding sama.

**Backup:** sebelum perubahan skema, gunakan fasilitas export/backup D1 atau **Time Travel** yang tersedia pada paket akun Anda. Simpan backup privat, bukan di GitHub. Jika UI tidak menyediakan export file, minta bantuan membuat export terkontrol sebelum migration berisiko; jangan menjalankan reset/drop sebagai pengganti backup. Backup D1 tidak mencakup foto R2; kelola backup/lifecycle bucket terpisah.

**Update kode:** perubahan GitHub → merge `main` → Cloudflare auto deploy. GitHub Checks sudah disertakan; aktifkan branch protection jika ingin tes wajib lolos sebelum merge.

**Update skema:** perubahan kode tidak otomatis menjalankan SQL. Buat migration baru, uji di database preview, backup production, lalu jalankan SQL yang dibutuhkan lewat D1 Console dan catat penerapannya. Jangan menjalankan ulang SQL awal. Rollback deployment Pages hanya mengembalikan kode, bukan database.

## Troubleshooting

| Masalah | Solusi |
|---|---|
| Binding tidak bisa diedit di dashboard | Pastikan deployment terbaru tidak memiliki `wrangler.toml`/`wrangler.json` production. `wrangler.local.toml` boleh tetap ada |
| `DB` tidak ditemukan | Tambahkan binding `DB` pada environment yang benar, pilih database, lalu redeploy |
| Health belum siap / `no such table` | Jalankan seluruh SQL awal pada database yang benar; jangan hanya membuat database kosong |
| `table already exists` | SQL sudah dijalankan atau ada skema lama; jangan drop tabel, gunakan database baru atau migration khusus |
| API mengembalikan HTML | Commit revisi belum terdeploy, root/build salah, atau hanya deploy static ZIP tanpa Functions |
| Login gagal | Cookie aktif, domain konsisten, akun benar, password pendaftaran 6–128 karakter; cek runtime logs |
| Google error origin/audience | Origin Google Cloud dan `GOOGLE_CLIENT_ID` Cloudflare harus cocok; redeploy |
| Scan 503 | Secret provider belum diisi atau provider pilihan tidak memiliki key |
| Scan 502 | Gambar, key, model, billing/kuota, atau timeout provider bermasalah |
| Scan 429 | Limit 20/jam per akun atau 200/hari global tercapai; tunggu reset bucket waktu berikutnya |
| Foto tidak tersimpan | R2 belum terpasang saat transaksi dibuat; cek binding dan status Profil |
| Kas tidak bisa dihapus | Ada riwayat transaksi yang merujuk kas tersebut; hapus transaksi terkait dahulu |
| Kamera gagal | Gunakan HTTPS dan izinkan kamera; alternatif pilih foto dari galeri |
| CPU/runtime limit | Periksa metrik/paket Workers. Hashing password membutuhkan CPU; pertimbangkan paket sesuai trafik, jangan melemahkan hashing |

## Batasan dan biaya

- Tanpa VPS bukan berarti gratis tanpa batas. D1, Functions, R2, dan provider AI memiliki kuota/biaya; pantau penggunaan dan budget.
- Pendaftaran, reset password pengguna, dan password admin menerima 6–128 karakter, bukan hanya spasi. Password lama yang lebih panjang tetap valid; tidak dipotong atau diganti otomatis.
- Password PBKDF2-SHA256 dengan salt unik dan 100.000 iterasi sesuai batas WebCrypto Workers. Cookie persisten HttpOnly, Secure pada HTTPS, SameSite=Strict, Max-Age dan Expires; sesi 30 hari sejak login. Menutup browser/HP tidak menghapus sesi selama cookie masih disimpan. Logout, kedaluwarsa, pencabutan sesi, penghapusan data browser, atau keluar dari mode privat dapat membuat pengguna perlu login lagi. Setelah update dari versi 7 hari, login ulang sekali untuk mendapatkan cookie 30 hari. Proteksi CSRF dan rate limit tetap tersedia; minimum 6 karakter bukan jaminan password kuat.
- Login email/password belum memiliki verifikasi email/reset email otomatis. Lupa password melalui admin; login Google menyediakan identitas email terverifikasi.
- Preferensi notifikasi disimpan, tetapi layanan push/scheduler belum tersedia. Tidak ada penyimpanan offline atau transaksi sukses palsu saat server gagal.
- API transaksi memakai pagination; ekspor API CSV/JSON maksimal 10.000 transaksi per permintaan (gunakan rentang tanggal jika lebih). Ekspor layar laporan memakai data yang dimuat browser dan periode yang dipilih.
- Tes lokal tidak menjamin layanan eksternal aktif. Selesaikan checklist dengan akun Cloudflare, Google, AI, serta domain nyata sebelum go-live.

Referensi: [Pages bindings](https://developers.cloudflare.com/pages/functions/bindings/) · [D1 dashboard](https://developers.cloudflare.com/d1/get-started/) · [Pages configuration](https://developers.cloudflare.com/pages/functions/wrangler-configuration/).
