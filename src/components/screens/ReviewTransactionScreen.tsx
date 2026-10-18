import React, { useState } from 'react';
import {
  ArrowLeft,
  Calendar,
  Image as ImageIcon,
  ChevronDown,
  Wallet as WalletIcon,
  Sparkles,
  Check,
  Settings2,
  Plus,
  Edit2,
  Shield,
  PiggyBank,
  Briefcase,
  Landmark,
} from 'lucide-react';
import { Wallet, TransactionItem } from '../../types';
import { formatRupiah, parseRupiah } from '../../utils/finance';
import {
  CategoryItem,
  loadStoredCategories,
  saveStoredCategories,
  getCategoryIconComponent,
  getCategoryColorMeta,
} from '../../data/categories';
import { CategoryManagerModal } from '../modals/CategoryManagerModal';

interface ReviewTransactionScreenProps {
  initialData: {
    merchant: string;
    amount: number;
    date: string;
    category: string;
    items?: TransactionItem[];
    notes?: string;
    aiEngine?: string;
    imageDataUrl?: string;
  };
  wallets: Wallet[];
  defaultWalletId: string;
  onBack: () => void;
  onSave: (data: {
    merchant: string;
    amount: number;
    walletId: string;
    type: 'pengeluaran' | 'pemasukan';
    date: string;
    category: string;
    notes?: string;
    items?: TransactionItem[];
  }) => void;
}

