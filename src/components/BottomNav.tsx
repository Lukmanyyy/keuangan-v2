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
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 w-full bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-2 pt-1.5 pb-[calc(0.5rem+env(safe-area-inset-bottom))] z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
      <div className="max-w-md mx-auto grid grid-cols-5 items-center relative">
        {/* 1. Beranda */}
        {(() => {
          const isActive = currentScreen === 'dashboard' || currentScreen === 'statistics';
          return (
            <button
              onClick={() => onNavigate('dashboard')}
              className={`relative flex flex-col items-center justify-center py-1.5 rounded-2xl transition-all duration-150 active:scale-90 cursor-pointer ${
                isActive ? 'text-indigo-600 font-bold' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="bottomNavActiveIndicator"
                  className="absolute inset-x-2 inset-y-0.5 bg-indigo-50/90 rounded-xl -z-10"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
              <Home className={`w-5 h-5 mb-0.5 transition-transform ${isActive ? 'scale-105 stroke-[2.3]' : 'stroke-[1.8]'}`} />
              <span className="text-[10px] tracking-tight">Beranda</span>
            </button>
          );
        })()}

        {/* 2. Transaksi */}
        {(() => {
          const isActive = currentScreen === 'transactions';
          return (
            <button
              onClick={() => onNavigate('transactions')}
              className={`relative flex flex-col items-center justify-center py-1.5 rounded-2xl transition-all duration-150 active:scale-90 cursor-pointer ${
                isActive ? 'text-indigo-600 font-bold' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="bottomNavActiveIndicator"
                  className="absolute inset-x-2 inset-y-0.5 bg-indigo-50/90 rounded-xl -z-10"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
              <ReceiptText className={`w-5 h-5 mb-0.5 transition-transform ${isActive ? 'scale-105 stroke-[2.3]' : 'stroke-[1.8]'}`} />
              <span className="text-[10px] tracking-tight">Transaksi</span>
            </button>
          );
        })()}

        {/* 3. Balanced Center Button (Catat Cepat) */}
        <div className="flex flex-col items-center justify-center -mt-2">
          <motion.button
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
            onClick={onOpenQuickAdd}
            className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/30 border-2 border-white transition-all cursor-pointer"
            aria-label="Catat Transaksi Cepat"
          >
            <Plus className="w-5 h-5 stroke-[2.6]" />
          </motion.button>
          <span className="text-[10px] font-semibold text-slate-500 tracking-tight mt-0.5">Catat</span>
        </div>

        {/* 4. Kas / Dompet */}
        {(() => {
          const isActive = currentScreen === 'wallets' || currentScreen === 'add_wallet';
          return (
            <button
              onClick={() => onNavigate('wallets')}
              className={`relative flex flex-col items-center justify-center py-1.5 rounded-2xl transition-all duration-150 active:scale-90 cursor-pointer ${
                isActive ? 'text-indigo-600 font-bold' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="bottomNavActiveIndicator"
                  className="absolute inset-x-2 inset-y-0.5 bg-indigo-50/90 rounded-xl -z-10"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
              <WalletIcon className={`w-5 h-5 mb-0.5 transition-transform ${isActive ? 'scale-105 stroke-[2.3]' : 'stroke-[1.8]'}`} />
              <span className="text-[10px] tracking-tight">Kas</span>
            </button>
          );
        })()}

        {/* 5. Profil */}
        {(() => {
          const isActive = currentScreen === 'profile';
          return (
            <button
              onClick={() => onNavigate('profile')}
              className={`relative flex flex-col items-center justify-center py-1.5 rounded-2xl transition-all duration-150 active:scale-90 cursor-pointer ${
                isActive ? 'text-indigo-600 font-bold' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="bottomNavActiveIndicator"
                  className="absolute inset-x-2 inset-y-0.5 bg-indigo-50/90 rounded-xl -z-10"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
              <MoreHorizontal className={`w-5 h-5 mb-0.5 transition-transform ${isActive ? 'scale-105 stroke-[2.3]' : 'stroke-[1.8]'}`} />
              <span className="text-[10px] tracking-tight">Profil</span>
            </button>
          );
        })()}
      </div>
    </nav>
  );
};
