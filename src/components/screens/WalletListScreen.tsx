import React, { useState } from 'react';
import {
  Plus,
  Eye,
  EyeOff,
  Shield,
  PiggyBank,
  Briefcase,
  CreditCard,
  Trash2,
  AlertTriangle,
  Wallet as WalletIcon,
} from 'lucide-react';
import { Wallet, ScreenId } from '../../types';
import { formatRupiah, calculateTotalKas } from '../../utils/finance';

interface WalletListScreenProps {
  wallets: Wallet[];
  onAddWallet: () => void;
  onDeleteWallet: (id: string) => void;
  onNavigate: (screen: ScreenId) => void;
}

export const WalletListScreen: React.FC<WalletListScreenProps> = ({
  wallets,
  onAddWallet,
  onDeleteWallet,
  onNavigate,
}) => {
  const [showBalance, setShowBalance] = useState(true);
  const [walletToDelete, setWalletToDelete] = useState<Wallet | null>(null);

  const total = calculateTotalKas(wallets);

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
        return { bg: 'bg-emerald-50 text-emerald-600', ring: 'ring-emerald-200' };
      case 'purple':
        return { bg: 'bg-purple-50 text-purple-600', ring: 'ring-purple-200' };
      case 'sky':
        return { bg: 'bg-sky-50 text-sky-600', ring: 'ring-sky-200' };
      default:
        return { bg: 'bg-indigo-50 text-indigo-600', ring: 'ring-indigo-200' };
    }
  };

  return (
    <div className="w-full pb-28 md:pb-12 text-slate-800">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          Kas & Dompet Saya
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Kelola seluruh rekening bank, dompet digital, dan kas tunai Anda
        </p>
      </div>

      {/* Total Kas Card */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-3xl shadow-md mb-6 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-44 h-44 rounded-full bg-indigo-500/15 blur-xl pointer-events-none"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-indigo-200 text-xs uppercase tracking-wider font-semibold">
            <span>Total Seluruh Kas</span>
            <button
              onClick={() => setShowBalance(!showBalance)}
              className="p-1 hover:text-white transition-colors cursor-pointer"
            >
              {showBalance ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-mono text-white mt-1">
            {showBalance ? formatRupiah(total) : 'Rp ••••••••'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Terbagi dalam {wallets.length} kas & dompet terdaftar
          </p>
        </div>
      </div>

      {/* Wallets Grid or Empty State */}
      {wallets.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-12 text-center max-w-lg mx-auto shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
            <WalletIcon className="w-7 h-7" />
          </div>
          <h3 className="text-base font-extrabold text-slate-900">Belum Ada Kas atau Dompet</h3>
          <p className="text-xs text-slate-500 mt-1.5 max-w-xs mx-auto leading-relaxed">
            Saldo akun Anda adalah Rp 0. Tambahkan kas pertama Anda (misal: Kas Tunai, Bank BCA, e-Wallet) dengan saldo Rp 0 atau saldo awal Anda.
          </p>
          <button
            onClick={onAddWallet}
            className="mt-5 inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white text-xs font-bold shadow-md shadow-indigo-500/25 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Tambah Kas Pertama (Saldo Rp 0)</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {wallets.map((w) => {
            const Icon = getWalletIcon(w.icon);
            const { bg } = getWalletColorClasses(w.color);

            return (
              <div
                key={w.id}
                className="bg-white p-5 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-indigo-200 transition-all flex flex-col justify-between group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-2xl ${bg} flex items-center justify-center shrink-0 shadow-2xs`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">{w.name}</h3>
                      <span className="text-[11px] text-slate-400 capitalize">
                        {w.icon ? `${w.icon} account` : 'Kas Aktif'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setWalletToDelete(w)}
                    className="p-2 text-rose-500 hover:text-rose-700 bg-rose-50/80 hover:bg-rose-100 rounded-xl border border-rose-100/80 transition-all cursor-pointer shrink-0"
                    title="Hapus Kas"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-baseline justify-between">
                  <span className="text-[11px] font-medium text-slate-400">Saldo Tersedia:</span>
                  <span className="text-base sm:text-lg font-bold font-mono text-slate-900">
                    {showBalance ? formatRupiah(w.balance) : '••••••••'}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Add Wallet Card Slot */}
          <button
            onClick={onAddWallet}
            className="border-2 border-dashed border-slate-200 hover:border-indigo-300 rounded-2xl sm:rounded-3xl p-6 flex flex-col items-center justify-center gap-2 hover:bg-indigo-50/30 transition-all cursor-pointer min-h-[140px] group"
          >
            <div className="w-10 h-10 rounded-full bg-slate-100 group-hover:bg-indigo-100 text-slate-400 group-hover:text-indigo-600 flex items-center justify-center transition-colors">
              <Plus className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="text-xs font-bold text-slate-600 group-hover:text-indigo-600">
              Tambah Kas / Rekening Baru
            </span>
          </button>
        </div>
      )}

      {/* Confirmation Modal for Wallet Deletion */}
      {walletToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 text-center space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Hapus Kas / Dompet?</h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Apakah Anda yakin ingin menghapus kas <span className="font-bold text-slate-800">"{walletToDelete.name}"</span>? Akun kas ini akan dihapus dari daftar Anda.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setWalletToDelete(null)}
                className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteWallet(walletToDelete.id);
                  setWalletToDelete(null);
                }}
                className="flex-1 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-500/20 transition-all cursor-pointer"
              >
                Ya, Hapus Kas
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
