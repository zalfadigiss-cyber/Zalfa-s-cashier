import React, { useState } from 'react';
import {
  Menu,
  Search,
  Bell,
  HelpCircle,
  CheckCircle,
  AlertTriangle,
  X,
  Building2,
  Wallet,
  Keyboard,
  ChevronDown,
  ShieldCheck,
  LogOut,
} from 'lucide-react';
import { StoreSettings, Branch, ShiftSession, AppUser } from '../types';

interface TopHeaderProps {
  onOpenMobileMenu: () => void;
  onOpenHelp: () => void;
  settings: StoreSettings;
  currentUser?: AppUser | null;
  onLogout?: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchPlaceholder?: string;
  lowStockCount: number;
  branches: Branch[];
  activeBranchId: string;
  onSelectBranch: (branchId: string) => void;
  currentShift: ShiftSession | null;
  onOpenShiftModal: () => void;
  onOpenHotkeysGuide: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  onOpenMobileMenu,
  onOpenHelp,
  settings,
  currentUser,
  onLogout,
  searchQuery,
  setSearchQuery,
  searchPlaceholder = 'Cari di KASIRKU...',
  lowStockCount,
  branches,
  activeBranchId,
  onSelectBranch,
  currentShift,
  onOpenShiftModal,
  onOpenHotkeysGuide,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const activeBranch = branches.find((b) => b.id === activeBranchId) || branches[0];

