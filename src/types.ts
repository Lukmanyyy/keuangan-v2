export type TransactionType = 'pemasukan' | 'pengeluaran' | 'transfer';

export interface TransactionItem {
  name: string;
  qty: number;
  price: number;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  walletId: string;
  toWalletId?: string;
  merchant: string;
  amount: number;
  date: string;
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

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

export interface AppSettings {
  openaiApiKey?: string;
  aiProvider: 'chatgpt' | 'gemini' | 'auto';
  notifications: boolean;
  darkMode: boolean;
  hasOpenAiKey?: boolean;
  hasGeminiKey?: boolean;
}

export type ScreenId =
  | 'welcome'
  | 'dashboard'
  | 'transactions'
  | 'add_transaction'
  | 'wallets'
  | 'add_wallet'
  | 'statistics'
  | 'reports'
  | 'report_downloaded'
  | 'profile'
  | 'scan_camera'
  | 'scan_review'
  | 'scan_success'
  | 'admin'
  | 'privacy'
  | 'terms';
