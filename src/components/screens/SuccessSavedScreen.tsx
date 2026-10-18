import React, { useEffect } from 'react';
import {
  Check,
  Camera,
  ReceiptText,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Transaction } from '../../types';
import { formatRupiah, formatIndonesianDate } from '../../utils/finance';

interface SuccessSavedScreenProps {
  transaction: Transaction | null;
  walletName?: string;
  onViewList: () => void;
  onScanAnother: () => void;
  onGoHome: () => void;
}

export const SuccessSavedScreen: React.FC<SuccessSavedScreenProps> = ({
  transaction,
  walletName = 'Kas Utama',
  onViewList,
  onScanAnother,
  onGoHome,
}) => {
  useEffect(() => {
    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.4 },
        colors: ['#4F46E5', '#10B981', '#F59E0B', '#3B82F6', '#EC4899'],
      });
    } catch {}
  }, []);

  const merchant = transaction?.merchant || 'Kopi Kenangan';
  const amount = transaction?.amount || 45000;
  const isExpense = transaction ? transaction.type === 'pengeluaran' : true;

  return (
    <div className="w-full max-w-lg mx-auto py-6 sm:py-10 pb-28 md:pb-12 text-slate-800">
      <div className="bg-white sm:rounded-3xl sm:border sm:border-slate-200/80 sm:shadow-xs p-6 sm:p-8 flex flex-col items-center text-center">
        {/* Radial Celebration Check Badge */}
        <div className="relative w-28 h-28 flex items-center justify-center mb-6">
          <div className="absolute inset-0 bg-indigo-500/10 rounded-full animate-ping"></div>
          <div className="absolute -inset-2 bg-gradient-to-tr from-indigo-200/40 to-blue-200/40 rounded-full blur-md"></div>

          <span className="absolute -top-1 -right-1 text-amber-400 text-lg">✨</span>
          <span className="absolute -bottom-1 -left-1 text-emerald-400 text-lg">✦</span>
          <span className="absolute top-2 -left-3 text-indigo-400 text-sm">★</span>

          <div className="relative z-10 w-20 h-20 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-xl shadow-indigo-600/30">
            <Check className="w-10 h-10 stroke-[3]" />
          </div>
        </div>

        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          Transaksi Berhasil Disimpan!
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xs leading-relaxed">
          Catatan pengeluaran struk belanja Anda telah berhasil dibukukan ke saldo kas.
        </p>

        {/* Transaction Summary Card */}
        <div className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl p-4.5 my-5 text-left space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200/60">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Toko / Merchant
              </span>
              <span className="text-sm font-bold text-slate-800">{merchant}</span>
            </div>
            <span className="text-xs font-mono font-extrabold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200/60">
              {formatRupiah(amount)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs pt-1">
            <div>
              <span className="text-[10px] text-slate-400 block font-medium">Kas / Dompet</span>
              <span className="font-semibold text-slate-700">{walletName}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-medium">Waktu Pencatatan</span>
              <span className="font-semibold text-slate-700">
                {formatIndonesianDate(transaction?.date || new Date().toISOString())}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full space-y-2.5">
          <button
            onClick={onViewList}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-indigo-500/25 transition-all cursor-pointer"
          >
            <ReceiptText className="w-4 h-4" />
            <span>Lihat Riwayat Transaksi</span>
          </button>

          <button
            onClick={onScanAnother}
            className="w-full py-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Camera className="w-4 h-4" />
            <span>Scan Struk Lainnya</span>
          </button>

          <button
            onClick={onGoHome}
            className="w-full py-2.5 text-slate-500 hover:text-slate-800 text-xs font-semibold transition-colors cursor-pointer"
          >
            Kembali ke Beranda
          </button>
        </div>
      </div>
    </div>
  );
};
