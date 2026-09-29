import React, { useState, useMemo, useEffect } from 'react';
import {
  Sparkles,
  Crown,
  Gift,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ArrowRight,
  Star,
  Coffee,
  Percent,
  Calendar,
  CreditCard,
  Phone,
  Mail,
  Lock,
  User,
  LogOut,
  X,
  ExternalLink,
  Zap,
  ShoppingBag,
  Award,
  Layers,
  Flame,
  Check,
  Smartphone,
  Eye,
  EyeOff,
  Store,
  FileSpreadsheet,
  RefreshCw,
} from 'lucide-react';
import { Customer, StoreSettings, VoucherPromo } from '../types';
import { api } from '../services/api';
import { formatRupiah } from '../utils/format';
import {
  initGoogleAuth,
  signInWithGoogle,
  getGoogleAccessToken,
  appendMemberToGoogleSheet,
  getSavedSpreadsheetId,
  getOrCreateMemberSpreadsheet,
} from '../services/googleSheets';
import { GoogleSignInButton, GoogleSheetsSyncCard } from './GoogleSheetsSyncCard';
import { User as FirebaseUser } from 'firebase/auth';

interface MemberLandingPageProps {
  settings: StoreSettings;
  customers: Customer[];
  vouchers: VoucherPromo[];
  onOpenPos: () => void;
  onCustomerRegistered?: (newCustomer: Customer) => void;
}

