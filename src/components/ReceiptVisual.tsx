import React from 'react';

interface ReceiptVisualProps {
  merchant?: string;
  date?: string;
  items?: Array<{ name: string; qty: number; price: number }>;
  total?: number;
  compact?: boolean;
}

export const ReceiptVisual: React.FC<ReceiptVisualProps> = ({
  merchant = 'kopi kenangan',
  date = '14 Mei 2024 12:30',
  items = [
    { name: 'Americano', qty: 1, price: 25000 },
    { name: 'Roti Croissant', qty: 1, price: 20000 },
  ],
  total = 45000,
  compact = false,
}) => {
  return (
    <div
      className={`bg-[#FAFAFA] text-slate-800 font-mono shadow-md border border-slate-200 rounded-sm overflow-hidden select-none transition-all ${
        compact ? 'p-3 text-[10px]' : 'p-4 text-xs'
      }`}
      style={{
        backgroundImage: 'radial-gradient(#e5e7eb 0.75px, transparent 0.75px)',
        backgroundSize: '8px 8px',
      }}
    >
      {/* Header */}
      <div className="text-center pb-2 border-b border-dashed border-slate-300">
        <div className="flex items-center justify-center gap-1.5 font-bold tracking-wider text-slate-900 uppercase">
          <span className="text-amber-700">☕</span>
          <span className="font-serif italic font-extrabold text-sm">{merchant}</span>
        </div>
        <p className="text-[10px] text-slate-500 mt-0.5">Jl. Jend. Sudirman No. 123</p>
        <p className="text-[9px] text-slate-400">Jakarta Pusat • 021-5550192</p>
        <div className="mt-1 text-[10px] text-slate-500 flex justify-between px-1">
          <span>{date}</span>
          <span className="text-slate-400">#TRX-8821</span>
        </div>
      </div>

      {/* Item List */}
      <div className="py-2.5 space-y-1.5 border-b border-dashed border-slate-300">
        {items.map((it, idx) => (
          <div key={idx} className="flex justify-between items-center text-[11px]">
            <div className="flex items-center gap-1.5 truncate max-w-[65%]">
              <span className="text-slate-400 text-[10px]">{it.qty}x</span>
              <span className="text-slate-700 font-medium truncate">{it.name}</span>
            </div>
            <span className="text-slate-900 font-semibold">{it.price.toLocaleString('id-ID')}</span>
          </div>
        ))}
      </div>

      {/* Calculation */}
      <div className="py-2 space-y-1 text-[11px]">
        <div className="flex justify-between text-slate-500">
          <span>Subtotal</span>
          <span>{total.toLocaleString('id-ID')}</span>
        </div>
        <div className="flex justify-between text-slate-500">
          <span>PPN (0%)</span>
          <span>0</span>
        </div>
        <div className="flex justify-between text-slate-900 font-bold pt-1 border-t border-slate-200 text-xs">
          <span>Total</span>
          <span className="text-indigo-600">Rp {total.toLocaleString('id-ID')}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center pt-2 text-[9px] text-slate-400 border-t border-dashed border-slate-300">
        <p>Terima kasih atas kunjungan Anda</p>
        <p className="text-[8px] text-slate-400 mt-0.5">Simpan struk ini sebagai bukti transaksi sah</p>
        {/* Barcode graphic */}
        <div className="flex justify-center gap-0.5 mt-2 h-4 opacity-60">
          <div className="w-0.5 bg-black"></div>
          <div className="w-1 bg-black"></div>
          <div className="w-0.5 bg-black"></div>
          <div className="w-1.5 bg-black"></div>
          <div className="w-0.5 bg-black"></div>
          <div className="w-2 bg-black"></div>
          <div className="w-0.5 bg-black"></div>
          <div className="w-1 bg-black"></div>
          <div className="w-1.5 bg-black"></div>
          <div className="w-0.5 bg-black"></div>
        </div>
      </div>
    </div>
  );
};
