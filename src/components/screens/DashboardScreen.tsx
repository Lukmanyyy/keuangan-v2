import React, { useState } from 'react';
import {
  Wallet,
  Eye,
  EyeOff,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Camera,
  Layers,
  FileText,
  ChevronRight,
  CreditCard,
  Shield,
  PiggyBank,
  Briefcase,
  Sparkles,
  ArrowRightLeft,
} from 'lucide-react';
import { Wallet as WalletType, Transaction, User, ScreenId } from '../../types';
import { formatRupiah, calculateTotalKas, calculateTransactionSummary } from '../../utils/finance';

interface DashboardScreenProps {
  user: User;
  wallets: WalletType[];
  transactions: Transaction[];
  onNavigate: (screen: ScreenId) => void;
  onOpenScanModal: () => void;
  onOpenAddModal: () => void;
  onOpenAiSettings: () => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  user,
  wallets,
  transactions,
  onNavigate,
  onOpenScanModal,
  onOpenAddModal,
  onOpenAiSettings,
}) => {
  const [showBalance, setShowBalance] = useState(true);

  const totalKas = calculateTotalKas(wallets);
  const { income, expense } = calculateTransactionSummary(transactions);

  const displayTotal = totalKas;
  const displayIncome = income;
  const displayExpense = expense;

  const getWalletIcon = (iconName: string) => {
    switch (iconName) {
      case 'shield':
        return Shield;
      case 'piggy':
        return PiggyBank;
      case 'briefcase':
        return Briefcase;
      default:
        return CreditCard;
    }
  };

  const getWalletColorClasses = (color: string) => {
    switch (color) {
      case 'emerald':
        return { bg: 'bg-emerald-50 text-emerald-600', border: 'border-emerald-100' };
      case 'purple':
        return { bg: 'bg-purple-50 text-purple-600', border: 'border-purple-100' };
      case 'sky':
        return { bg: 'bg-sky-50 text-sky-600', border: 'border-sky-100' };
      default:
        return { bg: 'bg-indigo-50 text-indigo-600', border: 'border-indigo-100' };
    }
  };

  return (
    <div className="w-full pb-28 md:pb-12 text-slate-800">
      {/* Main Responsive Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (Desktop: 5 cols): Total Kas Card & Quick Actions */}
        <div className="lg:col-span-5 space-y-4">
          {/* Total Kas Card */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-blue-800 p-6 text-white shadow-xl shadow-indigo-600/25">
            <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-white/10 blur-xl pointer-events-none"></div>
            <div className="absolute -left-10 -bottom-10 w-40 h-40 rounded-full bg-blue-400/10 blur-lg pointer-events-none"></div>

            <div className="relative z-10">
              <div className="flex items-center justify-between text-indigo-200 text-xs">
                <span className="font-medium tracking-wide uppercase text-[11px]">Total Kas & Saldo</span>
                <button
                  onClick={() => setShowBalance(!showBalance)}
                  className="p-1 hover:text-white transition-colors cursor-pointer"
                  aria-label="Toggle Saldo"
                >
                  {showBalance ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>

              <div className="mt-2">
                <h2 className="text-3xl font-extrabold font-mono tracking-tight text-white">
                  {showBalance ? formatRupiah(displayTotal) : 'Rp ••••••••'}
                </h2>
                <p className="text-xs text-indigo-200/80 mt-1">
                  Dari <span className="font-semibold text-white">{wallets.length}</span> dompet / kas yang aktif
                </p>
              </div>

              {/* Income & Expense sub-chips */}
              <div className="grid grid-cols-2 gap-3 mt-5 pt-4 border-t border-white/15">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/25 border border-emerald-400/40 flex items-center justify-center text-emerald-300">
                    <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <div>
                    <span className="text-[10px] text-indigo-200 block uppercase font-medium">Pemasukan</span>
                    <span className="text-xs sm:text-sm font-bold font-mono text-emerald-300">
                      {showBalance ? formatRupiah(displayIncome) : '••••••'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-rose-500/25 border border-rose-400/40 flex items-center justify-center text-rose-300">
                    <ArrowDownRight className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <div>
                    <span className="text-[10px] text-indigo-200 block uppercase font-medium">Pengeluaran</span>
                    <span className="text-xs sm:text-sm font-bold font-mono text-rose-300">
                      {showBalance ? formatRupiah(displayExpense) : '••••••'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 4 Quick Actions Grid */}
          <div className="grid grid-cols-4 gap-2.5">
            <button
              onClick={onOpenAddModal}
              className="flex flex-col items-center p-3 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-indigo-200 transition-all active:scale-95 cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-1.5 shadow-xs group-hover:scale-105 transition-transform">
                <Plus className="w-5 h-5 stroke-[2.5]" />
              </div>
              <span className="text-[11px] font-bold text-slate-700 text-center leading-tight">
                Tambah Transaksi
              </span>
            </button>

            <button
              onClick={onOpenScanModal}
              className="flex flex-col items-center p-3 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-indigo-200 transition-all active:scale-95 cursor-pointer relative group"
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-1.5 shadow-xs relative group-hover:scale-105 transition-transform">
                <Camera className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-indigo-600 animate-ping"></span>
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
              </div>
              <span className="text-[11px] font-bold text-slate-700 text-center leading-tight">
                Scan Struk
              </span>
            </button>

            <button
              onClick={() => onNavigate('wallets')}
              className="flex flex-col items-center p-3 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-indigo-200 transition-all active:scale-95 cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-1.5 shadow-xs group-hover:scale-105 transition-transform">
                <Layers className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-slate-700 text-center leading-tight">
                Kelola Kas
              </span>
            </button>

            <button
              onClick={() => onNavigate('reports')}
              className="flex flex-col items-center p-3 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-indigo-200 transition-all active:scale-95 cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-1.5 shadow-xs group-hover:scale-105 transition-transform">
                <FileText className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-slate-700 text-center leading-tight">
                Laporan
              </span>
            </button>
          </div>

          {/* Scanner Feature Highlight Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="shrink-0 w-11 h-11 aspect-square rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/25">
                <Camera className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Scan & Catat Struk Otomatis</h4>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Foto struk belanja, data total dan rincian langsung tercatat rapi!
                </p>
              </div>
            </div>
            <button
              onClick={onOpenScanModal}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 px-3 py-1.5 rounded-lg bg-white border border-indigo-200 shadow-2xs whitespace-nowrap cursor-pointer"
            >
              Coba Sekarang
            </button>
          </div>
        </div>

        {/* Right Column (Desktop: 7 cols): Kas Saya & Transaksi Terakhir */}
        <div className="lg:col-span-7 space-y-6">
          {/* Kas Saya Section */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Wallet className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-sm text-slate-900">Kas & Dompet Saya</h3>
              </div>
              <button
                onClick={() => onNavigate('wallets')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-0.5 cursor-pointer"
              >
                Lihat Semua ({wallets.length})
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Wallets List or Empty State */}
            {wallets.length === 0 ? (
              <div className="text-center py-6 px-4 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-2">
                  <Wallet className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-slate-800">Dompet & Kas Masih Kosong</p>
                <p className="text-[11px] text-slate-500 mt-1 max-w-xs mx-auto">
                  Akun Anda dimulai dari saldo Rp 0. Buat kas pertama Anda (misal: Kas Tunai, Bank BCA, e-Wallet) untuk mulai mencatat.
                </p>
                <button
                  onClick={() => onNavigate('wallets')}
                  className="mt-3.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-xl text-xs font-bold transition-all shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Buat Kas Pertama (Saldo Rp 0)</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {wallets.map((w) => {
                  const Icon = getWalletIcon(w.icon);
                  const colorStyle = getWalletColorClasses(w.color);
                  return (
                    <div
                      key={w.id}
                      onClick={() => onNavigate('wallets')}
                      className="p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between hover:border-indigo-300 hover:shadow-xs transition-all cursor-pointer bg-slate-50/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl ${colorStyle.bg} flex items-center justify-center`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-xs text-slate-900">{w.name}</h4>
                          <p className="text-[10px] text-slate-400 capitalize">{w.icon || 'Kas Aktif'}</p>
                        </div>
                      </div>
                      <span className="font-bold text-xs font-mono text-slate-900">
                        {showBalance ? formatRupiah(w.balance) : '••••••'}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Transaksi Hari Ini Section */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <ArrowRightLeft className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-sm text-slate-900">Transaksi Hari Ini</h3>
              </div>
              <button
                onClick={() => onNavigate('transactions')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-0.5 cursor-pointer"
              >
                Semua Riwayat
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {(() => {
                const todayIso = new Date().toISOString().slice(0, 10);
                const todayTxs = transactions.filter((t) => t.date && t.date.slice(0, 10) === todayIso);

                if (todayTxs.length === 0) {
                  return (
                    <div className="text-center py-8 text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200/80">
                      <p className="text-xs font-medium text-slate-600">Belum ada transaksi dicatat hari ini.</p>
                      <button
                        onClick={onOpenAddModal}
                        className="mt-2 text-xs font-bold text-indigo-600 hover:underline inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Catat transaksi hari ini</span>
                      </button>
                    </div>
                  );
                }

                return todayTxs.slice(0, 6).map((t) => (
                  <div
                    key={t.id}
                    onClick={() => onNavigate('transactions')}
                    className="p-3.5 rounded-2xl border border-slate-100 hover:border-slate-200 flex items-center justify-between hover:bg-slate-50 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-3 truncate max-w-[65%]">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-extrabold shrink-0 ${
                          t.type === 'pemasukan'
                            ? 'bg-emerald-50 text-emerald-600'
                            : t.type === 'transfer'
                            ? 'bg-blue-50 text-blue-600'
                            : 'bg-rose-50 text-rose-600'
                        }`}
                      >
                        {t.type === 'pemasukan' ? '+' : t.type === 'transfer' ? '⇄' : '-'}
                      </div>
                      <div className="truncate">
                        <p className="font-bold text-xs text-slate-900 truncate">{t.merchant}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-slate-400 truncate">{t.category}</span>
                          {t.items && t.items.length > 0 && (
                            <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.2 rounded font-mono">
                              {t.items.length} item
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p
                        className={`font-bold text-xs sm:text-sm font-mono ${
                          t.type === 'pemasukan'
                            ? 'text-emerald-600'
                            : t.type === 'transfer'
                            ? 'text-blue-600'
                            : 'text-rose-600'
                        }`}
                      >
                        {t.type === 'pemasukan' ? '+' : t.type === 'transfer' ? '⇄' : '-'} {formatRupiah(t.amount)}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {new Date(t.date).toLocaleTimeString('id-ID', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