export const MemberLandingPage: React.FC<MemberLandingPageProps> = ({
  settings,
  customers,
  vouchers,
  onOpenPos,
  onCustomerRegistered,
}) => {
  // Member authentication state
  const [activeMember, setActiveMember] = useState<Customer | null>(() => {
    try {
      const saved = localStorage.getItem('kasirku_active_member');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Modals state
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup' | null>(null);
  const [showMemberCardModal, setShowMemberCardModal] = useState<boolean>(false);
  const [memberTransactions, setMemberTransactions] = useState<any[]>([]);

  // Sign In form inputs
  const [signInIdentifier, setSignInIdentifier] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [showSignInPass, setShowSignInPass] = useState(false);
  const [signInLoading, setSignInLoading] = useState(false);
  const [signInError, setSignInError] = useState<string | null>(null);

  // Sign Up form inputs
  const [signUpName, setSignUpName] = useState('');
  const [signUpPhone, setSignUpPhone] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpFavCategory, setSignUpFavCategory] = useState('Coffee');
  const [showSignUpPass, setShowSignUpPass] = useState(false);
  const [signUpLoading, setSignUpLoading] = useState(false);
  const [signUpError, setSignUpError] = useState<string | null>(null);
  const [signUpSuccessMsg, setSignUpSuccessMsg] = useState<string | null>(null);

  // Google Sheets Integration State
  const [googleUser, setGoogleUser] = useState<FirebaseUser | null>(null);
  const [googleToken, setGoogleToken] = useState<string | null>(getGoogleAccessToken());
  const [spreadsheetUrl, setSpreadsheetUrl] = useState<string | null>(() => {
    const saved = getSavedSpreadsheetId();
    return saved ? `https://docs.google.com/spreadsheets/d/${saved}/edit` : null;
  });
  const [isQuickGoogleSigningUp, setIsQuickGoogleSigningUp] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);

  // Listen to Google Auth status
  useEffect(() => {
    const unsub = initGoogleAuth(
      (u, tok) => {
        setGoogleUser(u);
        setGoogleToken(tok);
        const savedId = getSavedSpreadsheetId();
        if (savedId) {
          setSpreadsheetUrl(`https://docs.google.com/spreadsheets/d/${savedId}/edit`);
        }
      },
      () => {
        setGoogleUser(null);
        setGoogleToken(null);
      }
    );
    return () => unsub();
  }, []);

  // Quick Sign Up with Google
  const handleGoogleQuickSignUp = async () => {
    setIsQuickGoogleSigningUp(true);
    setSignUpError(null);
    try {
      const res = await signInWithGoogle();
      setGoogleUser(res.user);
      setGoogleToken(res.accessToken);

      if (res.user.displayName) {
        setSignUpName(res.user.displayName);
      }
      if (res.user.email) {
        setSignUpEmail(res.user.email);
      }

      // Verify or create the member spreadsheet in Google Sheets
      const sheetInfo = await getOrCreateMemberSpreadsheet(res.accessToken, settings.storeName);
      setSpreadsheetUrl(sheetInfo.url);

      // Focus phone number input
      const phoneEl = document.getElementById('signup-phone');
      if (phoneEl) {
        phoneEl.focus();
      }
    } catch (err: any) {
      console.warn('[QuickGoogleSignUp] Error:', err);
      setSignUpError(err?.message || 'Gagal menghubungkan ke akun Google.');
    } finally {
      setIsQuickGoogleSigningUp(false);
    }
  };

  // Calculator slider state
  const [monthlySpend, setMonthlySpend] = useState<number>(350000);

  // FAQ Accordion state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Calculated benefits based on slider
  const calcPoints = useMemo(() => Math.floor(monthlySpend / 10000), [monthlySpend]);
  const calcCashbackRupiah = useMemo(() => calcPoints * 1000, [calcPoints]);
  const calcEstimatedTier = useMemo(() => {
    if (calcPoints >= 120) return { name: 'VIP', multiplier: '3x Poin', color: 'from-amber-600 to-amber-900 text-white' };
    if (calcPoints >= 50) return { name: 'Gold', multiplier: '2x Poin', color: 'from-amber-500 to-amber-700 text-white' };
    if (calcPoints >= 15) return { name: 'Silver', multiplier: '1.5x Poin', color: 'from-slate-400 to-slate-600 text-white' };
    return { name: 'Reguler', multiplier: '1x Poin', color: 'from-orange-800 to-stone-800 text-white' };
  }, [calcPoints]);

  // Load transactions for active member
  const handleOpenMemberDashboard = async (member: Customer) => {
    setActiveMember(member);
    try {
      localStorage.setItem('kasirku_active_member', JSON.stringify(member));
    } catch {
      // ignore
    }
    // Fetch live transactions from Turso
    const trxs = await api.getMemberTransactions(member.id);
    setMemberTransactions(trxs || []);
    setShowMemberCardModal(true);
  };

  const handleLogoutMember = () => {
    setActiveMember(null);
    localStorage.removeItem('kasirku_active_member');
    setShowMemberCardModal(false);
  };

  // Sign In Handler
  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignInError(null);

    if (!signInIdentifier.trim()) {
      setSignInError('Silakan masukkan nomor telepon/WhatsApp atau email Anda.');
      return;
    }
    if (!signInPassword) {
      setSignInError('Silakan masukkan PIN atau kata sandi.');
      return;
    }

    setSignInLoading(true);
    const result = await api.memberSignIn(signInIdentifier, signInPassword);
    setSignInLoading(false);

    if (!result.success || !result.member) {
      setSignInError(result.error || 'Nomor HP atau kata sandi tidak cocok.');
      return;
    }

    setActiveMember(result.member);
    try {
      localStorage.setItem('kasirku_active_member', JSON.stringify(result.member));
    } catch {
      // ignore
    }
    setMemberTransactions(result.recentTransactions || []);
    setAuthModalMode(null);
    setShowMemberCardModal(true);
  };

  // Sign Up Handler (Synchronizes with Turso & Google Sheets)
  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignUpError(null);
    setSignUpSuccessMsg(null);

    const cleanName = signUpName.trim();
    const rawDigits = signUpPhone.trim().replace(/[^0-9]/g, '');

    if (!cleanName || cleanName.length < 2) {
      setSignUpError('Silakan masukkan nama lengkap yang valid (minimal 2 karakter).');
      return;
    }
    if (rawDigits.length < 9) {
      setSignUpError('Nomor telepon/WhatsApp minimal 9 hingga 13 digit angka.');
      return;
    }
    if (!signUpPassword || signUpPassword.length < 4) {
      setSignUpError('PIN atau kata sandi minimal 4 karakter demi keamanan.');
      return;
    }

    // Standardize Indonesian phone to 08...
    let cleanPhone = rawDigits;
    if (rawDigits.startsWith('628')) {
      cleanPhone = '0' + rawDigits.slice(2);
    } else if (!rawDigits.startsWith('0') && rawDigits.startsWith('8')) {
      cleanPhone = '0' + rawDigits;
    }

    setSignUpLoading(true);
    const res = await api.memberSignUp({
      name: cleanName,
      phone: cleanPhone,
      email: signUpEmail.trim() || undefined,
      password: signUpPassword,
      favoriteCategory: signUpFavCategory,
    });
    setSignUpLoading(false);

    if (!res.success || !res.member) {
      setSignUpError(res.error || 'Gagal mendaftar. Silakan coba kembali.');
      return;
    }

    // If Google token is active, save directly to Google Sheets
    let isSheetSaved = false;
    const activeToken = googleToken || getGoogleAccessToken();
    if (activeToken) {
      try {
        const sheetRes = await appendMemberToGoogleSheet(res.member, activeToken, settings.storeName);
        if (sheetRes.success && sheetRes.spreadsheetUrl) {
          isSheetSaved = true;
          setSpreadsheetUrl(sheetRes.spreadsheetUrl);
        }
      } catch (err) {
        console.warn('[GoogleSheetAutoAppend] Warning:', err);
      }
    }

    // Success notification
    const msg = isSheetSaved
      ? 'Pendaftaran Berhasil! 50 Poin Bonus Selamat Datang telah aktif & data tersimpan di Turso Cloud & Google Spreadsheet.'
      : 'Pendaftaran Berhasil! 50 Poin Bonus Selamat Datang telah ditambahkan ke akun Anda di Turso Cloud DB.';

    setSignUpSuccessMsg(msg);
    setActiveMember(res.member);
    try {
      localStorage.setItem('kasirku_active_member', JSON.stringify(res.member));
    } catch {
      // ignore
    }

    if (onCustomerRegistered) {
      onCustomerRegistered(res.member);
    }

    setTimeout(() => {
      setAuthModalMode(null);
      setShowMemberCardModal(true);
    }, 1800);
  };

  // Demo Fast Login
  const handleDemoLogin = (targetCustomer: Customer) => {
    setSignInIdentifier(targetCustomer.phone);
    setSignInPassword(targetCustomer.password || '123456');
    setSignInError(null);
  };

  return (
    <div className="min-h-screen bg-[#fff8f4] text-[#201b14] flex flex-col font-sans selection:bg-[#ffdbca] selection:text-[#331200]">
      {/* ========================================================= */}
      {/* 1. STICKY FLOATING NAVBAR                                 */}
      {/* ========================================================= */}
      <header
        id="member-navbar"
        className="sticky top-0 z-40 bg-[#fff8f4]/90 backdrop-blur-md border-b border-[#ebdcd3] transition-all"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#964407] to-[#5a2503] flex items-center justify-center text-white shadow-md shadow-[#964407]/20 border border-[#b85a14]/30">
              <Crown className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-[#201b14] font-serif">
                  {settings.storeName || 'KASIRKU'}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#ffdbca] text-[#7e3905] border border-[#ffb68d]/60">
                  VIP Club
                </span>
              </div>
              <p className="text-[11px] text-[#69615b] font-medium hidden sm:block">
                Program Loyalitas & Keanggotaan Eksklusif
              </p>
            </div>
          </div>

          {/* Center Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-semibold text-[#51443b]">
            <a href="#keuntungan" className="hover:text-[#964407] transition-colors">
              Keuntungan
            </a>
            <a href="#kalkulator" className="hover:text-[#964407] transition-colors">
              Simulasi Poin
            </a>
            <a href="#tiers" className="hover:text-[#964407] transition-colors">
              Tingkat Tier
            </a>
            <a href="#rewards" className="hover:text-[#964407] transition-colors">
              Katalog Hadiah
            </a>
            <a href="#testimoni" className="hover:text-[#964407] transition-colors">
              Testimoni
            </a>
            <a href="#faq" className="hover:text-[#964407] transition-colors">
              FAQ
            </a>
          </nav>

          {/* Action CTAs & Member Status */}
          <div className="flex items-center gap-2 sm:gap-3">
            {activeMember ? (
              <div className="flex items-center gap-2">
                <button
                  id="nav-member-profile-btn"
                  type="button"
                  onClick={() => setShowMemberCardModal(true)}
                  className="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-amber-50 hover:bg-amber-100 border border-amber-200/80 text-[#7e3905] font-bold text-xs transition-all shadow-xs cursor-pointer active:scale-95"
                >
                  <div className="w-6 h-6 rounded-full bg-[#964407] text-white flex items-center justify-center text-[10px]">
                    {activeMember.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left hidden sm:block">
                    <span className="block text-[11px] leading-tight font-extrabold text-[#201b14]">
                      {activeMember.name.split(' ')[0]}
                    </span>
                    <span className="block text-[10px] text-[#964407] font-semibold">
                      {activeMember.points} Poin • {activeMember.tier}
                    </span>
                  </div>
                  <QrCode className="w-4 h-4 text-[#964407]" />
                </button>
                <button
                  id="nav-member-logout-btn"
                  type="button"
                  onClick={handleLogoutMember}
                  title="Keluar Member"
                  className="p-2 text-[#69615b] hover:text-red-600 rounded-xl hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <button
                  id="nav-signin-btn"
                  type="button"
                  onClick={() => {
                    setAuthModalMode('signin');
                    setSignInError(null);
                  }}
                  className="px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-[#51443b] hover:text-[#201b14] hover:bg-[#ebdcd3]/50 transition-all cursor-pointer active:scale-95"
                >
                  Masuk Member
                </button>

                <button
                  id="nav-signup-btn"
                  type="button"
                  onClick={() => {
                    setAuthModalMode('signup');
                    setSignUpError(null);
                    setSignUpSuccessMsg(null);
                  }}
                  className="px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[#964407] hover:bg-[#7e3905] text-white transition-all shadow-md shadow-[#964407]/20 flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Daftar Gratis</span>
                </button>
              </>
            )}

            {/* Google Sheets Sync Button */}
            <button
              id="nav-sheets-sync-btn"
              type="button"
              onClick={() => setIsSyncModalOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-emerald-50 hover:bg-emerald-100 border border-emerald-300/80 text-emerald-800 transition-all shadow-2xs cursor-pointer active:scale-95"
              title="Google Sheets & Cloud Sync"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
              <span>{googleToken ? 'Sheet Terhubung' : 'Google Sheets'}</span>
            </button>

            {/* Switch to Cashier / POS App */}
            <div className="h-6 w-[1px] bg-[#ebdcd3] mx-1 hidden sm:block" />

            <button
              id="nav-open-pos-btn"
              type="button"
              onClick={onOpenPos}
              className="px-3 py-2 rounded-xl text-xs font-bold bg-white hover:bg-stone-50 text-[#51443b] border border-[#ebdcd3] transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer active:scale-95"
              title="Beralih ke Terminal Kasir & Dashboard Staff"
            >
              <Store className="w-3.5 h-3.5 text-[#964407]" />
              <span className="hidden md:inline">Terminal Kasir</span>
            </button>
          </div>
        </div>
      </header>

      {/* ========================================================= */}
      {/* 2. HERO SECTION (ABOVE-THE-FOLD)                          */}
      {/* ========================================================= */}
      <section
        id="hero"
        className="relative pt-8 pb-16 md:pt-16 md:pb-24 overflow-hidden border-b border-[#ebdcd3]/80 bg-gradient-to-b from-[#fff8f4] via-[#fdf4ed] to-[#fff8f4]"
      >
        {/* Subtle decorative glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-[#ffdbca]/40 to-amber-100/30 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Column: Value Proposition & Copy */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* Badge Announcement */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#ffdbca]/70 border border-[#ffb68d]/60 text-[#7e3905] text-xs font-bold shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-[#964407]" />
                <span>Bonus 50 Poin Selamat Datang • Langsung Aktif</span>
              </div>

              {/* High Impact Headline H1 */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#201b14] tracking-tight leading-[1.15] font-serif">
                Keistimewaan Eksklusif di Setiap{' '}
                <span className="text-[#964407] underline decoration-[#ffb68d] decoration-wavy decoration-2">
                  Cangkir & Menu
                </span>{' '}
                Favorit Anda.
              </h1>

              {/* Sub-headline */}
              <p className="text-base sm:text-lg text-[#51443b] max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Bergabunglah bersama ribuan pelanggan setia {settings.storeName}. Dapatkan cashback poin tanpa batas di
                setiap transaksi, diskon khusus member, voucher ulang tahun, dan akses mencicipi menu rahasia barista
                terbaru.
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5">
                <button
                  id="hero-primary-signup-btn"
                  type="button"
                  onClick={() => {
                    setAuthModalMode('signup');
                    setSignUpError(null);
                    setSignUpSuccessMsg(null);
                  }}
                  className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-[#964407] hover:bg-[#7e3905] text-white font-extrabold text-sm sm:text-base shadow-lg shadow-[#964407]/25 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 group"
                >
                  <Gift className="w-5 h-5 text-amber-300 group-hover:rotate-12 transition-transform" />
                  <span>Daftar Member & Klaim 50 Poin</span>
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  id="hero-secondary-signin-btn"
                  type="button"
                  onClick={() => {
                    if (activeMember) {
                      setShowMemberCardModal(true);
                    } else {
                      setAuthModalMode('signin');
                      setSignInError(null);
                    }
                  }}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white hover:bg-stone-50 text-[#331200] font-bold text-sm sm:text-base border border-[#ebdcd3] shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
                >
                  <CreditCard className="w-4 h-4 text-[#964407]" />
                  <span>{activeMember ? 'Lihat Kartu Member Saya' : 'Sudah Member? Masuk'}</span>
                </button>
              </div>

              {/* Social Proof Metric Bar */}
              <div className="pt-4 border-t border-[#ebdcd3]/80 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-[#69615b]">
                <div className="flex items-center gap-1.5">
                  <div className="flex text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="font-extrabold text-[#201b14]">4.9 / 5.0</span>
                  <span className="text-[#847870]">(3.800+ Ulasan)</span>
                </div>
                <div className="h-3 w-[1px] bg-[#ebdcd3]" />
                <div>
                  <span className="font-extrabold text-[#201b14]">5.200+</span> Member Aktif
                </div>
                <div className="h-3 w-[1px] bg-[#ebdcd3]" />
                <div>
                  <span className="font-extrabold text-[#201b14]">100% Gratis</span> Tanpa Biaya
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Digital Membership Card Showcase */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-md">
                {/* Ambient glow behind card */}
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-[#964407]/20 rounded-3xl blur-2xl -z-10 transform scale-95" />

                {/* Aesthetic Holographic Metallic Member Card */}
                <div
                  id="hero-digital-member-card"
                  onClick={() => {
                    if (activeMember) setShowMemberCardModal(true);
                    else setAuthModalMode('signup');
                  }}
                  className="relative cursor-pointer rounded-3xl p-6 sm:p-7 text-white shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[#964407]/20 overflow-hidden border border-amber-300/30 bg-gradient-to-br from-[#29170e] via-[#48200f] to-[#1a0f09]"
                >
                  {/* Card Background Pattern Texture */}
                  <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#ebdcd3_1px,transparent_1px)] [background-size:16px_16px]" />
                  <div className="absolute -right-12 -top-12 w-48 h-48 bg-gradient-to-br from-amber-400/20 to-transparent rounded-full blur-xl" />

                  {/* Card Header */}
                  <div className="relative flex items-center justify-between mb-8">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-amber-400/20 border border-amber-300/40 flex items-center justify-center">
                        <Crown className="w-4 h-4 text-amber-300" />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-amber-200/80 font-semibold font-mono">
                          VIP MEMBERSHIP
                        </p>
                        <p className="text-sm font-extrabold tracking-tight text-white font-serif">
                          {settings.storeName || 'KASIRKU'}
                        </p>
                      </div>
                    </div>

                    <span className="px-3 py-1 rounded-full text-[10px] font-extrabold tracking-wider uppercase bg-amber-400/20 text-amber-200 border border-amber-300/40 backdrop-blur-xs">
                      {activeMember?.tier || 'GOLD TIER'}
                    </span>
                  </div>

                  {/* Smart EMV Chip & Contactless Visuals */}
                  <div className="relative flex items-center justify-between mb-8">
                    <div className="w-11 h-8 rounded-md bg-gradient-to-r from-amber-200 via-amber-300 to-amber-400 border border-amber-400/60 shadow-xs flex items-center justify-center relative overflow-hidden">
                      <div className="w-full h-[1px] bg-amber-600/40 absolute top-2" />
                      <div className="w-full h-[1px] bg-amber-600/40 absolute bottom-2" />
                      <div className="h-full w-[1px] bg-amber-600/40 absolute left-3" />
                      <div className="h-full w-[1px] bg-amber-600/40 absolute right-3" />
                    </div>

                    <div className="flex items-center gap-1.5 text-amber-200/80 text-xs font-mono">
                      <Zap className="w-3.5 h-3.5 text-amber-300" />
                      <span>TAP & SCAN POS</span>
                    </div>
                  </div>

                  {/* Member Name & Points Preview */}
                  <div className="relative space-y-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-amber-200/70 font-mono">
                        NAMA ANGGOTA
                      </p>
                      <p className="text-lg sm:text-xl font-extrabold tracking-wide text-white uppercase truncate">
                        {activeMember?.name || 'SITI RAHMAWATI'}
                      </p>
                    </div>

                    <div className="flex items-end justify-between pt-2 border-t border-amber-200/10">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-amber-200/70 font-mono">
                          SALDO POIN AKTIF
                        </p>
                        <p className="text-2xl font-black text-amber-300 tracking-tight flex items-center gap-1.5">
                          <span>{activeMember?.points || 820}</span>
                          <span className="text-xs font-semibold text-amber-200/90 uppercase tracking-normal">
                            POIN
                          </span>
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-[10px] uppercase tracking-wider text-amber-200/70 font-mono">
                          KODE SCANNER
                        </p>
                        <p className="text-xs font-mono text-amber-100/90 font-bold tracking-widest">
                          {activeMember?.phone || '0813-7766-5544'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Interactive Hint */}
                  <div className="mt-5 pt-3 border-t border-amber-200/10 flex items-center justify-between text-[11px] text-amber-200/70 font-medium">
                    <span>Sentuh untuk membuka barcode digital</span>
                    <QrCode className="w-4 h-4 text-amber-300" />
                  </div>
                </div>

                {/* Sub-card quick preview tags */}
                <div className="mt-3 grid grid-cols-2 gap-2 text-center text-xs font-semibold">
                  <div className="p-2.5 rounded-xl bg-white border border-[#ebdcd3] text-[#51443b] shadow-2xs">
                    <span className="text-[#964407] font-extrabold block">Tiap Rp 10.000</span>
                    <span className="text-[11px] text-[#69615b]">Dapat 1 Poin Reward</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-[#ebdcd3] text-[#51443b] shadow-2xs">
                    <span className="text-[#964407] font-extrabold block">Tukar di Kasir</span>
                    <span className="text-[11px] text-[#69615b]">Diskon Langsung</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 2.5 CLOUD DATABASE & GOOGLE SHEETS LIVE SYNC SECTION       */}
      {/* ========================================================= */}
      <section id="sync-cloud" className="pt-8 pb-4 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <GoogleSheetsSyncCard
          customers={customers}
          storeName={settings.storeName}
        />
      </section>

      {/* ========================================================= */}
      {/* 3. BENTO-GRID VALUE PROPOSITION                           */}
      {/* ========================================================= */}
      <section id="keuntungan" className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <span className="px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-[#ffdbca] text-[#7e3905] border border-[#ffb68d]/60 inline-block mb-3">
            Manfaat Eksklusif
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#201b14] font-serif tracking-tight">
            Lebih Banyak Hemat, Lebih Banyak Kenikmatan
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#69615b] leading-relaxed">
            Keanggotaan dirancang secara khusus untuk memberikan apresiasi nyata kepada pelanggan setia di setiap
            kunjungan.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 (Large - 2 cols on md+) */}
          <div className="md:col-span-2 p-6 sm:p-8 rounded-3xl bg-white border border-[#ebdcd3] shadow-xs relative overflow-hidden flex flex-col justify-between">
            <div className="space-y-3 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-[#964407]">
                <Percent className="w-6 h-6" />
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-[#201b14] font-serif">
                Cashback Poin Riil Tanpa Batas Masa Berlaku
              </h3>
              <p className="text-sm text-[#51443b] leading-relaxed max-w-xl">
                Setiap pembelanjaan di toko atau kasir akan langsung dikonversi menjadi poin loyalitas. 1 poin setara
                dengan Rp 1.000 diskon tunai yang dapat Anda gunakan kapan saja untuk memotong tagihan belanja
                berikutnya.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#ebdcd3] flex items-center justify-between text-xs font-bold text-[#964407]">
              <span>Tersedia di semua cabang</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          {/* Card 2 */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#ebdcd3] shadow-xs flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-700">
                <Gift className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-extrabold text-[#201b14] font-serif">
                Hadiah Ulang Tahun Gratis
              </h3>
              <p className="text-sm text-[#51443b] leading-relaxed">
                Nikmati minuman atau sajian pilihan gratis serta voucher belanja spesial Rp 50.000 di bulan ulang tahun
                Anda tanpa syarat pembelanjaan minimum.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#ebdcd3] text-xs font-bold text-rose-700">
              Otomatis dikirim via WhatsApp
            </div>
          </div>

          {/* Card 3 */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#ebdcd3] shadow-xs flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-[#964407]">
                <Coffee className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-extrabold text-[#201b14] font-serif">
                Akses Menu Rahasia & Seasonal
              </h3>
              <p className="text-sm text-[#51443b] leading-relaxed">
                Jadilah yang pertama mencicipi kreasi racikan barista dan chef kami 2 minggu sebelum resmi diluncurkan ke
                publik umum.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#ebdcd3] text-xs font-bold text-[#964407]">
              Khusus Member Silver ke atas
            </div>
          </div>

          {/* Card 4 (2 cols on md+) */}
          <div className="md:col-span-2 p-6 sm:p-8 rounded-3xl bg-white border border-[#ebdcd3] shadow-xs relative overflow-hidden flex flex-col justify-between">
            <div className="space-y-3 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700">
                <Smartphone className="w-6 h-6" />
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-[#201b14] font-serif">
                Transaksi Kilat di Kasir dengan Barcode HP
              </h3>
              <p className="text-sm text-[#51443b] leading-relaxed max-w-xl">
                Cukup sebutkan nomor WhatsApp Anda atau tunjukkan kartu barcode digital di layar ponsel Anda saat
                berada di depan kasir. Sistem kasir KASIRKU langsung mendeteksi tier dan menerapkan poin Anda dalam 2
                detik.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#ebdcd3] flex items-center justify-between text-xs font-bold text-blue-700">
              <span>Terintegrasi dengan mesin pemindai barcode toko</span>
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 4. INTERACTIVE REWARD CALCULATOR SLIDER                   */}
      {/* ========================================================= */}
      <section
        id="kalkulator"
        className="py-16 bg-[#fbf2eb] border-y border-[#ebdcd3] relative overflow-hidden"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-[#ffdbca] text-[#7e3905] border border-[#ffb68d]/60 inline-block mb-3">
              Kalkulator Keuntungan
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#201b14] font-serif tracking-tight">
              Hitung Berapa Poin & Hemat yang Anda Dapatkan
            </h2>
            <p className="mt-2 text-sm text-[#69615b]">
              Geser nilai belanja bulanan Anda untuk melihat estimasi poin dan tingkat tier yang akan Anda nikmati.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#ebdcd3] shadow-md space-y-8">
            {/* Slider Control */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label htmlFor="spend-range" className="text-sm font-bold text-[#51443b]">
                  Estimasi Belanja Anda per Bulan:
                </label>
                <span className="text-xl sm:text-2xl font-black text-[#964407] font-mono">
                  {formatRupiah(monthlySpend)}
                </span>
              </div>

              <input
                id="spend-range"
                type="range"
                min="50000"
                max="2500000"
                step="50000"
                value={monthlySpend}
                onChange={(e) => setMonthlySpend(Number(e.target.value))}
                className="w-full h-3 bg-[#ebdcd3] rounded-lg appearance-none cursor-pointer accent-[#964407]"
              />

              <div className="flex justify-between text-xs text-[#847870] font-mono">
                <span>Rp 50.000</span>
                <span>Rp 1.000.000</span>
                <span>Rp 2.500.000</span>
              </div>
            </div>

            {/* Live Output Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-[#ebdcd3]">
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 text-center">
                <span className="text-xs text-[#7e3905] font-semibold block uppercase tracking-wider">
                  Poin Didapat per Bulan
                </span>
                <span className="text-3xl font-black text-[#964407] font-mono block mt-1">
                  +{calcPoints}
                </span>
                <span className="text-[11px] text-[#69615b]">1 poin / Rp 10.000</span>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-center">
                <span className="text-xs text-emerald-800 font-semibold block uppercase tracking-wider">
                  Nilai Diskon Tunai
                </span>
                <span className="text-3xl font-black text-emerald-700 font-mono block mt-1">
                  {formatRupiah(calcCashbackRupiah)}
                </span>
                <span className="text-[11px] text-emerald-600">Bisa langsung dipakai di kasir</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#fff8f4] border border-[#ebdcd3] text-center flex flex-col justify-center">
                <span className="text-xs text-[#69615b] font-semibold block uppercase tracking-wider">
                  Status Tier Anda
                </span>
                <span className="text-xl font-black text-[#201b14] block mt-1">
                  {calcEstimatedTier.name} Member
                </span>
                <span className="text-[11px] text-[#964407] font-bold">
                  {calcEstimatedTier.multiplier}
                </span>
              </div>
            </div>

            {/* Quick Action */}
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setAuthModalMode('signup');
                  setSignUpError(null);
                }}
                className="px-6 py-3 rounded-xl bg-[#964407] hover:bg-[#7e3905] text-white font-bold text-sm shadow-md shadow-[#964407]/20 inline-flex items-center gap-2 transition-all cursor-pointer active:scale-95"
              >
                <span>Daftar Sekarang untuk Mulai Mengumpulkan Poin</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 5. MEMBER TIER LEVELS                                     */}
      {/* ========================================================= */}
      <section id="tiers" className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <span className="px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-[#ffdbca] text-[#7e3905] border border-[#ffb68d]/60 inline-block mb-3">
            Tingkatan Keanggotaan
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#201b14] font-serif tracking-tight">
            Semakin Sering Kunjungan, Semakin Mewah Manfaatnya
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#69615b] leading-relaxed">
            Tingkatkan status tier Anda secara otomatis berdasarkan akumulasi poin pembelanjaan.
          </p>
        </div>

        {/* 4 Tier Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Reguler */}
          <div className="p-6 rounded-3xl bg-white border border-[#ebdcd3] shadow-xs flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full text-xs font-extrabold uppercase bg-stone-100 text-stone-700">
                  Reguler
                </span>
                <span className="text-xs text-[#847870] font-mono">0 - 150 Poin</span>
              </div>
              <h3 className="text-xl font-bold text-[#201b14]">Anggota Baru</h3>
              <p className="text-xs text-[#69615b] leading-relaxed">
                Tingkat awal untuk setiap pelanggan baru terdaftar.
              </p>
              <ul className="space-y-2.5 text-xs text-[#51443b] pt-3 border-t border-[#ebdcd3]">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Welcome Gift 50 Poin</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>1x Poin Cashback Belanja</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Kartu Member Digital</span>
                </li>
              </ul>
            </div>
            <div className="mt-6 pt-4 border-t border-[#ebdcd3]">
              <span className="text-[11px] font-bold text-[#964407]">Langsung Didapat saat Daftar</span>
            </div>
          </div>

          {/* Silver */}
          <div className="p-6 rounded-3xl bg-white border border-[#ebdcd3] shadow-xs flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full text-xs font-extrabold uppercase bg-slate-100 text-slate-700 border border-slate-200">
                  Silver
                </span>
                <span className="text-xs text-[#847870] font-mono">151 - 500 Poin</span>
              </div>
              <h3 className="text-xl font-bold text-[#201b14]">Pengunjung Rutin</h3>
              <p className="text-xs text-[#69615b] leading-relaxed">
                Untuk penikmat kopi yang rutin berkunjung tiap minggu.
              </p>
              <ul className="space-y-2.5 text-xs text-[#51443b] pt-3 border-t border-[#ebdcd3]">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Semua manfaat Reguler</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>1.5x Multiplier Poin Cashback</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Gratis Upsize Cup Tiap Jumat</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Diskon Khusus 5% Tiap Transaksi</span>
                </li>
              </ul>
            </div>
            <div className="mt-6 pt-4 border-t border-[#ebdcd3]">
              <span className="text-[11px] font-bold text-slate-700">Akumulasi Belanja Rp 1,5 Juta</span>
            </div>
          </div>

          {/* Gold (Highlighted Tier) */}
          <div className="p-6 rounded-3xl bg-[#fff8f4] border-2 border-[#964407] shadow-lg shadow-[#964407]/10 flex flex-col justify-between relative transform lg:-translate-y-2">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#964407] text-white text-[10px] font-extrabold uppercase tracking-wider">
              Paling Populer
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full text-xs font-extrabold uppercase bg-amber-100 text-amber-900 border border-amber-300">
                  Gold
                </span>
                <span className="text-xs text-[#964407] font-mono font-bold">501 - 1.200 Poin</span>
              </div>
              <h3 className="text-xl font-bold text-[#201b14]">Pelanggan Setia</h3>
              <p className="text-xs text-[#69615b] leading-relaxed">
                Pilihan favorit bagi pecinta kuliner & workspace.
              </p>
              <ul className="space-y-2.5 text-xs text-[#51443b] pt-3 border-t border-[#ebdcd3]">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Semua manfaat Silver</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-bold text-[#964407]">2x Multiplier Poin</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Voucher Ulang Tahun Rp 50.000</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Diskon Khusus 10% Tiap Belanja</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Gratis Ongkir Delivery Pesanan</span>
                </li>
              </ul>
            </div>
            <div className="mt-6 pt-4 border-t border-[#ebdcd3]">
              <span className="text-[11px] font-bold text-[#964407]">Akumulasi Belanja Rp 5 Juta</span>
            </div>
          </div>

          {/* VIP */}
          <div className="p-6 rounded-3xl bg-gradient-to-b from-[#25150c] to-[#160c07] text-white shadow-xl flex flex-col justify-between border border-amber-400/30">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full text-xs font-extrabold uppercase bg-amber-400/20 text-amber-300 border border-amber-300/40">
                  VIP Club
                </span>
                <span className="text-xs text-amber-200/80 font-mono">&gt; 1.200 Poin</span>
              </div>
              <h3 className="text-xl font-bold text-white font-serif">Kasta Tertinggi</h3>
              <p className="text-xs text-amber-100/70 leading-relaxed">
                Pelayanan prioritas khusus tanpa antre & reservasi meja.
              </p>
              <ul className="space-y-2.5 text-xs text-amber-100/90 pt-3 border-t border-amber-200/20">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Semua manfaat Gold</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="font-bold text-amber-300">3x Multiplier Poin</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Diskon Eksklusif 15% Semua Menu</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Akses Private Lounge & Tasting</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Jalur Cepat Tanpa Antre di Kasir</span>
                </li>
              </ul>
            </div>
            <div className="mt-6 pt-4 border-t border-amber-200/20">
              <span className="text-[11px] font-bold text-amber-300">Status Sultan & Undangan VIP</span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 6. POPULAR REWARD CATALOGUE PREVIEW                       */}
      {/* ========================================================= */}
      <section id="rewards" className="py-16 bg-[#fbf2eb] border-y border-[#ebdcd3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-[#ffdbca] text-[#7e3905] border border-[#ffb68d]/60 inline-block mb-3">
              Katalog Penukaran
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#201b14] font-serif tracking-tight">
              Tukarkan Poin dengan Hadiah Favorit Anda
            </h2>
            <p className="mt-3 text-sm sm:text-base text-[#69615b]">
              Kumpulkan poin dan tukarkan langsung di kasir atau klaim lewat profil member digital Anda.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Reward 1 */}
            <div className="p-5 rounded-2xl bg-white border border-[#ebdcd3] shadow-xs flex flex-col justify-between">
              <div>
                <div className="h-32 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-[#964407] mb-4">
                  <Coffee className="w-12 h-12" />
                </div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#964407] bg-amber-50 px-2 py-0.5 rounded-full">
                    Minuman
                  </span>
                  <span className="text-xs font-mono font-extrabold text-amber-700">30 Poin</span>
                </div>
                <h4 className="font-bold text-base text-[#201b14]">Kopi Susu Aren Spesial</h4>
                <p className="text-xs text-[#69615b] mt-1">1 Cup Kopi Susu Aren Gula Aren Organik 16oz.</p>
              </div>
              <button
                type="button"
                onClick={() => setAuthModalMode('signup')}
                className="mt-4 w-full py-2 rounded-xl text-xs font-bold bg-[#fff8f4] hover:bg-amber-50 text-[#964407] border border-amber-200 transition-colors"
              >
                Klaim dengan Poin
              </button>
            </div>

            {/* Reward 2 */}
            <div className="p-5 rounded-2xl bg-white border border-[#ebdcd3] shadow-xs flex flex-col justify-between">
              <div>
                <div className="h-32 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-700 mb-4">
                  <ShoppingBag className="w-12 h-12" />
                </div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-orange-700 bg-orange-50 px-2 py-0.5 rounded-full">
                    Pastry
                  </span>
                  <span className="text-xs font-mono font-extrabold text-orange-700">45 Poin</span>
                </div>
                <h4 className="font-bold text-base text-[#201b14]">Butter Croissant Flaky</h4>
                <p className="text-xs text-[#69615b] mt-1">Freshly baked butter croissant Prancis renyah.</p>
              </div>
              <button
                type="button"
                onClick={() => setAuthModalMode('signup')}
                className="mt-4 w-full py-2 rounded-xl text-xs font-bold bg-[#fff8f4] hover:bg-orange-50 text-orange-800 border border-orange-200 transition-colors"
              >
                Klaim dengan Poin
              </button>
            </div>

            {/* Reward 3 */}
            <div className="p-5 rounded-2xl bg-white border border-[#ebdcd3] shadow-xs flex flex-col justify-between">
              <div>
                <div className="h-32 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 mb-4">
                  <Percent className="w-12 h-12" />
                </div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    Voucher
                  </span>
                  <span className="text-xs font-mono font-extrabold text-emerald-700">50 Poin</span>
                </div>
                <h4 className="font-bold text-base text-[#201b14]">Voucher Diskon Rp 25.000</h4>
                <p className="text-xs text-[#69615b] mt-1">Potongan langsung Rp 25.000 untuk transaksi apa saja.</p>
              </div>
              <button
                type="button"
                onClick={() => setAuthModalMode('signup')}
                className="mt-4 w-full py-2 rounded-xl text-xs font-bold bg-[#fff8f4] hover:bg-emerald-50 text-emerald-800 border border-emerald-200 transition-colors"
              >
                Klaim dengan Poin
              </button>
            </div>

            {/* Reward 4 */}
            <div className="p-5 rounded-2xl bg-white border border-[#ebdcd3] shadow-xs flex flex-col justify-between">
              <div>
                <div className="h-32 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-700 mb-4">
                  <Award className="w-12 h-12" />
                </div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">
                    Merchandise
                  </span>
                  <span className="text-xs font-mono font-extrabold text-purple-700">150 Poin</span>
                </div>
                <h4 className="font-bold text-base text-[#201b14]">Tumbler Stainless Steel</h4>
                <p className="text-xs text-[#69615b] mt-1">Tumbler eksklusif penahan panas & dingin 12 jam.</p>
              </div>
              <button
                type="button"
                onClick={() => setAuthModalMode('signup')}
                className="mt-4 w-full py-2 rounded-xl text-xs font-bold bg-[#fff8f4] hover:bg-purple-50 text-purple-800 border border-purple-200 transition-colors"
              >
                Klaim dengan Poin
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 7. SOCIAL PROOF & MEMBER TESTIMONIALS                     */}
      {/* ========================================================= */}
      <section id="testimoni" className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <span className="px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-[#ffdbca] text-[#7e3905] border border-[#ffb68d]/60 inline-block mb-3">
            Kisah Pelanggan
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#201b14] font-serif tracking-tight">
            Apa Kata Para Member Setia Kami
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#69615b]">
            Pengalaman nyata dari ribuan pelanggan yang menikmati manfaat keanggotaan setiap hari.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Testimonial 1 */}
          <div className="p-6 sm:p-7 rounded-3xl bg-white border border-[#ebdcd3] shadow-xs flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-sm text-[#51443b] leading-relaxed italic">
                &ldquo;Sejak jadi member Gold, tiap meeting mingguan selalu pesan di sini. Poinnya terkumpul cepat banget,
                bulan lalu dapat 3 kopi gratis dan voucher ultah 50 ribu langsung dipotong di kasir tanpa ribet!&rdquo;
              </p>
            </div>
            <div className="pt-4 border-t border-[#ebdcd3] flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#964407] text-white flex items-center justify-center font-bold text-sm">
                AF
              </div>
              <div>
                <p className="font-bold text-sm text-[#201b14]">Ahmad Fauzi</p>
                <p className="text-[11px] text-[#847870]">Gold Member • Freelance Designer</p>
              </div>
            </div>
          </div>

          {/* Testimonial 2 */}
          <div className="p-6 sm:p-7 rounded-3xl bg-white border border-[#ebdcd3] shadow-xs flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-sm text-[#51443b] leading-relaxed italic">
                &ldquo;Barcode digital di HP praktis sekali. Cukup tunjukin saat bayar di kasir, langsung kedeteksi nama
                dan saldo poin saya. Kasirnya juga ramah dan langsung kasih tahu sisa poin saya.&rdquo;
              </p>
            </div>
            <div className="pt-4 border-t border-[#ebdcd3] flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-700 text-white flex items-center justify-center font-bold text-sm">
                SR
              </div>
              <div>
                <p className="font-bold text-sm text-[#201b14]">Siti Rahmawati</p>
                <p className="text-[11px] text-[#847870]">VIP Member • Dosen & Peneliti</p>
              </div>
            </div>
          </div>

          {/* Testimonial 3 */}
          <div className="p-6 sm:p-7 rounded-3xl bg-white border border-[#ebdcd3] shadow-xs flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-sm text-[#51443b] leading-relaxed italic">
                &ldquo;Daftar membernya cepat hanya 1 menit via WhatsApp tanpa perlu kartu fisik yang bikin dompet tebal.
                Langsung dapat 50 poin bonus waktu pertama kali daftar! Sangat worth it.&rdquo;
              </p>
            </div>
            <div className="pt-4 border-t border-[#ebdcd3] flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-stone-700 text-white flex items-center justify-center font-bold text-sm">
                KW
              </div>
              <div>
                <p className="font-bold text-sm text-[#201b14]">Kevin Wijaya</p>
                <p className="text-[11px] text-[#847870]">Silver Member • Product Manager</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 8. FAQ ACCORDION                                          */}
      {/* ========================================================= */}
      <section id="faq" className="py-16 bg-[#fbf2eb] border-y border-[#ebdcd3]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-[#ffdbca] text-[#7e3905] border border-[#ffb68d]/60 inline-block mb-3">
              Tanya Jawab
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#201b14] font-serif tracking-tight">
              Pertanyaan yang Sering Diajukan
            </h2>
            <p className="mt-2 text-sm text-[#69615b]">
              Informasi lengkap seputar pendaftaran, masa berlaku poin, dan penukaran reward.
            </p>
          </div>

          <div className="space-y-3">
            {[
              {
                q: 'Apakah ada biaya untuk mendaftar sebagai Member KASIRKU?',
                a: 'Tidak ada biaya sepeser pun (100% Gratis). Anda bahkan langsung mendapatkan 50 poin bonus selamat datang begitu pendaftaran selesai diverifikasi.',
              },
              {
                q: 'Bagaimana cara kasir mengenali keanggotaan saya saat bertransaksi?',
                a: 'Sangat mudah! Anda cukup menunjukkan kartu barcode digital di ponsel Anda untuk dipindai oleh kasir, atau cukup sebutkan nomor telepon/WhatsApp Anda saat kasir memasukkan pesanan.',
              },
              {
                q: 'Apakah poin loyalitas memiliki tanggal kedaluwarsa?',
                a: 'Poin Anda aktif selama akun Anda melakukan minimal 1 transaksi dalam kurun waktu 12 bulan. Jika aktif berbelanja, poin Anda tidak akan pernah hangus.',
              },
              {
                q: 'Bisakah saya menggunakan poin member di cabang KASIRKU yang berbeda?',
                a: 'Ya, seluruh cabang KASIRKU terhubung ke database cloud terpusat secara real-time. Saldo poin dan status tier Anda dapat digunakan dan ditukarkan di cabang mana pun.',
              },
              {
                q: 'Bagaimana jika saya lupa PIN atau kata sandi akun saya?',
                a: 'Anda dapat meminta kasir kami di toko untuk memverifikasi nomor WhatsApp Anda dan membantu proses pembaruan PIN secara instan di sistem kasir.',
              },
            ].map((faq, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-[#ebdcd3] overflow-hidden shadow-2xs transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-[#201b14] cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-[#964407] transition-transform duration-200 shrink-0 ${
                      openFaqIndex === idx ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openFaqIndex === idx && (
                  <div className="px-5 pb-5 pt-1 text-sm text-[#51443b] leading-relaxed border-t border-stone-100 animate-in fade-in duration-200">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 9. FINAL CTA BANNER                                       */}
      {/* ========================================================= */}
      <section className="py-16 md:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-gradient-to-br from-[#964407] via-[#753404] to-[#451e03] text-white p-8 sm:p-12 md:p-16 overflow-hidden shadow-2xl">
          {/* Subtle circle overlay */}
          <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-white/10 blur-2xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl space-y-4 text-center md:text-left">
            <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-amber-400 text-amber-950 inline-block shadow-xs">
              Mulai Hari Ini
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold font-serif tracking-tight leading-tight">
              Klaim 50 Poin Selamat Datang Anda Sekarang Juga
            </h2>
            <p className="text-amber-100/90 text-sm sm:text-base leading-relaxed">
              Daftar gratis dalam 60 detik. Nikmati diskon langsung, welcome reward, dan keistimewaan member di setiap
              kunjungan Anda.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setAuthModalMode('signup');
                  setSignUpError(null);
                }}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-white hover:bg-amber-50 text-[#7e3905] font-extrabold text-sm sm:text-base shadow-lg transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-[#964407]" />
                <span>Daftar Member Gratis</span>
              </button>

              <button
                type="button"
                onClick={onOpenPos}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-amber-950/40 hover:bg-amber-950/60 text-white font-bold text-sm border border-white/20 transition-all cursor-pointer active:scale-95"
              >
                Buka Terminal Kasir
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 10. FOOTER                                                */}
      {/* ========================================================= */}
      <footer className="mt-auto bg-[#201b14] text-[#cfc4bc] border-t border-[#3a3229]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand Col */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#964407] text-white flex items-center justify-center font-serif font-black">
                  K
                </div>
                <span className="text-lg font-bold text-white font-serif">{settings.storeName || 'KASIRKU'}</span>
              </div>
              <p className="text-xs text-[#a0948b] leading-relaxed">
                Platform Point of Sale (POS) modern & program keanggotaan cerdas terintegrasi cloud database Turso.
              </p>
              <p className="text-xs text-[#a0948b]">
                {settings.storeAddress || 'Jl. Kopi Kenangan No. 88, Jakarta Selatan'}
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3 font-mono">Keanggotaan</h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <button onClick={() => setAuthModalMode('signup')} className="hover:text-white transition-colors">
                    Daftar Member Baru
                  </button>
                </li>
                <li>
                  <button onClick={() => setAuthModalMode('signin')} className="hover:text-white transition-colors">
                    Masuk Akun Member
                  </button>
                </li>
                <li>
                  <a href="#tiers" className="hover:text-white transition-colors">
                    Tingkat Tier & Manfaat
                  </a>
                </li>
                <li>
                  <a href="#rewards" className="hover:text-white transition-colors">
                    Katalog Tukar Poin
                  </a>
                </li>
              </ul>
            </div>

            {/* Hubungi Kami */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3 font-mono">Bantuan & Kontak</h4>
              <ul className="space-y-2 text-xs">
                <li className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-[#964407]" />
                  <span>{settings.storePhone || '0812-3456-7890'}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-[#964407]" />
                  <span>support@kasirku.id</span>
                </li>
                <li>
                  <a href="#faq" className="hover:text-white transition-colors">
                    Pusat Bantuan & FAQ
                  </a>
                </li>
              </ul>
            </div>

            {/* Switch to POS */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3 font-mono">Aplikasi Toko</h4>
              <p className="text-xs text-[#a0948b] mb-3">Untuk kasir, manajer cabang, dan pemilik toko.</p>
              <button
                type="button"
                onClick={onOpenPos}
                className="w-full py-2.5 px-4 rounded-xl bg-[#342c23] hover:bg-[#43392e] text-white text-xs font-bold border border-[#4a3e32] flex items-center justify-center gap-2 transition-colors"
              >
                <Store className="w-3.5 h-3.5 text-amber-300" />
                <span>Masuk ke Terminal Kasir POS</span>
              </button>
            </div>
          </div>

          <div className="mt-12 pt-6 border-t border-[#332b22] flex flex-col sm:flex-row items-center justify-between text-xs text-[#847870] gap-4">
            <p>&copy; {new Date().getFullYear()} {settings.storeName || 'KASIRKU'}. Seluruh Hak Cipta Dilindungi.</p>
            <p className="font-mono text-[11px]">Database: Turso Edge SQLite Cloud</p>
          </div>
        </div>
      </footer>

      {/* ========================================================= */}
      {/* 11. MODAL SIGN IN & SIGN UP UNTUK MEMBER                  */}
      {/* ========================================================= */}
      {authModalMode && (
        <div
          id="member-auth-modal-backdrop"
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <div
            id="member-auth-modal-box"
            className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-[#ebdcd3] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
          >
            {/* Modal Header */}
            <div className="p-6 pb-4 bg-gradient-to-r from-[#fff8f4] to-[#fcf1e8] border-b border-[#ebdcd3] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#964407] text-white flex items-center justify-center shadow-xs">
                  <Crown className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-[#201b14] font-serif">
                    {authModalMode === 'signin' ? 'Masuk Akun Member' : 'Daftar Member Baru'}
                  </h3>
                  <p className="text-xs text-[#69615b]">
                    {authModalMode === 'signin'
                      ? 'Akses saldo poin & reward digital Anda'
                      : 'Bonus 50 Poin Selamat Datang Menanti Anda'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAuthModalMode(null)}
                className="p-2 text-[#847870] hover:text-[#201b14] rounded-xl hover:bg-stone-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Switch Tabs */}
            <div className="flex border-b border-[#ebdcd3] bg-[#fbf2eb]/50 p-1.5 gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setAuthModalMode('signin');
                  setSignInError(null);
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                  authModalMode === 'signin'
                    ? 'bg-white text-[#964407] shadow-xs'
                    : 'text-[#69615b] hover:text-[#201b14]'
                }`}
              >
                Masuk (Sign In)
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthModalMode('signup');
                  setSignUpError(null);
                  setSignUpSuccessMsg(null);
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                  authModalMode === 'signup'
                    ? 'bg-white text-[#964407] shadow-xs'
                    : 'text-[#69615b] hover:text-[#201b14]'
                }`}
              >
                Daftar (Sign Up)
              </button>
            </div>

            {/* Form Body */}
            <div className="p-6 overflow-y-auto max-h-[75vh]">
              {/* ===================== SIGN IN FORM ===================== */}
              {authModalMode === 'signin' && (
                <form onSubmit={handleSignInSubmit} className="space-y-4">
                  {signInError && (
                    <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-start gap-2">
                      <X className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{signInError}</span>
                    </div>
                  )}

                  {/* Input Phone or Email */}
                  <div>
                    <label className="block text-xs font-bold text-[#51443b] mb-1.5">
                      Nomor Telepon / WhatsApp atau Email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#847870]">
                        <Phone className="w-4 h-4" />
                      </div>
                      <input
                        id="signin-identifier"
                        type="text"
                        placeholder="Contoh: 081299887711 atau email"
                        value={signInIdentifier}
                        onChange={(e) => setSignInIdentifier(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#ebdcd3] text-sm focus:outline-none focus:ring-2 focus:ring-[#964407]/30 focus:border-[#964407] bg-white"
                        autoFocus
                      />
                    </div>
                  </div>

                  {/* Input Password / PIN */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-[#51443b]">PIN / Kata Sandi</label>
                      <span className="text-[11px] text-[#964407] font-medium">Default demo: 123456</span>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#847870]">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        id="signin-password"
                        type={showSignInPass ? 'text' : 'password'}
                        placeholder="Masukkan kata sandi/PIN"
                        value={signInPassword}
                        onChange={(e) => setSignInPassword(e.target.value)}
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[#ebdcd3] text-sm focus:outline-none focus:ring-2 focus:ring-[#964407]/30 focus:border-[#964407] bg-white font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSignInPass(!showSignInPass)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#847870] hover:text-[#201b14]"
                      >
                        {showSignInPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    id="submit-signin-btn"
                    type="submit"
                    disabled={signInLoading}
                    className="w-full py-3 rounded-2xl bg-[#964407] hover:bg-[#7e3905] text-white font-extrabold text-sm shadow-md transition-all cursor-pointer active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
                  >
                    {signInLoading ? (
                      <span>Memverifikasi Database...</span>
                    ) : (
                      <>
                        <span>Masuk ke Kartu Member</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  {/* Demo Fast Login Buttons for Instant Testing */}
                  <div className="pt-4 border-t border-[#ebdcd3]">
                    <p className="text-[11px] font-bold text-[#847870] mb-2 uppercase tracking-wider text-center">
                      Uji Coba Cepat (Akun Demo di Turso):
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {customers.slice(0, 3).map((cust) => (
                        <button
                          key={cust.id}
                          type="button"
                          onClick={() => handleDemoLogin(cust)}
                          className="p-2 rounded-xl bg-amber-50/70 hover:bg-amber-100/80 border border-amber-200/80 text-left transition-colors cursor-pointer"
                        >
                          <span className="text-[11px] font-extrabold text-[#201b14] block truncate">
                            {cust.name.split(' ')[0]}
                          </span>
                          <span className="text-[10px] text-[#964407] font-semibold block">
                            {cust.tier} ({cust.points}p)
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </form>
              )}

              {/* ===================== SIGN UP FORM ===================== */}
              {authModalMode === 'signup' && (
                <form onSubmit={handleSignUpSubmit} className="space-y-4">
                  {signUpSuccessMsg ? (
                    <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold space-y-3 text-center animate-in zoom-in-95 duration-200">
                      <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-sm">
                        <CheckCircle2 className="w-7 h-7" />
                      </div>
                      <p className="text-base font-bold text-emerald-950 font-serif">Selamat Datang di VIP Club!</p>
                      <p className="text-emerald-800 text-xs leading-relaxed">{signUpSuccessMsg}</p>

                      {spreadsheetUrl && (
                        <div className="pt-2">
                          <a
                            href={spreadsheetUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-emerald-300 text-emerald-900 font-bold text-xs shadow-xs hover:bg-emerald-100/60 transition-colors"
                          >
                            <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                            <span>Buka Data di Google Sheet</span>
                            <ExternalLink className="w-3.5 h-3.5 text-emerald-700" />
                          </a>
                        </div>
                      )}

                      <p className="text-[11px] text-emerald-700 pt-1">Membuka kartu member digital Anda...</p>
                    </div>
                  ) : (
                    <>
                      {signUpError && (
                        <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-start gap-2">
                          <X className="w-4 h-4 shrink-0 mt-0.5" />
                          <span>{signUpError}</span>
                        </div>
                      )}

                      {/* Google Quick Registration Option */}
                      <div className="space-y-2">
                        <GoogleSignInButton
                          id="signup-google-quick-btn"
                          onClick={handleGoogleQuickSignUp}
                          disabled={isQuickGoogleSigningUp || signUpLoading}
                          label={
                            googleUser
                              ? `Google Terhubung: ${googleUser.email}`
                              : isQuickGoogleSigningUp
                              ? 'Menghubungkan Akun Google...'
                              : 'Daftar Cepat dengan Akun Google'
                          }
                          className="w-full py-2.5"
                        />
                        {googleUser && (
                          <div className="flex items-center justify-center gap-1.5 text-[11px] text-emerald-700 font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Data pendaftaran otomatis tercatat ke Google Spreadsheet</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-3 my-1">
                        <div className="flex-1 h-px bg-[#ebdcd3]" />
                        <span className="text-[10px] font-bold text-[#847870] uppercase tracking-wider">
                          Atau Lengkapi Data Pendaftaran
                        </span>
                        <div className="flex-1 h-px bg-[#ebdcd3]" />
                      </div>

                      {/* Bonus Banner */}
                      <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center gap-2.5 text-xs text-[#7e3905]">
                        <Gift className="w-5 h-5 text-[#964407] shrink-0" />
                        <span>
                          Daftar sekarang & dapatkan <strong className="text-[#964407]">50 Poin Bonus</strong> langsung di
                          Turso Cloud & Google Sheets!
                        </span>
                      </div>

                      {/* Name */}
                      <div>
                        <label className="block text-xs font-bold text-[#51443b] mb-1">Nama Lengkap</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#847870]">
                            <User className="w-4 h-4" />
                          </div>
                          <input
                            id="signup-name"
                            type="text"
                            placeholder="Contoh: Budi Santoso"
                            value={signUpName}
                            onChange={(e) => setSignUpName(e.target.value)}
                            required
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#ebdcd3] text-sm focus:outline-none focus:ring-2 focus:ring-[#964407]/30 focus:border-[#964407] bg-white"
                          />
                        </div>
                      </div>

                      {/* Phone WhatsApp */}
                      <div>
                        <label className="block text-xs font-bold text-[#51443b] mb-1">
                          Nomor WhatsApp / Handphone <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#847870]">
                            <Phone className="w-4 h-4" />
                          </div>
                          <input
                            id="signup-phone"
                            type="tel"
                            placeholder="Contoh: 081234567890"
                            value={signUpPhone}
                            onChange={(e) => setSignUpPhone(e.target.value)}
                            required
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#ebdcd3] text-sm focus:outline-none focus:ring-2 focus:ring-[#964407]/30 focus:border-[#964407] bg-white font-mono"
                          />
                        </div>
                        <p className="text-[10px] text-[#847870] mt-1">
                          Nomor ini digunakan kasir untuk mencari member Anda saat berbelanja.
                        </p>
                      </div>

                      {/* Email (Optional) */}
                      <div>
                        <label className="block text-xs font-bold text-[#51443b] mb-1">
                          Email (Opsional untuk struk digital & Google Sheet)
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#847870]">
                            <Mail className="w-4 h-4" />
                          </div>
                          <input
                            id="signup-email"
                            type="email"
                            placeholder="budi@gmail.com"
                            value={signUpEmail}
                            onChange={(e) => setSignUpEmail(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#ebdcd3] text-sm focus:outline-none focus:ring-2 focus:ring-[#964407]/30 focus:border-[#964407] bg-white"
                          />
                        </div>
                      </div>

                      {/* Password / PIN */}
                      <div>
                        <label className="block text-xs font-bold text-[#51443b] mb-1">
                          PIN / Kata Sandi (Minimal 4 karakter)
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#847870]">
                            <Lock className="w-4 h-4" />
                          </div>
                          <input
                            id="signup-password"
                            type={showSignUpPass ? 'text' : 'password'}
                            placeholder="Buat PIN atau sandi aman"
                            value={signUpPassword}
                            onChange={(e) => setSignUpPassword(e.target.value)}
                            required
                            className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[#ebdcd3] text-sm focus:outline-none focus:ring-2 focus:ring-[#964407]/30 focus:border-[#964407] bg-white font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => setShowSignUpPass(!showSignUpPass)}
                            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#847870] hover:text-[#201b14]"
                          >
                            {showSignUpPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Favorite Category */}
                      <div>
                        <label className="block text-xs font-bold text-[#51443b] mb-1">
                          Kategori Menu Favorit Anda
                        </label>
                        <select
                          value={signUpFavCategory}
                          onChange={(e) => setSignUpFavCategory(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#ebdcd3] text-xs font-medium bg-white text-[#201b14] focus:outline-none focus:ring-2 focus:ring-[#964407]/30"
                        >
                          <option value="Coffee">Espresso & Kopi Susu (Coffee)</option>
                          <option value="Pastry">Croissant & Pastry Manis</option>
                          <option value="Makanan">Makanan Berat & Pasta</option>
                          <option value="Snack">Camilan & Gorengan (Snacks)</option>
                          <option value="Non-Coffee">Matcha & Teh Artisan (Non-Coffee)</option>
                        </select>
                      </div>

                      {/* Submit */}
                      <button
                        id="submit-signup-btn"
                        type="submit"
                        disabled={signUpLoading}
                        className="w-full py-3.5 rounded-2xl bg-[#964407] hover:bg-[#7e3905] text-white font-extrabold text-sm shadow-md transition-all cursor-pointer active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
                      >
                        {signUpLoading ? (
                          <span>Menyimpan ke Turso & Google Sheets...</span>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 text-amber-300" />
                            <span>Daftar & Terima 50 Poin Sekarang</span>
                          </>
                        )}
                      </button>

                      {/* Database & Sheets status pill */}
                      <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/80 text-[11px] text-[#69615b] flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span>Turso DB: Aktif</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
                          <span>
                            Google Sheets: {googleToken ? 'Tersinkron' : 'Siap Ditautkan'}
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 12. FULL SCREEN MEMBER DIGITAL CARD & DASHBOARD MODAL    */}
      {/* ========================================================= */}
      {showMemberCardModal && activeMember && (
        <div
          id="member-dashboard-modal-backdrop"
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
        >
          <div
            id="member-dashboard-modal-container"
            className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-[#ebdcd3] overflow-hidden flex flex-col my-auto max-h-[92vh]"
          >
            {/* Modal Bar */}
            <div className="px-6 py-4 bg-[#fff8f4] border-b border-[#ebdcd3] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Crown className="w-5 h-5 text-[#964407]" />
                <h3 className="font-extrabold text-base text-[#201b14] font-serif">
                  Portal & Kartu Member Digital
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowMemberCardModal(false)}
                className="p-1.5 text-[#847870] hover:text-[#201b14] rounded-xl hover:bg-stone-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6 overflow-y-auto">
              {/* Digital Card (Scannable at POS) */}
              <div className="rounded-3xl p-6 sm:p-7 text-white shadow-xl bg-gradient-to-br from-[#2a170f] via-[#4d2310] to-[#1c0e07] border border-amber-300/40 relative overflow-hidden">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Crown className="w-5 h-5 text-amber-300" />
                    <span className="font-extrabold text-sm tracking-wide font-serif">
                      {settings.storeName || 'KASIRKU VIP'}
                    </span>
                  </div>
                  <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-400/20 text-amber-200 border border-amber-300/40">
                    {activeMember.tier} TIER
                  </span>
                </div>

                <div className="space-y-1 mb-6">
                  <p className="text-[10px] uppercase tracking-wider text-amber-200/70 font-mono">NAMA MEMBER</p>
                  <p className="text-xl sm:text-2xl font-black tracking-wide text-white uppercase truncate">
                    {activeMember.name}
                  </p>
                  <p className="text-xs font-mono text-amber-200/90 font-bold tracking-wider">
                    {activeMember.phone}
                  </p>
                </div>

                <div className="flex items-end justify-between pt-3 border-t border-amber-200/20">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-amber-200/70 font-mono">SALDO POIN</p>
                    <p className="text-3xl font-black text-amber-300 font-mono">{activeMember.points}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-wider text-amber-200/70 font-mono">NILAI RUPIAH</p>
                    <p className="text-sm font-black text-emerald-400 font-mono">
                      {formatRupiah(activeMember.points * 1000)}
                    </p>
                  </div>
                </div>

                {/* Scannable Barcode & QR Code Representation for Cashier Scan */}
                <div className="mt-5 p-3 rounded-2xl bg-white text-stone-900 text-center shadow-inner">
                  <p className="text-[10px] font-bold text-[#847870] uppercase tracking-wider mb-1.5">
                    Tunjukkan ke Kasir Saat Membayar
                  </p>
                  {/* Generated clean CSS Barcode stripes matching member phone */}
                  <div className="flex items-center justify-center gap-[2.5px] h-10 px-4 bg-stone-50 rounded-lg py-1">
                    {activeMember.phone
                      .split('')
                      .map((char, i) => (
                        <div
                          key={i}
                          className="bg-black h-full rounded-xs"
                          style={{
                            width: (parseInt(char || '1', 10) % 3) + 2 + 'px',
                            opacity: (i % 5 === 0) ? 0.7 : 1,
                          }}
                        />
                      ))}
                    {/* Add filler bars */}
                    {[...Array(14)].map((_, i) => (
                      <div
                        key={'fill-' + i}
                        className="bg-black h-full rounded-xs"
                        style={{ width: (i % 2 === 0 ? 3 : 1) + 'px' }}
                      />
                    ))}
                  </div>
                  <p className="text-xs font-mono font-bold tracking-widest text-[#201b14] mt-1">
                    *{activeMember.phone}*
                  </p>
                </div>
              </div>

              {/* Tier Progress Meter */}
              <div className="p-4 rounded-2xl bg-[#fbf2eb] border border-[#ebdcd3] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#51443b]">Progress Menuju Tier Berikutnya</span>
                  <span className="font-mono font-bold text-[#964407]">
                    {activeMember.tier === 'VIP'
                      ? 'Tier Maksimal'
                      : activeMember.tier === 'Gold'
                      ? `${activeMember.points} / 1.200 Poin (VIP)`
                      : activeMember.tier === 'Silver'
                      ? `${activeMember.points} / 500 Poin (Gold)`
                      : `${activeMember.points} / 150 Poin (Silver)`}
                  </span>
                </div>
                <div className="w-full h-2.5 bg-[#ebdcd3] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-[#964407] rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(
                        100,
                        activeMember.tier === 'VIP'
                          ? 100
                          : activeMember.tier === 'Gold'
                          ? (activeMember.points / 1200) * 100
                          : activeMember.tier === 'Silver'
                          ? (activeMember.points / 500) * 100
                          : (activeMember.points / 150) * 100
                      )}%`,
                    }}
                  />
                </div>
              </div>

              {/* Member Vouchers */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#51443b] mb-3">
                  Voucher Promo yang Dapat Digunakan ({vouchers.length})
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {vouchers.map((v) => (
                    <div
                      key={v.code}
                      className="p-3 rounded-2xl border border-dashed border-[#b85a14]/40 bg-amber-50/50 flex items-center justify-between gap-2"
                    >
                      <div>
                        <span className="text-[10px] font-mono font-black text-[#964407] tracking-wider uppercase block">
                          {v.code}
                        </span>
                        <span className="text-xs font-bold text-[#201b14]">{v.name}</span>
                      </div>
                      <span className="text-xs font-mono font-bold text-[#7e3905] bg-white px-2 py-1 rounded-lg border border-[#ebdcd3]">
                        {v.type === 'percent' ? `${v.value}%` : formatRupiah(v.value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Member Transactions from Turso */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#51443b] mb-3">
                  Riwayat Pembelian di Kasir (Turso Database)
                </h4>
                {memberTransactions.length === 0 ? (
                  <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-center text-xs text-[#847870]">
                    Belum ada riwayat transaksi yang tercatat atas nomor ini. Transaksi berikutnya di kasir akan
                    otomatis muncul di sini!
                  </div>
                ) : (
                  <div className="space-y-2">
                    {memberTransactions.slice(0, 5).map((trx: any) => (
                      <div
                        key={trx.id}
                        className="p-3 rounded-xl bg-white border border-[#ebdcd3] flex items-center justify-between text-xs"
                      >
                        <div>
                          <p className="font-mono font-bold text-[#201b14]">{trx.trxNumber}</p>
                          <p className="text-[11px] text-[#847870]">
                            {trx.date} • {trx.time} ({trx.paymentMethod.toUpperCase()})
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-mono font-extrabold text-[#964407]">{formatRupiah(trx.total)}</p>
                          {trx.pointsEarned > 0 && (
                            <p className="text-[10px] text-emerald-600 font-bold">+{trx.pointsEarned} Poin</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-[#fff8f4] border-t border-[#ebdcd3] flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleLogoutMember}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-red-700 hover:bg-red-50 transition-colors"
              >
                Keluar Akun
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowMemberCardModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#51443b] hover:bg-[#ebdcd3]/50 transition-colors"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowMemberCardModal(false);
                    onOpenPos();
                  }}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#964407] hover:bg-[#7e3905] text-white shadow-xs transition-all flex items-center gap-1.5"
                >
                  <Store className="w-3.5 h-3.5" />
                  <span>Belanja di Kasir POS</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 13. GOOGLE SHEETS & CLOUD SYNC MODAL                      */}
      {/* ========================================================= */}
      {isSyncModalOpen && (
        <div
          id="sheets-sync-modal-backdrop"
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-[#ebdcd3] overflow-hidden flex flex-col my-auto max-h-[92vh] animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-[#fff8f4] border-b border-[#ebdcd3] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <FileSpreadsheet className="w-5 h-5 text-emerald-700" />
                <h3 className="font-extrabold text-base text-[#201b14] font-serif">
                  Google Sheets & Cloud Database Sync
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSyncModalOpen(false)}
                className="p-1.5 text-[#847870] hover:text-[#201b14] rounded-xl hover:bg-stone-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <GoogleSheetsSyncCard
                customers={customers}
                storeName={settings.storeName}
                onSyncComplete={() => {
                  const saved = getSavedSpreadsheetId();
                  if (saved) setSpreadsheetUrl(`https://docs.google.com/spreadsheets/d/${saved}/edit`);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
