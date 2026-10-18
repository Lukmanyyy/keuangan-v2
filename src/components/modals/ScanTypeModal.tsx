import React from 'react';
import { X, ArrowDownLeft, ArrowUpRight } from 'lucide-react';

interface ScanTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectType: (type: 'pengeluaran' | 'pemasukan') => void;
}

export const ScanTypeModal: React.FC<ScanTypeModalProps> = ({
  isOpen,
  onClose,
  onSelectType,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in">
      <div
        className="w-full max-w-md bg-white rounded-t-3xl p-6 shadow-2xl transition-transform animate-in slide-in-from-bottom duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Handle & Close */}
        <div className="flex items-center justify-between pb-3">
          <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto -mr-6"></div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Title */}
        <div className="text-left mb-6">
          <h3 className="text-lg font-extrabold text-slate-900">Scan Struk</h3>
          <p className="text-xs text-slate-500 mt-1">Pilih jenis transaksi dari struk Anda</p>
        </div>

        {/* Options (Mockup #3) */}
        <div className="space-y-3">
          <button
            onClick={() => onSelectType('pemasukan')}
            className="w-full p-4 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/30 flex items-center gap-4 transition-all text-left cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <ArrowDownLeft className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900 group-hover:text-emerald-700">
                Struk Pemasukan
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                Misalnya struk penjualan, refund, atau pemasukan lain
              </p>
            </div>
          </button>

          <button
            onClick={() => onSelectType('pengeluaran')}
            className="w-full p-4 rounded-2xl border border-slate-200 hover:border-rose-500 hover:bg-rose-50/30 flex items-center gap-4 transition-all text-left cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <ArrowUpRight className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900 group-hover:text-rose-700">
                Struk Pengeluaran
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                Misalnya struk belanja, makan, transportasi, dll
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
