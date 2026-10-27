import React, { useEffect } from 'react';
import { FileText, CheckCircle2, ExternalLink, Share2, Plus, ArrowLeft } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ReportDownloadedScreenProps {
  format?: string;
  onOpenFile: () => void;
  onShare: () => void;
  onCreateAnother: () => void;
  onBack: () => void;
}

export const ReportDownloadedScreen: React.FC<ReportDownloadedScreenProps> = ({
  format = 'PDF',
  onOpenFile,
  onShare,
  onCreateAnother,
  onBack,
}) => {
  useEffect(() => {
    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.35 },
      });
    } catch {}
  }, []);

  return (
    <div className="w-full max-w-lg mx-auto py-6 sm:py-10 pb-28 md:pb-12 text-slate-800">
      <div className="bg-white sm:rounded-3xl sm:border sm:border-slate-200/80 sm:shadow-xs p-6 sm:p-8 flex flex-col items-center text-center">
        {/* Back button */}
        <div className="w-full flex justify-start pb-2">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>

        {/* Document 3D Graphic */}
        <div className="relative w-36 h-36 flex items-center justify-center my-4">
          <div className="absolute inset-0 bg-blue-100/50 rounded-full blur-xl"></div>
          <div className="absolute top-2 w-24 h-32 bg-indigo-100 rounded-2xl transform rotate-6 border border-indigo-200"></div>
          <div className="relative z-10 w-24 h-32 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 flex flex-col justify-between">
            <div className="space-y-1.5">
              <div className="w-6 h-6 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                <FileText className="w-3.5 h-3.5" />
              </div>
              <div className="w-12 h-1.5 bg-slate-200 rounded-full"></div>
              <div className="w-16 h-1 bg-slate-100 rounded-full"></div>
            </div>
            <div className="w-full h-8 bg-indigo-50/80 rounded-lg border border-indigo-100 flex items-center justify-center">
              <span className="text-[9px] font-bold text-indigo-600 uppercase font-mono">
                {format} REPORT
              </span>
            </div>
          </div>

          <div className="absolute -bottom-2 -right-2 z-20 w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg border-2 border-white">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          Laporan Siap Diunduh!
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xs leading-relaxed">
          File sesuai periode yang dipilih telah dibuat. Periksa daftar unduhan browser untuk menyimpannya.
        </p>

        {/* File Detail Chip */}
        <div className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl p-4 my-6 flex items-center justify-between text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs uppercase">
              {format.toUpperCase()}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">laporan-uangku.{format.toLowerCase()}</p>
              <p className="text-[10px] text-slate-400">Lokasi penyimpanan mengikuti pengaturan browser</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="w-full space-y-2.5">
          <button
            onClick={onOpenFile}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-indigo-500/25 transition-all cursor-pointer"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Kembali ke Laporan</span>
          </button>

          <button
            onClick={onShare}
            className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span>Bagikan Tautan Aplikasi</span>
          </button>

          <button
            onClick={onCreateAnother}
            className="w-full py-2.5 text-slate-500 hover:text-slate-800 text-xs font-semibold transition-colors cursor-pointer"
          >
            Buat Laporan Periode Lain
          </button>
        </div>
      </div>
    </div>
  );
};
