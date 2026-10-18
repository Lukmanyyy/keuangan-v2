import React, { useState } from 'react';
import {
  Calendar,
  PieChart,
  Plus,
  ChevronDown,
  ChevronUp,
  Clock,
  ArrowDownRight,
  ArrowUpRight,
  Utensils,
} from 'lucide-react';
import { Transaction, ScreenId } from '../../types';
import { formatRupiah, calculateCategoryStats } from '../../utils/finance';
import { getCategoryIconComponent, getCategoryColorMeta } from '../../data/categories';

interface StatisticsScreenProps {
  transactions: Transaction[];
  onNavigate: (screen: ScreenId) => void;
}

export const StatisticsScreen: React.FC<StatisticsScreenProps> = ({
  transactions,
  onNavigate,
}) => {
  const [tab, setTab] = useState<'pengeluaran' | 'pemasukan' | 'perbandingan'>('pengeluaran');
  const [selectedPeriod, setSelectedPeriod] = useState<'bulan_ini' | 'bulan_lalu' | 'semua'>('bulan_ini');

  const now = new Date();
  const currentMonthName = now.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthName = lastMonthDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

  // Filter transactions based on selected period
  const periodTransactions = transactions.filter((t) => {
    if (!t.date) return true;
    const d = new Date(t.date);
    if (selectedPeriod === 'bulan_ini') {
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }
    if (selectedPeriod === 'bulan_lalu') {
      return d.getMonth() === lastMonthDate.getMonth() && d.getFullYear() === lastMonthDate.getFullYear();
    }
    return true;
  });

  const calculatedStats = calculateCategoryStats(
    periodTransactions,
    tab === 'pemasukan' ? 'pemasukan' : 'pengeluaran'
  );

  const realTotalIncome = periodTransactions
    .filter((t) => t.type === 'pemasukan')
    .reduce((sum, t) => sum + t.amount, 0);

  const realTotalExpense = periodTransactions
    .filter((t) => t.type === 'pengeluaran')
    .reduce((sum, t) => sum + t.amount, 0);

  const categoriesToShow = calculatedStats;
  const currentTotal = tab === 'pemasukan' ? realTotalIncome : realTotalExpense;

  // ================= CALCULATE THIS WEEK (SENIN - MINGGU) =================
  const getStartOfWeek = (d: Date) => {
    const date = new Date(d);
    const day = date.getDay(); // 0 is Sunday, 1 is Monday...
    const diff = (day === 0 ? -6 : 1) - day; // Monday as first day
    date.setDate(date.getDate() + diff);
    date.setHours(0, 0, 0, 0);
    return date;
  };

  const startOfWeek = getStartOfWeek(now);
  const dayShortNames = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
  const dayFullNames = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

  const daysThisWeek = dayShortNames.map((shortName, idx) => {
    const dayDate = new Date(startOfWeek);
    dayDate.setDate(startOfWeek.getDate() + idx);

    const year = dayDate.getFullYear();
    const month = String(dayDate.getMonth() + 1).padStart(2, '0');
    const dayNum = String(dayDate.getDate()).padStart(2, '0');
    const dateKey = `${year}-${month}-${dayNum}`;

    // Filter transactions on this specific day
    const dayTxs = transactions.filter((t) => {
      if (!t.date) return false;
      return t.date.slice(0, 10) === dateKey;
    });

    const expenseTotal = dayTxs
      .filter((t) => t.type === 'pengeluaran')
      .reduce((sum, t) => sum + t.amount, 0);

    const incomeTotal = dayTxs
      .filter((t) => t.type === 'pemasukan')
      .reduce((sum, t) => sum + t.amount, 0);

    const isToday =
      dayDate.getDate() === now.getDate() &&
      dayDate.getMonth() === now.getMonth() &&
      dayDate.getFullYear() === now.getFullYear();

    const formattedDate = dayDate.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
    });

    return {
      index: idx,
      shortName,
      fullName: dayFullNames[idx],
      dateKey,
      formattedDate,
      isToday,
      expenseTotal,
      incomeTotal,
      transactions: dayTxs,
    };
  });

  // Default expanded day: today's dateKey
  const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const [expandedDayKey, setExpandedDayKey] = useState<string | null>(todayKey);

  const toggleDayExpanded = (key: string) => {
    setExpandedDayKey((prev) => (prev === key ? null : key));
  };

  // Find max value across all days for chart height scaling
  const maxDayVal = Math.max(
    ...daysThisWeek.map((d) => Math.max(d.expenseTotal, d.incomeTotal)),
    50000
  );

  return (
    <div className="w-full pb-28 md:pb-12 text-slate-800">
      {/* Page Title & Month Picker */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Statistik Keuangan
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Analisis data tren pengeluaran, pemasukan, dan alokasi kategori Anda
          </p>
        </div>

        {/* Interactive Month/Period Selector */}
        <div className="self-start sm:self-auto flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200/90 rounded-xl text-xs font-bold text-slate-700 shadow-2xs">
            <Calendar className="w-4 h-4 text-indigo-600 shrink-0" />
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as any)}
              className="bg-transparent text-slate-800 font-bold focus:outline-none cursor-pointer pr-1 text-xs"
            >
              <option value="bulan_ini">{currentMonthName}</option>
              <option value="bulan_lalu">{lastMonthName}</option>
              <option value="semua">Semua Waktu</option>
            </select>
          </div>
        </div>
      </div>

      {/* Segmented Tabs: Pengeluaran | Pemasukan | Perbandingan */}
      <div className="max-w-md bg-slate-200/80 p-1 rounded-2xl mb-6 grid grid-cols-3 gap-1">
        <button
          type="button"
          onClick={() => setTab('pengeluaran')}
          className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            tab === 'pengeluaran'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Pengeluaran
        </button>
        <button
          type="button"
          onClick={() => setTab('pemasukan')}
          className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            tab === 'pemasukan'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Pemasukan
        </button>
        <button
          type="button"
          onClick={() => setTab('perbandingan')}
          className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            tab === 'perbandingan'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Perbandingan
        </button>
      </div>

      {/* Responsive Grid: 2 columns on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (5 cols): Monthly Summary Card & Aktivitas Minggu Ini */}
        <div className="lg:col-span-5 space-y-6">
          {/* Main Total Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">
              Total {tab === 'pemasukan' ? 'Pemasukan' : 'Pengeluaran'}{' '}
              {selectedPeriod === 'bulan_ini' ? 'Bulan Ini' : selectedPeriod === 'bulan_lalu' ? 'Bulan Lalu' : 'Keseluruhan'}
            </span>
            <h2 className="text-3xl font-extrabold font-mono text-slate-900 mt-2">
              {formatRupiah(currentTotal)}
            </h2>

            <div className="mt-4 flex items-center gap-2 text-xs">
              <span className="text-slate-500 font-medium">
                {periodTransactions.length} transaksi tercatat dalam periode ini
              </span>
            </div>

            {/* Income vs Expense Quick Ratio */}
            <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-2 gap-4">
              <div>
                <span className="text-[11px] text-slate-400 block font-medium">Total Pemasukan</span>
                <span className="text-sm font-bold font-mono text-emerald-600">
                  {formatRupiah(realTotalIncome)}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block font-medium">Total Pengeluaran</span>
                <span className="text-sm font-bold font-mono text-rose-600">
                  {formatRupiah(realTotalExpense)}
                </span>
              </div>
            </div>
          </div>

          {/* Aktivitas Minggu Ini (Sen, Sel, Rab, Kam, Jum, Sab, Min) */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">Aktivitas Minggu Ini</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Perbandingan batang pengeluaran & pemasukan setiap hari
                </p>
              </div>
              <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-100">
                7 Hari
              </span>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 mb-4 text-xs font-semibold">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0"></span>
                <span className="text-slate-600">Pengeluaran</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></span>
                <span className="text-slate-600">Pemasukan</span>
              </div>
            </div>

            {/* Bar Charts: Sen, Sel, Rab, Kam, Jum, Sab, Min */}
            <div className="flex items-end justify-between h-48 pt-4 px-1 gap-1 sm:gap-2">
              {daysThisWeek.map((day) => {
                const expHeight = Math.max((day.expenseTotal / maxDayVal) * 100, day.expenseTotal > 0 ? 12 : 3);
                const incHeight = Math.max((day.incomeTotal / maxDayVal) * 100, day.incomeTotal > 0 ? 12 : 3);
                const isSelected = expandedDayKey === day.dateKey;

                return (
                  <button
                    type="button"
                    key={day.index}
                    onClick={() => toggleDayExpanded(day.dateKey)}
                    className={`flex flex-col items-center gap-1 h-full justify-end flex-1 rounded-xl p-1 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-50/70 ring-2 ring-indigo-400/40'
                        : 'hover:bg-slate-50'
                    }`}
                    title={`${day.fullName}, ${day.formattedDate}: Keluar ${formatRupiah(day.expenseTotal)}, Masuk ${formatRupiah(day.incomeTotal)}`}
                  >
                    {/* Tooltip nominal on hover or select */}
                    <div className="flex items-end justify-center gap-1 h-32 w-full">
                      {/* Red bar for Pengeluaran */}
                      <div className="flex flex-col items-center justify-end h-full w-2.5 sm:w-3.5">
                        <div
                          style={{ height: `${expHeight}%` }}
                          className={`w-full rounded-t-md transition-all duration-300 ${
                            day.expenseTotal > 0
                              ? 'bg-rose-500 shadow-2xs'
                              : 'bg-slate-100'
                          }`}
                        ></div>
                      </div>

                      {/* Green bar for Pemasukan */}
                      <div className="flex flex-col items-center justify-end h-full w-2.5 sm:w-3.5">
                        <div
                          style={{ height: `${incHeight}%` }}
                          className={`w-full rounded-t-md transition-all duration-300 ${
                            day.incomeTotal > 0
                              ? 'bg-emerald-500 shadow-2xs'
                              : 'bg-slate-100'
                          }`}
                        ></div>
                      </div>
                    </div>

                    {/* Day label: Sen, Sel, Rab, Kam, Jum, Sab, Min */}
                    <span
                      className={`text-[11px] font-extrabold mt-1 ${
                        day.isToday
                          ? 'text-indigo-600 font-black'
                          : isSelected
                          ? 'text-slate-900'
                          : 'text-slate-500'
                      }`}
                    >
                      {day.shortName}
                    </span>
                    <span className="text-[9px] text-slate-400 leading-none">
                      {day.formattedDate.split(' ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ================= DAFTAR TRANSAKSI PER HARI (SISTEM KLIK / ACCORDION) ================= */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">Rincian Transaksi Per Hari</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Klik hari untuk melihat seluruh transaksi yang tercatat
                </p>
              </div>
              <span className="text-[10px] text-slate-500 font-bold bg-slate-100 px-2 py-1 rounded-lg">
                Minggu Ini
              </span>
            </div>

            <div className="space-y-2.5">
              {daysThisWeek.map((day) => {
                const isExpanded = expandedDayKey === day.dateKey;
                const txCount = day.transactions.length;

                return (
                  <div
                    key={day.dateKey}
                    className={`rounded-2xl border transition-all overflow-hidden ${
                      isExpanded
                        ? 'border-indigo-200 bg-indigo-50/20 shadow-2xs'
                        : 'border-slate-100 bg-white hover:border-slate-200'
                    }`}
                  >
                    {/* Day Header Clickable */}
                    <button
                      type="button"
                      onClick={() => toggleDayExpanded(day.dateKey)}
                      className="w-full p-3.5 flex items-center justify-between cursor-pointer text-left transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center font-extrabold text-xs shrink-0 ${
                            day.isToday
                              ? 'bg-indigo-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {day.shortName}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-slate-900">
                              {day.fullName}, {day.formattedDate}
                            </span>
                            {day.isToday && (
                              <span className="text-[9px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded font-bold">
                                Hari Ini
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400">
                            {txCount} transaksi tercatat
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          {day.expenseTotal > 0 && (
                            <span className="text-[11px] font-mono font-bold text-rose-600 block">
                              -{formatRupiah(day.expenseTotal)}
                            </span>
                          )}
                          {day.incomeTotal > 0 && (
                            <span className="text-[11px] font-mono font-bold text-emerald-600 block">
                              +{formatRupiah(day.incomeTotal)}
                            </span>
                          )}
                          {day.expenseTotal === 0 && day.incomeTotal === 0 && (
                            <span className="text-[11px] font-mono text-slate-400 block">Rp 0</span>
                          )}
                        </div>
                        <div className="text-slate-400">
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-indigo-600" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </div>
                      </div>
                    </button>

                    {/* Expanded Transactions List */}
                    {isExpanded && (
                      <div className="p-3.5 pt-0 border-t border-slate-100/80 space-y-2 mt-1">
                        {txCount === 0 ? (
                          <div className="py-4 text-center text-xs text-slate-400 bg-white rounded-xl border border-dashed border-slate-200">
                            Belum ada transaksi di hari {day.fullName} ini.
                          </div>
                        ) : (
                          day.transactions.map((t) => {
                            const Icon = getCategoryIconComponent(t.category);
                            const isIncome = t.type === 'pemasukan';
                            const isTransfer = t.type === 'transfer';

                            return (
                              <div
                                key={t.id}
                                className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-100 shadow-2xs hover:border-slate-200 transition-colors"
                              >
                                <div className="flex items-center gap-2.5 min-w-0 mr-2">
                                  <div
                                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                                      isIncome
                                        ? 'bg-emerald-50 text-emerald-600'
                                        : isTransfer
                                        ? 'bg-indigo-50 text-indigo-600'
                                        : 'bg-rose-50 text-rose-600'
                                    }`}
                                  >
                                    <Icon className="w-4 h-4" />
                                  </div>
                                  <div className="truncate">
                                    <span className="text-xs font-bold text-slate-800 block truncate">
                                      {t.merchant || t.category}
                                    </span>
                                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                                      <span>{t.category}</span>
                                      {t.date && (
                                        <>
                                          <span>•</span>
                                          <span className="flex items-center gap-0.5">
                                            <Clock className="w-2.5 h-2.5" />
                                            {new Date(t.date).toLocaleTimeString('id-ID', {
                                              hour: '2-digit',
                                              minute: '2-digit',
                                            })}
                                          </span>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <span
                                  className={`font-mono font-bold text-xs whitespace-nowrap shrink-0 text-right ${
                                    isIncome
                                      ? 'text-emerald-600'
                                      : isTransfer
                                      ? 'text-indigo-600'
                                      : 'text-rose-600'
                                  }`}
                                >
                                  {isIncome ? '+' : isTransfer ? '' : '-'}
                                  {formatRupiah(t.amount)}
                                </span>
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column (7 cols): Category Breakdown */}
        <div className="lg:col-span-7">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PieChart className="w-4 h-4 text-indigo-600" />
                <h3 className="font-extrabold text-sm text-slate-900">
                  Rincian Kategori {tab === 'pemasukan' ? 'Pemasukan' : 'Pengeluaran'}
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-medium">Berdasarkan Total Nominal</span>
            </div>

            {categoriesToShow.length === 0 ? (
              <div className="py-12 text-center">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                  <PieChart className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-800">Belum Ada Transaksi Kategori</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                  Catat transaksi baru untuk melihat persentase dan diagram kategori keuangan Anda.
                </p>
                <button
                  onClick={() => onNavigate('dashboard')}
                  className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Catat Transaksi Pertama</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4 pt-1">
                {categoriesToShow.map((cat, idx) => {
                  const Icon = cat.icon || Utensils;
                  return (
                    <div key={idx} className="p-3.5 rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl ${(cat as any).lightBg || 'bg-indigo-50 text-indigo-600'} flex items-center justify-center shrink-0`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="font-bold text-xs sm:text-sm text-slate-900">{cat.category}</h4>
                            <span className="text-[11px] font-mono text-slate-400">
                              {cat.percentage}% dari total
                            </span>
                          </div>
                        </div>

                        <span className="font-mono font-bold text-xs sm:text-sm text-slate-900">
                          {formatRupiah(cat.amount)}
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${Math.min(cat.percentage, 100)}%` }}
                          className={`h-full ${cat.color || 'bg-indigo-600'} transition-all`}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
