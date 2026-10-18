import React from 'react';

export const Wallet3DIllustration: React.FC<{ className?: string }> = ({ className = 'w-64 h-64' }) => {
  return (
    <div className={`relative flex items-center justify-center select-none pointer-events-none ${className}`}>
      {/* Soft background glow & cloud shapes */}
      <div className="absolute inset-0 bg-gradient-to-tr from-indigo-200/40 via-purple-100/30 to-blue-100/40 rounded-full blur-2xl transform scale-90 -z-10"></div>
      
      <svg
        viewBox="0 0 320 300"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-xl"
      >
        <defs>
          {/* Gradients */}
          <linearGradient id="cloudGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F1F5F9" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#E2E8F0" stopOpacity="0.6" />
          </linearGradient>

          <linearGradient id="walletBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7C73F4" />
            <stop offset="50%" stopColor="#6357E8" />
            <stop offset="100%" stopColor="#4A3EC8" />
          </linearGradient>

          <linearGradient id="walletFrontGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8A82F6" />
            <stop offset="100%" stopColor="#5B4FE0" />
          </linearGradient>

          <linearGradient id="strapGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#5144D8" />
            <stop offset="100%" stopColor="#3C2FB8" />
          </linearGradient>

          <linearGradient id="goldCoinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FEE685" />
            <stop offset="50%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>

          <linearGradient id="goldCoinHighlight" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFBEB" />
            <stop offset="100%" stopColor="#FBBF24" />
          </linearGradient>

          <linearGradient id="greenMoneyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6EE7B7" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>

          <linearGradient id="purpleCoinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#DDD6FE" />
            <stop offset="100%" stopColor="#8B5CF6" />
          </linearGradient>

          <filter id="shadow3D" x="-10%" y="-10%" width="130%" height="130%">
            <feDropShadow dx="0" dy="12" stdDeviation="10" floodColor="#312E81" floodOpacity="0.22" />
          </filter>
        </defs>

        {/* Soft Background Clouds */}
        <g opacity="0.6">
          <ellipse cx="90" cy="180" rx="45" ry="30" fill="url(#cloudGrad)" />
          <ellipse cx="230" cy="190" rx="50" ry="35" fill="url(#cloudGrad)" />
          <ellipse cx="160" cy="200" rx="70" ry="40" fill="url(#cloudGrad)" />
        </g>

        {/* Floating Green Cash Bill (Back) */}
        <g transform="translate(190, 85) rotate(22)">
          <rect x="0" y="0" width="70" height="42" rx="6" fill="url(#greenMoneyGrad)" filter="url(#shadow3D)" />
          <rect x="5" y="4" width="60" height="34" rx="4" fill="none" stroke="#A7F3D0" strokeWidth="1.5" strokeDasharray="3 3" />
          <circle cx="35" cy="21" r="9" fill="#34D399" />
          <text x="35" y="24" textAnchor="middle" fill="#065F46" fontSize="10" fontWeight="bold" fontFamily="sans-serif">Rp</text>
        </g>

        {/* Floating Gold Coin (Top Left) */}
        <g transform="translate(45, 115) rotate(-15)" filter="url(#shadow3D)">
          <circle cx="26" cy="26" r="24" fill="url(#goldCoinGrad)" />
          <circle cx="26" cy="26" r="19" fill="url(#goldCoinHighlight)" stroke="#B45309" strokeWidth="1.5" />
          <text x="26" y="32" textAnchor="middle" fill="#92400E" fontSize="16" fontWeight="800" fontFamily="sans-serif">$</text>
        </g>

        {/* Floating Small Purple Coin (Top) */}
        <g transform="translate(185, 45) rotate(12)" filter="url(#shadow3D)">
          <circle cx="15" cy="15" r="14" fill="url(#purpleCoinGrad)" />
          <circle cx="15" cy="15" r="10" fill="#EDE9FE" stroke="#7C3AED" strokeWidth="1" />
          <text x="15" y="19" textAnchor="middle" fill="#6D28D9" fontSize="10" fontWeight="bold" fontFamily="sans-serif">$</text>
        </g>

        {/* Large 3D Purple Wallet (Center Main) */}
        <g filter="url(#shadow3D)">
          {/* Back flap of wallet */}
          <rect x="75" y="90" width="165" height="115" rx="28" fill="url(#walletBodyGrad)" transform="rotate(-6 157 147)" />
          
          {/* Cash poking out of wallet */}
          <g transform="translate(100, 75) rotate(-3)">
            <rect x="0" y="0" width="105" height="40" rx="7" fill="url(#greenMoneyGrad)" />
            <circle cx="52" cy="18" r="8" fill="#34D399" />
          </g>

          {/* Golden coins inside wallet rim */}
          <circle cx="118" cy="95" r="16" fill="url(#goldCoinGrad)" />
          <circle cx="118" cy="95" r="12" fill="url(#goldCoinHighlight)" />
          <text x="118" y="99" textAnchor="middle" fill="#92400E" fontSize="11" fontWeight="bold" fontFamily="sans-serif">$</text>

          <circle cx="145" cy="85" r="18" fill="url(#goldCoinGrad)" />
          <circle cx="145" cy="85" r="14" fill="url(#goldCoinHighlight)" />
          <text x="145" y="90" textAnchor="middle" fill="#92400E" fontSize="13" fontWeight="bold" fontFamily="sans-serif">Rp</text>

          {/* Front Body of Wallet */}
          <rect x="72" y="105" width="170" height="110" rx="26" fill="url(#walletFrontGrad)" transform="rotate(-3 157 160)" stroke="#9F97FC" strokeWidth="2" />
          
          {/* Wallet Texture curve highlight */}
          <path d="M 82 125 C 120 115, 200 112, 230 118" stroke="#B8B2FE" strokeWidth="3" strokeLinecap="round" opacity="0.6" />

          {/* Wallet Horizontal Strap */}
          <g transform="translate(150, 115) rotate(-3)">
            <path d="M 0 0 L 25 0 C 38 0, 48 10, 48 23 C 48 36, 38 46, 25 46 L 0 46 Z" fill="url(#strapGrad)" filter="url(#shadow3D)" />
            {/* Clasp circle */}
            <circle cx="28" cy="23" r="7" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1.5" />
            <circle cx="28" cy="23" r="3.5" fill="#94A3B8" />
          </g>
        </g>

        {/* Large Gold Coin Foreground Bottom Left */}
        <g transform="translate(68, 175) rotate(-8)" filter="url(#shadow3D)">
          <circle cx="28" cy="28" r="26" fill="url(#goldCoinGrad)" />
          <circle cx="28" cy="28" r="21" fill="url(#goldCoinHighlight)" stroke="#B45309" strokeWidth="2" />
          <circle cx="28" cy="28" r="14" fill="url(#goldCoinGrad)" opacity="0.4" />
        </g>

        {/* Medium Gold Coin Foreground Bottom Center */}
        <g transform="translate(150, 205) rotate(14)" filter="url(#shadow3D)">
          <circle cx="18" cy="18" r="16" fill="url(#goldCoinGrad)" />
          <circle cx="18" cy="18" r="13" fill="url(#goldCoinHighlight)" stroke="#B45309" strokeWidth="1.5" />
        </g>

        {/* 3D Soft Purple Cube / Token (Bottom Right) */}
        <g transform="translate(230, 175) rotate(18)" filter="url(#shadow3D)">
          <rect x="0" y="0" width="30" height="30" rx="8" fill="url(#purpleCoinGrad)" />
          <circle cx="15" cy="15" r="5" fill="#EDE9FE" />
        </g>

        {/* Small floating sparkles/stars */}
        <g fill="#A5B4FC">
          <path d="M 50 65 Q 53 72 60 75 Q 53 78 50 85 Q 47 78 40 75 Q 47 72 50 65 Z" opacity="0.8" />
          <path d="M 270 120 Q 272 125 277 127 Q 272 129 270 134 Q 268 129 263 127 Q 268 125 270 120 Z" opacity="0.7" />
          <circle cx="75" cy="40" r="3" fill="#C7D2FE" opacity="0.6" />
          <circle cx="265" cy="65" r="4" fill="#C7D2FE" opacity="0.6" />
        </g>
      </svg>
    </div>
  );
};
