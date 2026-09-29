import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  Eye,
  EyeOff,
  Copy,
  Check,
  Plus,
  Trash2,
  Edit3,
  Search,
  RefreshCw,
  Lock,
  UserCheck,
  Users,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Server,
  Database,
  ArrowRight,
} from 'lucide-react';
import { AppUser, UserRole } from '../types';
import { ConfirmationModal } from './ConfirmationModal';
import { api } from '../services/api';

interface SuperAdminScreenProps {
  currentUser: AppUser | null;
  users: AppUser[];
  onAddUser: (user: AppUser) => void;
  onUpdateUser: (user: AppUser) => void;
  onDeleteUser: (userId: string) => void;
  onRefreshUsers?: () => void;
}

export const SuperAdminScreen: React.FC<SuperAdminScreenProps> = ({
  currentUser,
  users,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
  onRefreshUsers,
}) => {
  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'super_admin' | 'admin' | 'staff'>('all');

  // Show/Hide password visibility by user ID map
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});

  // Copied password feedback map
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Status Alerts
  const [alertMessage, setAlertMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);
  const [changePasswordTarget, setChangePasswordTarget] = useState<AppUser | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AppUser | null>(null);

  // Form state for Adding User
  const [addForm, setAddForm] = useState({
    name: '',
    username: '',
    password: '',
    confirmPassword: '',
    role: 'super_admin' as UserRole,
    email: '',
    phone: '',
  });
  const [showAddPassword, setShowAddPassword] = useState(false);

  // Form state for Editing User
  const [editForm, setEditForm] = useState({
    name: '',
    username: '',
    role: 'super_admin' as UserRole,
    email: '',
    phone: '',
    newPassword: '',
  });
  const [showEditPassword, setShowEditPassword] = useState(false);

  // Form state for Dedicated Password Change Modal
  const [newPasswordValue, setNewPasswordValue] = useState('');
  const [confirmPasswordValue, setConfirmPasswordValue] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);

  // Quick Self Password Change
  const [selfOldPassword, setSelfOldPassword] = useState('');
  const [selfNewPassword, setSelfNewPassword] = useState('');
  const [selfConfirmPassword, setSelfConfirmPassword] = useState('');
  const [showSelfNewPassword, setShowSelfNewPassword] = useState(false);
  const [isSelfUpdating, setIsSelfUpdating] = useState(false);

  const showAlert = (type: 'success' | 'error', text: string) => {
    setAlertMessage({ type, text });
    setTimeout(() => {
      setAlertMessage(null);
    }, 4000);
  };

  // Toggle single user password visibility
  const togglePasswordVisibility = (userId: string) => {
    setVisiblePasswords((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  // Copy password to clipboard
  const handleCopyPassword = (userId: string, passwordText?: string) => {
    if (!passwordText) return;
    navigator.clipboard.writeText(passwordText);
    setCopiedId(userId);
    showAlert('success', 'Kata sandi berhasil disalin ke clipboard!');
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  // Generate strong random password
  const generateStrongPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    let result = '';
    for (let i = 0; i < 12; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  // Filtered users list
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchQuery =
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.email && u.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (u.phone && u.phone.includes(searchQuery));

      if (!matchQuery) return false;

      if (roleFilter === 'super_admin') return u.role === 'super_admin';
      if (roleFilter === 'admin') return u.role === 'admin';
      if (roleFilter === 'staff') return u.role === 'manager' || u.role === 'kasir';
      return true;
    });
  }, [users, searchQuery, roleFilter]);

  // Count metrics
  const superAdminCount = users.filter((u) => u.role === 'super_admin').length;
  const adminCount = users.filter((u) => u.role === 'admin').length;
  const staffCount = users.filter((u) => u.role === 'kasir' || u.role === 'manager').length;

  // 1. CREATE USER / SUPER ADMIN
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUsername = addForm.username.trim().toLowerCase();
    const cleanName = addForm.name.trim();

    if (!cleanName || !cleanUsername || !addForm.password) {
      showAlert('error', 'Semua kolom wajib diisi.');
      return;
    }

    if (cleanUsername.length < 3) {
      showAlert('error', 'Username minimal 3 karakter tanpa spasi.');
      return;
    }

    if (addForm.password.length < 4) {
      showAlert('error', 'Kata sandi minimal 4 karakter demi keamanan.');
      return;
    }

    if (addForm.password !== addForm.confirmPassword) {
      showAlert('error', 'Konfirmasi kata sandi tidak cocok.');
      return;
    }

    // Check duplicate username
    if (users.some((u) => u.username.toLowerCase() === cleanUsername)) {
      showAlert('error', `Username "${cleanUsername}" sudah digunakan oleh akun lain.`);
      return;
    }

    const newUser: AppUser = {
      id: 'user-' + Date.now(),
      name: cleanName,
      username: cleanUsername,
      password: addForm.password,
      role: addForm.role,
      email: addForm.email.trim() || `${cleanUsername}@kasirku.id`,
      phone: addForm.phone.trim() || '',
      avatarUrl:
        addForm.role === 'super_admin'
          ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'
          : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
      createdAt: new Date().toISOString().split('T')[0],
    };

    onAddUser(newUser);
    setIsAddModalOpen(false);
    setAddForm({
      name: '',
      username: '',
      password: '',
      confirmPassword: '',
      role: 'super_admin',
      email: '',
      phone: '',
    });
    showAlert('success', `Akun Super Admin / Pengguna "${newUser.name}" berhasil dibuat dan disimpan ke Turso Cloud!`);
  };

  // 2. UPDATE USER DETAILS
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    const cleanUsername = editForm.username.trim().toLowerCase();
    const cleanName = editForm.name.trim();

    if (!cleanName || !cleanUsername) {
      showAlert('error', 'Nama dan username wajib diisi.');
      return;
    }

    // Check duplicate username with other users
    if (users.some((u) => u.id !== editingUser.id && u.username.toLowerCase() === cleanUsername)) {
      showAlert('error', `Username "${cleanUsername}" sudah digunakan oleh akun lain.`);
      return;
    }

    const updated: AppUser = {
      ...editingUser,
      name: cleanName,
      username: cleanUsername,
      role: editForm.role,
      email: editForm.email.trim() || editingUser.email,
      phone: editForm.phone.trim() || editingUser.phone,
      password: editForm.newPassword.trim() ? editForm.newPassword.trim() : editingUser.password,
    };

    onUpdateUser(updated);
    setEditingUser(null);
    showAlert('success', `Profil & data akun "${updated.name}" berhasil diperbarui!`);
  };

  // 3. UPDATE PASSWORD MODAL SUBMIT
  const handlePasswordModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!changePasswordTarget) return;

    if (!newPasswordValue || newPasswordValue.length < 4) {
      showAlert('error', 'Kata sandi baru minimal 4 karakter.');
      return;
    }

    if (newPasswordValue !== confirmPasswordValue) {
      showAlert('error', 'Konfirmasi kata sandi tidak cocok.');
      return;
    }

    setIsSubmittingPassword(true);
    try {
      const res = await api.updateUserPassword(changePasswordTarget.id, newPasswordValue);
      if (res.success) {
        const updatedUser: AppUser = {
          ...changePasswordTarget,
          password: newPasswordValue,
        };
        onUpdateUser(updatedUser);
        setChangePasswordTarget(null);
        setNewPasswordValue('');
        setConfirmPasswordValue('');
        showAlert('success', `Kata sandi untuk "${changePasswordTarget.name}" (@${changePasswordTarget.username}) berhasil diperbarui dan disinkronkan ke Turso Cloud!`);
      } else {
        showAlert('error', res.error || 'Gagal mengubah kata sandi.');
      }
    } catch {
      showAlert('error', 'Terjadi kesalahan sistem saat memperbarui kata sandi.');
    } finally {
      setIsSubmittingPassword(false);
    }
  };

  // 4. QUICK SELF PASSWORD CHANGE
  const handleSelfPasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (!selfNewPassword || selfNewPassword.length < 4) {
      showAlert('error', 'Kata sandi baru minimal 4 karakter.');
      return;
    }

    if (selfNewPassword !== selfConfirmPassword) {
      showAlert('error', 'Konfirmasi kata sandi baru tidak cocok.');
      return;
    }

    setIsSelfUpdating(true);
    try {
      const res = await api.updateUserPassword(currentUser.id, selfNewPassword);
      if (res.success) {
        const updatedUser: AppUser = {
          ...currentUser,
          password: selfNewPassword,
        };
        onUpdateUser(updatedUser);
        setSelfOldPassword('');
        setSelfNewPassword('');
        setSelfConfirmPassword('');
        showAlert('success', 'Kata sandi Super Admin Anda berhasil diperbarui! Kredensial aktif telah disinkronkan.');
      } else {
        showAlert('error', res.error || 'Gagal mengubah kata sandi.');
      }
    } catch {
      showAlert('error', 'Koneksi ke database gagal.');
    } finally {
      setIsSelfUpdating(false);
    }
  };

  // 5. DELETE USER CONFIRMATION
  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;

    // Guard: Prevent deleting self
    if (currentUser && currentUser.id === deleteTarget.id) {
      showAlert('error', 'Anda tidak dapat menghapus akun yang sedang Anda gunakan untuk login saat ini.');
      setDeleteTarget(null);
      return;
    }

    // Guard: Prevent deleting last super admin
    if (deleteTarget.role === 'super_admin' && superAdminCount <= 1) {
      showAlert('error', 'Tidak dapat menghapus satu-satunya akun Super Admin aktif pada sistem.');
      setDeleteTarget(null);
      return;
    }

    onDeleteUser(deleteTarget.id);
    showAlert('success', `Akun "${deleteTarget.name}" (@${deleteTarget.username}) telah berhasil dihapus dari sistem.`);
    setDeleteTarget(null);
  };

  return (
    <div id="superadmin-screen-root" className="p-4 md:p-8 max-w-6xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#201b14] via-[#2d251d] to-[#3a2f26] p-6 rounded-2xl text-white shadow-md border border-[#dbc1b5]/30">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1.5 rounded-lg bg-[#964407] text-white">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-widest bg-[#ffbe99] text-[#592600]">
              Root Security Access
            </span>
          </div>
          <h2 className="font-serif-header text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Kelola Menu &amp; Kata Sandi Super Admin
          </h2>
          <p className="text-xs sm:text-sm text-[#dbc1b5] mt-1 max-w-2xl leading-relaxed">
            Pusat manajemen hak akses tingkat tinggi: Tambah, Lihat, Edit, Salin, dan Reset Kata Sandi seluruh akun Super Admin dan Admin POS yang terhubung ke Turso Cloud.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:self-center shrink-0">
          <button
            id="btn-open-add-superadmin"
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="w-full sm:w-auto px-4 py-2.5 bg-[#964407] hover:bg-[#b65c21] text-white text-xs sm:text-sm font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Super Admin Baru</span>
          </button>
        </div>
      </div>

      {/* Global Alert Notification */}
      {alertMessage && (
        <div
          className={`p-4 rounded-xl border flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${
            alertMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
              : 'bg-rose-50 border-rose-300 text-rose-900'
          }`}
        >
          {alertMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span className="text-xs sm:text-sm font-semibold">{alertMessage.text}</span>
        </div>
      )}

      {/* Metric Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-[#dbc1b5]/50 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-[#887368] uppercase tracking-wider">Super Admin</p>
            <h3 className="font-serif-header text-2xl font-bold text-[#964407] mt-0.5">{superAdminCount}</h3>
            <p className="text-[10px] text-[#645d57]">Hak akses penuh &amp; CRUD</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#ffbe99]/40 text-[#964407] flex items-center justify-center font-bold">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-[#dbc1b5]/50 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-[#887368] uppercase tracking-wider">Administrator</p>
            <h3 className="font-serif-header text-2xl font-bold text-purple-800 mt-0.5">{adminCount}</h3>
            <p className="text-[10px] text-[#645d57]">Kelola stok &amp; produk</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-[#dbc1b5]/50 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-[#887368] uppercase tracking-wider">Kasir &amp; Staff</p>
            <h3 className="font-serif-header text-2xl font-bold text-emerald-800 mt-0.5">{staffCount}</h3>
            <p className="text-[10px] text-[#645d57]">Transaksi harian POS</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-[#dbc1b5]/50 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-[#887368] uppercase tracking-wider">Sinkronisasi Database</p>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h4 className="text-xs font-bold text-emerald-800">Turso Cloud Aktif</h4>
            </div>
            <p className="text-[10px] text-[#645d57] font-mono mt-0.5">libsql://kasirzadb-falza...</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold border border-emerald-200">
            <Database className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Quick Password Change for Active Super Admin */}
      {currentUser && currentUser.role === 'super_admin' && (
        <div className="bg-white rounded-2xl border border-[#dbc1b5]/60 shadow-xs p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#dbc1b5]/40 pb-3">
            <div className="flex items-center gap-2.5 text-[#964407]">
              <KeyRound className="w-5 h-5" />
              <h3 className="font-serif-header text-lg font-bold text-[#201b14]">
                Ubah Cepat Kata Sandi Super Admin Saya ({currentUser.name})
              </h3>
            </div>
            <span className="text-xs font-bold text-[#554339] bg-[#f8ece1] px-2.5 py-1 rounded-full">
              Sesi Aktif: @{currentUser.username}
            </span>
          </div>

          <form onSubmit={handleSelfPasswordChange} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-xs font-bold text-[#554339] mb-1">
                Kata Sandi Baru
              </label>
              <div className="relative">
                <input
                  id="input-self-new-password"
                  type={showSelfNewPassword ? 'text' : 'password'}
                  required
                  minLength={4}
                  value={selfNewPassword}
                  onChange={(e) => setSelfNewPassword(e.target.value)}
                  placeholder="Minimal 4 karakter"
                  className="w-full px-3.5 py-2 pr-9 border border-[#dbc1b5] rounded-xl text-xs font-mono text-[#201b14] focus:outline-none focus:border-[#964407]"
                />
                <button
                  type="button"
                  onClick={() => setShowSelfNewPassword(!showSelfNewPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#887368] hover:text-[#201b14] cursor-pointer"
                  title="Lihat / Sembunyikan"
                >
                  {showSelfNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#554339] mb-1">
                Ulangi Kata Sandi Baru
              </label>
              <input
                id="input-self-confirm-password"
                type={showSelfNewPassword ? 'text' : 'password'}
                required
                minLength={4}
                value={selfConfirmPassword}
                onChange={(e) => setSelfConfirmPassword(e.target.value)}
                placeholder="Konfirmasi kata sandi"
                className="w-full px-3.5 py-2 border border-[#dbc1b5] rounded-xl text-xs font-mono text-[#201b14] focus:outline-none focus:border-[#964407]"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  const randomPass = generateStrongPassword();
                  setSelfNewPassword(randomPass);
                  setSelfConfirmPassword(randomPass);
                  setShowSelfNewPassword(true);
                  showAlert('success', 'Kata sandi acak kuat berhasil dibuat!');
                }}
                className="px-3 py-2 bg-[#f8ece1] hover:bg-[#ece0d6] text-[#964407] rounded-xl text-xs font-bold transition-colors border border-[#dbc1b5]/60 flex items-center gap-1.5 cursor-pointer"
                title="Generate Password Kuat Otomatis"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">Acak Sandi</span>
              </button>

              <button
                id="btn-submit-self-password"
                type="submit"
                disabled={isSelfUpdating}
                className="flex-1 py-2 px-4 bg-[#964407] hover:bg-[#773300] text-white rounded-xl text-xs font-bold shadow-xs transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>{isSelfUpdating ? 'Menyimpan...' : 'Perbarui Sandi Saya'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main CRUD Table Container */}
      <div className="bg-white rounded-2xl border border-[#dbc1b5]/50 shadow-xs overflow-hidden">
        {/* Filter & Search Bar */}
        <div className="p-4 sm:p-5 border-b border-[#dbc1b5]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#fff8f4]/60">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setRoleFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                roleFilter === 'all'
                  ? 'bg-[#964407] text-white shadow-2xs'
                  : 'bg-white text-[#554339] border border-[#dbc1b5]/60 hover:bg-[#f8ece1]'
              }`}
            >
              Semua Akun ({users.length})
            </button>
            <button
              onClick={() => setRoleFilter('super_admin')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                roleFilter === 'super_admin'
                  ? 'bg-[#ffbe99] text-[#592600] shadow-2xs font-extrabold'
                  : 'bg-white text-[#554339] border border-[#dbc1b5]/60 hover:bg-[#f8ece1]'
              }`}
            >
              Super Admin ({superAdminCount})
            </button>
            <button
              onClick={() => setRoleFilter('admin')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                roleFilter === 'admin'
                  ? 'bg-purple-100 text-purple-900 shadow-2xs'
                  : 'bg-white text-[#554339] border border-[#dbc1b5]/60 hover:bg-[#f8ece1]'
              }`}
            >
              Admin ({adminCount})
            </button>
            <button
              onClick={() => setRoleFilter('staff')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                roleFilter === 'staff'
                  ? 'bg-emerald-100 text-emerald-900 shadow-2xs'
                  : 'bg-white text-[#554339] border border-[#dbc1b5]/60 hover:bg-[#f8ece1]'
              }`}
            >
              Kasir/Manager ({staffCount})
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#887368]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari user, nama, no HP..."
              className="w-full pl-8.5 pr-3 py-1.5 border border-[#dbc1b5] rounded-xl text-xs text-[#201b14] placeholder-[#887368] focus:outline-none focus:border-[#964407]"
            />
          </div>
        </div>

        {/* User Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f8ece1]/70 border-b border-[#dbc1b5]/40 text-[11px] font-bold text-[#554339] uppercase tracking-wider">
                <th className="py-3 px-4">Pengguna &amp; Identitas</th>
                <th className="py-3 px-4">Peran (Role)</th>
                <th className="py-3 px-4">Kontak (Email / HP)</th>
                <th className="py-3 px-4">Kata Sandi (Password)</th>
                <th className="py-3 px-4 text-right">Aksi CRUD</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#dbc1b5]/30 text-xs">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-[#887368]">
                    Tidak ada akun yang sesuai dengan filter pencarian.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isVisible = !!visiblePasswords[u.id];
                  const passwordText = u.password || '123';
                  const isCurrentUser = currentUser?.id === u.id;
                  const isSuperAdmin = u.role === 'super_admin';

                  return (
                    <tr
                      key={u.id}
                      className={`hover:bg-[#fff8f4]/60 transition-colors ${
                        isCurrentUser ? 'bg-[#ffbe99]/15' : ''
                      }`}
                    >
                      {/* Name & Avatar */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#f8ece1] border border-[#dbc1b5] overflow-hidden shrink-0 flex items-center justify-center text-[#964407] font-bold text-xs shadow-2xs">
                            {u.avatarUrl ? (
                              <img
                                src={u.avatarUrl}
                                alt={u.name}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              u.name.charAt(0)
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-[#201b14]">{u.name}</span>
                              {isCurrentUser && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-[#964407] text-white">
                                  Anda
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-[#645d57] font-mono">@{u.username}</span>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                            u.role === 'super_admin'
                              ? 'bg-[#ffbe99] text-[#592600]'
                              : u.role === 'admin'
                              ? 'bg-purple-100 text-purple-800'
                              : u.role === 'manager'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {u.role === 'super_admin' && <ShieldCheck className="w-3 h-3" />}
                          {u.role.replace('_', ' ')}
                        </span>
                      </td>

                      {/* Contact */}
                      <td className="py-3.5 px-4 text-[#554339]">
                        <p className="truncate max-w-[180px]">{u.email || '-'}</p>
                        <p className="text-[11px] text-[#887368] font-mono">{u.phone || '-'}</p>
                      </td>

                      {/* Password Field & Actions */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="bg-[#f8ece1] px-2.5 py-1 rounded-lg border border-[#dbc1b5]/60 font-mono text-xs text-[#201b14] min-w-[120px] flex items-center justify-between">
                            <span>{isVisible ? passwordText : '••••••••••'}</span>
                            <button
                              type="button"
                              onClick={() => togglePasswordVisibility(u.id)}
                              className="text-[#887368] hover:text-[#201b14] ml-2 cursor-pointer"
                              title={isVisible ? 'Sembunyikan' : 'Tampilkan sandi'}
                            >
                              {isVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleCopyPassword(u.id, passwordText)}
                            className="p-1.5 text-[#554339] hover:bg-[#f8ece1] border border-[#dbc1b5]/50 rounded-lg transition-colors cursor-pointer"
                            title="Salin Kata Sandi"
                          >
                            {copiedId === u.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Change Password Button */}
                          <button
                            type="button"
                            onClick={() => {
                              setChangePasswordTarget(u);
                              setNewPasswordValue('');
                              setConfirmPasswordValue('');
                            }}
                            className="px-2.5 py-1 bg-[#fef1e7] hover:bg-[#ffdbca] text-[#964407] border border-[#dbc1b5]/60 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer active:scale-95"
                            title="Ubah kata sandi akun ini"
                          >
                            <KeyRound className="w-3 h-3" />
                            <span className="hidden sm:inline">Ubah Sandi</span>
                          </button>

                          {/* Edit Profile Button */}
                          <button
                            type="button"
                            onClick={() => {
                              setEditingUser(u);
                              setEditForm({
                                name: u.name,
                                username: u.username,
                                role: u.role,
                                email: u.email || '',
                                phone: u.phone || '',
                                newPassword: '',
                              });
                            }}
                            className="p-1 text-[#554339] hover:bg-[#f8ece1] border border-[#dbc1b5]/50 rounded-lg transition-colors cursor-pointer"
                            title="Edit data akun"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(u)}
                            className="p-1 text-[#ba1a1a] hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors cursor-pointer"
                            title="Hapus akun"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MODAL 1: TAMBAH SUPER ADMIN / AKUN BARU                   */}
      {/* ========================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#dbc1b5]/60 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#dbc1b5]/40 pb-3">
              <div className="flex items-center gap-2 text-[#964407]">
                <Plus className="w-5 h-5" />
                <h3 className="font-serif-header text-xl font-bold text-[#201b14]">
                  Tambah Super Admin / Akun Baru
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-[#887368] hover:text-[#201b14] text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#554339] mb-1">
                  Nama Lengkap *
                </label>
                <input
                  id="add-user-name"
                  type="text"
                  required
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  placeholder="Misal: Zalfa Administrator"
                  className="w-full px-3.5 py-2 border border-[#dbc1b5] rounded-xl text-xs text-[#201b14] focus:outline-none focus:border-[#964407]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#554339] mb-1">
                    Username Login *
                  </label>
                  <input
                    id="add-user-username"
                    type="text"
                    required
                    value={addForm.username}
                    onChange={(e) => setAddForm({ ...addForm, username: e.target.value })}
                    placeholder="misal: admin_zalfa"
                    className="w-full px-3.5 py-2 border border-[#dbc1b5] rounded-xl text-xs font-mono text-[#201b14] focus:outline-none focus:border-[#964407]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#554339] mb-1">
                    Peran / Tingkat Akses *
                  </label>
                  <select
                    id="add-user-role"
                    value={addForm.role}
                    onChange={(e) => setAddForm({ ...addForm, role: e.target.value as UserRole })}
                    className="w-full px-3.5 py-2 border border-[#dbc1b5] rounded-xl text-xs font-bold text-[#201b14] focus:outline-none focus:border-[#964407]"
                  >
                    <option value="super_admin">Super Admin (Akses Penuh)</option>
                    <option value="admin">Administrator (Manajer Toko)</option>
                    <option value="manager">Manager Operasional</option>
                    <option value="kasir">Kasir POS</option>
                  </select>
                </div>
              </div>

              {/* Password & Generator */}
              <div className="space-y-3 p-3.5 bg-[#fef1e7]/60 rounded-xl border border-[#dbc1b5]/60">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#964407]">
                    Kata Sandi (Password) *
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const pass = generateStrongPassword();
                      setAddForm({ ...addForm, password: pass, confirmPassword: pass });
                      setShowAddPassword(true);
                    }}
                    className="text-[11px] font-bold text-[#964407] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" />
                    Buat Password Acak Kuat
                  </button>
                </div>

                <div className="relative">
                  <input
                    id="add-user-password"
                    type={showAddPassword ? 'text' : 'password'}
                    required
                    minLength={4}
                    value={addForm.password}
                    onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                    placeholder="Minimal 4 karakter"
                    className="w-full px-3.5 py-2 pr-9 border border-[#dbc1b5] rounded-xl text-xs font-mono text-[#201b14] bg-white focus:outline-none focus:border-[#964407]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAddPassword(!showAddPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#887368] hover:text-[#201b14] cursor-pointer"
                  >
                    {showAddPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#554339] mb-1">
                    Konfirmasi Kata Sandi *
                  </label>
                  <input
                    id="add-user-confirm-password"
                    type={showAddPassword ? 'text' : 'password'}
                    required
                    minLength={4}
                    value={addForm.confirmPassword}
                    onChange={(e) => setAddForm({ ...addForm, confirmPassword: e.target.value })}
                    placeholder="Ulangi kata sandi"
                    className="w-full px-3.5 py-2 border border-[#dbc1b5] rounded-xl text-xs font-mono text-[#201b14] bg-white focus:outline-none focus:border-[#964407]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#554339] mb-1">
                    Email Akun
                  </label>
                  <input
                    id="add-user-email"
                    type="email"
                    value={addForm.email}
                    onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                    placeholder="email@kasirku.id"
                    className="w-full px-3.5 py-2 border border-[#dbc1b5] rounded-xl text-xs text-[#201b14] focus:outline-none focus:border-[#964407]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#554339] mb-1">
                    Nomor WhatsApp / HP
                  </label>
                  <input
                    id="add-user-phone"
                    type="tel"
                    value={addForm.phone}
                    onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                    placeholder="08123456789"
                    className="w-full px-3.5 py-2 border border-[#dbc1b5] rounded-xl text-xs text-[#201b14] focus:outline-none focus:border-[#964407]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#dbc1b5]/40">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-[#dbc1b5] rounded-xl text-xs font-bold text-[#554339] hover:bg-[#f8ece1] transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  id="btn-confirm-add-user"
                  type="submit"
                  className="px-5 py-2 bg-[#964407] hover:bg-[#773300] text-white rounded-xl text-xs font-bold shadow-sm transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Simpan Akun Baru</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: UBAH KATA SANDI (DEDICATED PASSWORD MODAL)        */}
      {/* ========================================================= */}
      {changePasswordTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#dbc1b5]/60 space-y-4">
            <div className="flex items-center justify-between border-b border-[#dbc1b5]/40 pb-3">
              <div className="flex items-center gap-2 text-[#964407]">
                <KeyRound className="w-5 h-5" />
                <h3 className="font-serif-header text-xl font-bold text-[#201b14]">
                  Ubah Kata Sandi
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setChangePasswordTarget(null)}
                className="text-[#887368] hover:text-[#201b14] text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-[#f8ece1]/70 rounded-xl border border-[#dbc1b5]/50 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#964407] text-white flex items-center justify-center font-bold text-xs">
                {changePasswordTarget.name.charAt(0)}
              </div>
              <div>
                <p className="text-xs font-bold text-[#201b14]">{changePasswordTarget.name}</p>
                <p className="text-[11px] text-[#645d57] font-mono">
                  @{changePasswordTarget.username} &bull; {changePasswordTarget.role.replace('_', ' ')}
                </p>
              </div>
            </div>

            <form onSubmit={handlePasswordModalSubmit} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-[#554339]">
                    Kata Sandi Baru *
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const pass = generateStrongPassword();
                      setNewPasswordValue(pass);
                      setConfirmPasswordValue(pass);
                      setShowNewPassword(true);
                      showAlert('success', 'Kata sandi acak kuat berhasil dibuat!');
                    }}
                    className="text-[11px] font-bold text-[#964407] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" />
                    Generate Sandi Kuat
                  </button>
                </div>

                <div className="relative">
                  <input
                    id="modal-change-password-input"
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    minLength={4}
                    value={newPasswordValue}
                    onChange={(e) => setNewPasswordValue(e.target.value)}
                    placeholder="Minimal 4 karakter"
                    className="w-full px-3.5 py-2 pr-9 border border-[#dbc1b5] rounded-xl text-xs font-mono text-[#201b14] focus:outline-none focus:border-[#964407]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#887368] hover:text-[#201b14] cursor-pointer"
                  >
                    {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#554339] mb-1">
                  Konfirmasi Kata Sandi Baru *
                </label>
                <input
                  id="modal-change-password-confirm"
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  minLength={4}
                  value={confirmPasswordValue}
                  onChange={(e) => setConfirmPasswordValue(e.target.value)}
                  placeholder="Ulangi kata sandi baru"
                  className="w-full px-3.5 py-2 border border-[#dbc1b5] rounded-xl text-xs font-mono text-[#201b14] focus:outline-none focus:border-[#964407]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#dbc1b5]/40">
                <button
                  type="button"
                  onClick={() => setChangePasswordTarget(null)}
                  className="px-4 py-2 border border-[#dbc1b5] rounded-xl text-xs font-bold text-[#554339] hover:bg-[#f8ece1] transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  id="btn-confirm-save-password"
                  type="submit"
                  disabled={isSubmittingPassword}
                  className="px-5 py-2 bg-[#964407] hover:bg-[#773300] text-white rounded-xl text-xs font-bold shadow-sm transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>{isSubmittingPassword ? 'Menyimpan...' : 'Simpan Kata Sandi'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: EDIT PROFIL AKUN                                 */}
      {/* ========================================================= */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#dbc1b5]/60 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#dbc1b5]/40 pb-3">
              <div className="flex items-center gap-2 text-[#964407]">
                <Edit3 className="w-5 h-5" />
                <h3 className="font-serif-header text-xl font-bold text-[#201b14]">
                  Edit Profil Akun
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="text-[#887368] hover:text-[#201b14] text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#554339] mb-1">
                  Nama Lengkap *
                </label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3.5 py-2 border border-[#dbc1b5] rounded-xl text-xs text-[#201b14] focus:outline-none focus:border-[#964407]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#554339] mb-1">
                    Username *
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.username}
                    onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                    className="w-full px-3.5 py-2 border border-[#dbc1b5] rounded-xl text-xs font-mono text-[#201b14] focus:outline-none focus:border-[#964407]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#554339] mb-1">
                    Peran (Role) *
                  </label>
                  <select
                    value={editForm.role}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value as UserRole })}
                    className="w-full px-3.5 py-2 border border-[#dbc1b5] rounded-xl text-xs font-bold text-[#201b14] focus:outline-none focus:border-[#964407]"
                  >
                    <option value="super_admin">Super Admin</option>
                    <option value="admin">Administrator</option>
                    <option value="manager">Manager</option>
                    <option value="kasir">Kasir</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#554339] mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full px-3.5 py-2 border border-[#dbc1b5] rounded-xl text-xs text-[#201b14] focus:outline-none focus:border-[#964407]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#554339] mb-1">
                    No. HP / WhatsApp
                  </label>
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full px-3.5 py-2 border border-[#dbc1b5] rounded-xl text-xs text-[#201b14] focus:outline-none focus:border-[#964407]"
                  />
                </div>
              </div>

              {/* Optional New Password */}
              <div className="pt-2">
                <label className="block text-xs font-bold text-[#554339] mb-1">
                  Ganti Kata Sandi (Kosongkan jika tidak ingin mengubah)
                </label>
                <div className="relative">
                  <input
                    type={showEditPassword ? 'text' : 'password'}
                    value={editForm.newPassword}
                    onChange={(e) => setEditForm({ ...editForm, newPassword: e.target.value })}
                    placeholder="Masukkan kata sandi baru (opsional)"
                    className="w-full px-3.5 py-2 pr-9 border border-[#dbc1b5] rounded-xl text-xs font-mono text-[#201b14] focus:outline-none focus:border-[#964407]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowEditPassword(!showEditPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#887368] hover:text-[#201b14] cursor-pointer"
                  >
                    {showEditPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#dbc1b5]/40">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 border border-[#dbc1b5] rounded-xl text-xs font-bold text-[#554339] hover:bg-[#f8ece1] transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#964407] hover:bg-[#773300] text-white rounded-xl text-xs font-bold shadow-sm transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 4: KONFIRMASI HAPUS AKUN                            */}
      {/* ========================================================= */}
      <ConfirmationModal
        id="confirm-delete-superadmin-user"
        isOpen={deleteTarget !== null}
        title="Hapus Akun Pengguna"
        message={`Apakah Anda yakin ingin menghapus akun "${deleteTarget?.name}" (@${deleteTarget?.username})? Tindakan ini akan menghapus akses login akun ini secara permanen dari Turso Database.`}
        confirmText="Ya, Hapus Akun"
        cancelText="Batal"
        danger={true}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
