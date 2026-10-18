import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Users,
  Key,
  Sparkles,
  RefreshCw,
  Search,
  Eye,
  EyeOff,
  Clock,
  Calendar,
  Wallet,
  Receipt,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Lock,
  Trash2,
  ChevronRight,
  Sliders,
  DollarSign,
  Activity,
  Layers,
  X,
  ExternalLink,
} from 'lucide-react';
import { api } from '../../services/api';
import { formatRupiah } from '../../utils/finance';

interface AdminScreenProps {
  onBack: () => void;
}

export const AdminScreen: React.FC<AdminScreenProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'users' | 'ai'>('users');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Overview Data
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsersToday: 0,
    totalWallets: 0,
    totalTransactions: 0,
    totalSystemBalance: 0,
  });
  const [users, setUsers] = useState<any[]>([]);
  const [globalAiSettings, setGlobalAiSettings] = useState<{
    openaiApiKey: string;
    geminiApiKey?: string;
    aiProvider: string;
  }>({
    openaiApiKey: '',
    geminiApiKey: '',
    aiProvider: 'auto',
  });

  // Reset Password Modal
  const [selectedUserForReset, setSelectedUserForReset] = useState<any | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);
  const [resetSuccessMsg, setResetSuccessMsg] = useState('');
  const [resetErrorMsg, setResetErrorMsg] = useState('');

  // User Detail Inspection Modal
  const [inspectUser, setInspectUser] = useState<any | null>(null);

  // AI Settings Form
  const [openaiKeyInput, setOpenaiKeyInput] = useState('');
  const [geminiKeyInput, setGeminiKeyInput] = useState('');
  const [aiProviderInput, setAiProviderInput] = useState('auto');
  const [showAiKey, setShowAiKey] = useState(false);
  const [savingAi, setSavingAi] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load Data
  const loadAdminData = async () => {
    try {
      setRefreshing(true);
      const res = await api.getAdminOverview();
      if (res.success) {
        setStats(res.stats);
        setUsers(res.users);
        setGlobalAiSettings(res.globalAiSettings);
        setOpenaiKeyInput(res.globalAiSettings.openaiApiKey || '');
        setGeminiKeyInput(res.globalAiSettings.geminiApiKey || '');
        setAiProviderInput(res.globalAiSettings.aiProvider || 'auto');
      }
    } catch (err) {
      console.error('Failed to load admin overview:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  // Format Date & Time in Indonesian
  const formatDateIndo = (dateStr?: string) => {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  // Relative Active Time
  const getActiveStatusBadge = (lastActiveStr?: string) => {
    if (!lastActiveStr) {
      return (
        <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full font-medium">
          Offline
        </span>
      );
    }
    const diffMs = Date.now() - new Date(lastActiveStr).getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffMinutes < 15) {
      return (
        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          Online Sekarang
        </span>
      );
    } else if (diffMinutes < 60) {
      return (
        <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 border border-blue-200/80 px-2 py-0.5 rounded-full">
          {diffMinutes} mnt lalu
        </span>
      );
    } else if (diffMinutes < 1440) {
      const hours = Math.floor(diffMinutes / 60);
      return (
        <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-2 py-0.5 rounded-full">
          {hours} jam lalu
        </span>
      );
    } else {
      const days = Math.floor(diffMinutes / 1440);
      return (
        <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full font-medium">
          {days} hari lalu
        </span>
      );
    }
  };

  // Filtered Users List
  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.id.toLowerCase().includes(q)
    );
  });

  // Handle Reset Password Submit
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForReset || !newPassword) return;

    if (newPassword.length < 6) {
      setResetErrorMsg('Kata sandi baru minimal 6 karakter');
      return;
    }

    setResettingPassword(true);
    setResetErrorMsg('');
    setResetSuccessMsg('');

    try {
      const res = await api.resetUserPassword(selectedUserForReset.id, newPassword);
      setResettingPassword(false);
      if (res.success) {
        setResetSuccessMsg(res.message);
        // Refresh local data
        setUsers((prev) =>
          prev.map((u) =>
            u.id === selectedUserForReset.id ? { ...u, password: newPassword } : u
          )
        );
        setTimeout(() => {
          setSelectedUserForReset(null);
          setNewPassword('');
          setResetSuccessMsg('');
        }, 1800);
      } else {
        setResetErrorMsg(res.message || 'Gagal mereset kata sandi');
      }
    } catch (err: any) {
      setResettingPassword(false);
      setResetErrorMsg(err?.message || 'Terjadi kesalahan');
    }
  };

  // Handle Save AI Settings
  const handleSaveAiSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingAi(true);
    setAiFeedback(null);

    try {
      const res = await api.saveAdminAiSettings({
        openaiApiKey: openaiKeyInput.trim(),
        geminiApiKey: geminiKeyInput.trim(),
        aiProvider: aiProviderInput,
      });

      setSavingAi(false);
      if (res.success) {
        setAiFeedback({
          type: 'success',
          text: res.message || 'Pengaturan integrasi AI berhasil disimpan!',
        });
        setGlobalAiSettings({
          openaiApiKey: openaiKeyInput.trim(),
          geminiApiKey: geminiKeyInput.trim(),
          aiProvider: aiProviderInput as any,
        });
      } else {
        setAiFeedback({
          type: 'error',
          text: res.message || 'Gagal menyimpan pengaturan AI',
        });
      }
    } catch (err: any) {
      setSavingAi(false);
      setAiFeedback({
        type: 'error',
        text: err?.message || 'Terjadi kesalahan sistem',
      });
    }
  };

  // Delete User Confirmation
  const handleDeleteUser = async (userId: string, userName: string) => {
    if (
      !window.confirm(
        `PERINGATAN: Apakah Anda yakin ingin menghapus akun pengguna "${userName}"? Semua data kas dan transaksi akan terhapus permanen.`
      )
    ) {
      return;
    }

    try {
      const res = await api.deleteAdminUser(userId);
      if (res.success) {
        alert(res.message);
        loadAdminData();
      } else {
        alert(res.message || 'Gagal menghapus pengguna');
      }
    } catch {
      alert('Terjadi kesalahan saat menghapus pengguna');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pb-24">
      {/* Admin Top Header */}
      <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 shadow-lg px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold"
              title="Kembali ke Dashboard Utama"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Kembali ke Aplikasi</span>
            </button>

            <div className="h-5 w-px bg-slate-800 hidden sm:block"></div>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/30">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-sm sm:text-base font-extrabold text-white tracking-wide uppercase">
                    Panel Admin UANGKU
                  </h1>
                  <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 px-2 py-0.5 rounded-full font-mono font-bold">
                    ROOT
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 hidden sm:block">
                  Pusat Monitoring Pengguna & Konfigurasi Integrasi AI
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadAdminData}
              disabled={refreshing}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              title="Segarkan Data"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-indigo-400' : ''}`} />
              <span className="hidden sm:inline">Segarkan</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-6 space-y-6">
        {/* Metric Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
          {/* Card 1: Total Users */}
          <div className="bg-slate-800/80 border border-slate-700/80 p-4 rounded-2xl shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Total User</span>
              <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold font-mono text-white">
              {stats.totalUsers}
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Akun terdaftar di database</p>
          </div>

          {/* Card 2: Active Users Today */}
          <div className="bg-slate-800/80 border border-slate-700/80 p-4 rounded-2xl shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Aktif 24 Jam</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Activity className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold font-mono text-emerald-400">
              {stats.activeUsersToday}
            </div>
            <p className="text-[10px] text-slate-400 mt-1">User berinteraksi hari ini</p>
          </div>

          {/* Card 3: Total Kas / Wallets */}
          <div className="bg-slate-800/80 border border-slate-700/80 p-4 rounded-2xl shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Total Kas</span>
              <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                <Wallet className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold font-mono text-white">
              {stats.totalWallets}
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Dompet kas dibuat user</p>
          </div>

          {/* Card 4: Total Transactions */}
          <div className="bg-slate-800/80 border border-slate-700/80 p-4 rounded-2xl shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Transaksi</span>
              <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
                <Receipt className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold font-mono text-white">
              {stats.totalTransactions}
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Catatan kas & struk</p>
          </div>

          {/* Card 5: Total Balance in System */}
          <div className="col-span-2 lg:col-span-1 bg-gradient-to-br from-indigo-950 to-slate-800 border border-indigo-700/50 p-4 rounded-2xl shadow-xs">
            <div className="flex items-center justify-between text-indigo-300 mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider">Saldo Seluruh Kas</span>
              <div className="w-7 h-7 rounded-lg bg-indigo-500/30 text-indigo-300 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="text-lg sm:text-xl font-extrabold font-mono text-white truncate">
              {formatRupiah(stats.totalSystemBalance)}
            </div>
            <p className="text-[10px] text-indigo-300/70 mt-1">Akumulasi saldo user</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'users'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Daftar & Pantau Akun Pengguna ({users.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('ai')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'ai'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Pengaturan Integrasi AI (OpenAI & Gemini)</span>
          </button>
        </div>

        {/* TAB 1: USER MONITORING & MANAGEMENT */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            {/* Search and Filters Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/80">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari user berdasarkan nama, email, atau ID..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-3.5 py-2 text-xs font-medium text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>
                  Menampilkan <strong className="text-white">{filteredUsers.length}</strong> dari{' '}
                  <strong className="text-white">{users.length}</strong> akun
                </span>
              </div>
            </div>

            {/* Users Table / List */}
            {loading ? (
              <div className="py-16 text-center text-slate-400 bg-slate-800/50 rounded-2xl border border-slate-800">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-400" />
                <p className="text-xs">Memuat data pengguna...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="py-16 text-center text-slate-400 bg-slate-800/50 rounded-2xl border border-slate-800">
                <Users className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <h3 className="text-sm font-bold text-slate-300">Tidak ada pengguna ditemukan</h3>
                <p className="text-xs text-slate-500 mt-1">
                  {searchQuery ? 'Coba kata kunci pencarian lain' : 'Belum ada user yang mendaftar'}
                </p>
              </div>
            ) : (
              <div className="bg-slate-800/90 rounded-2xl border border-slate-700/90 overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-700">
                      <tr>
                        <th className="py-3 px-4">Pengguna</th>
                        <th className="py-3 px-4">Akun & Kontak</th>
                        <th className="py-3 px-4">Terdaftar</th>
                        <th className="py-3 px-4">Status & Terakhir Aktif</th>
                        <th className="py-3 px-4">Kas & Saldo</th>
                        <th className="py-3 px-4">Transaksi</th>
                        <th className="py-3 px-4 text-center">Aksi Admin</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/60">
                      {filteredUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-750/50 transition-colors">
                          {/* Nama & Avatar */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-extrabold flex items-center justify-center text-sm shadow-sm shrink-0">
                                {u.avatar || u.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-bold text-white text-xs">{u.name}</div>
                                <div className="text-[10px] font-mono text-slate-400 truncate max-w-[120px]">
                                  {u.id}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Email & Password Info */}
                          <td className="py-3 px-4">
                            <div className="font-semibold text-slate-200">{u.email}</div>
                            <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-slate-400">
                              <Lock className="w-3 h-3 text-slate-500" />
                              <span className="font-mono bg-slate-900/60 px-1.5 py-0.5 rounded text-indigo-300">
                                {u.password}
                              </span>
                            </div>
                          </td>

                          {/* Tanggal Terdaftar */}
                          <td className="py-3 px-4 text-slate-300 whitespace-nowrap">
                            <div className="flex items-center gap-1 text-[11px]">
                              <Calendar className="w-3 h-3 text-slate-500" />
                              <span>{formatDateIndo(u.createdAt)}</span>
                            </div>
                          </td>

                          {/* Status Aktif Terakhir */}
                          <td className="py-3 px-4 whitespace-nowrap">
                            <div className="space-y-1">
                              <div>{getActiveStatusBadge(u.lastActiveAt)}</div>
                              <div className="text-[10px] text-slate-400 flex items-center gap-1">
                                <Clock className="w-3 h-3 text-slate-500" />
                                <span>{formatDateIndo(u.lastActiveAt)}</span>
                              </div>
                            </div>
                          </td>

                          {/* Dompet & Saldo */}
                          <td className="py-3 px-4 whitespace-nowrap">
                            <div className="font-bold text-white font-mono">
                              {formatRupiah(u.totalBalance || 0)}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {u.walletsCount} dompet kas
                            </div>
                          </td>

                          {/* Transaksi */}
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1 bg-slate-900 px-2 py-1 rounded-lg text-slate-300 font-mono text-[11px]">
                              <Receipt className="w-3 h-3 text-indigo-400" />
                              {u.transactionsCount} data
                            </span>
                          </td>

                          {/* Aksi Admin: Reset Password, Detail, Hapus */}
                          <td className="py-3 px-4 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1.5">
                              {/* Reset Password Button */}
                              <button
                                onClick={() => {
                                  setSelectedUserForReset(u);
                                  setNewPassword('');
                                  setResetSuccessMsg('');
                                  setResetErrorMsg('');
                                }}
                                className="px-2.5 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/40 text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1"
                                title="Reset Kata Sandi User Ini"
                              >
                                <Key className="w-3.5 h-3.5" />
                                <span>Reset Sandi</span>
                              </button>

                              {/* Inspect Detail Button */}
                              <button
                                onClick={() => setInspectUser(u)}
                                className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white transition-all cursor-pointer"
                                title="Lihat Rincian Dompet & Transaksi"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>

                              {/* Delete User Button */}
                              <button
                                onClick={() => handleDeleteUser(u.id, u.name)}
                                className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-800/40 transition-all cursor-pointer"
                                title="Hapus Akun Pengguna Ini"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: AI INTEGRATION SETTINGS */}
        {activeTab === 'ai' && (
          <div className="max-w-2xl bg-slate-800/90 rounded-3xl border border-slate-700/90 p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="border-b border-slate-700 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-white">
                    Konfigurasi Integrasi AI Scan Struk
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Pengaturan API Key ini berlaku secara global untuk seluruh pengguna website.
                  </p>
                </div>
              </div>
            </div>

            {aiFeedback && (
              <div
                className={`p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2.5 ${
                  aiFeedback.type === 'success'
                    ? 'bg-emerald-950/60 border border-emerald-700 text-emerald-300'
                    : 'bg-rose-950/60 border border-rose-700 text-rose-300'
                }`}
              >
                {aiFeedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                )}
                <span>{aiFeedback.text}</span>
              </div>
            )}

            <form onSubmit={handleSaveAiSettings} className="space-y-4">
              {/* OpenAI API Key Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-200">
                    OpenAI API Key (ChatGPT-4o Mini)
                  </label>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {openaiKeyInput ? 'Tersedia' : 'Belum Diisi'}
                  </span>
                </div>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type={showAiKey ? 'text' : 'password'}
                    value={openaiKeyInput}
                    onChange={(e) => setOpenaiKeyInput(e.target.value)}
                    placeholder="sk-proj-..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-10 py-2.5 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAiKey(!showAiKey)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-200 cursor-pointer"
                  >
                    {showAiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  Digunakan untuk mengekstrak struk belanja menggunakan model vision OpenAI GPT-4o Mini.
                </p>
              </div>

              {/* Google Gemini Vision Status */}
              <div>
                <label className="text-xs font-bold text-slate-200 block mb-1.5">
                  Google Gemini 2.5 Flash Vision
                </label>
                <div className="p-3 bg-slate-900 border border-slate-700 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                    <span className="font-semibold text-slate-300">
                      Model Gemini 2.5 Flash Terhubung
                    </span>
                  </div>
                  <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded-full font-bold">
                    Aktif (Free Quota)
                  </span>
                </div>
              </div>

              {/* AI Provider Preference Selector */}
              <div>
                <label className="text-xs font-bold text-slate-200 block mb-1.5">
                  Pilihan Engine AI Utama
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setAiProviderInput('auto')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      aiProviderInput === 'auto'
                        ? 'bg-indigo-600/30 border-indigo-500 text-white shadow-xs'
                        : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    Otomatis (Rekomendasi)
                  </button>

                  <button
                    type="button"
                    onClick={() => setAiProviderInput('gemini')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      aiProviderInput === 'gemini'
                        ? 'bg-indigo-600/30 border-indigo-500 text-white shadow-xs'
                        : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    Google Gemini
                  </button>

                  <button
                    type="button"
                    onClick={() => setAiProviderInput('chatgpt')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      aiProviderInput === 'chatgpt'
                        ? 'bg-indigo-600/30 border-indigo-500 text-white shadow-xs'
                        : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    OpenAI ChatGPT
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Mode Otomatis akan menggunakan Google Gemini terlebih dahulu, dan beralih ke OpenAI jika kuota habis.
                </p>
              </div>

              {/* Save Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={savingAi}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/30 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{savingAi ? 'Menyimpan...' : 'Simpan Konfigurasi AI Global'}</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </main>

      {/* MODAL 1: RESET PASSWORD USER */}
      {selectedUserForReset && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl text-white space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Reset Kata Sandi Pengguna</h3>
                  <p className="text-[11px] text-slate-400">{selectedUserForReset.name}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUserForReset(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-800/80 rounded-xl text-xs space-y-1">
              <div className="text-slate-400">Email: <span className="font-semibold text-white">{selectedUserForReset.email}</span></div>
              <div className="text-slate-400">Sandi Sekarang: <span className="font-mono text-indigo-300">{selectedUserForReset.password}</span></div>
            </div>

            {resetErrorMsg && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{resetErrorMsg}</span>
              </div>
            )}

            {resetSuccessMsg && (
              <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{resetSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleResetPasswordSubmit} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">
                  Kata Sandi Baru
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-200 cursor-pointer"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Quick Generator */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const rnd = 'uangku' + Math.floor(1000 + Math.random() * 9000);
                    setNewPassword(rnd);
                    setShowNewPassword(true);
                  }}
                  className="text-[10px] text-indigo-400 hover:underline cursor-pointer"
                >
                  &rarr; Acak Sandi Otomatis (Contoh: uangku1234)
                </button>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={resettingPassword}
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer disabled:opacity-50"
                >
                  {resettingPassword ? 'Menyimpan...' : 'Terapkan Sandi Baru'}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedUserForReset(null)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: DETAIL INSPECTION OF USER (WALLETS & TRANSACTIONS) */}
      {inspectUser && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl text-white space-y-4 max-h-[85vh] overflow-y-auto animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-extrabold flex items-center justify-center">
                  {inspectUser.avatar || inspectUser.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{inspectUser.name}</h3>
                  <p className="text-xs text-slate-400">{inspectUser.email}</p>
                </div>
              </div>
              <button
                onClick={() => setInspectUser(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Metadata */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-800 p-2.5 rounded-xl">
                <span className="text-slate-400 block text-[10px]">Tanggal Terdaftar</span>
                <span className="font-semibold text-slate-200">{formatDateIndo(inspectUser.createdAt)}</span>
              </div>
              <div className="bg-slate-800 p-2.5 rounded-xl">
                <span className="text-slate-400 block text-[10px]">Terakhir Aktif</span>
                <span className="font-semibold text-slate-200">{formatDateIndo(inspectUser.lastActiveAt)}</span>
              </div>
            </div>

            {/* Dompet User */}
            <div>
              <h4 className="text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5 text-indigo-400" />
                <span>Kas & Dompet ({inspectUser.wallets?.length || 0})</span>
              </h4>
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {inspectUser.wallets && inspectUser.wallets.length > 0 ? (
                  inspectUser.wallets.map((w: any) => (
                    <div
                      key={w.id}
                      className="p-2.5 bg-slate-800 rounded-xl flex items-center justify-between text-xs"
                    >
                      <span className="font-semibold text-slate-200">{w.name}</span>
                      <span className="font-mono font-bold text-emerald-400">
                        {formatRupiah(w.balance || 0)}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-[11px] text-slate-500 italic p-2 bg-slate-800/40 rounded-xl">
                    Belum ada kas atau dompet yang dibuat oleh user ini.
                  </p>
                )}
              </div>
            </div>

            {/* Transaksi Terakhir User */}
            <div>
              <h4 className="text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5">
                <Receipt className="w-3.5 h-3.5 text-indigo-400" />
                <span>Transaksi Tercatat ({inspectUser.transactions?.length || 0})</span>
              </h4>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {inspectUser.transactions && inspectUser.transactions.length > 0 ? (
                  inspectUser.transactions.slice(0, 10).map((t: any) => (
                    <div
                      key={t.id}
                      className="p-2.5 bg-slate-800 rounded-xl flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-semibold text-slate-200">{t.merchant}</div>
                        <div className="text-[10px] text-slate-400">
                          {formatDateIndo(t.date)} &bull; {t.category}
                        </div>
                      </div>
                      <span
                        className={`font-mono font-bold ${
                          t.type === 'pemasukan' ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {t.type === 'pemasukan' ? '+' : '-'} {formatRupiah(t.amount)}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-[11px] text-slate-500 italic p-2 bg-slate-800/40 rounded-xl">
                    Belum ada transaksi yang dicatat oleh user ini.
                  </p>
                )}
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setInspectUser(null)}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
