import React, { useState, useEffect } from 'react';
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
  Key,
  Eye,
  EyeOff,
  ExternalLink,
  Check,
  ShieldCheck,
  BookOpen,
  Camera,
  CheckCircle2,
} from 'lucide-react';
import { User, ScreenId, AppSettings } from '../../types';

interface ProfileSettingsScreenProps {
  user: User;
  settings?: AppSettings;
  onSaveSettings?: (settings: Partial<AppSettings>) => void;
  onNavigate: (screen: ScreenId) => void;
  onOpenAiSettings: () => void;
  onUpdateUser: (name: string, email: string) => void;
  onResetDemoData: () => void;
  onLogout: () => void;
}

export const ProfileSettingsScreen: React.FC<ProfileSettingsScreenProps> = ({
  user,
  settings,
  onSaveSettings,
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

  // Gemini API Key (BYOK) State
  const [geminiKeyInput, setGeminiKeyInput] = useState(settings?.geminiApiKey || '');
  const [showKey, setShowKey] = useState(false);
  const [keySavedMsg, setKeySavedMsg] = useState('');
  const [isTutorialModalOpen, setIsTutorialModalOpen] = useState(false);

  useEffect(() => {
    if (settings?.geminiApiKey !== undefined) {
      setGeminiKeyInput(settings.geminiApiKey);
    }
  }, [settings?.geminiApiKey]);

  const handleSaveGeminiKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSaveSettings) {
      onSaveSettings({
        geminiApiKey: geminiKeyInput.trim(),
        aiProvider: 'gemini',
      });
    }
    setKeySavedMsg('Kunci Gemini berhasil disimpan!');
    setTimeout(() => setKeySavedMsg(''), 3000);
  };

  const handleRemoveGeminiKey = () => {
    setGeminiKeyInput('');
    if (onSaveSettings) {
      onSaveSettings({
        geminiApiKey: '',
      });
    }
    setKeySavedMsg('Kunci Gemini dihapus. Kembali ke mode contoh.');
    setTimeout(() => setKeySavedMsg(''), 3000);
  };

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

          {/* Gemini AI Key BYOK Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/25">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">
                    Kunci Scan Struk AI
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    Google Gemini 2.5 Flash Vision
                  </span>
                </div>
              </div>

              {/* Status Badge */}
              {settings?.geminiApiKey ? (
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80 px-2.5 py-1 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Aktif
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 px-2.5 py-1 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                  Mode Simulasi
                </span>
              )}
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Setiap akun Google mendapat kuota gratis <strong>~1.500 scan struk per hari</strong>. Pasang kunci pribadi Anda agar struk belanja terbaca otomatis dengan akurasi tinggi!
            </p>

            {/* Tutorial Button */}
            <button
              type="button"
              onClick={() => setIsTutorialModalOpen(true)}
              className="w-full py-2.5 px-3.5 bg-gradient-to-r from-indigo-50 to-blue-50 hover:from-indigo-100 hover:to-blue-100 active:scale-[0.98] border border-indigo-200/80 rounded-2xl flex items-center justify-between text-indigo-700 transition-all cursor-pointer shadow-2xs"
            >
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold">Panduan 1 Menit: Cara Ambil Kunci Gratis</span>
              </div>
              <ChevronRight className="w-4 h-4 text-indigo-500" />
            </button>

            {/* Key Input Form */}
            <form onSubmit={handleSaveGeminiKey} className="space-y-3 pt-1">
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Gemini API Key Anda
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={geminiKeyInput}
                    onChange={(e) => setGeminiKeyInput(e.target.value)}
                    placeholder="Tempel kode AIzaSy... di sini"
                    className="w-full bg-slate-50 border border-slate-200/90 rounded-2xl pl-10 pr-10 py-2.5 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  >
                    {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {keySavedMsg && (
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-[11px] font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{keySavedMsg}</span>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={!geminiKeyInput.trim()}
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Simpan Kunci</span>
                </button>
                {settings?.geminiApiKey && (
                  <button
                    type="button"
                    onClick={handleRemoveGeminiKey}
                    className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-600 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    title="Hapus Kunci Pribadi"
                  >
                    Hapus
                  </button>
                )}
              </div>
            </form>

            {/* Privacy Guarantee Note */}
            <div className="flex items-start gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-100 text-[11px] text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span className="leading-snug">
                <strong>Privasi Terjamin:</strong> Kunci disimpan aman hanya di browser perangkat Anda dan tidak dibagikan ke server publik manapun.
              </span>
            </div>
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

      {/* Interactive Step-by-Step Tutorial Modal */}
      {isTutorialModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">
                    Cara Ambil Kunci Gemini Gratis
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Hanya 1 menit dengan akun Google biasa
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsTutorialModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 active:scale-90 text-slate-500 flex items-center justify-center transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 3 Visual Steps */}
            <div className="space-y-4">
              {/* Step 1 */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-[11px] font-extrabold flex items-center justify-center">
                      1
                    </span>
                    <h4 className="text-xs font-bold text-slate-900">
                      Buka Google AI Studio
                    </h4>
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    Resmi Google
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed pl-8">
                  Kunjungi portal AI resmi dari Google. Masuk menggunakan akun Google / Gmail Anda yang biasa.
                </p>
                <div className="pl-8 pt-1">
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 py-2 px-3.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-xl text-xs font-bold shadow-xs transition-all"
                  >
                    <span>Buka aistudio.google.com</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Step 2 */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-[11px] font-extrabold flex items-center justify-center">
                    2
                  </span>
                  <h4 className="text-xs font-bold text-slate-900">
                    Klik Tombol "Create API Key"
                  </h4>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed pl-8">
                  Di halaman Google AI Studio, klik tombol biru <strong>Create API key</strong>, pilih proyek bawaan Google Anda, lalu klik konfirmasi.
                </p>
                <div className="pl-8 pt-1">
                  <div className="inline-flex items-center gap-2 bg-blue-600 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl shadow-2xs">
                    <Key className="w-3.5 h-3.5" />
                    <span>+ Create API key</span>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-[11px] font-extrabold flex items-center justify-center">
                    3
                  </span>
                  <h4 className="text-xs font-bold text-slate-900">
                    Salin & Tempelkan ke Sini
                  </h4>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed pl-8">
                  Salin kode yang diawali huruf <code className="bg-slate-200 px-1 py-0.5 rounded font-mono text-[11px]">AIzaSy...</code>, tutup jendela ini, lalu tempelkan ke kolom <strong>Gemini API Key Anda</strong> di halaman profil.
                </p>
              </div>
            </div>

            {/* Security Guarantee Box */}
            <div className="bg-emerald-50 border border-emerald-200/80 p-3.5 rounded-2xl space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>3 Hal yang Membuat Ini 100% Aman:</span>
              </div>
              <ul className="text-[11px] text-emerald-800 space-y-1 list-disc pl-5 leading-relaxed">
                <li><strong>100% Gratis:</strong> Diberikan kuota 1.500 scan struk per hari tanpa perlu kartu kredit.</li>
                <li><strong>Privasi Penuh:</strong> Kunci hanya tersimpan di browser HP Anda, tidak bisa dilihat orang lain.</li>
                <li><strong>Akurat Seketika:</strong> Struk Indomaret, Alfamart, restoran, dan bensin langsung terbaca presisi!</li>
              </ul>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={() => setIsTutorialModalOpen(false)}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 active:scale-98 text-white rounded-2xl text-xs font-bold transition-all cursor-pointer"
            >
              Saya Mengerti, Tutup Panduan
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
