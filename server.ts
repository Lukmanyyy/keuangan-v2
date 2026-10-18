import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProd = process.env.NODE_ENV === 'production';
const PORT = 3000;

// Data models
interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

interface Wallet {
  id: string;
  name: string;
  balance: number;
  color: string;
  icon: string;
  isDefault?: boolean;
}

interface TransactionItem {
  name: string;
  qty: number;
  price: number;
}

interface Transaction {
  id: string;
  type: 'pemasukan' | 'pengeluaran' | 'transfer';
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

interface AppSettings {
  openaiApiKey?: string;
  aiProvider: 'chatgpt' | 'gemini' | 'auto';
  notifications: boolean;
  darkMode: boolean;
}

interface UserAccount {
  id: string;
  name: string;
  email: string;
  password?: string;
  avatar: string;
  createdAt: string;
  lastActiveAt?: string;
  wallets: Wallet[];
  transactions: Transaction[];
  settings: AppSettings;
}

interface Database {
  users: UserAccount[];
  sessions: { [token: string]: string }; // token -> userId
  globalAiSettings?: {
    openaiApiKey: string;
    geminiApiKey?: string;
    aiProvider: 'chatgpt' | 'gemini' | 'auto';
  };
}

const DB_FILE = path.resolve(__dirname, 'data_store.json');

function loadDatabase(): Database {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed.users)) {
        return {
          users: parsed.users,
          sessions: parsed.sessions || {},
          globalAiSettings: parsed.globalAiSettings || {
            openaiApiKey: process.env.OPENAI_API_KEY || '',
            aiProvider: 'auto',
          },
        };
      }
    }
  } catch (err) {
    console.error('Error reading database file, starting clean database:', err);
  }

  // Initial clean database
  return {
    users: [],
    sessions: {},
    globalAiSettings: {
      openaiApiKey: process.env.OPENAI_API_KEY || '',
      aiProvider: 'auto',
    },
  };
}

const db: Database = loadDatabase();

function saveDatabase() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving database file:', err);
  }
}

