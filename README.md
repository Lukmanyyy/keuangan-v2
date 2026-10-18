# 💸 UANGKU - Manajemen Keuangan & Smart AI Receipt Scanner
### 🚀 Panduan Lengkap Deploy ke Ekosistem Cloudflare (100% Serverless Tanpa VPS)

Aplikasi pencatatan keuangan pribadi modern berbahasa Indonesia yang dirancang presisi dengan:
- 📊 **Pemisahan Kategori Pintar**: Kategori Pengeluaran & Pemasukan otomatis terpisah secara cerdas.
- 📅 **Statistik Mingguan Interaktif**: Grafik batang per hari (Senin s.d. Minggu) dengan kartu rincian transaksi harian yang dapat diklik.
- 📸 **AI Receipt Scanner**: Pemindai struk belanja otomatis menggunakan Google Gemini 2.5 Flash Vision & ChatGPT Vision.
- ⚡ **100% Serverless**: Dibuat khusus untuk berjalan di ekosistem Cloudflare (Pages + Functions + D1 + R2) tanpa perlu menyewa VPS, tanpa Nginx, tanpa biaya bulanan server.

---

## 📑 Daftar Isi
1. [Arsitektur Cloudflare (Mengapa Tanpa VPS?)](#1-arsitektur-cloudflare-mengapa-tanpa-vps)
2. [Langkah 1: Menghubungkan Google AI Studio / Proyek ke GitHub](#langkah-1-menghubungkan-google-ai-studio--proyek-ke-github)
3. [Langkah 2: Menghubungkan GitHub ke Cloudflare Pages](#langkah-2-menghubungkan-github-ke-cloudflare-pages)
4. [Langkah 3: Konfigurasi Build & Environment Variables di Cloudflare](#langkah-3-konfigurasi-build--environment-variables-di-cloudflare)
5. [Langkah 4: Arsitektur Penyimpanan Data (Cloudflare D1, KV, & R2)](#langkah-4-arsitektur-penyimpanan-data-cloudflare-d1-kv--r2)
6. [Langkah 5: Menghubungkan Domain Kustom & SSL Otomatis](#langkah-5-menghubungkan-domain-kustom--ssl-otomatis)
7. [Langkah 6: Alur Kerja Harian (Workflow CI/CD Otomatis)](#langkah-6-alur-kerja-harian-workflow-cicd-otomatis)
8. [Struktur Berkas Proyek](#struktur-berkas-proyek)

---

## 1. Arsitektur Cloudflare (Mengapa Tanpa VPS?)

Pada metode tradisional menggunakan VPS (Virtual Private Server):
- Anda harus membayar sewa server setiap bulan ($5 - $20/bln).
- Harus menginstal Linux, Node.js, PM2, reverse-proxy Nginx, dan memperbarui sertifikat SSL Certbot secara berkala.
- Server bisa *down* atau kehabisan memori jika banyak pengguna mengakses bersamaan.

**Dengan Ekosistem Cloudflare (Full Serverless):**
| Kebutuhan | Solusi Cloudflare | Keunggulan & Biaya |
|---|---|---|
| **Hosting Web (Frontend React)** | **Cloudflare Pages** | Gratis, CDN di 300+ kota dunia, bandwidth tak terbatas, load secepat kilat. |
| **Backend & OCR AI Scan** | **Cloudflare Pages Functions** | Serverless Edge Worker (`functions/api/*`), jalan otomatis hanya saat ada request. |
| **Database Transaksi & Kas** | **Cloudflare D1** | Serverless SQLite resmi dari Cloudflare, gratis hingga 5 juta pembacaan/hari. |
| **Penyimpanan Foto Struk** | **Cloudflare R2** | Kompatibel S3, gratis 10 GB/bulan, **bebas biaya transfer (0$ Egress Fee)**. |
| **Keamanan & SSL** | **Cloudflare Edge SSL** | HTTPS aktif otomatis dengan enkripsi TLS 1.3 gratis selamanya. |

---

## Langkah 1: Menghubungkan Google AI Studio / Proyek ke GitHub

Untuk menghubungkan kode ini ke GitHub, pilih metode yang paling nyaman bagi Anda:

### Metode A: Unduh Proyek (Paling Mudah & Direkomendasikan)
1. Di tampilan Google AI Studio Build, unduh repositori ini dalam bentuk berkas ZIP (tombol **Download Project / Export**).
2. Ekstrak berkas ZIP tersebut ke folder di komputer Anda, misalnya di folder `Documents/uangku-app`.
3. Buka folder tersebut menggunakan terminal komputer (atau VS Code).
4. Buat repositori baru di GitHub:
   - Buka [github.com/new](https://github.com/new).
   - Isi nama repositori: `uangku-app`.
   - Pilih visibilitas **Private** atau **Public**.
   - Biarkan opsi lain kosong (jangan centang *Add README*), lalu klik **Create repository**.
5. Di terminal komputer Anda, jalankan perintah berikut secara berurutan:
   ```bash
   # Inisialisasi git lokal
   git init

   # Tambahkan semua berkas ke git
   git add .

   # Buat commit pertama
   git commit -m "feat: inisialisasi aplikasi Uangku fullstack"

   # Ubah nama branch utama menjadi main
   git branch -M main

   # Hubungkan ke repositori GitHub Anda (ganti USERNAME dengan nama akun GitHub Anda)
   git remote add origin https://github.com/USERNAME/uangku-app.git

   # Unggah (push) seluruh kode ke GitHub
   git push -u origin main
   ```

### Metode B: Push Langsung dari Terminal Git
Jika Anda sudah menghubungkan terminal ke akun GitHub via SSH Key atau Personal Access Token (PAT):
```bash
git init
git add .
git commit -m "feat: inisialisasi UANGKU"
git remote add origin https://github.com/USERNAME/uangku-app.git
git branch -M main
git push -u origin main
```

---

## Langkah 2: Menghubungkan GitHub ke Cloudflare Pages

Setelah kode berada di GitHub, Cloudflare Pages akan dihubungkan sekali saja dan otomatis memantau pembaruan:

1. Buka dan masuk ke [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. Pada menu navigasi sebelah kiri, klik menu **Workers & Pages** (atau **Compute**).
3. Klik tombol **Create application** di bagian kanan atas.
4. Pilih tab **Pages**, lalu klik tombol **Connect to Git**.
5. Hubungkan akun GitHub Anda dan pilih repositori `uangku-app` yang baru saja Anda buat.
   *(Jika repositori belum muncul dalam daftar, klik opsi "Add account" atau konfirmasi izin akses Cloudflare ke repositori tersebut).*
6. Klik tombol **Begin setup**.

---

## Langkah 3: Konfigurasi Build & Environment Variables di Cloudflare

Pada layar setup konfigurasi proyek Cloudflare Pages, isi pengaturan berikut:

### 3.1 Build Settings
* **Project name**: `uangku-app` (atau nama aplikasi pilihan Anda)
* **Production branch**: `main`
* **Framework preset**: Pilih **`Vite`**
* **Build command**: `npm run build`
* **Build output directory**: `dist`
* **Root directory**: `/` *(biarkan kosong/default)*

### 3.2 Environment Variables (Variabel Lingkungan)
Buka menu lipat **Environment variables (advanced)** dan tambahkan kunci berikut:

| Variable Name (Nama Variabel) | Nilai (Value) | Fungsi |
|---|---|---|
| `NODE_VERSION` | `20` | Memastikan Cloudflare menggunakan Node.js v20 untuk proses build Vite |
| `GEMINI_API_KEY` | `AIzaSy...` *(Kunci Google AI Studio Anda)* | Digunakan oleh AI Scanner untuk membaca struk belanja otomatis di edge |
| `OPENAI_API_KEY` | *(Opsional)* | Cadangan jika Anda ingin menggunakan ChatGPT Vision (GPT-4o) |

> 🔒 **Keamanan Terjamin**: Variabel lingkungan di Cloudflare Pages terenkripsi di level infrastruktur Cloudflare dan tidak akan pernah bocor ke publik atau repositori GitHub Anda.

7. Klik tombol **Save and Deploy**.
8. Cloudflare akan otomatis mengunduh dependensi, mengkompilasi file React/Vite, dan mempublikasikan situs Anda dalam waktu ~40 detik!
9. Anda akan mendapatkan URL publik instan, contoh: `https://uangku-app.pages.dev`.

---

## Langkah 4: Arsitektur Penyimpanan Data (Cloudflare D1, KV, & R2)

Bagaimana penyimpanan data bekerja tanpa harddisk server fisik VPS? Ekosistem Cloudflare menyediakan solusi serverless yang saling melengkapi:

### A. Penyimpanan Cepat di Perangkat (Client-Side Storage)
- Secara default, aplikasi UANGKU sudah memiliki sistem penyimpanan lokal terintegrasi (*Offline-First*).
- Kategori transaksi, pengaturan tampilan, dan transaksi harian tersimpan aman di browser masing-masing pengguna tanpa memerlukan konfigurasi database tambahan.

### B. Cloudflare D1 (Database SQL Serverless Global)
Untuk sinkronisasi multi-perangkat (misalnya buka di HP dan laptop dengan data yang sama):
1. Di Cloudflare Dashboard, klik menu **Storage & Databases** -> **D1 SQL Database**.
2. Klik **Create database**, beri nama `uangku-db`, lalu pilih lokasi data center (misal: *Asia-Pacific / Singapore*).
3. Sambungkan database ke Cloudflare Pages Anda:
   - Buka proyek `uangku-app` di Cloudflare Pages.
   - Masuk ke tab **Settings** -> **Functions**.
   - Di bagian **D1 Database Bindings**, klik **Add binding**:
     - *Variable name*: `DB`
     - *D1 database*: pilih `uangku-db`.
4. Buka tab **Console** di dalam `uangku-db` dan jalankan skema tabel SQL berikut:

```sql
-- Tabel Pengguna & Profil
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  avatar TEXT DEFAULT 'U',
  password_hash TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Kas / Dompet
CREATE TABLE IF NOT EXISTS wallets (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  balance INTEGER NOT NULL DEFAULT 0,
  color TEXT DEFAULT 'indigo',
  icon TEXT DEFAULT 'wallet',
  is_default BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabel Transaksi (Pemasukan, Pengeluaran, Transfer)
CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  wallet_id TEXT NOT NULL,
  to_wallet_id TEXT,
  type TEXT NOT NULL, -- 'pemasukan' | 'pengeluaran' | 'transfer'
  merchant TEXT NOT NULL,
  amount INTEGER NOT NULL,
  date TEXT NOT NULL,
  category TEXT NOT NULL,
  notes TEXT,
  receipt_image TEXT,
  items_json TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (wallet_id) REFERENCES wallets(id) ON DELETE CASCADE
);

-- Indeks Performa Cepat
CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_wallets_user ON wallets(user_id);
```

### C. Cloudflare R2 (Penyimpanan Foto Struk Fisik)
Jika Anda ingin menyimpan arsip foto struk asli resolusi tinggi tanpa membebani database:
- Buat bucket di **R2 Object Storage** bernama `uangku-receipts`.
- Hubungkan bucket binding `RECEIPTS_BUCKET` di Cloudflare Pages Functions.
- Kuota gratis 10 GB per bulan tanpa biaya keluar (*Zero Egress Fee*).

---

## Langkah 5: Menghubungkan Domain Kustom & SSL Otomatis

Aplikasi Anda langsung aktif di `https://uangku-app.pages.dev`. Jika Anda memiliki domain sendiri (seperti `uangku.id`, `dompetku.my.id`, atau subdomain `keuangan.perusahaan.com`):

1. Masuk ke proyek Anda di Cloudflare Pages -> Tab **Custom domains**.
2. Klik tombol **Set up a custom domain**.
3. Masukkan nama domain atau subdomain Anda.
4. Klik **Continue**.
5. Jika domain Anda sudah diatur menggunakan DNS Cloudflare, Cloudflare akan menambahkan CNAME record secara otomatis hanya dengan 1 klik!
6. Sertifikat SSL HTTPS akan diterbitkan otomatis dalam 1-2 menit tanpa perlu perintah terminal atau renew manual.

---

## Langkah 6: Alur Kerja Harian (Workflow CI/CD Otomatis)

Setelah proses di atas selesai, Anda tidak perlu lagi login ke Cloudflare atau repot memindahkan file:

```
┌─────────────────────────┐       git push        ┌─────────────────────────┐
│     Komputer Anda /     │ ────────────────────> │      GitHub Repo        │
│   Google AI Studio      │                       │     (Branch main)       │
└─────────────────────────┘                       └─────────────────────────┘
                                                               │
                                                               │ Webhook otomatis
                                                               ▼
                                                  ┌─────────────────────────┐
                                                  │    Cloudflare Pages     │
                                                  │  - Build otomatis       │
                                                  │  - Deploy ke 300+ Edge  │
                                                  │  - Zero Downtime (~40s) │
                                                  └─────────────────────────┘
```

Setiap kali Anda mengubah tampilan atau fitur:
```bash
git add .
git commit -m "update: perbaiki tampilan dan fitur"
git push origin main
```
Cloudflare Pages akan langsung mendeteksi perubahan tersebut, menjalankan `npm run build`, dan memperbarui website Anda secara langsung di seluruh dunia tanpa downtime!

---

## Struktur Berkas Proyek

```
uangku-app/
├── functions/                     # Cloudflare Pages Functions (Serverless Backend)
│   └── api/
│       └── scan-receipt.ts        # Serverless Gemini AI OCR Scanner di Cloudflare Edge
├── public/
│   └── _redirects                 # Konfigurasi SPA routing Cloudflare (Cegah 404 saat refresh)
├── src/
│   ├── components/                # Komponen antarmuka (Header, BottomNav, Modals)
│   │   ├── modals/                # Modal kelola kategori, scan struk, dompet
│   │   └── screens/               # Layar utama (Dashboard, Statistik, Laporan, Profil)
│   ├── data/                      # Kategori pengeluaran & pemasukan terpisah
│   ├── services/                  # Integrasi API & autentikasi
│   ├── utils/                     # Format rupiah & kalkulasi arus kas
│   ├── App.tsx                    # Komponen induk navigasi & state utama
│   └── main.tsx                   # Titik masuk React 19
├── .env.example                   # Contoh konfigurasi variabel lingkungan
├── package.json                   # Dependensi & script build Vite
├── README.md                      # Panduan lengkap deployment Cloudflare
├── server.ts                      # Server Express (untuk pengujian lokal / node)
└── vite.config.ts                 # Konfigurasi bundler Vite + Tailwind CSS
```

---

## 💻 Perintah Penting untuk Pengujian Lokal

```bash
# Menjalankan server lokal pengembangan
npm run dev

# Memeriksa sintaks & validasi tipe TypeScript
npm run lint

# Menjalankan kompilasi build produksi (dist)
npm run build
```

---

## 🌟 Siap Digunakan!
Dengan panduan ini, aplikasi **UANGKU** Anda siap dipublikasikan secara profesional dengan kehandalan kelas dunia dari jaringan Cloudflare, performa instan, dan bebas biaya server bulanan!
