import React, { useState } from 'react';
import {
  Store,
  ShieldCheck,
  User,
  Lock,
  Eye,
  EyeOff,
  UserPlus,
  LogIn,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  KeyRound,
  BadgeCheck,
  ArrowRight,
  Phone,
  Mail,
  Users,
  Crown,
} from 'lucide-react';
import { AppUser, UserRole } from '../types';

interface AuthScreenProps {
  onLogin: (user: AppUser) => void;
  onRegister: (newUser: AppUser) => void;
  users: AppUser[];
  onOpenMemberPortal?: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  onLogin,
  onRegister,
  users,
  onOpenMemberPortal,
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  // Login form state
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(true);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('kasir');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);
  const [regSuccess, setRegSuccess] = useState<string | null>(null);

  // Super Admin account from users list
  const superAdminAccount = users.find((u) => u.username === 'zalfaw4' || u.role === 'super_admin') || users[0];
  const superAdminUserStr = superAdminAccount?.username || 'zalfaw4';
  const superAdminPassStr = superAdminAccount?.password || '13februarilove';
  const [showAutofillPass, setShowAutofillPass] = useState(false);

  // Super Admin fast credential autofill
  const handleAutoFillSuperAdmin = () => {
    setActiveTab('login');
    setLoginUsername(superAdminUserStr);
    setLoginPassword(superAdminPassStr);
    setLoginError(null);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const cleanUsername = loginUsername.trim();
    if (!cleanUsername) {
      setLoginError('Silakan masukkan username atau email Anda.');
      return;
    }

    if (!loginPassword) {
      setLoginError('Silakan masukkan kata sandi.');
      return;
    }

    // Match username or email (case-insensitive for username/email)
    const user = users.find(
      (u) =>
        u.username.toLowerCase() === cleanUsername.toLowerCase() ||
        (u.email && u.email.toLowerCase() === cleanUsername.toLowerCase())
    );

    if (!user) {
      setLoginError(`Akun dengan username "${cleanUsername}" tidak ditemukan.`);
      return;
    }

    if (user.password !== loginPassword) {
      setLoginError('Kata sandi yang Anda masukkan salah. Periksa kembali.');
      return;
    }

    // Success login
    onLogin(user);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);
    setRegSuccess(null);

    const cleanName = regName.trim();
    const cleanUsername = regUsername.trim().toLowerCase();
    const cleanEmail = regEmail.trim();

    if (!cleanName) {
      setRegError('Nama lengkap wajib diisi.');
      return;
    }

    if (!cleanUsername || cleanUsername.length < 3) {
      setRegError('Username minimal harus 3 karakter tanpa spasi.');
      return;
    }

    // Check if username already exists
    const existing = users.find((u) => u.username.toLowerCase() === cleanUsername);
    if (existing) {
      setRegError(`Username "${cleanUsername}" sudah digunakan oleh pengguna lain.`);
      return;
    }

    if (!regPassword || regPassword.length < 4) {
      setRegError('Kata sandi minimal 4 karakter demi keamanan.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setRegError('Konfirmasi kata sandi tidak cocok dengan kata sandi.');
      return;
    }

    const newUser: AppUser = {
      id: 'user-' + Date.now(),
      name: cleanName,
      username: cleanUsername,
      password: regPassword,
      role: regRole,
      email: cleanEmail || `${cleanUsername}@kasirku.id`,
      phone: regPhone || '',
      avatarUrl:
        regRole === 'super_admin'
          ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'
          : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
      createdAt: new Date().toISOString().split('T')[0],
    };

    onRegister(newUser);
    setRegSuccess(`Akun "${cleanName}" (${cleanUsername}) berhasil didaftarkan! Mengalihkan ke sistem...`);

    // Automatically log in the newly registered user after brief moment
    setTimeout(() => {
      onLogin(newUser);
    }, 700);
  };

  return (
    <div id="auth-screen-root" className="min-h-screen bg-[#fff8f4] flex flex-col justify-center py-6 sm:py-12 px-4 sm:px-6 lg:px-8">
      {/* Container Box */}
      <div className="max-w-4xl w-full mx-auto bg-white rounded-2xl shadow-sm border border-[#dbc1b5]/60 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* Left Terminal Identification Column */}
        <div className="lg:col-span-5 bg-[#201b14] p-6 sm:p-8 text-white flex flex-col justify-between">
          <div>
            {/* POS Brand Header */}
            <div className="flex items-center gap-3 pb-6 border-b border-white/10">
              <div className="w-11 h-11 bg-[#964407] rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-serif-header text-2xl font-bold tracking-tight text-white leading-none">
                  KASIRKU
                </h1>
                <p className="text-xs text-[#dbc1b5] mt-1 font-medium">
                  Sistem Kasir &amp; Manajemen Toko
                </p>
              </div>
            </div>

            {/* System Status Indicators */}
            <div className="mt-6 space-y-2.5">
              <div className="flex items-center justify-between text-xs py-2 px-3 bg-white/5 rounded-xl border border-white/10">
                <span className="text-[#dbc1b5]">Terminal Kerja</span>
                <span className="font-bold text-white font-mono">POS-TER-01</span>
              </div>
              <div className="flex items-center justify-between text-xs py-2 px-3 bg-white/5 rounded-xl border border-white/10">
                <span className="text-[#dbc1b5]">Status Koneksi</span>
                <span className="inline-flex items-center gap-1.5 font-bold text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  Online &bull; Siap
                </span>
              </div>
              <div className="flex items-center justify-between text-xs py-2 px-3 bg-white/5 rounded-xl border border-white/10">
                <span className="text-[#dbc1b5]">Keamanan Sesi</span>
                <span className="font-semibold text-white">RBAC Terproteksi</span>
              </div>
            </div>

            {/* Role Capability Summary */}
            <div className="mt-6 pt-5 border-t border-white/10 text-xs text-[#dbc1b5] space-y-2">
              <p className="font-bold text-white">Tingkat Hak Akses Pengguna:</p>
              <ul className="space-y-1.5 text-[11px] leading-relaxed">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ffbe99]" />
                  <span><strong>Super Admin</strong>: Akses penuh, audit sistem &amp; kelola user</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-300" />
                  <span><strong>Manager</strong>: Laporan keuangan, approval void &amp; shift</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-300" />
                  <span><strong>Kasir</strong>: Transaksi belanja, barcode scanner &amp; struk</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Super Admin Credential Card */}
          <div id="superadmin-credential-card" className="mt-6 pt-5 border-t border-white/10">
            <div className="bg-[#2d251d] rounded-xl p-3.5 border border-[#dbc1b5]/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-[#ffbe99] flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Kredensial Super Admin
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-[#ffbe99] text-[#592600]">
                  Siap Pakai
                </span>
              </div>
              <div className="text-xs space-y-1.5 font-mono text-white/90">
                <p>
                  Username: <strong className="text-white bg-black/40 px-1.5 py-0.5 rounded">@{superAdminUserStr}</strong>
                </p>
                <div className="flex items-center gap-1.5">
                  <span>Password:</span>
                  <strong className="text-white bg-black/40 px-1.5 py-0.5 rounded">
                    {showAutofillPass ? superAdminPassStr : '••••••••••••'}
                  </strong>
                  <button
                    type="button"
                    onClick={() => setShowAutofillPass(!showAutofillPass)}
                    className="p-0.5 text-[#dbc1b5] hover:text-white transition-colors cursor-pointer"
                    title={showAutofillPass ? 'Sembunyikan' : 'Tampilkan'}
                  >
                    {showAutofillPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
              <button
                id="btn-autofill-superadmin-card"
                type="button"
                onClick={handleAutoFillSuperAdmin}
                className="mt-3 w-full py-2 px-3 bg-[#964407] hover:bg-[#b65c21] text-white text-xs font-bold rounded-lg transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Gunakan Akun Super Admin</span>
              </button>
            </div>
          </div>

          {/* Member Landing Page Switcher */}
          {onOpenMemberPortal && (
            <div className="mt-4 pt-3 border-t border-white/10">
              <button
                id="btn-goto-member-landing"
                type="button"
                onClick={onOpenMemberPortal}
                className="w-full py-2.5 px-3 bg-gradient-to-r from-amber-600/30 to-amber-700/30 hover:from-amber-600/50 hover:to-amber-700/50 text-amber-200 border border-amber-300/30 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Crown className="w-3.5 h-3.5 text-amber-300" />
                <span>Buka Landing Page Member & Poin VIP</span>
              </button>
            </div>
          )}
        </div>

        {/* Right Form Column */}
        <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-center bg-white">
          {/* Tabs Switcher */}
          <div className="flex p-1 bg-[#f8ece1] rounded-xl border border-[#dbc1b5]/50 mb-6">
            <button
              id="tab-btn-login"
              type="button"
              onClick={() => {
                setActiveTab('login');
                setLoginError(null);
              }}
              className={`flex-1 py-2 px-4 rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'login'
                  ? 'bg-[#964407] text-white shadow-xs'
                  : 'text-[#645d57] hover:text-[#201b14]'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>Masuk Kasir</span>
            </button>
            <button
              id="tab-btn-register"
              type="button"
              onClick={() => {
                setActiveTab('register');
                setRegError(null);
                setRegSuccess(null);
              }}
              className={`flex-1 py-2 px-4 rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'register'
                  ? 'bg-[#964407] text-white shadow-xs'
                  : 'text-[#645d57] hover:text-[#201b14]'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>Pendaftaran Staf</span>
            </button>
          </div>

          {/* TAB 1: FORM LOGIN */}
          {activeTab === 'login' && (
            <div id="auth-tab-login-content" className="space-y-4 animate-in fade-in duration-200">
              <div>
                <h2 className="text-xl sm:text-2xl font-serif-header font-bold text-[#201b14]">
                  Autentikasi Akses Terminal
                </h2>
                <p className="text-xs sm:text-sm text-[#554339] mt-1">
                  Masukkan username kasir atau kredensial Super Admin untuk membuka sesi.
                </p>
              </div>

              {loginError && (
                <div id="login-error-alert" className="p-3 bg-[#ffdad6]/70 border border-[#ba1a1a]/40 rounded-xl flex items-start gap-2.5 text-xs text-[#ba1a1a] animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{loginError}</span>
                </div>
              )}

              <form id="auth-login-form" onSubmit={handleLoginSubmit} className="space-y-3.5">
                <div>
                  <label htmlFor="input-login-username" className="block text-xs font-bold text-[#554339] mb-1">
                    Username atau Email
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#887368]" />
                    <input
                      id="input-login-username"
                      type="text"
                      value={loginUsername}
                      onChange={(e) => setLoginUsername(e.target.value)}
                      placeholder="Contoh: zalfaw4"
                      className="w-full pl-10 pr-3.5 py-2.5 border border-[#dbc1b5] rounded-xl text-sm text-[#201b14] bg-[#fef1e7]/30 focus:bg-white focus:border-[#964407] focus:outline-none focus:ring-1 focus:ring-[#964407] transition-all"
                      autoFocus
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="input-login-password" className="block text-xs font-bold text-[#554339] mb-1">
                    Kata Sandi (Password)
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#887368]" />
                    <input
                      id="input-login-password"
                      type={showLoginPassword ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Masukkan kata sandi"
                      className="w-full pl-10 pr-10 py-2.5 border border-[#dbc1b5] rounded-xl text-sm text-[#201b14] bg-[#fef1e7]/30 focus:bg-white focus:border-[#964407] focus:outline-none focus:ring-1 focus:ring-[#964407] transition-all"
                    />
                    <button
                      id="btn-toggle-login-password"
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#887368] hover:text-[#201b14] p-1 cursor-pointer"
                      title={showLoginPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
                    >
                      {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 text-[#645d57] cursor-pointer select-none">
                    <input
                      id="checkbox-remember-me"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded text-[#964407] focus:ring-[#964407] accent-[#964407]"
                    />
                    <span>Ingat sesi di perangkat ini</span>
                  </label>
                  <button
                    id="btn-superadmin-quick-link"
                    type="button"
                    onClick={handleAutoFillSuperAdmin}
                    className="text-[#964407] hover:underline font-semibold cursor-pointer"
                  >
                    Pakai Super Admin
                  </button>
                </div>

                <button
                  id="btn-submit-login"
                  type="submit"
                  className="w-full mt-2 py-3 px-4 bg-[#964407] hover:bg-[#773300] text-white rounded-xl font-bold text-sm shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2 active:scale-99"
                >
                  <span>Buka Terminal Kasir</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Quick Demo Switchers */}
              <div className="pt-4 border-t border-[#dbc1b5]/40">
                <p className="text-[11px] font-bold text-[#887368] uppercase tracking-wider mb-2">
                  Daftar Akun Siap Uji:
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {users.slice(0, 3).map((u) => (
                    <button
                      id={`demo-user-${u.id}`}
                      key={u.id}
                      type="button"
                      onClick={() => {
                        setLoginUsername(u.username);
                        setLoginPassword(u.password || '');
                      }}
                      className="p-2 border border-[#dbc1b5]/60 hover:border-[#964407] bg-[#fff8f4] rounded-lg text-left transition-colors cursor-pointer"
                    >
                      <p className="text-[11px] font-bold text-[#201b14] truncate">{u.name}</p>
                      <p className="text-[10px] text-[#964407] font-semibold uppercase">{u.role.replace('_', ' ')}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FORM DAFTAR (REGISTER) */}
          {activeTab === 'register' && (
            <div id="auth-tab-register-content" className="space-y-4 animate-in fade-in duration-200">
              <div>
                <h2 className="text-xl sm:text-2xl font-serif-header font-bold text-[#201b14]">
                  Pendaftaran Akun Baru
                </h2>
                <p className="text-xs sm:text-sm text-[#554339] mt-1">
                  Registrasi staf kasir, manajer shift, atau administrator toko.
                </p>
              </div>

              {regError && (
                <div id="reg-error-alert" className="p-3 bg-[#ffdad6]/70 border border-[#ba1a1a]/40 rounded-xl flex items-start gap-2.5 text-xs text-[#ba1a1a] animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{regError}</span>
                </div>
              )}

              {regSuccess && (
                <div id="reg-success-alert" className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl flex items-start gap-2.5 text-xs text-emerald-800 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                  <span>{regSuccess}</span>
                </div>
              )}

              <form id="auth-register-form" onSubmit={handleRegisterSubmit} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="input-reg-name" className="block text-xs font-bold text-[#554339] mb-1">
                      Nama Lengkap <span className="text-[#ba1a1a]">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#887368]" />
                      <input
                        id="input-reg-name"
                        type="text"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder="Contoh: Rian Pratama"
                        className="w-full pl-10 pr-3 py-2 border border-[#dbc1b5] rounded-xl text-xs sm:text-sm text-[#201b14] bg-[#fef1e7]/30 focus:bg-white focus:border-[#964407] focus:outline-none focus:ring-1 focus:ring-[#964407] transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="input-reg-username" className="block text-xs font-bold text-[#554339] mb-1">
                      Username <span className="text-[#ba1a1a]">*</span>
                    </label>
                    <div className="relative">
                      <span className="text-xs font-bold absolute left-3.5 top-1/2 -translate-y-1/2 text-[#887368]">
                        @
                      </span>
                      <input
                        id="input-reg-username"
                        type="text"
                        value={regUsername}
                        onChange={(e) => setRegUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                        placeholder="rian_kasir"
                        className="w-full pl-8 pr-3 py-2 border border-[#dbc1b5] rounded-xl text-xs sm:text-sm text-[#201b14] bg-[#fef1e7]/30 focus:bg-white focus:border-[#964407] focus:outline-none focus:ring-1 focus:ring-[#964407] transition-all"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="input-reg-email" className="block text-xs font-bold text-[#554339] mb-1">
                      Email (Opsional)
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#887368]" />
                      <input
                        id="input-reg-email"
                        type="email"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="rian@toko.com"
                        className="w-full pl-10 pr-3 py-2 border border-[#dbc1b5] rounded-xl text-xs sm:text-sm text-[#201b14] bg-[#fef1e7]/30 focus:bg-white focus:border-[#964407] focus:outline-none focus:ring-1 focus:ring-[#964407] transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="input-reg-phone" className="block text-xs font-bold text-[#554339] mb-1">
                      No. Telepon / WA
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#887368]" />
                      <input
                        id="input-reg-phone"
                        type="tel"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        placeholder="08123456789"
                        className="w-full pl-10 pr-3 py-2 border border-[#dbc1b5] rounded-xl text-xs sm:text-sm text-[#201b14] bg-[#fef1e7]/30 focus:bg-white focus:border-[#964407] focus:outline-none focus:ring-1 focus:ring-[#964407] transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#554339] mb-1">
                    Peran Akses (Role)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'kasir', label: 'Kasir', desc: 'Transaksi' },
                      { id: 'manager', label: 'Manager', desc: 'Laporan' },
                      { id: 'admin', label: 'Admin', desc: 'Produk' },
                      { id: 'super_admin', label: 'Super Admin', desc: 'Full Akses' },
                    ].map((r) => (
                      <button
                        id={`btn-role-select-${r.id}`}
                        key={r.id}
                        type="button"
                        onClick={() => setRegRole(r.id as UserRole)}
                        className={`p-2 rounded-lg border text-left transition-colors cursor-pointer ${
                          regRole === r.id
                            ? 'border-[#964407] bg-[#fff8f4] text-[#964407] font-bold shadow-2xs'
                            : 'border-[#dbc1b5]/60 hover:border-[#dbc1b5] text-[#554339] bg-white'
                        }`}
                      >
                        <p className="text-xs font-bold leading-tight">{r.label}</p>
                        <p className="text-[10px] text-[#887368]">{r.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="input-reg-password" className="block text-xs font-bold text-[#554339] mb-1">
                      Kata Sandi <span className="text-[#ba1a1a]">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#887368]" />
                      <input
                        id="input-reg-password"
                        type={showRegPassword ? 'text' : 'password'}
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="Min. 4 karakter"
                        className="w-full pl-10 pr-10 py-2 border border-[#dbc1b5] rounded-xl text-xs sm:text-sm text-[#201b14] bg-[#fef1e7]/30 focus:bg-white focus:border-[#964407] focus:outline-none focus:ring-1 focus:ring-[#964407] transition-all"
                        required
                      />
                      <button
                        id="btn-toggle-reg-password"
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#887368] hover:text-[#201b14] p-1 cursor-pointer"
                      >
                        {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="input-reg-confirm-password" className="block text-xs font-bold text-[#554339] mb-1">
                      Ulangi Kata Sandi <span className="text-[#ba1a1a]">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#887368]" />
                      <input
                        id="input-reg-confirm-password"
                        type={showRegPassword ? 'text' : 'password'}
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        placeholder="Ulangi kata sandi"
                        className="w-full pl-10 pr-3.5 py-2 border border-[#dbc1b5] rounded-xl text-xs sm:text-sm text-[#201b14] bg-[#fef1e7]/30 focus:bg-white focus:border-[#964407] focus:outline-none focus:ring-1 focus:ring-[#964407] transition-all"
                        required
                      />
                    </div>
                  </div>
                </div>

                <button
                  id="btn-submit-register"
                  type="submit"
                  className="w-full mt-2 py-3 px-4 bg-[#964407] hover:bg-[#773300] text-white rounded-xl font-bold text-sm shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2 active:scale-99"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Daftarkan Akun &amp; Buka Sesi</span>
                </button>
              </form>

              <div className="text-center pt-2">
                <p className="text-xs text-[#645d57]">
                  Sudah memiliki akun?{' '}
                  <button
                    id="btn-switch-to-login"
                    type="button"
                    onClick={() => setActiveTab('login')}
                    className="font-bold text-[#964407] hover:underline cursor-pointer"
                  >
                    Masuk di sini
                  </button>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
