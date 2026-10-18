import React from 'react';
import { Home, ReceiptText, Plus, Wallet as WalletIcon, MoreHorizontal } from 'lucide-react';
import { motion } from 'motion/react';
import { ScreenId } from '../types';

interface BottomNavProps {
  currentScreen: ScreenId;
  onNavigate: (screen: ScreenId) => void;
  onOpenQuickAdd: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentScreen,
  onNavigate,
  onOpenQuickAdd,
}) => {
  const navItems = [
    { id: 'dashboard' as ScreenId, label: 'Beranda', icon: Home },
    { id: 'transactions' as ScreenId, label: 'Transaksi', icon: ReceiptText },
    { id: 'add_center' as any, label: '', icon: Plus, isAction: true },
    { id: 'wallets' as ScreenId, label: 'Kas', icon: WalletIcon },
    { id: 'profile' as ScreenId, label: 'Profil', icon: MoreHorizontal },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 w-full bg-white/95 backdrop-blur-md border-t border-slate-200/90 px-4 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] z-40 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
      <div className="max-w-md mx-auto flex items-center justify-between relative">
        {navItems.map((item) => {
          if (item.isAction) {
            return (
              <div key="center-btn" className="relative -top-5 flex flex-col items-center">
                <button
                  onClick={onOpenQuickAdd}
                  className="w-14 h-14 rounded-full bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white flex items-center justify-center shadow-lg shadow-indigo-500/40 border-4 border-white transition-all cursor-pointer"
                  aria-label="Tambah Transaksi Cepat"
                >
                  <Plus className="w-7 h-7 stroke-[2.5]" />
                </button>
              </div>
            );
          }

          const Icon = item.icon;
          const isActive =
            currentScreen === item.id ||
            (item.id === 'dashboard' && currentScreen === 'statistics') ||
            (item.id === 'wallets' && currentScreen === 'add_wallet');

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`relative flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-colors cursor-pointer ${
                isActive
                  ? 'text-indigo-600 font-bold'
                  : 'text-slate-400 hover:text-slate-600 font-normal'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="bottomNavActiveIndicator"
                  className="absolute inset-0 bg-indigo-50/90 rounded-xl -z-10"
                  transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                />
              )}
              <Icon className={`w-5 h-5 mb-1 transition-transform ${isActive ? 'scale-110 stroke-[2.2]' : ''}`} />
              <span className="text-[10px] tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
