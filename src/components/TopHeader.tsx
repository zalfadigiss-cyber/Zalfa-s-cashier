import React, { useState } from 'react';
import { Menu, Search, Bell, HelpCircle, User, CheckCircle, AlertTriangle, X } from 'lucide-react';
import { StoreSettings } from '../types';

interface TopHeaderProps {
  onOpenMobileMenu: () => void;
  onOpenHelp: () => void;
  settings: StoreSettings;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchPlaceholder?: string;
  lowStockCount: number;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  onOpenMobileMenu,
  onOpenHelp,
  settings,
  searchQuery,
  setSearchQuery,
  searchPlaceholder = 'Cari di KASIRKU...',
  lowStockCount,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <header className="flex justify-between items-center w-full px-4 md:px-8 h-16 bg-[#fff8f4]/90 backdrop-blur-md border-b border-[#dbc1b5]/40 sticky top-0 z-30">
      <div className="flex items-center gap-3 md:gap-4 flex-1">
        {/* Mobile menu trigger */}
        <button
          onClick={onOpenMobileMenu}
          className="p-2 rounded-lg text-[#554339] hover:bg-[#ece0d6] md:hidden transition-colors"
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
            className="w-full pl-9.5 pr-4 py-1.5 bg-[#fef1e7] border border-[#dbc1b5] rounded-full text-sm text-[#201b14] placeholder-[#887368] focus:outline-none focus:border-[#964407] focus:ring-2 focus:ring-[#ffdbca] transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#887368] hover:text-[#201b14]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
            }}
            className="relative p-2 text-[#554339] hover:bg-[#ece0d6] rounded-full transition-colors active:scale-95"
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
                  Kasir aktif: <span className="font-semibold">{settings.userName}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Help */}
        <button
          onClick={onOpenHelp}
          className="p-2 text-[#554339] hover:bg-[#ece0d6] rounded-full transition-colors active:scale-95"
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
            className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-full hover:bg-[#ece0d6] transition-colors cursor-pointer border border-[#dbc1b5]/50"
          >
            <div className="w-7 h-7 rounded-full overflow-hidden bg-[#e9ded6] border border-[#dbc1b5]">
              {settings.userPhotoUrl ? (
                <img
                  src={settings.userPhotoUrl}
                  alt={settings.userName}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#964407] font-bold text-xs">
                  {settings.userName.charAt(0)}
                </div>
              )}
            </div>
            <span className="text-xs font-semibold text-[#201b14] hidden sm:block max-w-[100px] truncate">
              {settings.userName}
            </span>
          </button>

          {/* Profile Menu Dropdown */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-[#dbc1b5]/60 p-3 z-50 animate-in fade-in zoom-in-95">
              <div className="flex items-center gap-3 pb-3 border-b border-[#dbc1b5]/40 mb-2">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-[#e9ded6] border border-[#dbc1b5] shrink-0">
                  <img
                    src={settings.userPhotoUrl}
                    alt={settings.userName}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#201b14] truncate">{settings.userName}</p>
                  <p className="text-[11px] text-[#645d57] truncate">{settings.userEmail}</p>
                </div>
              </div>
              <div className="text-[11px] text-[#645d57] space-y-1 py-1">
                <p>Toko: <span className="font-semibold text-[#201b14]">{settings.storeName}</span></p>
                <p>PPN Default: <span className="font-semibold text-[#201b14]">{settings.defaultTaxPercent}%</span></p>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
