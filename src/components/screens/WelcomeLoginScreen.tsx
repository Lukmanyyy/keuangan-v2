import React, { useState, useEffect } from 'react';
import {
  Wallet,
  ArrowRight,
  Mail,
  Lock,
  User as UserIcon,
  AlertCircle,
  Eye,
  EyeOff,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Camera,
  Layers,
  BarChart3,
  CheckCircle2,
  Receipt,
  CreditCard,
  Sparkles,
} from 'lucide-react';
import { api } from '../../services/api';
import { User } from '../../types';
import { Wallet3DIllustration } from '../Wallet3DIllustration';
import { motion, AnimatePresence } from 'motion/react';

interface WelcomeLoginScreenProps {
  onLoginSuccess: (user: User, token?: string) => void;
  onSecretAdminTrigger?: () => void;
}

export const WelcomeLoginScreen: React.FC<WelcomeLoginScreenProps> = ({
  onLoginSuccess,
  onSecretAdminTrigger,
}) => {
  // Starts with 'onboarding', clicking 'Mulai Sekarang' switches to 'auth'
  const [viewMode, setViewMode] = useState<'onboarding' | 'auth'>('onboarding');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  
  // Secret 10-click trigger for admin
  const [logoClicks, setLogoClicks] = useState(0);
  const logoTimerRef = React.useRef<any>(null);

  const handleLogoSecretClick = () => {
    const next = logoClicks + 1;
    setLogoClicks(next);
    if (logoTimerRef.current) clearTimeout(logoTimerRef.current);

    if (next >= 10) {
      setLogoClicks(0);
      if (onSecretAdminTrigger) {
        onSecretAdminTrigger();
      }
    } else {
      logoTimerRef.current = setTimeout(() => {
        setLogoClicks(0);
      }, 3500);
    }
  };
  
  // Onboarding Carousel State
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const [name, setName] = useState('');
  const [identifier, setIdentifier] = useState(''); // Email or Username for login
  const [email, setEmail] = useState(''); // Dedicated email for registration
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isUserNotFound, setIsUserNotFound] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // 4 Onboarding Slides
  const slides = [
    {
      id: 0,
      title: 'Kelola Keuanganmu dengan Lebih Bijak',
      desc: 'Catat, pantau, dan capai tujuan finansialmu dengan mudah, transparan, dan teratur.',
      renderVisual: () => (
        <div className="w-full flex items-center justify-center py-2">
          <Wallet3DIllustration className="w-52 h-52 sm:w-60 sm:h-60" />
        </div>
      ),
    },
    {
      id: 1,
      title: 'Pindai Struk Belanja Seketika',
      desc: 'Cukup foto struk belanja dengan kamera, total dan rincian barang otomatis tercatat tanpa perlu ketik manual.',
      renderVisual: () => (
        <div className="w-full flex items-center justify-center py-4">
          <div className="relative w-56 h-52 rounded-2xl bg-gradient-to-b from-indigo-900 to-slate-900 p-4 border border-indigo-500/30 shadow-xl flex flex-col justify-between overflow-hidden">
            {/* Camera Viewfinder Corners */}
            <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-indigo-400"></div>
            <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-indigo-400"></div>
            <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-indigo-400"></div>
            <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-indigo-400"></div>

            {/* Glowing Scan Laser */}
            <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent top-1/2 -translate-y-1/2 animate-pulse shadow-lg shadow-cyan-400"></div>

            {/* Simulated Receipt inside Viewfinder */}
            <div className="bg-white rounded-xl p-3 shadow-md border border-slate-100 flex flex-col gap-1.5 z-10 text-left">
              <div className="flex items-center justify-between border-b border-slate-100 pb-1">
                <div className="flex items-center gap-1.5">
                  <Receipt className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="text-[10px] font-bold text-slate-800">Supermarket Kasih</span>
                </div>
                <span className="text-[9px] text-slate-400">14:20</span>
              </div>
              <div className="space-y-1 py-1">
                <div className="flex justify-between text-[9px] text-slate-600">
                  <span>Susu UHT 1L</span>
                  <span className="font-mono">Rp 19.500</span>
                </div>
                <div className="flex justify-between text-[9px] text-slate-600">
                  <span>Roti Gandum</span>
                  <span className="font-mono">Rp 16.000</span>
                </div>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-dashed border-slate-200">
                <span className="text-[10px] font-extrabold text-indigo-900">Total</span>
                <span className="text-[11px] font-bold font-mono text-emerald-600">Rp 35.500</span>
              </div>
            </div>

            {/* Bottom Status Tag */}
            <div className="flex items-center justify-center gap-1.5 bg-indigo-600/60 backdrop-blur-md rounded-lg py-1 px-2.5 text-white text-[10px] font-semibold z-10">
              <Camera className="w-3 h-3 text-cyan-300" />
              <span>Otomatis Deteksi & Simpan</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 2,
      title: 'Multi Kas & Dompet Fleksibel',
      desc: 'Kelola kas tunai, rekening bank, hingga e-wallet secara terpisah dengan saldo yang selalu akurat.',
      renderVisual: () => (
        <div className="w-full flex items-center justify-center py-4">
          <div className="w-60 space-y-2">
            {/* Card 1: Bank BCA */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl p-3 shadow-md flex items-center justify-between transform -rotate-1 hover:rotate-0 transition-transform">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-white" />
                </div>
                <div className="text-left">
                  <div className="text-[10px] font-semibold text-blue-100">Rekening Utama</div>
                  <div className="text-xs font-bold font-mono">BCA Digital</div>
                </div>
              </div>
              <span className="text-[9px] bg-white/20 px-2 py-0.5 rounded-full font-mono">Utama</span>
            </div>

            {/* Card 2: Kas Tunai */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-xl p-3 shadow-md flex items-center justify-between transform rotate-1 hover:rotate-0 transition-transform">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
                  <Wallet className="w-4 h-4 text-white" />
                </div>
                <div className="text-left">
                  <div className="text-[10px] font-semibold text-emerald-100">Uang Dompet</div>
                  <div className="text-xs font-bold font-mono">Kas Tunai Harian</div>
                </div>
              </div>
              <span className="text-[9px] bg-white/20 px-2 py-0.5 rounded-full font-mono">Tunai</span>
            </div>

            {/* Card 3: E-Wallet */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl p-3 shadow-md flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
                  <Layers className="w-4 h-4 text-white" />
                </div>
                <div className="text-left">
                  <div className="text-[10px] font-semibold text-purple-100">Dompet Digital</div>
                  <div className="text-xs font-bold font-mono">GoPay / QRIS</div>
                </div>
              </div>
              <span className="text-[9px] bg-white/20 px-2 py-0.5 rounded-full font-mono">E-Wallet</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 3,
      title: 'Laporan Finansial Rapi & Jernih',
      desc: 'Pantau grafik arus kas bulanan dan ekspor ringkasan pengeluaran Anda kapan saja dengan mudah.',
      renderVisual: () => (
        <div className="w-full flex items-center justify-center py-4">
          <div className="w-60 bg-white rounded-2xl border border-slate-200/90 p-4 shadow-lg text-left space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <BarChart3 className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-slate-800">Arus Keuangan</span>
              </div>
              <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                Surplus +24%
              </span>
            </div>

            {/* Animated Mini Bars */}
            <div className="flex items-end justify-between gap-2 h-20 pt-2 px-1">
              <div className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full bg-indigo-200 rounded-t-md h-10 transition-all"></div>
                <span className="text-[9px] text-slate-400 font-mono">Sen</span>
              </div>
              <div className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full bg-indigo-300 rounded-t-md h-14 transition-all"></div>
                <span className="text-[9px] text-slate-400 font-mono">Sel</span>
              </div>
              <div className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full bg-indigo-400 rounded-t-md h-8 transition-all"></div>
                <span className="text-[9px] text-slate-400 font-mono">Rab</span>
              </div>
              <div className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full bg-indigo-500 rounded-t-md h-16 transition-all"></div>
                <span className="text-[9px] text-slate-400 font-mono">Kam</span>
              </div>
              <div className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full bg-indigo-600 rounded-t-md h-20 transition-all shadow-xs"></div>
                <span className="text-[9px] text-slate-800 font-bold font-mono">Jum</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px]">
              <span className="text-slate-500 font-medium">Laporan Bulanan</span>
              <span className="text-indigo-600 font-bold hover:underline">Lihat Rincian &rarr;</span>
            </div>
          </div>
        </div>
      ),
    },
  ];

  // Auto-Slide interval (every 2.5 seconds, snappy & engaging)
  useEffect(() => {
    if (viewMode !== 'onboarding' || isPaused) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 2500);

    return () => clearInterval(timer);
  }, [viewMode, isPaused, slides.length]);

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsUserNotFound(false);
    setSuccessMsg('');

    if (authMode === 'register') {
      if (!name.trim()) {
        setErrorMsg('Nama lengkap wajib diisi');
        return;
      }
      if (!email.trim()) {
        setErrorMsg('Alamat email wajib diisi');
        return;
      }
      if (password.length < 10 || password.length > 128) {
        setErrorMsg('Kata sandi harus 10–128 karakter');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('Konfirmasi kata sandi tidak cocok');
        return;
      }

      setLoading(true);
      try {
        const res = await api.register(name.trim(), email.trim(), password);
        setLoading(false);
        if (res.success && res.user) {
          onLoginSuccess(res.user);
        } else {
          setErrorMsg(res.message || 'Gagal mendaftarkan akun. Silakan coba lagi.');
        }
      } catch (err: any) {
        setLoading(false);
        setErrorMsg(err?.message || 'Terjadi kesalahan jaringan.');
      }
    } else {
      // Login mode - supports email or username
      if (!identifier.trim() || !password.trim()) {
        setErrorMsg('Email atau nama pengguna serta kata sandi wajib diisi');
        return;
      }

      setLoading(true);
      try {
        const res = await api.login(identifier.trim(), password);
        setLoading(false);
        if (res.success && res.user) {
          onLoginSuccess(res.user);
        } else {
          const msg = res.message || 'Email/nama pengguna atau kata sandi tidak cocok.';
          setErrorMsg(msg);
          if (
            msg.toLowerCase().includes('tidak ditemukan') ||
            msg.toLowerCase().includes('buat akun')
          ) {
            setIsUserNotFound(true);
          }
        }
      } catch (err: any) {
        setLoading(false);
        setErrorMsg(err?.message || 'Terjadi kesalahan jaringan.');
      }
    }
  };

  const googleButtonRef = React.useRef<HTMLDivElement>(null);
  const [googleStatus, setGoogleStatus] = useState('Memuat login Google…');
  const loginCallbackRef = React.useRef(onLoginSuccess);
  loginCallbackRef.current = onLoginSuccess;
  useEffect(() => {
    if (viewMode !== 'auth') return;
    let cancelled = false;
    let timer: ReturnType<typeof setInterval> | undefined;
    api.getConfig().then(config => {
      if (cancelled) return;
      if (!config.googleClientId) { setGoogleStatus('Login Google belum dikonfigurasi. Gunakan email dan kata sandi.'); return; }
      let attempts = 0;
      const render = () => {
        const identity = (window as any).google?.accounts?.id;
        if (!identity || !googleButtonRef.current) {
          if (++attempts >= 40) { clearInterval(timer); setGoogleStatus('Google tidak dapat dimuat. Periksa koneksi atau gunakan login email.'); }
          return;
        }
        clearInterval(timer);
        identity.initialize({client_id:config.googleClientId,callback:async (result:{credential:string}) => {
          if (cancelled) return;
          setLoading(true);setErrorMsg('');
          try { const res=await api.loginGoogle(result.credential); loginCallbackRef.current(res.user); }
          catch(e) { setErrorMsg(e instanceof Error?e.message:'Login Google gagal'); }
          finally { setLoading(false); }
        }});
        identity.renderButton(googleButtonRef.current,{theme:'outline',size:'large',text:'signin_with',width:300});
        setGoogleStatus('');
      };
      timer = setInterval(render,250); render();
    }).catch(()=>{if(!cancelled)setGoogleStatus('Konfigurasi Google tidak dapat dimuat.');});
    return () => { cancelled=true;clearInterval(timer); };
  },[viewMode]);

  const activeSlideData = slides[currentSlide];

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50/70 via-white to-slate-50 flex flex-col justify-center items-center py-6 sm:py-12 px-4 text-slate-800">
      {/* ========================================================
          1. ONBOARDING SCREEN (4-Slide Auto Carousel)
          Tampil pertama kali saat baru buka website / belum login
          ======================================================== */}
      {viewMode === 'onboarding' ? (
        <div
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          className="w-full max-w-sm sm:max-w-md bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/60 p-6 sm:p-8 flex flex-col items-center text-center relative transition-all"
        >
          {/* Brand Header (Secret 10-Click Admin Trigger) */}
          <div
            onClick={handleLogoSecretClick}
            className="flex items-center gap-2 mb-1 cursor-pointer select-none"
            title="UANGKU"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/25">
              <Wallet className="w-5 h-5 stroke-[2.2]" />
            </div>
            <span className="font-extrabold text-base tracking-wider text-slate-900 uppercase">
              UANGKU
            </span>
          </div>

          {/* Carousel Visual Container with Prev/Next subtle controls */}
          <div className="relative w-full my-2 min-h-[220px] flex items-center justify-center overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, scale: 0.95, x: 20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95, x: -20 }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                className="w-full flex items-center justify-center"
              >
                {activeSlideData.renderVisual()}
              </motion.div>
            </AnimatePresence>

            {/* Prev slide button */}
            <button
              onClick={handlePrevSlide}
              className="absolute left-0 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/85 hover:bg-white active:scale-90 text-slate-600 shadow-sm border border-slate-200/60 flex items-center justify-center opacity-50 hover:opacity-100 transition-all cursor-pointer z-20"
              aria-label="Slide sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Next slide button */}
            <button
              onClick={handleNextSlide}
              className="absolute right-0 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/85 hover:bg-white active:scale-90 text-slate-600 shadow-sm border border-slate-200/60 flex items-center justify-center opacity-50 hover:opacity-100 transition-all cursor-pointer z-20"
              aria-label="Slide berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Dynamic Heading & Subheading with Smooth Motion */}
          <div className="min-h-[90px] flex flex-col justify-center overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
              >
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight leading-snug px-2">
                  {activeSlideData.title}
                </h1>
                <p className="text-xs text-slate-500 mt-2 max-w-xs mx-auto leading-relaxed px-2">
                  {activeSlideData.desc}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* 4 Interactive Auto-sliding Pagination Dots */}
          <div className="flex items-center justify-center gap-2 my-5">
            {slides.map((slide, idx) => {
              const isActive = idx === currentSlide;
              return (
                <button
                  key={slide.id}
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                    isActive
                      ? 'w-7 bg-indigo-600 shadow-xs shadow-indigo-600/40'
                      : 'w-2.5 bg-slate-200 hover:bg-slate-300'
                  }`}
                  aria-label={`Pindah ke slide ${idx + 1}`}
                />
              );
            })}
          </div>

          {/* Mulai Sekarang Button (Transitions to Login/Register) */}
          <button
            onClick={() => setViewMode('auth')}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer group"
          >
            <span>Mulai Sekarang</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5] group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      ) : (
        /* ========================================================
            2. AUTHENTICATION SCREEN (Login & Register Form)
            Tampil setelah klik "Mulai Sekarang"
            ======================================================== */
        <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/60 p-6 sm:p-8 transition-all animate-fadeIn">
          {/* Top Return to Intro button (Removed "Akun Asli" label as requested) */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <button
              onClick={() => setViewMode('onboarding')}
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Kembali</span>
            </button>

            <div
              onClick={handleLogoSecretClick}
              className="flex items-center gap-2 cursor-pointer select-none"
              title="UANGKU"
            >
              <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                <Wallet className="w-4 h-4 stroke-[2.2]" />
              </div>
              <span className="font-extrabold text-sm text-slate-900 tracking-wider uppercase">
                UANGKU
              </span>
            </div>

            <div className="w-14"></div>
          </div>

          {/* Auth Mode Toggle Tabs */}
          <div className="grid grid-cols-2 gap-1 bg-slate-100/80 p-1.5 rounded-2xl mb-5">
            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setErrorMsg('');
                setIsUserNotFound(false);
              }}
              className={`py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                authMode === 'login'
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Masuk
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('register');
                setErrorMsg('');
                setIsUserNotFound(false);
              }}
              className={`py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                authMode === 'register'
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Daftar Akun Baru
            </button>
          </div>

          {/* Form Header */}
          <div className="mb-4">
            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
              {authMode === 'login' ? 'Masuk ke Akun Anda' : 'Buat Akun Pribadi Anda'}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {authMode === 'login'
                ? 'Kelola kas, dompet, dan catat transaksi keuangan Anda.'
                : 'Daftarkan akun Anda untuk mulai mengelola keuangan.'}
            </p>
          </div>

          {/* Notification Alerts */}
          {errorMsg && (
            <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex flex-col gap-2 font-medium">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMsg}</span>
              </div>
              {isUserNotFound && authMode === 'login' && (
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('register');
                    setErrorMsg('');
                    setIsUserNotFound(false);
                  }}
                  className="self-start text-[11px] font-bold text-indigo-600 hover:text-indigo-800 underline pl-6 cursor-pointer"
                >
                  &rarr; Klik di sini untuk Buat Akun Baru
                </button>
              )}
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2 font-medium">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {authMode === 'register' ? (
              <>
                {/* Nama Lengkap */}
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Nama Lengkap
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Contoh: Budi Santoso"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Email Pendaftaran */}
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Alamat Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nama@email.com"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                      required
                    />
                  </div>
                </div>
              </>
            ) : (
              /* Input Login: Mendukung Email atau Username */
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Email atau Nama Pengguna
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => {
                      setIdentifier(e.target.value);
                      if (isUserNotFound) setIsUserNotFound(false);
                    }}
                    placeholder="Masukkan email atau username"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                    required
                  />
                </div>
              </div>
            )}

            {/* Kata Sandi */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-slate-700">
                  Kata Sandi
                </label>
                {authMode === 'login' && (
                  <button
                    type="button"
                    onClick={() =>
                      alert('Untuk reset kata sandi, hubungi admin atau daftar akun baru dengan email lain.')
                    }
                    className="text-[10px] text-indigo-600 hover:underline cursor-pointer"
                  >
                    Lupa sandi?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimal 10 karakter"
                    maxLength={128}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Konfirmasi Kata Sandi untuk Register */}
            {authMode === 'register' && (
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Konfirmasi Kata Sandi
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ulangi kata sandi"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                    required
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 active:scale-98 text-white rounded-2xl text-xs font-bold transition-all shadow-md shadow-indigo-500/25 cursor-pointer disabled:opacity-50 mt-2 flex items-center justify-center gap-2"
            >
              <span>
                {loading
                  ? 'Memproses...'
                  : authMode === 'register'
                  ? 'Daftar Akun & Mulai'
                  : 'Masuk ke UANGKU'}
              </span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-4">
            <div className="flex-1 border-t border-slate-200"></div>
            <span className="px-3 text-[11px] text-slate-400 font-medium">atau</span>
            <div className="flex-1 border-t border-slate-200"></div>
          </div>

          {/* Google Quick Sign-In */}
          <div ref={googleButtonRef} className="flex justify-center" />
          {googleStatus && <p className="text-xs text-center text-slate-500">{googleStatus}</p>}

          {/* Toggle Switch */}
          <div className="text-center pt-4">
            {authMode === 'login' ? (
              <p className="text-xs text-slate-500">
                Belum punya akun?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('register');
                    setErrorMsg('');
                    setIsUserNotFound(false);
                  }}
                  className="text-indigo-600 font-bold hover:underline cursor-pointer"
                >
                  Daftar sekarang gratis
                </button>
              </p>
            ) : (
              <p className="text-xs text-slate-500">
                Sudah punya akun?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setErrorMsg('');
                    setIsUserNotFound(false);
                  }}
                  className="text-indigo-600 font-bold hover:underline cursor-pointer"
                >
                  Masuk di sini
                </button>
              </p>
            )}
          </div>

          {/* Legal Links for Google OAuth Compliance */}
          <div className="flex items-center justify-center gap-4 mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-400">
            <a href="/privacy" className="hover:text-indigo-600 transition-colors">
              Kebijakan Privasi
            </a>
            <span>•</span>
            <a href="/terms" className="hover:text-indigo-600 transition-colors">
              Ketentuan Layanan
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
