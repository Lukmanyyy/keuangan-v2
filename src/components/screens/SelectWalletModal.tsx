import React from 'react';
import { ArrowLeft, X, CreditCard, Shield, PiggyBank, Briefcase, ArrowRight, CheckCircle2, Circle, Wallet as WalletIcon, Plus } from 'lucide-react';
import { Wallet } from '../../types';
import { formatRupiah } from '../../utils/finance';

interface SelectWalletModalProps {
  isOpen: boolean;
  wallets: Wallet[];
  selectedWalletId: string;
  onSelectWallet: (id: string) => void;
  onClose: () => void;
  onBack?: () => void;
  onProceed?: () => void;
  onProceedToCamera?: () => void;
  onNavigateToAddWallet?: () => void;
}

export const SelectWalletModal: React.FC<SelectWalletModalProps> = ({
  isOpen,
  wallets,
  selectedWalletId,
  onSelectWallet,
  onBack,
  onClose,
  onProceed,
  onProceedToCamera,
  onNavigateToAddWallet,
}) => {
  if (!isOpen) return null;

  const handleProceed = onProceed || onProceedToCamera || (() => {});

  const getWalletIcon = (icon?: string) => {
    switch (icon) {
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

  const getWalletColorClasses = (color?: string) => {
    switch (color) {
      case 'emerald':
        return 'bg-emerald-50 text-emerald-600';
      case 'purple':
        return 'bg-purple-50 text-purple-600';
      case 'sky':
        return 'bg-sky-50 text-sky-600';
      case 'rose':
        return 'bg-rose-50 text-rose-600';
      case 'amber':
        return 'bg-amber-50 text-amber-600';
      default:
        return 'bg-indigo-50 text-indigo-600';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 flex items-center justify-between border-b border-slate-100">
          {onBack ? (
            <button
              onClick={onBack}
              className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          ) : (
            <div className="w-9"></div>
          )}
          <div className="text-center">
            <h3 className="font-extrabold text-sm text-slate-900">Pilih Kas / Dompet</h3>
            <p className="text-[10px] text-slate-400">Tentukan sumber dana untuk transaksi ini</p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wallets List or Empty Guard */}
        <div className="p-5 space-y-2.5 overflow-y-auto flex-1">
          {wallets.length === 0 ? (
            <div className="py-8 px-4 text-center">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
                <WalletIcon className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Belum Ada Kas atau Dompet</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                Anda perlu membuat kas atau dompet terlebih dahulu sebelum scan struk belanja.
              </p>
              {onNavigateToAddWallet && (
                <button
                  type="button"
                  onClick={onNavigateToAddWallet}
                  className="mt-4 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Buat Kas Pertama (Saldo Rp 0)</span>
                </button>
              )}
            </div>
          ) : (
            wallets.map((w) => {
              const Icon = getWalletIcon(w.icon);
              const isSelected = selectedWalletId === w.id;
              const colorClass = getWalletColorClasses(w.color);

              return (
                <div
                  key={w.id}
                  onClick={() => onSelectWallet(w.id)}
                  className={`p-4 rounded-2xl border flex items-center justify-between transition-all cursor-pointer ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/50 shadow-xs ring-2 ring-indigo-500/20'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-xl ${colorClass} flex items-center justify-center`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">{w.name}</h4>
                      <p className="text-[10px] text-slate-400">Saldo: {formatRupiah(w.balance)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-slate-800">
                      {formatRupiah(w.balance)}
                    </span>
                    {isSelected ? (
                      <CheckCircle2 className="w-5 h-5 text-indigo-600 fill-indigo-100" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-300" />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Bottom Button */}
        {wallets.length > 0 && (
          <div className="p-5 border-t border-slate-100 bg-slate-50/50">
            <button
              onClick={handleProceed}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-indigo-500/25 transition-all cursor-pointer"
            >
              <span>Buka Kamera & Pindai Struk</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
