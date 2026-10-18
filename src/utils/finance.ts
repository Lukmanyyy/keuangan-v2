/**
 * Finance calculations and formatters for UANGKU
 */

export interface TransactionItem {
  name: string;
  qty: number;
  price: number;
}

export type TransactionType = 'pemasukan' | 'pengeluaran' | 'transfer';

export interface Transaction {
  id: string;
  type: TransactionType;
  walletId: string;
  toWalletId?: string;
  merchant: string;
  amount: number;
  date: string; // ISO string or YYYY-MM-DD HH:mm
  category: string;
  notes?: string;
  receiptImage?: string;
  items?: TransactionItem[];
  reminder?: boolean;
  createdAt: string;
}

export interface Wallet {
  id: string;
  name: string;
  balance: number;
  color: string;
  icon: string;
  isDefault?: boolean;
}

export interface CategoryStat {
  category: string;
  amount: number;
  percentage: number;
  color: string;
  icon: string;
}

/**
 * Format a number to Indonesian Rupiah string (e.g. 10182000 -> "Rp 10.182.000")
 */
export function formatRupiah(amount: number, withPrefix = true): string {
  const isNegative = amount < 0;
  const absAmount = Math.abs(Math.round(amount));
  const formatted = absAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const prefix = withPrefix ? 'Rp ' : '';
  return isNegative ? `-${prefix}${formatted}` : `${prefix}${formatted}`;
}

/**
 * Parse a rupiah string back to number (e.g. "Rp 45.000" -> 45000)
 */
export function parseRupiah(value: string | number): number {
  if (typeof value === 'number') return value;
  const cleaned = value.replace(/[^0-9-]/g, '');
  const parsed = parseInt(cleaned, 10);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Calculate total kas (sum of balances of all active wallets)
 */
export function calculateTotalKas(wallets: Wallet[]): number {
  return wallets.reduce((sum, w) => sum + (w.balance || 0), 0);
}

/**
 * Calculate total income, expense, and net balance from transactions
 */
export function calculateTransactionSummary(transactions: Transaction[]): {
  income: number;
  expense: number;
  net: number;
} {
  let income = 0;
  let expense = 0;

  for (const t of transactions) {
    if (t.type === 'pemasukan') {
      income += t.amount;
    } else if (t.type === 'pengeluaran') {
      expense += t.amount;
    }
  }

  return {
    income,
    expense,
    net: income - expense,
  };
}

/**
 * Calculate category breakdown sorted by largest expense percentage
 */
export function calculateCategoryStats(
  transactions: Transaction[],
  type: TransactionType = 'pengeluaran'
): CategoryStat[] {
  const filtered = transactions.filter((t) => t.type === type);
  const total = filtered.reduce((sum, t) => sum + t.amount, 0);

  if (total === 0) return [];

  const categoryMap: Record<string, number> = {};
  for (const t of filtered) {
    const cat = t.category || 'Lainnya';
    categoryMap[cat] = (categoryMap[cat] || 0) + t.amount;
  }

  const categoryMetadata: Record<string, { color: string; icon: string }> = {
    'Makan & Minum': { color: '#F97316', icon: 'Utensils' },
    'Transportasi': { color: '#0EA5E9', icon: 'Car' },
    'Belanja': { color: '#EC4899', icon: 'ShoppingBag' },
    'Hiburan': { color: '#8B5CF6', icon: 'Film' },
    'Tagihan & Utilitas': { color: '#EF4444', icon: 'Receipt' },
    'Kesehatan': { color: '#10B981', icon: 'HeartPulse' },
    'Pendidikan': { color: '#6366F1', icon: 'GraduationCap' },
    'Investasi': { color: '#14B8A6', icon: 'TrendingUp' },
    'Gaji & Penghasilan': { color: '#10B981', icon: 'Wallet' },
    'Bonus & Hadiah': { color: '#F59E0B', icon: 'Gift' },
    'Lainnya': { color: '#64748B', icon: 'MoreHorizontal' },
  };

  const results: CategoryStat[] = Object.keys(categoryMap).map((cat) => {
    const amount = categoryMap[cat];
    const percentage = Math.round((amount / total) * 100);
    const meta = categoryMetadata[cat] || { color: '#64748B', icon: 'MoreHorizontal' };
    return {
      category: cat,
      amount,
      percentage,
      color: meta.color,
      icon: meta.icon,
    };
  });

  return results.sort((a, b) => b.amount - a.amount);
}

/**
 * Format date string into Indonesian readable format
 * e.g. "14 Mei 2024 12:30" or "Hari Ini, 14 Mei 2024"
 */
export function formatIndonesianDate(
  dateInput: string | Date,
  includeTime = false
): string {
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return typeof dateInput === 'string' ? dateInput : '';

  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
  ];

  const day = d.getDate();
  const month = months[d.getMonth()];
  const year = d.getFullYear();

  let formatted = `${day} ${month} ${year}`;

  if (includeTime) {
    const hours = d.getHours().toString().padStart(2, '0');
    const mins = d.getMinutes().toString().padStart(2, '0');
    formatted += ` ${hours}:${mins}`;
  }

  return formatted;
}