export const ReviewTransactionScreen: React.FC<ReviewTransactionScreenProps> = ({
  initialData,
  wallets,
  defaultWalletId,
  onBack,
  onSave,
}) => {
  const [type, setType] = useState<'pengeluaran' | 'pemasukan'>('pengeluaran');
  const [walletId, setWalletId] = useState(defaultWalletId || wallets[0]?.id || '');
  const [merchant, setMerchant] = useState(initialData.merchant || 'Struk Belanja');
  const [amountStr, setAmountStr] = useState(initialData.amount ? initialData.amount.toString() : '');
  const [date, setDate] = useState(() => initialData.date ? initialData.date.slice(0, 16) : new Date().toISOString().slice(0, 16));
  const [category, setCategory] = useState(initialData.category || 'Belanja');
  const [notes, setNotes] = useState(initialData.notes || '');
  const [items, setItems] = useState<TransactionItem[]>(initialData.items || []);

  // Category state from stored categories
  const [categories, setCategories] = useState<CategoryItem[]>(() => loadStoredCategories());
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategoryTarget, setEditingCategoryTarget] = useState<CategoryItem | null>(null);

  const activeCategoryType = type === 'pemasukan' ? 'pemasukan' : 'pengeluaran';
  const displayedCategories = categories.filter(
    (c) => (c.type || 'pengeluaran') === activeCategoryType
  );

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    setAmountStr(raw);
  };

  const handleCategoriesUpdate = (updated: CategoryItem[]) => {
    setCategories(updated);
    saveStoredCategories(updated);
    const targetList = updated.filter((c) => (c.type || 'pengeluaran') === activeCategoryType);
    if (!targetList.some((c) => c.name === category) && targetList.length > 0) {
      setCategory(targetList[0].name);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseRupiah(amountStr);
    onSave({
      merchant,
      amount: numAmount || 0,
      walletId,
      type,
      date: new Date(date).toISOString(),
      category,
      notes,
      items,
    });
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
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="font-extrabold text-base text-slate-900 tracking-tight">Detail Hasil Scan Struk</h2>
          <div className="w-9"></div>
        </div>

        {/* AI Badge banner */}
        {initialData.aiEngine && (
          <div className="bg-indigo-50 border border-indigo-100 p-3 rounded-2xl flex items-center justify-between text-xs text-indigo-700 mb-5">
            <span className="flex items-center gap-1.5 font-medium">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              Dipindai via: <span className="font-bold">{initialData.aiEngine}</span>
            </span>
            <span className="text-[10px] bg-indigo-200/60 text-indigo-800 px-2 py-0.5 rounded-full font-bold">
              OCR Berhasil
            </span>
          </div>
        )}

        <div className="space-y-5">
          {/* Receipt Photo Card */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-14 bg-white rounded-lg border border-slate-200 flex items-center justify-center overflow-hidden shadow-2xs">
                <div className="w-full h-full bg-amber-50/50 p-1 font-mono text-[7px] text-slate-500 leading-tight overflow-hidden select-none">
                  <p className="font-bold text-[8px] text-slate-800 text-center uppercase">{merchant}</p>
                  <p className="mt-1">Items: {items.length}</p>
                  <p className="font-bold mt-1 text-slate-900">Total: {formatRupiah(parseRupiah(amountStr))}</p>
                </div>
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800 block">Struk Berhasil Terbaca</span>
                <span className="text-[11px] text-slate-400">Rincian otomatis siap disimpan</span>
              </div>
            </div>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200/60 truncate max-w-[140px]">
              {merchant}
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Merchant Name */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Nama Merchant / Toko</label>
              <input
                type="text"
                value={merchant}
                onChange={(e) => setMerchant(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            {/* Total Nominal */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Total Nominal</label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-sm font-bold text-slate-400">Rp</span>
                <input
                  type="text"
                  value={amountStr ? Number(amountStr).toLocaleString('id-ID') : ''}
                  onChange={handleAmountChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-3.5 py-2.5 text-sm font-bold font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>

            {/* Items Detected by AI */}
            {items.length > 0 && (
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-700">Rincian Item Struk</span>
                  <span className="text-[10px] text-slate-400">{items.length} item</span>
                </div>
                <div className="space-y-2">
                  {items.map((it, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs">
                      <span className="text-slate-700 font-medium">
                        {it.qty}x {it.name}
                      </span>
                      <span className="font-mono font-bold text-slate-800">
                        {formatRupiah(it.price * it.qty)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ================= TARGET WALLET (TAMPILAN TOMBOL KAS) ================= */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <WalletIcon className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Masuk ke Kas / Dompet</span>
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
                      onClick={() => setWalletId(w.id)}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between relative ${
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

            {/* ================= CATEGORY SELECTOR (DENGAN MANAJEMEN KATEGORI) ================= */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-slate-700">Kategori</label>
                  <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100">
                    {category}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {displayedCategories.map((c) => {
                  const Icon = getCategoryIconComponent(c.icon);
                  const isSelected = category === c.name;
                  const colorMeta = getCategoryColorMeta(c.color);

                  return (
                    <button
                      type="button"
                      key={c.id}
                      onClick={() => setCategory(c.name)}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border transition-all cursor-pointer text-center ${
                        isSelected
                          ? `${colorMeta.bgClass} ${colorMeta.borderClass} ${colorMeta.textClass} ring-2 ${colorMeta.ringClass}/30 shadow-xs scale-102`
                          : 'bg-white border-slate-200/90 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="mb-1">
                        <Icon className={`w-4 h-4 ${isSelected ? colorMeta.textClass : 'text-slate-500'}`} />
                      </div>
                      <span className="text-[11px] font-bold truncate w-full">{c.name}</span>
                    </button>
                  );
                })}

                {/* Edit Kategori tile */}
                <button
                  type="button"
                  onClick={() => {
                    setEditingCategoryTarget(null);
                    setIsCategoryModalOpen(true);
                  }}
                  className="flex flex-col items-center justify-center p-2.5 rounded-2xl border border-dashed border-slate-300 hover:border-indigo-400 bg-slate-50/50 hover:bg-indigo-50/30 text-slate-500 hover:text-indigo-600 transition-all cursor-pointer text-center group"
                >
                  <div className="mb-1">
                    <Edit2 className="w-4 h-4 text-slate-500 group-hover:text-indigo-600" />
                  </div>
                  <span className="text-[11px] font-bold truncate w-full">Edit Kategori</span>
                </button>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Catatan</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Catatan kecil struk..."
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white rounded-2xl text-xs font-bold shadow-md shadow-indigo-500/25 transition-all cursor-pointer mt-2"
            >
              Simpan Transaksi Struk
            </button>
          </form>
        </div>
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
        onSelectCategory={(catName) => setCategory(catName)}
      />
    </div>
  );
};
