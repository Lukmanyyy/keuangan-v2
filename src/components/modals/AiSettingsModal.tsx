import React, { useState } from 'react';
import { X, Sparkles, Key, Check, Info, Bot, RefreshCw } from 'lucide-react';
import { AppSettings } from '../../types';

interface AiSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSave: (settings: Partial<AppSettings>) => void;
}

export const AiSettingsModal: React.FC<AiSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSave,
}) => {
  const [apiKey, setApiKey] = useState(settings.openaiApiKey || '');
  const [provider, setProvider] = useState<'chatgpt' | 'gemini' | 'auto'>(settings.aiProvider || 'auto');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      openaiApiKey: apiKey.trim(),
      aiProvider: provider,
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Integrasi AI Scan Struk</h3>
              <p className="text-[10px] text-slate-400">ChatGPT & Gemini OCR</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-3.5">
          {/* Provider Selector */}
          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">
              Pilihan AI Engine
            </label>
            <div className="grid grid-cols-2 gap-1.5 bg-slate-100 p-1 rounded-xl text-[11px]">
              <button
                type="button"
                onClick={() => setProvider('gemini')}
                className={`py-2 px-2 rounded-lg font-bold transition-all cursor-pointer text-center ${
                  provider === 'gemini' || provider === 'auto'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 bg-white/50'
                }`}
              >
                <div>Google Gemini Flash</div>
                <div className="text-[9px] font-normal opacity-90">Gratis ~1.500 scan/hari</div>
              </button>
              <button
                type="button"
                onClick={() => setProvider('chatgpt')}
                className={`py-2 px-2 rounded-lg font-bold transition-all cursor-pointer text-center ${
                  provider === 'chatgpt'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 bg-white/50'
                }`}
              >
                <div>ChatGPT API (Opsional)</div>
                <div className="text-[9px] font-normal opacity-70">Butuh Saldo Berbayar</div>
              </button>
            </div>
          </div>

          {/* Gemini Status Card */}
          <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-3 text-[11px] text-emerald-900 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-emerald-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Gemini 2.5 Flash Aktif (Gratis)</span>
            </div>
            <p className="text-[10px] text-emerald-700 leading-snug">
              Key Gemini sudah terpasang otomatis dari Google AI Studio. Anda bisa memindai hingga 1.500 struk per hari tanpa biaya langganan!
            </p>
          </div>

          {/* Optional OpenAI API Key Input */}
          {provider === 'chatgpt' && (
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                OpenAI API Key (Jika ingin pakai ChatGPT)
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-proj-..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1 leading-snug">
                Opsional: Masukkan key jika ingin beralih ke model GPT-4o-mini Vision.
              </p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/25 transition-all cursor-pointer"
          >
            {savedSuccess ? (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Pengaturan Tersimpan!</span>
              </>
            ) : (
              <span>Simpan Pengaturan</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
