import React from 'react';
import { ArrowLeft, Shield, FileText, CheckCircle2 } from 'lucide-react';

interface LegalScreenProps {
  type: 'privacy' | 'terms';
  onBack: () => void;
}

export const LegalScreen: React.FC<LegalScreenProps> = ({ type, onBack }) => {
  const isPrivacy = type === 'privacy';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 py-10 px-4 sm:px-6 flex justify-center">
      <div className="w-full max-w-2xl bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-10">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100/80 px-3.5 py-2 rounded-xl transition-all cursor-pointer mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Aplikasi</span>
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 pb-6 border-b border-slate-100">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            {isPrivacy ? <Shield className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              {isPrivacy ? 'Kebijakan Privasi (Privacy Policy)' : 'Ketentuan Layanan (Terms of Service)'}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">UANGKU • Terakhir Diperbarui: 27 Oktober 2026</p>
          </div>
        </div>

        {/* Content Body */}
        {isPrivacy ? (
          <div className="mt-6 space-y-5 text-xs text-slate-600 leading-relaxed">
            <section>
              <h2 className="text-sm font-bold text-slate-900 mb-1.5 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                1. Komitmen Privasi Kami
              </h2>
              <p>
                Aplikasi <strong>UANGKU</strong> menghormati dan melindungi privasi setiap pengguna. Kami berkomitmen untuk menjaga transparansi penuh atas seluruh data yang Anda kelola dalam aplikasi pencatatan keuangan ini.
              </p>
            </section>

            <section>
              <h2 className="text-sm font-bold text-slate-900 mb-1.5 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                2. Data yang Dikumpulkan & Penggunaan Google OAuth
              </h2>
              <p>
                Saat Anda menggunakan fitur <strong>Masuk dengan Google</strong>, kami hanya mengakses informasi dasar profil Anda yang bersifat publik, meliputi:
              </p>
              <ul className="list-disc pl-5 mt-1 space-y-1">
                <li><strong>Nama Lengkap</strong>: Digunakan untuk personalisasi sapaan akun Anda.</li>
                <li><strong>Alamat Email</strong>: Digunakan sebagai identitas unik login akun Anda.</li>
                <li><strong>Foto Profil (Avatar)</strong>: Digunakan sebagai ikon profil akun Anda di aplikasi.</li>
              </ul>
              <p className="mt-1.5 text-slate-500">
                Kami <strong>TIDAK PERNAH</strong> meminta, mengakses, atau menyimpan kata sandi Google Anda, email pribadi Gmail, Google Drive, atau data sensitif lainnya.
              </p>
            </section>

            <section>
              <h2 className="text-sm font-bold text-slate-900 mb-1.5 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                3. Penyimpanan Data Keuangan
              </h2>
              <p>
                Akun, kategori, dompet, dan transaksi disimpan di Cloudflare D1. Foto struk disimpan di bucket Cloudflare R2 privat jika fitur tersebut diaktifkan. Saat memindai, foto dikirim ke Google Gemini atau OpenAI sesuai konfigurasi provider; kebijakan dan retensi provider berlaku. Administrator dapat mengelola akun dan melihat ringkasan penggunaan. Password aplikasi disimpan sebagai hash, bukan teks asli. Kami tidak menjual data kepada pengiklan.
              </p>
            </section>

            <section>
              <h2 className="text-sm font-bold text-slate-900 mb-1.5 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                4. Hak Pengguna & Penghapusan Akun
              </h2>
              <p>
                Anda dapat mengekspor laporan PDF/Excel/CSV dan data transaksi JSON. Untuk menghapus akun beserta data, hubungi administrator melalui kontak di bawah. Penghapusan data aktif tidak langsung menghapus salinan backup yang masih mengikuti masa retensi Cloudflare atau kebijakan provider AI.
              </p>
            </section>

            <section className="pt-4 border-t border-slate-100">
              <p className="text-[11px] text-slate-400">
                Pertanyaan seputar privasi dapat disampaikan ke kontak pengembang: <strong>lukmanardiansah46game@gmail.com</strong>
              </p>
            </section>
          </div>
        ) : (
          <div className="mt-6 space-y-5 text-xs text-slate-600 leading-relaxed">
            <section>
              <h2 className="text-sm font-bold text-slate-900 mb-1.5 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-500" />
                1. Ketentuan Penggunaan
              </h2>
              <p>
                Dengan mengakses atau menggunakan aplikasi <strong>UANGKU</strong>, Anda menyetujui untuk terikat oleh Ketentuan Layanan ini. Aplikasi ini disediakan untuk membantu pengelolaan catatan keuangan pribadi dan bisnis kecil Anda.
              </p>
            </section>

            <section>
              <h2 className="text-sm font-bold text-slate-900 mb-1.5 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-500" />
                2. Tanggung Jawab Akun
              </h2>
              <p>
                Pengguna bertanggung jawab penuh atas keamanan perangkat yang digunakan untuk mengakses aplikasi ini dan keakuratan setiap data transaksi yang diinput secara mandiri maupun melalui pemindai struk AI.
              </p>
            </section>

            <section>
              <h2 className="text-sm font-bold text-slate-900 mb-1.5 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-500" />
                3. Batasan Tanggung Jawab
              </h2>
              <p>
                UANGKU menyediakan alat bantu kalkulasi dan pencatatan. Aplikasi ini tidak bertindak sebagai lembaga keuangan, perbankan, atau penasihat investasi berlisensi.
              </p>
            </section>

            <section className="pt-4 border-t border-slate-100">
              <p className="text-[11px] text-slate-400">
                Hubungi kami untuk pertanyaan mengenai syarat layanan: <strong>lukmanardiansah46game@gmail.com</strong>
              </p>
            </section>
          </div>
        )}
      </div>
    </div>
  );
};
