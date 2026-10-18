import React, { useState } from 'react';
import {
  Layers,
  Tag,
  PieChart,
  Cloud,
  Download,
  LogOut,
  ChevronRight,
  RotateCcw,
  Sparkles,
  AlertTriangle,
  X,
} from 'lucide-react';
import { User, ScreenId } from '../../types';

interface ProfileSettingsScreenProps {
  user: User;
  onNavigate: (screen: ScreenId) => void;
  onOpenAiSettings: () => void;
  onUpdateUser: (name: string, email: string) => void;
  onResetDemoData: () => void;
  onLogout: () => void;
}

export const ProfileSettingsScreen: React.FC<ProfileSettingsScreenProps> = ({
  user,
  onNavigate,
  onOpenAiSettings,
  onUpdateUser,
  onResetDemoData,
  onLogout,
}) => {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user.name || 'Luthfi');
  const [email, setEmail] = useState(user.email || 'luthfi@email.com');
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser(name, email);
    setEditing(false);
    setFeedbackMsg('Profil kamu berhasil diperbarui! Makin keren!');
    setTimeout(() => setFeedbackMsg(''), 2500);
  };

  const handleExportJson = () => {
    fetch('/api/export/report')
      .then((r) => r.json())
      .then((data) => {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `backup-keuangan-uangku-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
      });
  };

  return (
    <div className="w-full pb-28 md:pb-12 text-slate-800">
      {/* Page Title */}
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          Profil & Pengaturan
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Senang nemenin perjalanan finansialmu! Yuk atur preferensi, dompet impian, dan gaya pencatatanmu di sini.
        </p>
      </div>

      {/* Responsive Grid: 2 columns on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (5 cols): Profile Info Card & AI Highlight */}
        <div className="lg:col-span-5 space-y-5">
          {/* Profile Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs">
            {editing ? (
              <form onSubmit={handleSaveProfile} className="space-y-3.5">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase">Nama Panggilan / Lengkap</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 mt-1"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase">Email Akun</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 mt-1"
                    required
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 cursor-pointer shadow-xs active:scale-95 transition-all"
                  >
                    Simpan Profil Baru
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-200 cursor-pointer"
                  >
                    Batal
                  </button>
                </div>
              </form>
            ) : (
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-extrabold text-xl flex items-center justify-center shadow-md shadow-indigo-600/30">
                      {user.avatar || 'L'}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-base text-slate-900">{user.name || 'Teman Uangku'}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">{user.email || 'teman@uangku.id'}</p>
                      <span className="inline-flex items-center gap-1 mt-1 text-[10px] bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full font-bold">
                        <Sparkles className="w-3 h-3 text-indigo-500" />
                        Sahabat Finansial Aktif
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setEditing(true)}
                    className="px-3.5 py-1.5 border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 active:scale-95 text-indigo-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Ubah
                  </button>
                </div>
              </div>
            )}

            {feedbackMsg && (
              <p className="text-xs text-emerald-600 font-bold mt-3 text-center bg-emerald-50 py-1.5 rounded-xl border border-emerald-100">
                {feedbackMsg}
              </p>
            )}
          </div>
        </div>

        {/* Right Column (7 cols): Navigation Menu Options */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs divide-y divide-slate-100 overflow-hidden">
            {/* Kelola Kas */}
            <button
              onClick={() => onNavigate('wallets')}
              className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer text-left active:scale-[0.99]"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Dompet & Rekening Keuanganmu</span>
                  <span className="text-[11px] text-slate-400">Atur saldo rekening bank, e-wallet, dan pos tabungan</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            {/* Statistik & Kategori */}
            <button
              onClick={() => onNavigate('statistics')}
              className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer text-left active:scale-[0.99]"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Tag className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Kategori Pengeluaran & Pemasukan</span>
                  <span className="text-[11px] text-slate-400">Sesuaikan pos transaksi biar pas dengan kebutuhanmu</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            {/* Laporan */}
            <button
              onClick={() => onNavigate('reports')}
              className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer text-left active:scale-[0.99]"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <PieChart className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Rangkuman Catatan & Laporan</span>
                  <span className="text-[11px] text-slate-400">Lihat seberapa sehat alur kasmu dan unduh laporannya</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            {/* Sinkronisasi Cloud */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                  <Cloud className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Data Tersimpan Aman</span>
                  <span className="text-[11px] text-slate-400">Semua catatan tersinkron rapi di perangkatmu</span>
                </div>
              </div>
              <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full flex items-center gap-1.5 border border-emerald-100">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Tersimpan
              </span>
            </div>

            {/* Cadangkan Data JSON */}
            <button
              onClick={handleExportJson}
              className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer text-left active:scale-[0.99]"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Download className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Simpan Cadangan Data (Backup)</span>
                  <span className="text-[11px] text-slate-400">Unduh salinan rekaman keuangan agar selalu terlindungi</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            {/* Mulai Lembaran Baru (Kosongkan Data) */}
            <button
              onClick={() => setIsResetModalOpen(true)}
              className="w-full p-4 flex items-center justify-between hover:bg-amber-50/50 transition-colors cursor-pointer text-left active:scale-[0.99]"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                  <RotateCcw className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-orange-900 block">Mulai Lembaran Baru (Kosongkan Data)</span>
                  <span className="text-[11px] text-slate-400">Bersihkan semua transaksi untuk mulai pencatatan segar</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            {/* Keluar / Logout */}
            <button
              onClick={onLogout}
              className="w-full p-4 flex items-center justify-between hover:bg-rose-50/50 transition-colors cursor-pointer text-left active:scale-[0.99]"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                  <LogOut className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-rose-600 block">Istirahat Dulu / Keluar Akun</span>
                  <span className="text-[11px] text-slate-400">Catatan finansialmu tetap tersimpan aman</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-rose-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Custom In-App Modal for Resetting Data */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 stroke-[2.2]" />
              </div>
              <button
                onClick={() => setIsResetModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Mulai Lembaran Baru?</h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Tindakan ini akan mengosongkan semua riwayat transaksi Anda sehingga Anda bisa mencatat dari awal dengan pembukuan yang segar.
              </p>
            </div>
            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsResetModalOpen(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsResetModalOpen(false);
                  onResetDemoData();
                }}
                className="flex-1 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
              >
                Ya, Mulai Baru
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
