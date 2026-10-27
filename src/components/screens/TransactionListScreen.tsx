import React, { useState } from 'react';
import {
  Search,
  SlidersHorizontal,
  Utensils,
  ArrowRightLeft,
  Briefcase,
  ShoppingBag,
  Film,
  Plus,
  Trash2,
  Calendar,
  Wallet as WalletIcon,
  Filter,
  AlertTriangle,
  Tag,
  Clock,
} from 'lucide-react';
import { Transaction, Wallet, ScreenId } from '../../types';
import { formatRupiah, groupTransactionsByDate } from '../../utils/finance';
import {
  loadStoredCategories,
  getCategoryIconComponent,
  getCategoryColorMeta,
} from '../../data/categories';
import { TransactionListSkeleton } from '../skeletons/AppSkeletons';

interface TransactionListScreenProps {
  transactions: Transaction[];
  wallets: Wallet[];
  isLoading?: boolean;
  onOpenAddModal: () => void;
  onOpenScanModal?: () => void;
  onDeleteTransaction: (id: string) => void;
  onNavigate: (screen: ScreenId) => void;
}

export const TransactionListScreen: React.FC<TransactionListScreenProps> = ({
  transactions,
  wallets,
  isLoading,
  onOpenAddModal,
  onOpenScanModal,
  onDeleteTransaction,
  onNavigate,
}) => {
  if (isLoading) {
    return <TransactionListSkeleton />;
  }
  const [filterType, setFilterType] = useState<'semua' | 'pemasukan' | 'pengeluaran' | 'transfer'>('semua');
  const [periodFilter, setPeriodFilter] = useState<'semua' | 'hari_ini' | 'minggu_ini' | 'bulan_ini' | 'bulan_lalu'>('semua');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [activeWalletFilter, setActiveWalletFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [txToDelete, setTxToDelete] = useState<Transaction | null>(null);

  const storedCategories = loadStoredCategories();

  // Filter transactions
  const filtered = transactions.filter((t) => {
    if (filterType !== 'semua' && t.type !== filterType) return false;
    if (activeWalletFilter !== 'all' && t.walletId !== activeWalletFilter) return false;
    if (categoryFilter !== 'all' && t.category.toLowerCase() !== categoryFilter.toLowerCase()) return false;

    if (t.date) {
      const txDate = new Date(t.date);
      const now = new Date();

      if (periodFilter === 'hari_ini') {
        const todayStr = now.toISOString().slice(0, 10);
        if (t.date.slice(0, 10) !== todayStr) return false;
      } else if (periodFilter === 'minggu_ini') {
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        if (txDate < sevenDaysAgo) return false;
      } else if (periodFilter === 'bulan_ini') {
        if (txDate.getMonth() !== now.getMonth() || txDate.getFullYear() !== now.getFullYear()) return false;
      } else if (periodFilter === 'bulan_lalu') {
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        if (txDate.getMonth() !== lastMonth.getMonth() || txDate.getFullYear() !== lastMonth.getFullYear()) return false;
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchMerchant = t.merchant.toLowerCase().includes(q);
      const matchCat = t.category.toLowerCase().includes(q);
      const matchNotes = t.notes && t.notes.toLowerCase().includes(q);
      if (!matchMerchant && !matchCat && !matchNotes) return false;
    }
    return true;
  });

  const grouped = groupTransactionsByDate(filtered);

  const getCategoryIcon = (category: string, merchant: string, type: string) => {
    if (type === 'transfer') {
      return { icon: ArrowRightLeft, bg: 'bg-blue-50 text-blue-600' };
    }
    const matched = storedCategories.find(
      (c) => c.name.toLowerCase() === (category || '').toLowerCase()
    );
    if (matched) {
      const Icon = getCategoryIconComponent(matched.icon);
      const meta = getCategoryColorMeta(matched.color);
      return { icon: Icon, bg: `${meta.bgClass} ${meta.textClass}` };
    }

    const lower = (category + ' ' + merchant).toLowerCase();
    if (lower.includes('kopi') || lower.includes('makan') || lower.includes('restoran')) {
      return { icon: Utensils, bg: 'bg-orange-50 text-orange-600' };
    }
    if (lower.includes('gaji') || lower.includes('bonus') || lower.includes('income')) {
      return { icon: Briefcase, bg: 'bg-emerald-50 text-emerald-600' };
    }
    if (lower.includes('belanja') || lower.includes('groceries')) {
      return { icon: ShoppingBag, bg: 'bg-pink-50 text-pink-600' };
    }
    if (lower.includes('netflix') || lower.includes('hiburan') || lower.includes('bioskop')) {
      return { icon: Film, bg: 'bg-rose-50 text-rose-600' };
    }
    return { icon: Utensils, bg: 'bg-indigo-50 text-indigo-600' };
  };

  return (
    <div className="w-full pb-28 md:pb-12 text-slate-800">
      {/* Page Title & Add Button Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Riwayat Transaksi
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Total {filtered.length} transaksi ditampilkan
          </p>
        </div>

        <button
          onClick={onOpenAddModal}
          className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-all active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Tambah Transaksi Baru</span>
        </button>
      </div>

      {/* Filter and Search Card */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs mb-6 space-y-3">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari transaksi, merchant, atau catatan..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Dropdowns Row: Kas/Wallet, Periode Waktu, Kategori */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
          {/* Kas Filter Dropdown */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs">
            <WalletIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={activeWalletFilter}
              onChange={(e) => setActiveWalletFilter(e.target.value)}
              className="bg-transparent text-slate-800 font-bold focus:outline-none cursor-pointer w-full text-xs"
            >
              <option value="all">Semua Kas</option>
              {wallets.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>

          {/* Periode Filter Dropdown */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs">
            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={periodFilter}
              onChange={(e) => setPeriodFilter(e.target.value as any)}
              className="bg-transparent text-slate-800 font-bold focus:outline-none cursor-pointer w-full text-xs"
            >
              <option value="semua">Semua Waktu</option>
              <option value="hari_ini">Hari Ini</option>
              <option value="minggu_ini">7 Hari Terakhir</option>
              <option value="bulan_ini">Bulan Ini</option>
              <option value="bulan_lalu">Bulan Lalu</option>
            </select>
          </div>

          {/* Category Filter Dropdown */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs">
            <Tag className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-transparent text-slate-800 font-bold focus:outline-none cursor-pointer w-full text-xs"
            >
              <option value="all">Semua Kategori</option>
              {storedCategories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter Type Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setFilterType('semua')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              filterType === 'semua'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Semua ({transactions.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('pengeluaran')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              filterType === 'pengeluaran'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Pengeluaran
          </button>
          <button
            type="button"
            onClick={() => setFilterType('pemasukan')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              filterType === 'pemasukan'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Pemasukan
          </button>
          <button
            type="button"
            onClick={() => setFilterType('transfer')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              filterType === 'transfer'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Transfer
          </button>
        </div>
      </div>

      {/* Grouped Transaction List */}
      <div className="space-y-6">
        {Object.keys(grouped).length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/80 p-8 shadow-xs max-w-lg mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
              <Calendar className="w-7 h-7" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900">
              {transactions.length === 0 ? 'Belum Ada Transaksi' : 'Tidak Ada Transaksi yang Cocok'}
            </h3>
            <p className="text-xs text-slate-500 mt-1.5 max-w-sm mx-auto leading-relaxed">
              {transactions.length === 0
                ? 'Akun Anda dimulai dari saldo Rp 0. Catat pengeluaran pertama Anda atau pindai struk dengan AI!'
                : 'Coba ubah kata kunci atau sesuaikan pilihan filter di atas.'}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2.5 mt-5">
              <button
                type="button"
                onClick={onOpenAddModal}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
              >
                + Catat Transaksi Baru
              </button>
              {onOpenScanModal && (
                <button
                  type="button"
                  onClick={onOpenScanModal}
                  className="px-4 py-2.5 bg-white hover:bg-slate-50 active:scale-95 text-slate-700 border border-slate-200 text-xs font-bold rounded-xl shadow-2xs transition-all cursor-pointer"
                >
                  Scan Struk
                </button>
              )}
            </div>
          </div>
        ) : (
          Object.keys(grouped).map((groupTitle) => (
            <div key={groupTitle} className="space-y-2.5">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {groupTitle}
                </span>
                <span className="text-[11px] text-slate-400 font-medium">
                  {grouped[groupTitle].length} transaksi
                </span>
              </div>

              <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-xs divide-y divide-slate-100 overflow-hidden">
                {grouped[groupTitle].map((tx) => {
                  const { icon: Icon, bg } = getCategoryIcon(tx.category, tx.merchant, tx.type);
                  const isIncome = tx.type === 'pemasukan';
                  const isTransfer = tx.type === 'transfer';
                  const walletName = wallets.find((w) => w.id === tx.walletId)?.name || 'Kas Utama';

                  return (
                    <div
                      key={tx.id}
                      className="p-4 flex items-center justify-between hover:bg-slate-50/90 transition-colors group"
                    >
                      <div className="flex items-center gap-3.5 truncate max-w-[70%]">
                        <div className={`w-11 h-11 rounded-2xl ${bg} flex items-center justify-center shrink-0 shadow-2xs`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="truncate">
                          <h4 className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                            {tx.merchant}
                          </h4>
                          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-0.5">
                            <span className="text-[11px] text-slate-500 font-medium">{tx.category}</span>
                            {tx.receiptImage && <a href={tx.receiptImage} target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline text-xs">Lihat struk</a>}
                            <span className="text-slate-300">•</span>
                            <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded font-medium">
                              {walletName}
                            </span>
                            {tx.notes && (
                              <>
                                <span className="text-slate-300 hidden sm:inline">•</span>
                                <span className="text-[11px] text-slate-400 italic truncate hidden sm:inline max-w-xs">
                                  {tx.notes}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <p
                            className={`font-mono font-bold text-xs sm:text-sm ${
                              isIncome
                                ? 'text-emerald-600'
                                : isTransfer
                                ? 'text-blue-600'
                                : 'text-rose-600'
                            }`}
                          >
                            {isIncome ? '+' : isTransfer ? '⇄' : '-'} {formatRupiah(tx.amount)}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5 font-medium">
                            {new Date(tx.date).toLocaleTimeString('id-ID', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => setTxToDelete(tx)}
                          className="p-2 text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl transition-all cursor-pointer shrink-0"
                          title="Hapus Transaksi"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Confirmation Modal for Transaction Deletion */}
      {txToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 text-center space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Hapus Transaksi Ini?</h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Apakah Anda yakin ingin menghapus transaksi <span className="font-bold text-slate-800">"{txToDelete.merchant}"</span> sebesar <span className="font-bold text-slate-800">{formatRupiah(txToDelete.amount)}</span>?
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setTxToDelete(null)}
                className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteTransaction(txToDelete.id);
                  setTxToDelete(null);
                }}
                className="flex-1 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-500/20 transition-all cursor-pointer"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
