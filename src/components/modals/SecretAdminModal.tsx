import React, { useState } from 'react';
import { ShieldCheck, Lock, Eye, EyeOff, AlertCircle, X, KeyRound, Sparkles } from 'lucide-react';

interface SecretAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const SecretAdminModal: React.FC<SecretAdminModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  // Master PIN (Default: 123456, or master key)
  const MASTER_PIN = '123456';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      // Validates master PIN or common owner passphrase
      if (pin.trim() === MASTER_PIN || pin.trim() === 'admin123' || pin.trim() === 'uangku123') {
        onSuccess();
        onClose();
        setPin('');
      } else {
        setErrorMsg('PIN / Kunci Akses Admin tidak valid!');
      }
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-700/90 rounded-3xl p-6 shadow-2xl text-white space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white tracking-wide">
                Akses Konsol Admin
              </h3>
              <p className="text-[10px] text-slate-400">Verifikasi Kunci Rahasia Pemilik</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Pintu masuk admin terdeteksi via ketukan logo rahasia. Masukkan PIN Master untuk membuka konsol administrasi.
        </p>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="text-[11px] font-bold text-slate-300 block mb-1">
              PIN Master Admin
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type={showPin ? 'text' : 'password'}
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                placeholder="Masukkan 6-digit PIN"
                autoFocus
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-10 py-2.5 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[10px] text-slate-400 mt-1 italic">
              *PIN bawaan default pemilik: <span className="text-indigo-300 font-mono font-bold">123456</span>
            </p>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={loading || !pin.trim()}
              className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/30 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{loading ? 'Memverifikasi...' : 'Buka Panel Admin'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
            >
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
