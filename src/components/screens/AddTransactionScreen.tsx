import React, { useState } from 'react';
import {
  ArrowLeft,
  Calendar,
  Wallet as WalletIcon,
  CreditCard,
  Shield,
  PiggyBank,
  Briefcase,
  Plus,
  Settings2,
  Check,
  Edit2,
  ArrowRight,
  Landmark,
  Loader2,
} from 'lucide-react';
import { Wallet, TransactionType } from '../../types';
import { formatRupiah } from '../../utils/finance';
import {
  CategoryItem,
  loadStoredCategories,
  saveStoredCategories,
  getCategoryIconComponent,
  getCategoryColorMeta,
} from '../../data/categories';
import { CategoryManagerModal } from '../modals/CategoryManagerModal';

interface AddTransactionScreenProps {
  wallets: Wallet[];
  onBack: () => void;
  onSave: (data: {
    type: TransactionType;
    walletId: string;
    toWalletId?: string;
    merchant: string;
    amount: number;
    date: string;
    category: string;
    notes?: string;
    reminder?: boolean;
  }) => void;
  onNavigateToAddWallet?: () => void;
}

export const AddTransactionScreen: React.FC<AddTransactionScreenProps> = ({
  wallets,
  onBack,
  onSave,
  onNavigateToAddWallet,
}) => {
  const [type, setType] = useState<TransactionType>('pengeluaran');
  const [walletId, setWalletId] = useState(wallets[0]?.id || 'w1');
  const [toWalletId, setToWalletId] = useState(
    wallets.find((w) => w.id !== (wallets[0]?.id || 'w1'))?.id || wallets[1]?.id || ''
  );

  // Category state with localStorage persistence
  const [categories, setCategories] = useState<CategoryItem[]>(() => loadStoredCategories());

  // Categories matching active transaction type
  const activeCategoryType = type === 'pemasukan' ? 'pemasukan' : 'pengeluaran';
  const displayedCategories = categories.filter(
    (c) => (c.type || 'pengeluaran') === activeCategoryType
  );

  const [selectedCategory, setSelectedCategory] = useState<string>(() => {
    const initialList = loadStoredCategories('pengeluaran');
    return initialList[0]?.name || 'Makan & Minum';
  });

  const handleTypeSelect = (newType: TransactionType) => {
    setType(newType);
    if (newType !== 'transfer') {
      const targetType = newType === 'pemasukan' ? 'pemasukan' : 'pengeluaran';
      const targetList = categories.filter((c) => (c.type || 'pengeluaran') === targetType);
      if (!targetList.some((c) => c.name === selectedCategory) && targetList.length > 0) {
        setSelectedCategory(targetList[0].name);
      }
    }
  };

  // Category manager modal
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategoryTarget, setEditingCategoryTarget] = useState<CategoryItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [amountRaw, setAmountRaw] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');
  const [merchant, setMerchant] = useState('');

  const handleAmountInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/[^0-9]/g, '');
    setAmountRaw(digits);
  };

  const parsedAmount = Number(amountRaw) || 0;

  const handleCategoriesUpdate = (updated: CategoryItem[]) => {
    setCategories(updated);
    saveStoredCategories(updated);
    const targetList = updated.filter((c) => (c.type || 'pengeluaran') === activeCategoryType);
    if (!targetList.some((c) => c.name === selectedCategory) && targetList.length > 0) {
      setSelectedCategory(targetList[0].name);
    }
  };

  const handleOpenAddCategory = () => {
    setEditingCategoryTarget(null);
    setIsCategoryModalOpen(true);
  };

  const handleOpenEditCategory = (cat: CategoryItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingCategoryTarget(cat);
    setIsCategoryModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || parsedAmount <= 0) return;

    const finalMerchant =
      merchant.trim() ||
      (type === 'transfer'
        ? `Transfer ke ${wallets.find((w) => w.id === toWalletId)?.name || 'Tabungan'}`
        : selectedCategory);

    try {
      setIsSubmitting(true);
      await Promise.resolve(
        onSave({
          type,
          walletId,
          toWalletId: type === 'transfer' ? toWalletId : undefined,
          merchant: finalMerchant,
          amount: parsedAmount,
          date: new Date(date).toISOString(),
          category: type === 'transfer' ? 'Transfer' : selectedCategory,
          notes: notes.trim() || undefined,
        })
      );
    } catch {
      setIsSubmitting(false);
    }
  };

  const getWalletIconComp = (iconName?: string) => {
    switch (iconName) {
      case 'shield':
        return Shield;
      case 'piggy':
        return PiggyBank;
      case 'briefcase':
        return Briefcase;
      case 'bank':
        return Landmark;
      default:
        return WalletIcon;
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto py-2 sm:py-6 pb-28 md:pb-12 text-slate-800">
      <div className="bg-white sm:rounded-3xl sm:border sm:border-slate-200/80 sm:shadow-xs p-5 sm:p-7">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-700 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
          </button>
          <h2 className="font-extrabold text-base text-slate-900 tracking-tight">
            Tambah Transaksi Baru
          </h2>
          <div className="w-9"></div>
        </div>

        {wallets.length === 0 ? (
          <div className="py-8 px-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
              <WalletIcon className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Belum Ada Kas atau Dompet</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Untuk mencatat transaksi, Anda perlu membuat kas atau dompet terlebih dahulu (misal: Kas Tunai, Rekening Bank, atau e-Wallet) dengan saldo awal Rp 0.
            </p>
            <button
              type="button"
              onClick={onNavigateToAddWallet || onBack}
              className="mt-4 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
            >
              <span>+ Buat Kas Pertama Sekarang</span>
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Segmented Type Control: [Pengeluaran | Pemasukan | Transfer] */}
            <div className="grid grid-cols-3 gap-1.5 bg-slate-100 p-1 rounded-2xl">
              <button
                type="button"
                onClick={() => handleTypeSelect('pengeluaran')}
                className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer text-center ${
                  type === 'pengeluaran'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Pengeluaran
              </button>
              <button
                type="button"
                onClick={() => handleTypeSelect('pemasukan')}
                className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer text-center ${
                  type === 'pemasukan'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Pemasukan
              </button>
              <button
                type="button"
                onClick={() => handleTypeSelect('transfer')}
                className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer text-center ${
                  type === 'transfer'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Transfer
              </button>
            </div>

            {/* Nominal Input: Rp 0 */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Nominal Transaksi
              </label>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-400">Rp</span>
                <input
                  type="text"
                  value={amountRaw ? Number(amountRaw).toLocaleString('id-ID') : ''}
                  onChange={handleAmountInputChange}
                  placeholder="0"
                  className="w-full text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 bg-transparent border-none p-0 focus:outline-none font-mono"
                  autoFocus
                  required
                />
              </div>
            </div>

            {/* ================= BAGIAN KAS / DOMPET (TAMPILAN TOMBOL RAPI) ================= */}
            <div className="space-y-3">
              {type === 'transfer' ? (
                /* Mode Transfer: Kas Asal & Kas Tujuan */
                <div className="space-y-4">
                  {/* Kas Asal (Pengirim) */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <WalletIcon className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Kas Asal (Pengirim)</span>
                      </label>
                      <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100">
                        {wallets.find((w) => w.id === walletId)?.name || 'Pilih Kas'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {wallets.map((w) => {
                        const isSelected = w.id === walletId;
                        const IconComponent = getWalletIconComp(w.icon);
                        return (
                          <button
                            key={w.id}
                            type="button"
                            onClick={() => {
                              setWalletId(w.id);
                              if (toWalletId === w.id) {
                                const nextWallet = wallets.find((other) => other.id !== w.id);
                                if (nextWallet) setToWalletId(nextWallet.id);
                              }
                            }}
                            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between relative group ${
                              isSelected
                                ? 'bg-indigo-50/90 border-indigo-500 ring-2 ring-indigo-500/25 shadow-xs'
                                : 'bg-white border-slate-200/90 hover:border-slate-300 hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div
                                className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                                  isSelected
                                    ? 'bg-indigo-600 text-white shadow-2xs'
                                    : 'bg-slate-100 text-slate-600'
                                }`}
                              >
                                <IconComponent className="w-4 h-4" />
                              </div>
                              {isSelected && (
                                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-2xs">
                                  <Check className="w-3 h-3 stroke-[3]" />
                                </span>
                              )}
                            </div>
                            <div>
                              <div
                                className={`text-xs font-extrabold truncate ${
                                  isSelected ? 'text-indigo-950' : 'text-slate-800'
                                }`}
                              >
                                {w.name}
                              </div>
                              <div
                                className={`text-[11px] font-mono font-medium ${
                                  isSelected ? 'text-indigo-700' : 'text-slate-500'
                                }`}
                              >
                                {formatRupiah(w.balance)}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Kas Tujuan (Penerima) */}
                  <div className="pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <ArrowRight className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Kas Tujuan (Penerima)</span>
                      </label>
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">
                        {wallets.find((w) => w.id === toWalletId)?.name || 'Pilih Tujuan'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {wallets
                        .filter((w) => w.id !== walletId)
                        .map((w) => {
                          const isSelected = w.id === toWalletId;
                          const IconComponent = getWalletIconComp(w.icon);
                          return (
                            <button
                              key={w.id}
                              type="button"
                              onClick={() => setToWalletId(w.id)}
                              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between relative group ${
                                isSelected
                                  ? 'bg-emerald-50/90 border-emerald-500 ring-2 ring-emerald-500/25 shadow-xs'
                                  : 'bg-white border-slate-200/90 hover:border-slate-300 hover:bg-slate-50'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div
                                  className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                                    isSelected
                                      ? 'bg-emerald-600 text-white shadow-2xs'
                                      : 'bg-slate-100 text-slate-600'
                                  }`}
                                >
                                  <IconComponent className="w-4 h-4" />
                                </div>
                                {isSelected && (
                                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-2xs">
                                    <Check className="w-3 h-3 stroke-[3]" />
                                  </span>
                                )}
                              </div>
                              <div>
                                <div
                                  className={`text-xs font-extrabold truncate ${
                                    isSelected ? 'text-emerald-950' : 'text-slate-800'
                                  }`}
                                >
                                  {w.name}
                                </div>
                                <div
                                  className={`text-[11px] font-mono font-medium ${
                                    isSelected ? 'text-emerald-700' : 'text-slate-500'
                                  }`}
                                >
                                  {formatRupiah(w.balance)}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                    </div>
                  </div>
                </div>
              ) : (
                /* Mode Pengeluaran / Pemasukan: Kas / Dompet Digunakan (Tombol Interaktif) */
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <WalletIcon className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Kas / Dompet Digunakan</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100">
                        {wallets.find((w) => w.id === walletId)?.name || 'Pilih Kas'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {wallets.map((w) => {
                      const isSelected = w.id === walletId;
                      const IconComponent = getWalletIconComp(w.icon);
                      return (
                        <button
                          key={w.id}
                          type="button"
                          onClick={() => setWalletId(w.id)}
                          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between relative group ${
                            isSelected
                              ? 'bg-indigo-50/90 border-indigo-500 ring-2 ring-indigo-500/25 shadow-xs'
                              : 'bg-white border-slate-200/90 hover:border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div
                              className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                                isSelected
                                  ? 'bg-indigo-600 text-white shadow-2xs'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              <IconComponent className="w-4 h-4" />
                            </div>
                            {isSelected && (
                              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-2xs">
                                <Check className="w-3 h-3 stroke-[3]" />
                              </span>
                            )}
                          </div>
                          <div>
                            <div
                              className={`text-xs font-extrabold truncate ${
                                isSelected ? 'text-indigo-950' : 'text-slate-800'
                              }`}
                            >
                              {w.name}
                            </div>
                            <div
                              className={`text-[11px] font-mono font-medium ${
                                isSelected ? 'text-indigo-700' : 'text-slate-500'
                              }`}
                            >
                              {formatRupiah(w.balance)}
                            </div>
                          </div>
                        </button>
                      );
                    })}

                    {/* Quick Add Wallet Button */}
                    {onNavigateToAddWallet && (
                      <button
                        type="button"
                        onClick={onNavigateToAddWallet}
                        className="p-3 rounded-2xl border border-dashed border-slate-300 hover:border-indigo-400 hover:bg-indigo-50/30 text-slate-500 hover:text-indigo-600 transition-all flex flex-col items-center justify-center text-center cursor-pointer min-h-[76px] group"
                      >
                        <Plus className="w-5 h-5 mb-1 text-slate-400 group-hover:text-indigo-600 transition-transform group-hover:scale-110" />
                        <span className="text-[11px] font-bold">+ Tambah Kas</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Date Picker */}
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                Tanggal Transaksi
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
              />
            </div>

            {/* Merchant / Store / Title */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Nama Toko / Keterangan Transaksi
              </label>
              <input
                type="text"
                value={merchant}
                onChange={(e) => setMerchant(e.target.value)}
                placeholder={
                  type === 'transfer'
                    ? 'Contoh: Pindah tabungan ke BCA'
                    : 'Contoh: Kopi Kenangan, Indomaret, Gaji Kantor'
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* ================= BAGIAN KATEGORI (SELEKSI & EDIT) ================= */}
            {type !== 'transfer' && (
              <div className="space-y-2.5">
                {/* Header row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-slate-700">Pilih Kategori</label>
                    <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100">
                      {selectedCategory}
                    </span>
                  </div>
                </div>

                {/* Grid of Categories */}
                <div className="grid grid-cols-3 gap-2">
                  {displayedCategories.map((cat) => {
                    const Icon = getCategoryIconComponent(cat.icon);
                    const isSelected = selectedCategory === cat.name;
                    const colorMeta = getCategoryColorMeta(cat.color);

                    return (
                      <div key={cat.id} className="relative group">
                        <button
                          type="button"
                          onClick={() => setSelectedCategory(cat.name)}
                          className={`w-full flex flex-col items-center justify-center p-3 rounded-2xl border transition-all cursor-pointer text-center relative ${
                            isSelected
                              ? `${colorMeta.bgClass} ${colorMeta.borderClass} ${colorMeta.textClass} ring-2 ${colorMeta.ringClass}/30 shadow-xs scale-102`
                              : 'bg-white border-slate-200/90 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div className="mb-1.5 flex items-center justify-center">
                            <Icon
                              className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                                isSelected ? colorMeta.textClass : 'text-slate-500'
                              }`}
                            />
                          </div>
                          <span className="text-[11px] font-bold leading-tight truncate w-full">
                            {cat.name}
                          </span>
                        </button>

                        {/* Quick edit button on hover / active */}
                        <button
                          type="button"
                          onClick={(e) => handleOpenEditCategory(cat, e)}
                          title="Edit kategori ini"
                          className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-300 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-2xs z-10 cursor-pointer"
                        >
                          <Edit2 className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    );
                  })}

                  {/* Tile "Edit Kategori" */}
                  <button
                    type="button"
                    onClick={() => {
                      setEditingCategoryTarget(null);
                      setIsCategoryModalOpen(true);
                    }}
                    className="flex flex-col items-center justify-center p-3 rounded-2xl border border-dashed border-slate-300 hover:border-indigo-400 bg-slate-50/50 hover:bg-indigo-50/30 text-slate-500 hover:text-indigo-600 transition-all cursor-pointer text-center group"
                  >
                    <div className="mb-1.5 w-6 h-6 rounded-full bg-white border border-slate-200 group-hover:border-indigo-300 flex items-center justify-center transition-transform group-hover:scale-110">
                      <Edit2 className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-600" />
                    </div>
                    <span className="text-[11px] font-bold leading-tight">
                      Edit Kategori
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* Notes */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Catatan Tambahan (Opsional)
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Tulis catatan kecil tentang transaksi ini..."
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || parsedAmount <= 0}
              className={`w-full py-3.5 rounded-2xl text-xs font-bold text-white transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 ${
                parsedAmount > 0 && !isSubmitting
                  ? 'bg-indigo-600 hover:bg-indigo-700 active:scale-98 shadow-indigo-500/25'
                  : 'bg-slate-300 cursor-not-allowed shadow-none'
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Memproses Transaksi...</span>
                </>
              ) : (
                <span>
                  Simpan Transaksi {parsedAmount > 0 ? `(${formatRupiah(parsedAmount)})` : ''}
                </span>
              )}
            </button>
          </form>
        )}
      </div>

      {/* Category Manager Modal */}
      <CategoryManagerModal
        isOpen={isCategoryModalOpen}
        onClose={() => {
          setIsCategoryModalOpen(false);
          setEditingCategoryTarget(null);
        }}
        categories={categories}
        initialType={activeCategoryType}
        initialEditingCategory={editingCategoryTarget}
        onSaveCategories={handleCategoriesUpdate}
        onSelectCategory={(catName) => setSelectedCategory(catName)}
      />
    </div>
  );
};