  return (
    <header className="flex justify-between items-center w-full px-3 sm:px-6 md:px-8 h-16 bg-[#fff8f4]/95 backdrop-blur-md border-b border-[#dbc1b5]/40 sticky top-0 z-30">
      <div className="flex items-center gap-2 sm:gap-3 flex-1">
        {/* Mobile menu trigger */}
        <button
          onClick={onOpenMobileMenu}
          className="p-2 rounded-lg text-[#554339] hover:bg-[#ece0d6] md:hidden transition-colors cursor-pointer"
          aria-label="Buka menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search */}
        <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#887368]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full pl-9.5 pr-4 py-1.5 bg-[#fef1e7] border border-[#dbc1b5] rounded-full text-xs sm:text-sm text-[#201b14] placeholder-[#887368] focus:outline-none focus:border-[#964407] focus:ring-2 focus:ring-[#ffdbca] transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#887368] hover:text-[#201b14] cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2.5">
        {/* Enterprise Branch Selector */}
        <div className="hidden lg:flex items-center gap-1.5 bg-white border border-[#dbc1b5] rounded-xl px-2.5 py-1 shadow-2xs">
          <Building2 className="w-3.5 h-3.5 text-[#964407]" />
          <select
            value={activeBranchId}
            onChange={(e) => onSelectBranch(e.target.value)}
            className="bg-transparent text-xs font-bold text-[#201b14] focus:outline-none cursor-pointer pr-1"
          >
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} ({b.city})
              </option>
            ))}
          </select>
        </div>

        {/* Cashier Shift Status Button */}
        <button
          onClick={onOpenShiftModal}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs ${
            currentShift
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
              : 'bg-rose-50 text-rose-800 border border-rose-300 hover:bg-rose-100'
          }`}
          title="Manajemen Shift & Kas Laci (F9)"
        >
          <Wallet className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">
            {currentShift ? `Kas Aktif (#Shift ${currentShift.shiftNumber})` : 'Buka Shift Kas'}
          </span>
          <span className="sm:hidden">
            {currentShift ? 'Kas Aktif' : 'Shift'}
          </span>
        </button>

        {/* Hotkeys button */}
        <button
          onClick={onOpenHotkeysGuide}
          className="hidden sm:flex p-2 text-[#554339] hover:bg-[#ece0d6] rounded-xl transition-colors cursor-pointer"
          title="Tombol Pintas Kasir"
        >
          <Keyboard className="w-4 h-4 text-[#964407]" />
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
            }}
            className="relative p-2 text-[#554339] hover:bg-[#ece0d6] rounded-full transition-colors active:scale-95 cursor-pointer"
            title="Notifikasi"
          >
            <Bell className="w-5 h-5" />
            {lowStockCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-[#ba1a1a] rounded-full ring-2 ring-[#fff8f4]" />
            )}
          </button>

          {/* Notification Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-[#dbc1b5]/60 p-3 z-50 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#dbc1b5]/40">
                <h4 className="text-xs font-bold text-[#201b14] uppercase tracking-wider">
                  Notifikasi Sistem
                </h4>
                <span className="text-[10px] text-[#645d57] bg-[#f8ece1] px-2 py-0.5 rounded-full font-semibold">
                  {lowStockCount > 0 ? `${lowStockCount} Peringatan` : 'Semua Aman'}
                </span>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {lowStockCount > 0 ? (
                  <div className="p-2.5 bg-[#ffdad6]/40 border border-[#ffdad6] rounded-lg flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-[#ba1a1a] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-[#93000a]">
                        Peringatan Stok Rendah
                      </p>
                      <p className="text-[11px] text-[#554339] mt-0.5">
                        Ada {lowStockCount} produk yang mendekati atau telah habis.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-2.5 bg-[#d1fae5]/50 border border-[#d1fae5] rounded-lg flex items-start gap-2.5">
                    <CheckCircle className="w-4 h-4 text-[#059669] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-[#059669]">Sistem Siap</p>
                      <p className="text-[11px] text-[#554339] mt-0.5">
                        Semua inventaris dan koneksi kasir berfungsi normal.
                      </p>
                    </div>
                  </div>
                )}
                <div className="p-2 bg-[#f8ece1]/60 rounded-lg text-[11px] text-[#554339]">
                  Cabang Aktif: <span className="font-semibold">{activeBranch.name}</span>
                </div>
                <div className="p-2 bg-[#f8ece1]/60 rounded-lg text-[11px] text-[#554339]">
                  Kasir: <span className="font-semibold">{settings.userName}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Help */}
        <button
          onClick={onOpenHelp}
          className="p-2 text-[#554339] hover:bg-[#ece0d6] rounded-full transition-colors active:scale-95 cursor-pointer"
          title="Bantuan & Petunjuk"
        >
          <HelpCircle className="w-5 h-5" />
        </button>

        <div className="w-[1px] h-6 bg-[#dbc1b5]/60 mx-0.5" />

        {/* User Profile avatar */}
        <div className="relative">
          <button
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-full hover:bg-[#ece0d6] transition-colors cursor-pointer border border-[#dbc1b5]/60 bg-white/60 shadow-2xs"
          >
            <div className="w-7 h-7 rounded-full overflow-hidden bg-[#e9ded6] border border-[#dbc1b5] shrink-0">
              {currentUser?.avatarUrl || settings.userPhotoUrl ? (
                <img
                  src={currentUser?.avatarUrl || settings.userPhotoUrl}
                  alt={currentUser?.name || settings.userName}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#964407] font-bold text-xs">
                  {(currentUser?.name || settings.userName).charAt(0)}
                </div>
              )}
            </div>
            <div className="hidden sm:flex flex-col text-left leading-none">
              <span className="text-xs font-bold text-[#201b14] max-w-[110px] truncate">
                {currentUser?.name || settings.userName}
              </span>
              <span className="text-[10px] font-semibold text-[#964407] uppercase mt-0.5">
                {currentUser?.role ? currentUser.role.replace('_', ' ') : 'Kasir'}
              </span>
            </div>
            {currentUser?.role === 'super_admin' && (
              <span className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-black bg-[#ffbe99] text-[#592600] uppercase tracking-wider">
                <ShieldCheck className="w-2.5 h-2.5" />
                Super Admin
              </span>
            )}
            <ChevronDown className="w-3 h-3 text-[#887368]" />
          </button>

          {/* Profile Menu Dropdown */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-[#dbc1b5]/60 p-3.5 z-50 animate-in fade-in zoom-in-95">
              <div className="flex items-center gap-3 pb-3 border-b border-[#dbc1b5]/40 mb-2">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-[#e9ded6] border border-[#dbc1b5] shrink-0">
                  <img
                    src={currentUser?.avatarUrl || settings.userPhotoUrl}
                    alt={currentUser?.name || settings.userName}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-[#201b14] truncate">
                    {currentUser?.name || settings.userName}
                  </p>
                  <p className="text-[11px] text-[#645d57] truncate">
                    @{currentUser?.username || 'kasir'}
                  </p>
                  <div className="mt-1">
                    <span
                      className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase tracking-wider ${
                        currentUser?.role === 'super_admin'
                          ? 'bg-[#ffbe99] text-[#592600]'
                          : currentUser?.role === 'manager'
                          ? 'bg-blue-100 text-blue-800'
                          : currentUser?.role === 'admin'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {currentUser?.role === 'super_admin' && <ShieldCheck className="w-2.5 h-2.5" />}
                      {currentUser?.role ? currentUser.role.replace('_', ' ') : 'Kasir'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-[#645d57] space-y-1.5 py-1.5 bg-[#fef1e7]/40 p-2.5 rounded-xl border border-[#dbc1b5]/30">
                <p>Toko: <span className="font-semibold text-[#201b14]">{settings.storeName}</span></p>
                <p>Cabang: <span className="font-semibold text-[#201b14]">{activeBranch.name}</span></p>
                <p>Email: <span className="font-semibold text-[#201b14]">{currentUser?.email || settings.userEmail}</span></p>
              </div>

              <div className="pt-2.5 mt-1 border-t border-[#dbc1b5]/40">
                <button
                  id="topheader-btn-logout"
                  onClick={() => {
                    setShowProfileMenu(false);
                    if (onLogout) {
                      onLogout();
                    }
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-bold text-[#ba1a1a] bg-[#ffdad6]/40 hover:bg-[#ffdad6] rounded-xl transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5 text-[#ba1a1a]" />
                  <span>Keluar / Ganti Akun</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