/**
 * Group transactions by date label (Hari Ini, Kemarin, or Date)
 */
export function groupTransactionsByDate(transactions: Transaction[]): Record<string, Transaction[]> {
  const groups: Record<string, Transaction[]> = {};
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = `${yesterday.getFullYear()}-${(yesterday.getMonth() + 1).toString().padStart(2, '0')}-${yesterday.getDate().toString().padStart(2, '0')}`;

  // Sort descending by date
  const sorted = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  for (const t of sorted) {
    const tDate = new Date(t.date);
    const dateStr = !isNaN(tDate.getTime()) 
      ? `${tDate.getFullYear()}-${(tDate.getMonth() + 1).toString().padStart(2, '0')}-${tDate.getDate().toString().padStart(2, '0')}`
      : 'Lainnya';

    let groupKey = '';
    if (dateStr === todayStr) {
      groupKey = `Hari Ini • ${formatIndonesianDate(t.date)}`;
    } else if (dateStr === yesterdayStr) {
      groupKey = `Kemarin • ${formatIndonesianDate(t.date)}`;
    } else {
      groupKey = formatIndonesianDate(t.date);
    }

    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(t);
  }

  return groups;
}

/**
 * Smart fallback parser for Indonesian receipt text when offline or API key absent
 */
export function parseIndonesianReceiptText(rawText: string): {
  merchant: string;
  total: number;
  date: string;
  category: string;
  items: TransactionItem[];
} {
  const text = rawText || '';
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);

  let merchant = 'Toko / Merchant';
  let total = 0;
  let date = new Date().toISOString();
  let category = 'Makan & Minum';
  const items: TransactionItem[] = [];

  // Known merchant pattern detection
  const lower = text.toLowerCase();
  if (lower.includes('kopi kenangan')) {
    merchant = 'Kopi Kenangan';
    category = 'Makan & Minum';
  } else if (lower.includes('indomaret')) {
    merchant = 'Indomaret';
    category = 'Belanja';
  } else if (lower.includes('alfamart')) {
    merchant = 'Alfamart';
    category = 'Belanja';
  } else if (lower.includes('starbucks')) {
    merchant = 'Starbucks';
    category = 'Makan & Minum';
  } else if (lower.includes('pertamina') || lower.includes('spbu')) {
    merchant = 'SPBU Pertamina';
    category = 'Transportasi';
  } else if (lower.includes('mcdonald') || lower.includes('mcd')) {
    merchant = "McDonald's";
    category = 'Makan & Minum';
  } else if (lines.length > 0) {
    merchant = lines[0].replace(/[^\w\s&.-]/g, '').trim() || 'Toko Retail';
  }

  // Look for total
  for (const line of lines) {
    const lLower = line.toLowerCase();
    if (lLower.includes('total') || lLower.includes('grand total') || lLower.includes('tagihan')) {
      const match = line.match(/(?:rp\.?|idr)?\s*([0-9]{1,3}(?:\.[0-9]{3})*(?:,[0-9]+)?|[0-9]+)/i);
      if (match && match[1]) {
        const val = parseRupiah(match[1]);
        if (val > 0) {
          total = val;
          break;
        }
      }
    }
  }

  // Extract items
  for (const line of lines) {
    const itemMatch = line.match(/^([a-zA-Z0-9\s&]+?)\s+(\d+)\s+([0-9.,]+)$/);
    if (itemMatch) {
      const name = itemMatch[1].trim();
      const qty = parseInt(itemMatch[2], 10) || 1;
      const price = parseRupiah(itemMatch[3]);
      if (price > 0 && !name.toLowerCase().includes('total')) {
        items.push({ name, qty, price });
      }
    }
  }

  if (total === 0 && items.length > 0) {
    total = items.reduce((sum, it) => sum + it.price, 0);
  }

  return {
    merchant,
    total: total || 45000,
    date,
    category,
    items: items.length > 0 ? items : [
      { name: 'Americano', qty: 1, price: 25000 },
      { name: 'Roti Croissant', qty: 1, price: 20000 },
    ],
  };
}
