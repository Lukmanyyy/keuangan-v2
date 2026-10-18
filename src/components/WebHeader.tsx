import React, { useState, useRef } from 'react';
import {
  Wallet,
  ReceiptText,
  Layers,
  PieChart,
  FileSpreadsheet,
  Plus,
  Camera,
} from 'lucide-react';
import { motion } from 'motion/react';
import { ScreenId, User } from '../types';

interface WebHeaderProps {
  currentScreen: ScreenId;
  user: User;
  onNavigate: (screen: ScreenId) => void;
  onOpenScanModal: () => void;
  onOpenAddModal: () => void;
  onOpenAiSettings: () => void;
  onLogout?: () => void;
  onSecretAdminTrigger?: () => void;
}

export const WebHeader: React.FC<WebHeaderProps> = ({
  currentScreen,
  user,
  onNavigate,
  onOpenScanModal,
  onOpenAddModal,
  onOpenAiSettings,
  onLogout,
  onSecretAdminTrigger,
}) => {
  const [clickCount, setClickCount] = useState(0);
  const clickTimeoutRef = useRef<any>(null);

  const handleLogoClick = () => {
    onNavigate('dashboard');

    // Secret 10-click trigger for admin access
    const nextCount = clickCount + 1;
    setClickCount(nextCount);

    if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);

    if (nextCount >= 10) {
      setClickCount(0);
      if (onSecretAdminTrigger) {
        onSecretAdminTrigger();
      }
    } else {
      clickTimeoutRef.current = setTimeout(() => {
        setClickCount(0);
      }, 3500);
    }
  };

  const navLinks = [
    { id: 'dashboard' as ScreenId, label: 'Beranda', icon: Wallet },
    { id: 'transactions' as ScreenId, label: 'Transaksi', icon: ReceiptText },
    { id: 'wallets' as ScreenId, label: 'Kas & Dompet', icon: Layers },
    { id: 'statistics' as ScreenId, label: 'Statistik', icon: PieChart },
    { id: 'reports' as ScreenId, label: 'Laporan', icon: FileSpreadsheet },
  ];

  return (
    <header className="sticky top-0 z-30 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Title (With Secret 10-Click Admin Trigger) */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleLogoClick}
              className="flex items-center gap-2.5 text-left group cursor-pointer focus:outline-none select-none"
              title="UANGKU"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/25 group-hover:scale-105 transition-transform">
                <Wallet className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <span className="font-extrabold text-base tracking-wider text-slate-900 uppercase block leading-none">
                  UANGKU
                </span>
                <span className="text-[10px] text-slate-400 font-medium hidden sm:block leading-tight mt-0.5">
                  Manajemen Keuangan AI
                </span>
              </div>
            </button>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 ml-6 pl-6 border-l border-slate-200">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = currentScreen === link.id;

                return (
                  <button
                    key={link.id}
                    onClick={() => onNavigate(link.id)}
                    className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                      isActive
                        ? 'text-indigo-700 font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="webHeaderActivePill"
                        className="absolute inset-0 bg-indigo-50 rounded-xl shadow-2xs -z-10"
                        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                      />
                    )}
                    <Icon
                      className={`w-4 h-4 ${
                        isActive ? 'text-indigo-600 stroke-[2.2]' : 'text-slate-400'
                      }`}
                    />
                    <span>{link.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Scan Struk Button (Desktop & Tablet) */}
            <button
              onClick={onOpenScanModal}
              className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-sm shadow-indigo-500/30 transition-all active:scale-95 cursor-pointer"
            >
              <Camera className="w-4 h-4" />
              <span>Scan Struk</span>
              <span className="text-[9px] bg-white/25 px-1.5 py-0.5 rounded-full font-mono uppercase tracking-wider">
                Foto
              </span>
            </button>

            {/* Quick Add Button (Desktop) */}
            <button
              onClick={onOpenAddModal}
              className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5] text-indigo-600" />
              <span>Tambah Transaksi</span>
            </button>
            {/* Profile Avatar & Navigation */}
            <button
              onClick={() => onNavigate('profile')}
              className="flex items-center gap-2 pl-1 pr-1.5 py-1 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer group"
              title="Profil & Pengaturan"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-xs flex items-center justify-center shadow-xs group-hover:ring-2 group-hover:ring-indigo-300 transition-all">
                {user.avatar || 'L'}
              </div>
              <span className="text-xs font-bold text-slate-800 hidden lg:inline">
                {user.name}
              </span>
            </button>

            {/* Tombol Keluar Akun */}
            <button
              onClick={() => {
                if (onLogout) {
                  onLogout();
                } else {
                  onNavigate('welcome');
                }
              }}
              className="text-[11px] font-bold text-slate-500 hover:text-rose-600 px-2.5 py-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer hidden sm:inline"
              title="Keluar dari akun Anda"
            >
              Keluar
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
