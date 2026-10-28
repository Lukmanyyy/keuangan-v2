/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { api, ApiError } from './services/api';
import { downloadReport } from './services/reports';
import { syncCategories, clearCategoryCache } from './data/categories';
import { isRemovedAdminUrl, publicScreenFromUrl } from './utils/navigation';
import { User, Wallet, Transaction, AppSettings, ScreenId } from './types';
import { WelcomeLoginScreen } from './components/screens/WelcomeLoginScreen';
import { DashboardScreen } from './components/screens/DashboardScreen';
import { ScanTypeModal } from './components/modals/ScanTypeModal';
import { SelectWalletModal } from './components/screens/SelectWalletModal';
import { CameraScanScreen } from './components/screens/CameraScanScreen';
import { ReviewTransactionScreen } from './components/screens/ReviewTransactionScreen';
import { SuccessSavedScreen } from './components/screens/SuccessSavedScreen';
import { TransactionListScreen } from './components/screens/TransactionListScreen';
import { AddTransactionScreen } from './components/screens/AddTransactionScreen';
import { WalletListScreen } from './components/screens/WalletListScreen';
import { AddWalletScreen } from './components/screens/AddWalletScreen';
import { StatisticsScreen } from './components/screens/StatisticsScreen';
import { ReportScreen } from './components/screens/ReportScreen';
import { ReportDownloadedScreen } from './components/screens/ReportDownloadedScreen';
import { ProfileSettingsScreen } from './components/screens/ProfileSettingsScreen';
import { AdminScreen } from './components/screens/AdminScreen';
import { LegalScreen } from './components/screens/LegalScreen';
import { BottomNav } from './components/BottomNav';
import { WebHeader } from './components/WebHeader';
import { AiSettingsModal } from './components/modals/AiSettingsModal';
import { AdminLoginModal } from './components/modals/AdminLoginModal';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAuthChecking, setIsAuthChecking] = useState<boolean>(true);
  const [isDataLoading, setIsDataLoading] = useState<boolean>(true);

  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    openaiApiKey: '',
    aiProvider: 'auto',
    notifications: true,
    darkMode: false,
  });

  // Current screen state
  const [currentScreen, setCurrentScreen] = useState<ScreenId>(() => {
    if (typeof window !== 'undefined') {
      return publicScreenFromUrl(window.location.pathname,window.location.hash);
    }
    return 'welcome';
  });

  const handleNavigate = (screen: ScreenId) => {
    if (screen === 'admin' && (!isAuthenticated || user?.role!=='admin')) return;
    setCurrentScreen(screen);
  };

  // Modals & Flows
  const [isScanTypeModalOpen, setIsScanTypeModalOpen] = useState(false);
  const [isSelectWalletModalOpen, setIsSelectWalletModalOpen] = useState(false);
  const [selectedScanType, setSelectedScanType] = useState<'pengeluaran' | 'pemasukan'>('pengeluaran');
  const [selectedScanWalletId, setSelectedScanWalletId] = useState<string>('');
  const [isAiSettingsOpen, setIsAiSettingsOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);

  // Scanned data cache for review
  const [scannedData, setScannedData] = useState<any>({
    merchant: 'Struk Belanja',
    amount: 0,
    date: new Date().toISOString(),
    category: 'Belanja',
    items: [],
    notes: 'Hasil foto struk',
    aiEngine: 'Pemindai Kamera',
  });

  const [lastSavedTransaction, setLastSavedTransaction] = useState<Transaction | null>(null);

  const [downloadedFormat, setDownloadedFormat] = useState<'pdf' | 'xlsx' | 'csv'>('pdf');

  // Load user data (wallets, transactions, settings)
  const loadUserData = useCallback(async () => {
    setIsDataLoading(true);
    try {
      const [walletsRes, txRes, settingsRes] = await Promise.all([
        api.getWallets(),
        api.getTransactions(),
        api.getSettings(),
        syncCategories(),
      ]);

      if (walletsRes.success && walletsRes.wallets) {
        setWallets(walletsRes.wallets);
        if (walletsRes.wallets.length > 0) {
          setSelectedScanWalletId(walletsRes.wallets[0].id);
        } else {
          setSelectedScanWalletId('');
        }
      } else {
        setWallets([]);
        setSelectedScanWalletId('');
      }

      if (txRes.success && txRes.transactions) {
        setTransactions(txRes.transactions);
      } else {
        setTransactions([]);
      }

      if (settingsRes.success && settingsRes.settings) {
        setSettings(settingsRes.settings);
      }
    } catch (err) {
      console.warn('Failed to load user financial data:', err);
      alert(err instanceof Error ? err.message : 'Data gagal dimuat. Coba muat ulang halaman.');
    } finally {
      setIsDataLoading(false);
    }
  }, []);

  // Only public legal screens are URL-addressable. Admin is in-app state only.
  useEffect(() => {
    const handleUrlChange = () => {
      if (typeof window !== 'undefined') {
        const path = window.location.pathname;
        const hash = window.location.hash;
        if (isRemovedAdminUrl(path,hash)) {
          window.history.replaceState({},'', '/');
          setCurrentScreen(current=>current==='welcome'?'welcome':'dashboard');
        } else {
          const target = publicScreenFromUrl(path,hash);
          if (target!=='welcome') setCurrentScreen(target);
        }
      }
    };

    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);
    handleUrlChange();
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, []);

  // Check auth session on startup
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await api.getMe();
        if (res.success && res.user) {
          setUser(res.user);
          setIsAuthenticated(true);
          setCurrentScreen(current=>current==='privacy'||current==='terms'?current:'dashboard');
          await loadUserData();
        } else {
          setUser(null);
          setIsAuthenticated(false);
          setCurrentScreen(current=>current==='privacy'||current==='terms'?current:'welcome');
        }
      } catch (error) {
        if (!(error instanceof ApiError && error.status === 401)) {
          alert(error instanceof Error ? error.message : 'Koneksi server gagal');
        }
        setUser(null);
        setIsAuthenticated(false);
        setCurrentScreen(current=>current==='privacy'||current==='terms'?current:'welcome');
      } finally {
        setIsAuthChecking(false);
      }
    };

    checkAuth();
  }, [loadUserData]);

  // Handle successful login or register
  const handleLoginSuccess = async (loggedInUser: User) => {
    setUser(loggedInUser);
    setIsAuthenticated(true);
    await loadUserData();
    setCurrentScreen('dashboard');
  };

  const handleAdminShortcut = () => {
    if(isAuthenticated && user?.role==='admin') setCurrentScreen('admin');
    else setIsAdminLoginOpen(true);
  };

  const handleAdminLoginSuccess = async (admin:User) => {
    if(admin.role!=='admin')throw new Error('Akses khusus administrator.');
    setWallets([]);setTransactions([]);clearCategoryCache();setScannedData({});
    setUser(admin);setIsAuthenticated(true);
    await loadUserData();
    setIsAdminLoginOpen(false);
    setCurrentScreen('admin');
  };

  // Handle logout
  const handleLogout = async () => {
    try { await api.logout(); } catch (error) { alert(error instanceof Error ? error.message : 'Logout gagal'); return; }
    clearCategoryCache();
    setIsAdminLoginOpen(false);
    setScannedData({});
    setUser(null);
    setWallets([]);
    setTransactions([]);
    setIsAuthenticated(false);
    setCurrentScreen('welcome');
  };

  // Handlers for Scan Flow
  const handleStartScanFlow = () => {
    if (wallets.length === 0) {
      alert('Silakan buat kas atau dompet terlebih dahulu sebelum melakukan scan struk.');
      setCurrentScreen('add_wallet');
      return;
    }
    setIsScanTypeModalOpen(true);
  };

  const handleSelectScanType = (type: 'pengeluaran' | 'pemasukan') => {
    setSelectedScanType(type);
    setIsScanTypeModalOpen(false);
    setIsSelectWalletModalOpen(true);
  };

  const handleProceedToCamera = () => {
    setIsSelectWalletModalOpen(false);
    setCurrentScreen('scan_camera');
  };

  const handleScanComplete = (extracted: any) => {
    setScannedData({ ...extracted, type: selectedScanType });
    setCurrentScreen('scan_review');
  };

  const handleSaveScannedTransaction = async (data: any) => {
    const targetWalletId = data.walletId || selectedScanWalletId || (wallets[0]?.id || '');
    if (!targetWalletId) {
      alert('Pilih kas atau dompet terlebih dahulu');
      return;
    }

    try {
      const res = await api.createTransaction({
        type: data.type || selectedScanType,
        walletId: targetWalletId,
        merchant: data.merchant,
        amount: data.amount,
        date: data.date,
        category: data.category,
        notes: data.notes,
        items: data.items,
        receiptImage: settings.hasReceiptStorage ? scannedData.imageDataUrl : undefined,
      });

      if (res.success) {
        setLastSavedTransaction(res.transaction);
        if (res.wallets) setWallets(res.wallets);
        setTransactions((prev) => [res.transaction, ...prev]);
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Transaksi gagal disimpan');
      return;
    }

    setCurrentScreen('scan_success');
  };

  const handleSaveManualTransaction = async (data: any) => {
    try {
      const res = await api.createTransaction(data);
      if (res.success) {
        setLastSavedTransaction(res.transaction);
        if (res.wallets) setWallets(res.wallets);
        setTransactions((prev) => [res.transaction, ...prev]);
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Transaksi gagal disimpan');
      return;
    }

    setCurrentScreen('scan_success');
  };

  const handleCreateWallet = async (newW: any) => {
    try {
      const res = await api.createWallet(newW);
      if (res.success) {
        setWallets((prev) => [...prev, res.wallet]);
        if (!selectedScanWalletId) {
          setSelectedScanWalletId(res.wallet.id);
        }
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Kas gagal disimpan');
      return;
    }
    setCurrentScreen('wallets');
  };

  const handleDeleteWallet = async (id: string) => {
    try {
      const res = await api.deleteWallet(id);
      let updatedList: Wallet[] = [];
      if (res.success && res.wallets) {
        updatedList = res.wallets;
      } else {
        updatedList = wallets.filter((w) => w.id !== id);
      }
      setWallets(updatedList);

      if (selectedScanWalletId === id) {
        setSelectedScanWalletId(updatedList[0]?.id || '');
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Kas gagal dihapus');
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    try {
      const res = await api.deleteTransaction(id);
      setTransactions((prev) => prev.filter((t) => t.id !== id));
      if (res.wallets) setWallets(res.wallets);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Transaksi gagal dihapus');
    }
  };

  const handleTriggerDownload = async (format: 'pdf' | 'xlsx' | 'csv', rows: Transaction[] = transactions) => {
    try {
      await downloadReport(format, rows, wallets);
      setDownloadedFormat(format);
      setCurrentScreen('report_downloaded');
    } catch (error) { alert(error instanceof Error ? error.message : 'Unduhan gagal'); }
  };

  const handleUpdateProfile = async (name: string, email: string) => {
    try {
      const res = await api.updateProfile(name, email);
      if (res.success && res.user) {
        setUser(res.user);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Profil gagal disimpan');
    }
  };

  // If checking session, show splash screen
  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 animate-pulse mb-3">
          <span className="font-extrabold text-xl">U</span>
        </div>
        <p className="text-xs font-bold text-slate-600 tracking-wide">Memuat UANGKU...</p>
      </div>
    );
  }

  // The server verifies the session and role on EVERY admin API request.
  if (currentScreen === 'admin' && isAuthenticated && user?.role==='admin') {
    return (
      <AdminScreen
        onBack={() => handleNavigate(isAuthenticated ? 'dashboard' : 'welcome')}
      />
    );
  }

  // Not authenticated: always show Welcome/Login Screen
  if (currentScreen === 'privacy' || currentScreen === 'terms') {
    return <LegalScreen type={currentScreen} onBack={() => setCurrentScreen(isAuthenticated ? 'dashboard' : 'welcome')} />;
  }
  if (!isAuthenticated || !user || currentScreen === 'welcome') {
    return (
      <>
        <WelcomeLoginScreen onLoginSuccess={handleLoginSuccess} onSecretAdminTrigger={handleAdminShortcut} />
        {isAdminLoginOpen&&<AdminLoginModal onClose={()=>setIsAdminLoginOpen(false)} onSuccess={handleAdminLoginSuccess}/>}
      </>
    );
  }

  const activeUser = user;

  const shouldShowBottomNav =
    currentScreen !== 'scan_camera' &&
    currentScreen !== 'scan_review' &&
    currentScreen !== 'scan_success' &&
    currentScreen !== 'add_transaction' &&
    currentScreen !== 'add_wallet' &&
    currentScreen !== 'report_downloaded';

  const showWebHeader = currentScreen !== 'scan_camera';

  const activeWallet = wallets.find((w) => w.id === (lastSavedTransaction?.walletId || ''));

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col w-full text-slate-800 selection:bg-indigo-500 selection:text-white">
      {/* Responsive Top Navigation Header (Desktop navbar + Mobile brand header) */}
      {showWebHeader && (
        <WebHeader
          currentScreen={currentScreen}
          user={activeUser}
          onNavigate={(s) => handleNavigate(s)}
          onOpenScanModal={handleStartScanFlow}
          onOpenAddModal={() => handleNavigate('add_transaction')}
          onOpenAiSettings={() => setIsAiSettingsOpen(true)}
          onLogout={handleLogout}
          onSecretAdminTrigger={handleAdminShortcut}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentScreen}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="w-full"
          >
            {currentScreen === 'dashboard' && (
              <DashboardScreen
                user={activeUser}
                wallets={wallets}
                transactions={transactions}
                isLoading={isDataLoading}
                onNavigate={(s) => handleNavigate(s)}
                onOpenScanModal={handleStartScanFlow}
                onOpenAddModal={() => handleNavigate('add_transaction')}
                onOpenAiSettings={() => setIsAiSettingsOpen(true)}
              />
            )}

            {currentScreen === 'transactions' && (
              <TransactionListScreen
                transactions={transactions}
                wallets={wallets}
                isLoading={isDataLoading}
                onNavigate={(s) => handleNavigate(s)}
                onDeleteTransaction={handleDeleteTransaction}
                onOpenScanModal={handleStartScanFlow}
                onOpenAddModal={() => handleNavigate('add_transaction')}
              />
            )}

            {currentScreen === 'wallets' && (
              <WalletListScreen
                wallets={wallets}
                onNavigate={(s) => handleNavigate(s)}
                onDeleteWallet={handleDeleteWallet}
                onAddWallet={() => handleNavigate('add_wallet')}
              />
            )}

            {currentScreen === 'statistics' && (
              <StatisticsScreen
                transactions={transactions}
                onNavigate={(s) => handleNavigate(s)}
              />
            )}

            {currentScreen === 'reports' && (
              <ReportScreen
                transactions={transactions}
                wallets={wallets}
                onNavigate={(s) => handleNavigate(s)}
                onDownloadReport={handleTriggerDownload}
              />
            )}

            {currentScreen === 'profile' && (
              <ProfileSettingsScreen
                user={activeUser}
                settings={settings}
                onSaveSettings={async (newSettings) => {
                  try { const res = await api.updateSettings(newSettings); setSettings(res.settings); }
                  catch (error) { alert(error instanceof Error ? error.message : 'Pengaturan gagal disimpan'); }
                }}
                onNavigate={(s) => handleNavigate(s)}
                onOpenAiSettings={() => setIsAiSettingsOpen(true)}
                onUpdateUser={handleUpdateProfile}
                onResetDemoData={async () => {
                  alert('Data tersimpan di D1. Hapus transaksi satu per satu; reset data palsu telah dinonaktifkan.');
                }}
                onLogout={handleLogout}
              />
            )}

            {currentScreen === 'add_transaction' && (
              <AddTransactionScreen
                wallets={wallets}
                onBack={() => setCurrentScreen('dashboard')}
                onSave={handleSaveManualTransaction}
                onNavigateToAddWallet={() => setCurrentScreen('add_wallet')}
              />
            )}

            {currentScreen === 'add_wallet' && (
              <AddWalletScreen
                onBack={() => setCurrentScreen('wallets')}
                onSave={handleCreateWallet}
              />
            )}

            {currentScreen === 'scan_camera' && (
              <CameraScanScreen
                receiptType={selectedScanType}
                onClose={() => setCurrentScreen('dashboard')}
                onScanComplete={handleScanComplete}
              />
            )}

            {currentScreen === 'scan_review' && (
              <ReviewTransactionScreen
                initialData={scannedData}
                wallets={wallets}
                defaultWalletId={selectedScanWalletId || wallets[0]?.id || ''}
                onBack={() => setCurrentScreen('scan_camera')}
                onSave={handleSaveScannedTransaction}
              />
            )}

            {currentScreen === 'scan_success' && (
              <SuccessSavedScreen
                transaction={lastSavedTransaction}
                walletName={activeWallet?.name || 'Kas'}
                onGoHome={() => setCurrentScreen('dashboard')}
                onViewList={() => setCurrentScreen('transactions')}
                onScanAnother={handleStartScanFlow}
              />
            )}

            {currentScreen === 'report_downloaded' && (
              <ReportDownloadedScreen
                format={downloadedFormat.toUpperCase()}
                onOpenFile={() => setCurrentScreen('reports')}
                onBack={() => setCurrentScreen('dashboard')}
                onShare={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: 'UANGKU',
                      text: 'Aplikasi pencatatan keuangan UANGKU',
                      url: window.location.href,
                    }).catch(() => {});
                  } else {
                    navigator.clipboard.writeText(window.location.origin).then(()=>alert('Tautan aplikasi disalin')).catch(()=>alert('Tidak dapat menyalin tautan'));
                  }
                }}
                onCreateAnother={() => setCurrentScreen('reports')}
              />
            )}

          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile Bottom Navigation Bar (Hidden on desktop) */}
      {shouldShowBottomNav && (
        <div className="pb-20 md:pb-6">
          <BottomNav
            currentScreen={currentScreen}
            onNavigate={(s) => handleNavigate(s)}
            onOpenQuickAdd={() => handleNavigate('add_transaction')}
          />
        </div>
      )}

      {/* Modals */}
      <ScanTypeModal
        isOpen={isScanTypeModalOpen}
        onClose={() => setIsScanTypeModalOpen(false)}
        onSelectType={handleSelectScanType}
      />

      <SelectWalletModal
        isOpen={isSelectWalletModalOpen}
        wallets={wallets}
        selectedWalletId={selectedScanWalletId}
        onClose={() => setIsSelectWalletModalOpen(false)}
        onSelectWallet={(id) => setSelectedScanWalletId(id)}
        onProceed={handleProceedToCamera}
        onNavigateToAddWallet={() => {
          setIsSelectWalletModalOpen(false);
          setCurrentScreen('add_wallet');
        }}
      />

      <AiSettingsModal
        isOpen={isAiSettingsOpen}
        onClose={() => setIsAiSettingsOpen(false)}
        settings={settings}
        onSave={async (newSettings: Partial<AppSettings>) => {
          const res = await api.updateSettings(newSettings);
          setSettings(res.settings);
        }}
      />

      {isAdminLoginOpen&&<AdminLoginModal onClose={()=>setIsAdminLoginOpen(false)} onSuccess={handleAdminLoginSuccess}/>}

    </div>
  );
}
