import { Transaction, Wallet, User, AppSettings } from '../types';

const TOKEN_KEY = 'uangku_auth_token';

function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function setStoredToken(token: string | null) {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch {}
}

async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getStoredToken();
  const headers = new Headers(options.headers || {});
  
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  return fetch(url, {
    ...options,
    headers,
  });
}

export const api = {
  // Token Management
  getToken: getStoredToken,
  setToken: setStoredToken,
  clearToken: () => setStoredToken(null),

  // Auth
  async register(name: string, email: string, password: string): Promise<{ success: boolean; user: User; token: string; message?: string }> {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (data.success && data.token) {
      setStoredToken(data.token);
    }
    return data;
  },

  async login(identifier: string, password?: string): Promise<{ success: boolean; user: User; token: string; message?: string }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: identifier, username: identifier, password }),
    });
    const data = await res.json();
    if (data.success && data.token) {
      setStoredToken(data.token);
    }
    return data;
  },

  async loginGoogle(email?: string, name?: string): Promise<{ success: boolean; user: User; token: string }> {
    const res = await fetch('/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name }),
    });
    const data = await res.json();
    if (data.success && data.token) {
      setStoredToken(data.token);
    }
    return data;
  },

  async logout(): Promise<{ success: boolean }> {
    try {
      await authFetch('/api/auth/logout', { method: 'POST' });
    } catch {}
    setStoredToken(null);
    return { success: true };
  },

  async getMe(): Promise<{ success: boolean; user?: User; message?: string }> {
    const token = getStoredToken();
    if (!token) {
      return { success: false, message: 'Belum login' };
    }
    const res = await authFetch('/api/auth/me');
    return res.json();
  },

  async updateProfile(name: string, email: string): Promise<{ success: boolean; user: User }> {
    const res = await authFetch('/api/auth/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email }),
    });
    return res.json();
  },

  // Wallets
  async getWallets(): Promise<{ success: boolean; wallets: Wallet[] }> {
    const res = await authFetch('/api/wallets');
    return res.json();
  },

  async createWallet(wallet: Omit<Wallet, 'id'>): Promise<{ success: boolean; wallet: Wallet; wallets?: Wallet[] }> {
    const res = await authFetch('/api/wallets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(wallet),
    });
    return res.json();
  },

  async updateWallet(id: string, updates: Partial<Wallet>): Promise<{ success: boolean; wallet: Wallet; wallets?: Wallet[] }> {
    const res = await authFetch(`/api/wallets/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return res.json();
  },

  async deleteWallet(id: string): Promise<{ success: boolean; wallets?: Wallet[] }> {
    const res = await authFetch(`/api/wallets/${id}`, { method: 'DELETE' });
    return res.json();
  },

  // Transactions
  async getTransactions(params?: { type?: string; walletId?: string; search?: string }): Promise<{ success: boolean; transactions: Transaction[] }> {
    const query = new URLSearchParams();
    if (params?.type) query.append('type', params.type);
    if (params?.walletId) query.append('walletId', params.walletId);
    if (params?.search) query.append('search', params.search);

    const res = await authFetch(`/api/transactions?${query.toString()}`);
    return res.json();
  },

  async createTransaction(tx: Omit<Transaction, 'id' | 'createdAt'>): Promise<{ success: boolean; transaction: Transaction; wallets: Wallet[] }> {
    const res = await authFetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tx),
    });
    return res.json();
  },

  async deleteTransaction(id: string): Promise<{ success: boolean; wallets: Wallet[] }> {
    const res = await authFetch(`/api/transactions/${id}`, { method: 'DELETE' });
    return res.json();
  },

  // Receipt Scan via AI (ChatGPT / Gemini / Local OCR)
  async scanReceipt(params: {
    imageBase64?: string;
    receiptType: 'pengeluaran' | 'pemasukan';
    customApiKey?: string;
  }): Promise<{
    success: boolean;
    data: {
      merchant: string;
      amount: number;
      date: string;
      category: string;
      items: Array<{ name: string; qty: number; price: number }>;
      notes: string;
      aiEngine: string;
    };
  }> {
    const res = await authFetch('/api/scan-receipt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    return res.json();
  },

  // Settings
  async getSettings(): Promise<{ success: boolean; settings: AppSettings }> {
    const res = await authFetch('/api/settings');
    return res.json();
  },

  async updateSettings(settings: Partial<AppSettings>): Promise<{ success: boolean; settings: AppSettings }> {
    const res = await authFetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    return res.json();
  },

  // Admin APIs (/admin)
  async getAdminOverview(): Promise<{
    success: boolean;
    stats: {
      totalUsers: number;
      activeUsersToday: number;
      totalWallets: number;
      totalTransactions: number;
      totalSystemBalance: number;
    };
    users: Array<{
      id: string;
      name: string;
      email: string;
      avatar: string;
      password: string;
      createdAt: string;
      lastActiveAt: string;
      walletsCount: number;
      transactionsCount: number;
      totalBalance: number;
      wallets: any[];
      transactions: any[];
    }>;
    globalAiSettings: {
      openaiApiKey: string;
      geminiApiKey?: string;
      aiProvider: 'chatgpt' | 'gemini' | 'auto';
    };
  }> {
    const res = await fetch('/api/admin/overview');
    return res.json();
  },

  async resetUserPassword(userId: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/admin/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, newPassword }),
    });
    return res.json();
  },

  async saveAdminAiSettings(settings: {
    openaiApiKey: string;
    geminiApiKey?: string;
    aiProvider: string;
  }): Promise<{ success: boolean; message: string; globalAiSettings?: any }> {
    const res = await fetch('/api/admin/ai-settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    return res.json();
  },

  async deleteAdminUser(userId: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: 'DELETE',
    });
    return res.json();
  },
};