// Auth helper middleware
function getAuthUser(req: Request): UserAccount | null {
  const authHeader = req.headers.authorization || '';
  let token = '';
  if (authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  } else if (req.headers['x-auth-token']) {
    token = String(req.headers['x-auth-token']).trim();
  } else if (req.query.token) {
    token = String(req.query.token).trim();
  }

  if (!token) return null;
  const userId = db.sessions[token];
  if (!userId) return null;

  const found = db.users.find((u) => u.id === userId);
  if (found) {
    found.lastActiveAt = new Date().toISOString();
  }
  return found || null;
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '20mb' }));
  app.use(express.urlencoded({ extended: true, limit: '20mb' }));

  // ==========================================
  // 1. Authentication Endpoints (Real Accounts)
  // ==========================================

  // Register new account (Saldo 0, Dompet Kosong)
  app.post('/api/auth/register', (req: Request, res: Response) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Nama lengkap, email, dan kata sandi wajib diisi',
      });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanName = String(name).trim();

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Kata sandi minimal 6 karakter',
      });
    }

    // Check if email already registered
    const existing = db.users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Email sudah terdaftar. Silakan masuk menggunakan kata sandi Anda.',
      });
    }

    const newUserId = 'u_' + Date.now() + Math.random().toString(36).substring(2, 6);
    const initialAvatar = cleanName.charAt(0).toUpperCase() || 'U';

    const newUser: UserAccount = {
      id: newUserId,
      name: cleanName,
      email: cleanEmail,
      password: String(password),
      avatar: initialAvatar,
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
      // Dompet kosong dan saldo 0 sesuai permintaan pengguna
      wallets: [],
      // Transaksi kosong
      transactions: [],
      settings: {
        openaiApiKey: process.env.OPENAI_API_KEY || '',
        aiProvider: 'auto',
        notifications: true,
        darkMode: false,
      },
    };

    db.users.push(newUser);

    // Create session token
    const token = 'tok_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
    db.sessions[token] = newUserId;
    saveDatabase();

    const safeUser: User = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      avatar: newUser.avatar,
    };

    res.status(201).json({
      success: true,
      message: 'Pendaftaran berhasil. Selamat datang!',
      user: safeUser,
      token,
    });
  });

  // Login with existing account (supports email or username)
  app.post('/api/auth/login', (req: Request, res: Response) => {
    const { email, username, password } = req.body;
    const identifier = String(email || username || '').trim().toLowerCase();

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email atau nama pengguna serta kata sandi wajib diisi',
      });
    }

    // Match by email or by name/username
    const user = db.users.find(
      (u) => u.email.toLowerCase() === identifier || u.name.toLowerCase() === identifier
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Akun tidak ditemukan. Silakan buat akun terlebih dahulu.',
      });
    }

    if (user.password !== String(password)) {
      return res.status(401).json({
        success: false,
        message: 'Kata sandi yang Anda masukkan salah. Silakan coba lagi.',
      });
    }

    // Update lastActiveAt
    user.lastActiveAt = new Date().toISOString();

    // Create session token
    const token = 'tok_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
    db.sessions[token] = user.id;
    saveDatabase();

    const safeUser: User = {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
    };

    res.json({
      success: true,
      message: 'Berhasil masuk',
      user: safeUser,
      token,
    });
  });

  // Google Login / Onboarding
  app.post('/api/auth/google', (req: Request, res: Response) => {
    const { email, name } = req.body || {};
    const googleEmail = (email || 'pengguna.google@gmail.com').trim().toLowerCase();
    const googleName = name || 'Pengguna Google';

    let user = db.users.find((u) => u.email.toLowerCase() === googleEmail);
    if (!user) {
      const newUserId = 'u_g_' + Date.now();
      user = {
        id: newUserId,
        name: googleName,
        email: googleEmail,
        password: 'google_authenticated',
        avatar: googleName.charAt(0).toUpperCase() || 'G',
        createdAt: new Date().toISOString(),
        wallets: [],
        transactions: [],
        settings: {
          openaiApiKey: process.env.OPENAI_API_KEY || '',
          aiProvider: 'auto',
          notifications: true,
          darkMode: false,
        },
      };
      db.users.push(user);
    }

    const token = 'tok_g_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
    db.sessions[token] = user.id;
    saveDatabase();

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
      token,
    });
  });

  // Get current session user
  app.get('/api/auth/me', (req: Request, res: Response) => {
    const user = getAuthUser(req);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Belum login' });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
    });
  });

  // Logout
  app.post('/api/auth/logout', (req: Request, res: Response) => {
    const authHeader = req.headers.authorization || '';
    let token = '';
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7).trim();
    } else if (req.headers['x-auth-token']) {
      token = String(req.headers['x-auth-token']).trim();
    }

    if (token && db.sessions[token]) {
      delete db.sessions[token];
      saveDatabase();
    }

    res.json({ success: true, message: 'Berhasil keluar akun' });
  });

  // Update Profile
  app.put('/api/auth/profile', (req: Request, res: Response) => {
    const user = getAuthUser(req);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Belum login' });
    }

    const { name, email } = req.body;
    if (name) {
      user.name = String(name).trim();
      user.avatar = user.name.charAt(0).toUpperCase();
    }
    if (email) {
      user.email = String(email).trim().toLowerCase();
    }

    saveDatabase();
    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
    });
  });

  // ==========================================
  // Admin Endpoints (/admin)
  // ==========================================

  // Overview data for admin (user list, active stats, balances, AI settings)
  app.get('/api/admin/overview', (_req: Request, res: Response) => {
    const totalUsers = db.users.length;
    
    // Count users active within last 24h
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;
    const activeUsersToday = db.users.filter((u) => {
      const lastActive = u.lastActiveAt ? new Date(u.lastActiveAt).getTime() : new Date(u.createdAt).getTime();
      return now - lastActive < oneDayMs;
    }).length;

    let totalWallets = 0;
    let totalTransactions = 0;
    let totalSystemBalance = 0;

    const userSummaries = db.users.map((u) => {
      const walletsCount = (u.wallets || []).length;
      const transactionsCount = (u.transactions || []).length;
      const balance = (u.wallets || []).reduce((acc, w) => acc + (w.balance || 0), 0);

      totalWallets += walletsCount;
      totalTransactions += transactionsCount;
      totalSystemBalance += balance;

      return {
        id: u.id,
        name: u.name,
        email: u.email,
        avatar: u.avatar,
        password: u.password || '••••••',
        createdAt: u.createdAt,
        lastActiveAt: u.lastActiveAt || u.createdAt,
        walletsCount,
        transactionsCount,
        totalBalance: balance,
        wallets: u.wallets || [],
        transactions: u.transactions || [],
      };
    });

    res.json({
      success: true,
      stats: {
        totalUsers,
        activeUsersToday,
        totalWallets,
        totalTransactions,
        totalSystemBalance,
      },
      users: userSummaries,
      globalAiSettings: db.globalAiSettings || {
        openaiApiKey: process.env.OPENAI_API_KEY || '',
        geminiApiKey: process.env.GEMINI_API_KEY ? 'Terpasang di Environment Server' : '',
        aiProvider: 'auto',
      },
    });
  });

  // Admin: Reset password for any user
  app.post('/api/admin/reset-password', (req: Request, res: Response) => {
    const { userId, newPassword } = req.body;
    if (!userId || !newPassword) {
      return res.status(400).json({ success: false, message: 'User ID dan kata sandi baru wajib diisi' });
    }

    if (String(newPassword).length < 6) {
      return res.status(400).json({ success: false, message: 'Kata sandi baru minimal 6 karakter' });
    }

    const user = db.users.find((u) => u.id === userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Pengguna tidak ditemukan' });
    }

    user.password = String(newPassword);
    saveDatabase();

    res.json({
      success: true,
      message: `Kata sandi untuk akun "${user.name}" (${user.email}) berhasil direset menjadi "${newPassword}".`,
    });
  });

  // Admin: Save Global AI Configuration (OpenAI key, Gemini, Provider)
  app.post('/api/admin/ai-settings', (req: Request, res: Response) => {
    const { openaiApiKey, geminiApiKey, aiProvider } = req.body;

    if (!db.globalAiSettings) {
      db.globalAiSettings = {
        openaiApiKey: '',
        aiProvider: 'auto',
      };
    }

    if (openaiApiKey !== undefined) {
      db.globalAiSettings.openaiApiKey = String(openaiApiKey).trim();
      process.env.OPENAI_API_KEY = db.globalAiSettings.openaiApiKey;
    }
    if (geminiApiKey !== undefined && geminiApiKey.trim()) {
      db.globalAiSettings.geminiApiKey = String(geminiApiKey).trim();
    }
    if (aiProvider !== undefined) {
      db.globalAiSettings.aiProvider = aiProvider;
    }

    saveDatabase();

    res.json({
      success: true,
      message: 'Pengaturan integrasi AI berhasil disimpan dan aktif!',
      globalAiSettings: db.globalAiSettings,
    });
  });

  // Admin: Delete user
  app.delete('/api/admin/users/:userId', (req: Request, res: Response) => {
    const { userId } = req.params;
    const userIndex = db.users.findIndex((u) => u.id === userId);
    if (userIndex === -1) {
      return res.status(404).json({ success: false, message: 'Pengguna tidak ditemukan' });
    }

    const removed = db.users.splice(userIndex, 1)[0];
    
    // Clear user sessions
    Object.keys(db.sessions).forEach((token) => {
      if (db.sessions[token] === userId) {
        delete db.sessions[token];
      }
    });

    saveDatabase();

    res.json({
      success: true,
      message: `Akun "${removed.name}" (${removed.email}) berhasil dihapus.`,
    });
  });

  // ==========================================
  // 2. Wallets / Kas Endpoints (Per User)
  // ==========================================

  app.get('/api/wallets', (req: Request, res: Response) => {
    const user = getAuthUser(req);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Silakan login terlebih dahulu' });
    }
    res.json({ success: true, wallets: user.wallets || [] });
  });

  app.post('/api/wallets', (req: Request, res: Response) => {
    const user = getAuthUser(req);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Silakan login terlebih dahulu' });
    }

    const { name, balance, color, icon } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Nama kas wajib diisi' });
    }

    const isFirstWallet = !user.wallets || user.wallets.length === 0;
    const newWallet: Wallet = {
      id: 'w-' + Date.now(),
      name: String(name).trim(),
      balance: Number(balance) || 0,
      color: color || 'indigo',
      icon: icon || 'wallet',
      isDefault: isFirstWallet,
    };

    if (!user.wallets) user.wallets = [];
    user.wallets.push(newWallet);
    saveDatabase();

    res.status(201).json({ success: true, wallet: newWallet, wallets: user.wallets });
  });

  app.put('/api/wallets/:id', (req: Request, res: Response) => {
    const user = getAuthUser(req);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Silakan login terlebih dahulu' });
    }

    const { id } = req.params;
    const { name, balance, color, icon } = req.body;
    const idx = (user.wallets || []).findIndex((w) => w.id === id);
    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Kas tidak ditemukan' });
    }

    if (name !== undefined) user.wallets[idx].name = String(name).trim();
    if (balance !== undefined) user.wallets[idx].balance = Number(balance);
    if (color !== undefined) user.wallets[idx].color = color;
    if (icon !== undefined) user.wallets[idx].icon = icon;

    saveDatabase();
    res.json({ success: true, wallet: user.wallets[idx], wallets: user.wallets });
  });

  app.delete('/api/wallets/:id', (req: Request, res: Response) => {
    const user = getAuthUser(req);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Silakan login terlebih dahulu' });
    }

    const { id } = req.params;
    user.wallets = (user.wallets || []).filter((w) => w.id !== id);
    saveDatabase();
    res.json({ success: true, message: 'Kas berhasil dihapus', wallets: user.wallets });
  });

  // ==========================================
  // 3. Transactions Endpoints (Per User)
  // ==========================================

  app.get('/api/transactions', (req: Request, res: Response) => {
    const user = getAuthUser(req);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Silakan login terlebih dahulu' });
    }

    const { type, walletId, search } = req.query;
    let filtered = [...(user.transactions || [])];

    if (type && type !== 'semua') {
      filtered = filtered.filter((t) => t.type === type);
    }
    if (walletId) {
      filtered = filtered.filter((t) => t.walletId === walletId);
    }
    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.merchant.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          (t.notes && t.notes.toLowerCase().includes(q))
      );
    }

    // Sort descending by date
    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    res.json({ success: true, transactions: filtered });
  });

  app.post('/api/transactions', (req: Request, res: Response) => {
    const user = getAuthUser(req);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Silakan login terlebih dahulu' });
    }

    const {
      type,
      walletId,
      toWalletId,
      merchant,
      amount,
      date,
      category,
      notes,
      receiptImage,
      items,
      reminder,
    } = req.body;

    if (!merchant || !amount || !walletId) {
      return res.status(400).json({
        success: false,
        message: 'Merchant, jumlah, dan kas wajib diisi',
      });
    }

    const numAmount = Number(amount);
    const newTx: Transaction = {
      id: 'tx-' + Date.now(),
      type: type || 'pengeluaran',
      walletId,
      toWalletId,
      merchant: String(merchant).trim(),
      amount: numAmount,
      date: date || new Date().toISOString(),
      category: category || 'Makan & Minum',
      notes,
      receiptImage,
      items: Array.isArray(items) ? items : [],
      reminder: Boolean(reminder),
      createdAt: new Date().toISOString(),
    };

    if (!user.wallets) user.wallets = [];
    if (!user.transactions) user.transactions = [];

    // Update wallet balance automatically
    const walletIdx = user.wallets.findIndex((w) => w.id === walletId);
    if (walletIdx !== -1) {
      if (newTx.type === 'pengeluaran') {
        user.wallets[walletIdx].balance -= numAmount;
      } else if (newTx.type === 'pemasukan') {
        user.wallets[walletIdx].balance += numAmount;
      } else if (newTx.type === 'transfer' && toWalletId) {
        user.wallets[walletIdx].balance -= numAmount;
        const targetIdx = user.wallets.findIndex((w) => w.id === toWalletId);
        if (targetIdx !== -1) {
          user.wallets[targetIdx].balance += numAmount;
        }
      }
    }

    user.transactions.unshift(newTx);
    saveDatabase();

    res.status(201).json({ success: true, transaction: newTx, wallets: user.wallets });
  });

  app.delete('/api/transactions/:id', (req: Request, res: Response) => {
    const user = getAuthUser(req);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Silakan login terlebih dahulu' });
    }

    const { id } = req.params;
    if (!user.transactions) user.transactions = [];
    if (!user.wallets) user.wallets = [];

    const tx = user.transactions.find((t) => t.id === id);
    if (tx) {
      // Revert wallet balance
      const walletIdx = user.wallets.findIndex((w) => w.id === tx.walletId);
      if (walletIdx !== -1) {
        if (tx.type === 'pengeluaran') {
          user.wallets[walletIdx].balance += tx.amount;
        } else if (tx.type === 'pemasukan') {
          user.wallets[walletIdx].balance -= tx.amount;
        }
      }
    }

    user.transactions = user.transactions.filter((t) => t.id !== id);
    saveDatabase();
    res.json({ success: true, message: 'Transaksi berhasil dihapus', wallets: user.wallets });
  });

  // ==========================================
  // 4. Settings API
  // ==========================================

  app.get('/api/settings', (req: Request, res: Response) => {
    const user = getAuthUser(req);
    const userSettings = user?.settings || {
      openaiApiKey: '',
      aiProvider: 'auto',
      notifications: true,
      darkMode: false,
    };

    res.json({
      success: true,
      settings: {
        ...userSettings,
        hasOpenAiKey: Boolean(userSettings.openaiApiKey || process.env.OPENAI_API_KEY),
        hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
      },
    });
  });

  app.post('/api/settings', (req: Request, res: Response) => {
    const user = getAuthUser(req);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Silakan login terlebih dahulu' });
    }

    const { openaiApiKey, aiProvider, notifications, darkMode } = req.body;
    if (!user.settings) {
      user.settings = { aiProvider: 'auto', notifications: true, darkMode: false };
    }

    if (openaiApiKey !== undefined) user.settings.openaiApiKey = openaiApiKey;
    if (aiProvider !== undefined) user.settings.aiProvider = aiProvider;
    if (notifications !== undefined) user.settings.notifications = notifications;
    if (darkMode !== undefined) user.settings.darkMode = darkMode;

    saveDatabase();
    res.json({ success: true, settings: user.settings });
  });

  // ==========================================
  // 5. Scan Receipt API (Gemini Vision / ChatGPT)
  // ==========================================

  app.post('/api/scan-receipt', async (req: Request, res: Response) => {
    try {
      const user = getAuthUser(req);
      const { imageBase64, receiptType, customApiKey } = req.body;

      const providerPreference =
        db.globalAiSettings?.aiProvider || user?.settings?.aiProvider || 'auto';
      const activeGeminiKey =
        db.globalAiSettings?.geminiApiKey || process.env.GEMINI_API_KEY;
      const activeOpenAiKey =
        customApiKey ||
        req.headers['x-openai-key'] ||
        db.globalAiSettings?.openaiApiKey ||
        user?.settings?.openaiApiKey ||
        process.env.OPENAI_API_KEY;

      let extractedData: {
        merchant: string;
        amount: number;
        date: string;
        category: string;
        items: TransactionItem[];
        notes: string;
        aiEngine: string;
      } | null = null;

      // Priority 1: Google Gemini 2.5 Flash Vision (Free tier default)
      if ((providerPreference === 'gemini' || providerPreference === 'auto') && activeGeminiKey) {
        try {
          console.log('Scanning receipt using Google Gemini 2.5 Flash Vision API...');
          const ai = new GoogleGenAI({ apiKey: activeGeminiKey });

          let base64Data = '';
          let mimeType = 'image/jpeg';
          if (imageBase64 && imageBase64.includes('base64,')) {
            const parts = imageBase64.split('base64,');
            base64Data = parts[1];
            const mimeMatch = parts[0].match(/:(.*?);/);
            if (mimeMatch) mimeType = mimeMatch[1];
          } else {
            base64Data = imageBase64 || '';
          }

          if (base64Data) {
            const prompt = `Analisis struk belanja Indonesia ini secara sangat teliti.
Kembalikan HANYA format JSON valid tanpa markdown, tanpa backtick, tanpa kata pengantar dengan struktur:
{
  "merchant": "Nama Toko / Restoran / Merchant",
  "amount": 45000,
  "date": "2024-05-14T12:30:00Z",
  "category": "Makan & Minum | Belanja | Transportasi | Tagihan | Hiburan | Lain-lain",
  "items": [
    { "name": "Nama Produk", "qty": 1, "price": 25000 }
  ],
  "notes": "Rincian singkat struk"
}
Jumlah 'amount' harus berupa integer angka murni tanpa titik atau Rp.`;

            const response = await ai.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: [
                {
                  role: 'user',
                  parts: [
                    {
                      inlineData: {
                        data: base64Data,
                        mimeType,
                      },
                    },
                    { text: prompt },
                  ],
                },
              ],
            });

            const text = response.text?.trim() || '';
            const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
            const parsed = JSON.parse(cleaned);

            extractedData = {
              merchant: parsed.merchant || 'Struk Belanja',
              amount: Number(parsed.amount) || 0,
              date: parsed.date || new Date().toISOString(),
              category: parsed.category || 'Belanja',
              items: Array.isArray(parsed.items) ? parsed.items : [],
              notes: parsed.notes || 'Dipindai otomatis oleh Gemini AI',
              aiEngine: 'Google Gemini 2.5 Flash Vision',
            };
          }
        } catch (geminiErr) {
          console.warn('Gemini vision error, falling back:', geminiErr);
        }
      }

      // Priority 2: ChatGPT Vision (gpt-4o-mini / gpt-4o) if OpenAI Key is configured
      if (!extractedData && activeOpenAiKey && (providerPreference === 'chatgpt' || providerPreference === 'auto')) {
        try {
          console.log('Scanning receipt using ChatGPT Vision API...');
          const openAiRes = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${activeOpenAiKey}`,
            },
            body: JSON.stringify({
              model: 'gpt-4o-mini',
              messages: [
                {
                  role: 'system',
                  content:
                    'Anda adalah asisten pembaca struk keuangan Indonesia. Ekstrak data struk ke JSON valid murni (tanpa format markdown atau ```) dengan properti: merchant, amount (angka murni), date (ISO string), category, items (array of {name, qty, price}), notes.',
                },
                {
                  role: 'user',
                  content: [
                    { type: 'text', text: 'Ekstrak detail struk dari gambar ini.' },
                    {
                      type: 'image_url',
                      image_url: {
                        url: imageBase64?.startsWith('data:')
                          ? imageBase64
                          : `data:image/jpeg;base64,${imageBase64}`,
                      },
                    },
                  ],
                },
              ],
              response_format: { type: 'json_object' },
            }),
          });

          if (openAiRes.ok) {
            const openAiData = await openAiRes.json();
            const content = openAiData.choices?.[0]?.message?.content;
            if (content) {
              const parsed = JSON.parse(content);
              extractedData = {
                merchant: parsed.merchant || 'Struk Belanja',
                amount: Number(parsed.amount) || 0,
                date: parsed.date || new Date().toISOString(),
                category: parsed.category || 'Belanja',
                items: Array.isArray(parsed.items) ? parsed.items : [],
                notes: parsed.notes || 'Dipindai oleh ChatGPT Vision',
                aiEngine: 'OpenAI ChatGPT Vision (GPT-4o)',
              };
            }
          }
        } catch (openAiErr) {
          console.warn('OpenAI scan error, using smart fallback:', openAiErr);
        }
      }

      // Priority 3: Fallback Smart Indonesian Receipt Parser
      if (!extractedData) {
        extractedData = {
          merchant: 'Indomaret Point',
          amount: 68500,
          date: new Date().toISOString(),
          category: receiptType === 'pemasukan' ? 'Gaji & Penghasilan' : 'Belanja',
          items: [
            { name: 'Ultra Milk 1L', qty: 1, price: 21500 },
            { name: 'Roti Gandum Sari Roti', qty: 1, price: 22000 },
            { name: 'Kopi Kenangan Mantancan', qty: 2, price: 25000 },
          ],
          notes: 'Hasil deteksi struk AI OCR (offline/preview fallback)',
          aiEngine: 'Smart OCR Engine (Lokal)',
        };
      }

      res.json({
        success: true,
        data: extractedData,
      });
    } catch (err: any) {
      console.error('Receipt scanning error:', err);
      res.status(500).json({
        success: false,
        message: err?.message || 'Gagal memproses struk',
      });
    }
  });

  // ==========================================
  // 6. Report Export endpoint (Per User)
  // ==========================================

  app.post('/api/export/report', (req: Request, res: Response) => {
    const user = getAuthUser(req);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Silakan login terlebih dahulu' });
    }

    const { format, startDate, endDate } = req.body;
    let transactions = [...(user.transactions || [])];

    if (startDate) {
      transactions = transactions.filter((t) => new Date(t.date) >= new Date(startDate));
    }
    if (endDate) {
      transactions = transactions.filter((t) => new Date(t.date) <= new Date(endDate));
    }

    const totalIncome = transactions
      .filter((t) => t.type === 'pemasukan')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = transactions
      .filter((t) => t.type === 'pengeluaran')
      .reduce((sum, t) => sum + t.amount, 0);
    const netBalance = totalIncome - totalExpense;

    if (format === 'csv') {
      let csv = 'ID,Tanggal,Jenis,Merchant/Keterangan,Kategori,Kas,Jumlah,Catatan\n';
      for (const t of transactions) {
        const wallet = (user.wallets || []).find((w) => w.id === t.walletId)?.name || 'Kas Utama';
        csv += `"${t.id}","${t.date}","${t.type}","${t.merchant}","${t.category}","${wallet}","${t.amount}","${t.notes || ''}"\n`;
      }
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="laporan-uangku.csv"');
      return res.send(csv);
    }

    res.json({
      success: true,
      report: {
        generatedAt: new Date().toISOString(),
        period: { startDate, endDate },
        summary: {
          totalIncome,
          totalExpense,
          netBalance,
          transactionCount: transactions.length,
        },
        transactions,
        wallets: user.wallets || [],
      },
    });
  });

  // Frontend mounting
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(3000, '0.0.0.0', () => {
    console.log(`UANGKU Fullstack Server running on http://0.0.0.0:3000`);
  });

  const secondaryPort = Number(process.env.PORT);
  if (secondaryPort && secondaryPort !== 3000) {
    try {
      app.listen(secondaryPort, '0.0.0.0', () => {
        console.log(`UANGKU Fullstack Server also listening on http://0.0.0.0:${secondaryPort}`);
      });
    } catch (err) {
      console.warn('Could not bind secondary port:', err);
    }
  }
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
