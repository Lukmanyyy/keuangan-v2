import React, { useState } from 'react';
import {
  ArrowLeft,
  CreditCard,
  Shield,
  PiggyBank,
  Briefcase,
  Home,
  ShoppingBag,
  Car,
  Landmark,
  Check,
  Loader2,
} from 'lucide-react';
import { parseRupiah, formatRupiah } from '../../utils/finance';

interface AddWalletScreenProps {
  onBack: () => void;
  onSave: (wallet: { name: string; balance: number; color: string; icon: string }) => void;
}

export const AddWalletScreen: React.FC<AddWalletScreenProps> = ({ onBack, onSave }) => {
  const [name, setName] = useState('');
  const [balanceStr, setBalanceStr] = useState('');
  const [selectedColor, setSelectedColor] = useState('indigo');
  const [selectedIcon, setSelectedIcon] = useState('wallet');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const colors = [
    { id: 'indigo', bg: 'bg-indigo-600', ring: 'ring-indigo-600' },
    { id: 'emerald', bg: 'bg-emerald-600', ring: 'ring-emerald-600' },
    { id: 'purple', bg: 'bg-purple-600', ring: 'ring-purple-600' },
    { id: 'sky', bg: 'bg-sky-600', ring: 'ring-sky-600' },
    { id: 'rose', bg: 'bg-rose-600', ring: 'ring-rose-600' },
    { id: 'amber', bg: 'bg-amber-500', ring: 'ring-amber-500' },
  ];

  const icons = [
    { id: 'wallet', icon: CreditCard, label: 'Dompet' },
    { id: 'shield', icon: Shield, label: 'Darurat' },
    { id: 'piggy', icon: PiggyBank, label: 'Tabungan' },
    { id: 'briefcase', icon: Briefcase, label: 'Bisnis' },
    { id: 'home', icon: Home, label: 'Rumah' },
    { id: 'shopping', icon: ShoppingBag, label: 'Belanja' },
    { id: 'car', icon: Car, label: 'Kendaraan' },
    { id: 'bank', icon: Landmark, label: 'Investasi' },
  ];

  const handleBalanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    setBalanceStr(raw);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !name.trim()) return;

    try {
      setIsSubmitting(true);
      await Promise.resolve(
        onSave({
          name,
          balance: parseRupiah(balanceStr),
          color: selectedColor,
          icon: selectedIcon,
        })
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const SelectedIconComp = icons.find((i) => i.id === selectedIcon)?.icon || CreditCard;

  const getPreviewBg = (col: string) => {
    switch (col) {
      case 'emerald':
        return 'bg-emerald-600 shadow-emerald-500/30';
      case 'purple':
        return 'bg-purple-600 shadow-purple-500/30';
      case 'sky':
        return 'bg-sky-600 shadow-sky-500/30';
      case 'rose':
        return 'bg-rose-600 shadow-rose-500/30';
      case 'amber':
        return 'bg-amber-500 shadow-amber-500/30';
      default:
        return 'bg-indigo-600 shadow-indigo-500/30';
    }
  };

  return (
    <div className="w-full max-w-md mx-auto py-2 sm:py-6 pb-28 md:pb-12 text-slate-800">
      <div className="bg-white sm:rounded-3xl sm:border sm:border-slate-200/80 sm:shadow-xs p-5 sm:p-7">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="font-extrabold text-base text-slate-900 tracking-tight">
            Tambah Kas / Rekening
          </h2>
          <div className="w-9"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Top Icon Circle Preview */}
          <div className="flex justify-center py-2">
            <div
              className={`w-18 h-18 rounded-3xl ${getPreviewBg(
                selectedColor
              )} text-white flex items-center justify-center shadow-lg transition-transform hover:scale-105`}
            >
              <SelectedIconComp className="w-9 h-9 stroke-[2.2]" />
            </div>
          </div>

          <div className="space-y-4">
            {/* Nama Kas */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Nama Kas / Rekening</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Tabungan Liburan, Rekening Bisnis"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            {/* Saldo Awal */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Saldo Awal</label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-400">Rp</span>
                <input
                  type="text"
                  value={balanceStr ? Number(balanceStr).toLocaleString('id-ID') : ''}
                  onChange={handleBalanceChange}
                  placeholder="0"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-3.5 py-2.5 text-xs font-bold font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Warna Kas */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-2">Pilih Warna</label>
              <div className="flex items-center gap-3">
                {colors.map((c) => (
                  <button
                    type="button"
                    key={c.id}
                    onClick={() => setSelectedColor(c.id)}
                    className={`w-8 h-8 rounded-full ${c.bg} flex items-center justify-center text-white transition-all cursor-pointer ${
                      selectedColor === c.id ? 'ring-4 ring-slate-200 scale-110' : 'opacity-80 hover:opacity-100'
                    }`}
                  >
                    {selectedColor === c.id && <Check className="w-4 h-4 stroke-[3]" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Ikon Kas */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-2">Pilih Ikon</label>
              <div className="grid grid-cols-4 gap-2">
                {icons.map((ic) => {
                  const Icon = ic.icon;
                  const isSel = selectedIcon === ic.id;
                  return (
                    <button
                      type="button"
                      key={ic.id}
                      onClick={() => setSelectedIcon(ic.id)}
                      className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                        isSel
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-600 ring-2 ring-indigo-500/20 shadow-xs'
                          : 'border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-[10px] font-bold leading-none">{ic.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !name.trim()}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl text-xs font-bold transition-all shadow-md shadow-indigo-500/25 cursor-pointer flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Memproses Kas Baru...</span>
              </>
            ) : (
              <span>Simpan Kas Baru</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
