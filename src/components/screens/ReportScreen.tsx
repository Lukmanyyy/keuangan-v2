import React, { useState } from 'react';
import {
  Calendar,
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight,
  Wallet as WalletIcon,
  Download,
  FileText,
  FileSpreadsheet,
  FileCode,
  Sparkles,
} from 'lucide-react';
import { Transaction, Wallet, ScreenId } from '../../types';
import { formatRupiah, calculateTransactionSummary } from '../../utils/finance';

interface ReportScreenProps {
  transactions: Transaction[];
  wallets: Wallet[];
  onTriggerDownload?: (format: 'pdf' | 'xlsx' | 'csv') => void;
  onDownloadReport?: (format: 'pdf' | 'xlsx' | 'csv') => void;
  onNavigate: (screen: ScreenId) => void;
}

export const ReportScreen: React.FC<ReportScreenProps> = ({
  transactions,
  wallets,
  onTriggerDownload,
  onDownloadReport,
  onNavigate,
}) => {
  const [tab, setTab] = useState<'ringkasan' | 'arus_kas' | 'kategori'>('ringkasan');
  const [selectedPeriod, setSelectedPeriod] = useState<'bulan_ini' | 'bulan_lalu' | 'tahun_ini' | 'semua'>('bulan_ini');

  const now = new Date();
  const currentMonthLabel = now.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthLabel = lastMonthDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

  const filteredTransactions = transactions.filter((t) => {
    if (!t.date) return true;
    const d = new Date(t.date);
    if (selectedPeriod === 'bulan_ini') {
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }
    if (selectedPeriod === 'bulan_lalu') {
      return d.getMonth() === lastMonthDate.getMonth() && d.getFullYear() === lastMonthDate.getFullYear();
    }
    if (selectedPeriod === 'tahun_ini') {
      return d.getFullYear() === now.getFullYear();
    }
    return true;
  });

  const { income, expense, net } = calculateTransactionSummary(filteredTransactions);

  const displayIncome = income;
  const displayExpense = expense;
  const displayNet = net;

  const periodText =
    selectedPeriod === 'bulan_ini'
      ? `Periode ${currentMonthLabel}`
      : selectedPeriod === 'bulan_lalu'
      ? `Periode ${lastMonthLabel}`
      : selectedPeriod === 'tahun_ini'
      ? `Periode Tahun ${now.getFullYear()}`
      : 'Semua Periode';

  const triggerDownload = onDownloadReport || onTriggerDownload || (() => {});

  const renderNetCashFlow = (netVal: number) => {
    const absVal = Math.abs(netVal);
    const formatted = formatRupiah(absVal);
    if (netVal > 0) {
      return (
        <span className="font-mono font-extrabold text-sm sm:text-base text-emerald-600 whitespace-nowrap shrink-0 text-right">
          +{formatted}
        </span>
      );
    } else if (netVal < 0) {
      return (
        <span className="font-mono font-extrabold text-sm sm:text-base text-rose-600 whitespace-nowrap shrink-0 text-right">
          -{formatted}
        </span>
      );
    } else {
      return (
        <span className="font-mono font-extrabold text-sm sm:text-base text-slate-700 whitespace-nowrap shrink-0 text-right">
          Rp 0
        </span>
      );
    }
  };

  return (
    <div className="w-full pb-28 md:pb-12 text-slate-800">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Laporan Keuangan
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Ekspor rekapitulasi transaksi ke PDF, Excel (XLSX), atau CSV
          </p>
        </div>

        {/* Date Range Selector */}
        <div className="self-start sm:self-auto bg-white px-3.5 py-2 rounded-xl border border-slate-200/90 shadow-2xs flex items-center gap-2 text-xs font-semibold text-slate-700">
          <Calendar className="w-4 h-4 text-indigo-600 shrink-0" />
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as any)}
            className="bg-transparent text-slate-800 font-bold focus:outline-none cursor-pointer pr-1 text-xs"
          >
            <option value="bulan_ini">Bulan Ini ({currentMonthLabel})</option>
            <option value="bulan_lalu">Bulan Lalu ({lastMonthLabel})</option>
            <option value="tahun_ini">Tahun Ini ({now.getFullYear()})</option>
            <option value="semua">Semua Waktu</option>
          </select>
        </div>
      </div>

      {/* Segmented Tabs */}
      <div className="max-w-md bg-slate-200/80 p-1 rounded-2xl mb-6 grid grid-cols-3 gap-1">
        <button
          type="button"
          onClick={() => setTab('ringkasan')}
          className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            tab === 'ringkasan'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Ringkasan
        </button>
        <button
          type="button"
          onClick={() => setTab('arus_kas')}
          className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            tab === 'arus_kas'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Arus Kas
        </button>
        <button
          type="button"
          onClick={() => setTab('kategori')}
          className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            tab === 'kategori'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Kategori
        </button>
      </div>

      {/* Responsive Grid: 2 Columns on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (5 cols): Metrics Summary */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
            <h3 className="font-extrabold text-sm text-slate-900">Rekapitulasi Periode</h3>

            {/* Total Pemasukan */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100">
              <div className="flex items-center gap-3 min-w-0 mr-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div className="truncate">
                  <span className="text-xs font-bold text-slate-800 block truncate">Total Pemasukan</span>
                  <p className="text-[10px] text-slate-400">{periodText}</p>
                </div>
              </div>
              <span className="font-mono font-bold text-sm text-emerald-600 whitespace-nowrap shrink-0 text-right">
                {formatRupiah(displayIncome)}
              </span>
            </div>

            {/* Total Pengeluaran */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100">
              <div className="flex items-center gap-3 min-w-0 mr-2">
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                  <ArrowDownRight className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div className="truncate">
                  <span className="text-xs font-bold text-slate-800 block truncate">Total Pengeluaran</span>
                  <p className="text-[10px] text-slate-400">{periodText}</p>
                </div>
              </div>
              <span className="font-mono font-bold text-sm text-rose-600 whitespace-nowrap shrink-0 text-right">
                {formatRupiah(displayExpense)}
              </span>
            </div>

            {/* Arus Kas Bersih */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100">
              <div className="flex items-center gap-3 min-w-0 mr-2">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                  <WalletIcon className="w-5 h-5" />
                </div>
                <div className="truncate">
                  <span className="text-xs font-bold text-slate-900 block truncate">Arus Kas Bersih</span>
                  <p className="text-[10px] text-indigo-700/70 truncate">Pemasukan dikurangi Pengeluaran</p>
                </div>
              </div>
              {renderNetCashFlow(displayNet)}
            </div>
          </div>
        </div>

        {/* Right Column (7 cols): Download Options */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-sm text-slate-900">Format Unduh Laporan</h3>
              <span className="text-xs text-slate-400">Siap cetak & olah data</span>
            </div>

            <div className="space-y-3">
              {/* PDF Download */}
              <div className="p-4 rounded-2xl border border-slate-200/80 hover:border-indigo-300 hover:shadow-xs transition-all flex items-center justify-between group">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-indigo-600 transition-colors">
                      Laporan PDF (Format Resmi)
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Rapi, dilengkapi grafik dan siap cetak untuk arsip keuangan
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => triggerDownload('pdf')}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh PDF</span>
                </button>
              </div>

              {/* XLSX Download */}
              <div className="p-4 rounded-2xl border border-slate-200/80 hover:border-indigo-300 hover:shadow-xs transition-all flex items-center justify-between group">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-indigo-600 transition-colors">
                      Excel Spreadsheet (.XLSX)
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Tabel terstruktur dengan rumus siap olah di Microsoft Excel
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => triggerDownload('xlsx')}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh Excel</span>
                </button>
              </div>

              {/* CSV Download */}
              <div className="p-4 rounded-2xl border border-slate-200/80 hover:border-indigo-300 hover:shadow-xs transition-all flex items-center justify-between group">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <FileCode className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-indigo-600 transition-colors">
                      Format CSV (Comma Separated)
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Kompatibel dengan Google Sheets, software akuntansi, dan database
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => triggerDownload('csv')}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 active:scale-95 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh CSV</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
