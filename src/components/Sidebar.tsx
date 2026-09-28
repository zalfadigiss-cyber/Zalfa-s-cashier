import React from 'react';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Tag,
  Boxes,
  History,
  BarChart3,
  Settings,
  HelpCircle,
  LogOut,
  Store,
  X,
  CreditCard,
  ShieldCheck,
  Crown,
} from 'lucide-react';
import { TabType, StoreSettings, AppUser } from '../types';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  isOpenMobile: boolean;
  setIsOpenMobile: (open: boolean) => void;
  settings: StoreSettings;
  currentUser?: AppUser | null;
  onLogout?: () => void;
  onOpenHelp: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpenMobile,
  setIsOpenMobile,
  settings,
  currentUser,
  onLogout,
  onOpenHelp,
}) => {
  const navItems: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'kasir', label: 'Kasir', icon: <ShoppingCart className="w-5 h-5" /> },
    { id: 'member', label: 'Member & Loyalty', icon: <Crown className="w-5 h-5" /> },
    { id: 'produk', label: 'Produk', icon: <Package className="w-5 h-5" /> },
    { id: 'kategori', label: 'Kategori', icon: <Tag className="w-5 h-5" /> },
    { id: 'stok', label: 'Stok', icon: <Boxes className="w-5 h-5" /> },
    { id: 'riwayat', label: 'Riwayat Penjualan', icon: <History className="w-5 h-5" /> },
    { id: 'laporan', label: 'Laporan', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'pengaturan', label: 'Pengaturan', icon: <Settings className="w-5 h-5" /> },
  ];

  const handleSelectTab = (tab: TabType) => {
    setActiveTab(tab);
    setIsOpenMobile(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-xs transition-opacity"
          onClick={() => setIsOpenMobile(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#f8ece1] border-r border-[#dbc1b5]/60 flex flex-col py-6 px-4 transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between px-2 pb-5 mb-2 border-b border-[#dbc1b5]/50">
          <div
            className="flex items-center gap-3 cursor-pointer select-none"
            onClick={() => handleSelectTab('dashboard')}
          >
            <div className="w-10 h-10 bg-[#964407] rounded-lg flex items-center justify-center text-white shadow-sm">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-serif-header text-xl font-bold tracking-tight text-[#964407] leading-tight">
                KASIRKU
              </h1>
              <p className="text-[11px] font-semibold tracking-wider text-[#645d57] uppercase">
                POS System
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsOpenMobile(false)}
            className="p-1 rounded-lg text-[#645d57] hover:bg-[#ece0d6] md:hidden"
            aria-label="Tutup menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex-1 flex flex-col gap-1 overflow-y-auto pr-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150 text-left ${
                  isActive
                    ? 'bg-[#b65c21] text-white shadow-sm'
                    : 'text-[#554339] hover:bg-[#ece0d6] active:scale-[0.98]'
                }`}
              >
                <span className={isActive ? 'text-white' : 'text-[#887368]'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* CTA & Footer */}
        <div className="mt-auto pt-4 border-t border-[#dbc1b5]/50 flex flex-col gap-2">
          {/* Active User Card */}
          {currentUser && (
            <div className="p-2.5 bg-white/70 rounded-xl border border-[#dbc1b5]/60 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-[#e9ded6] border border-[#dbc1b5] shrink-0">
                {currentUser.avatarUrl ? (
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#964407] font-bold text-xs">
                    {currentUser.name.charAt(0)}
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-[#201b14] truncate leading-tight">
                  {currentUser.name}
                </p>
                <div className="flex items-center gap-1 mt-0.5">
                  <span
                    className={`inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider ${
                      currentUser.role === 'super_admin'
                        ? 'bg-[#ffbe99] text-[#592600]'
                        : currentUser.role === 'manager'
                        ? 'bg-blue-100 text-blue-800'
                        : currentUser.role === 'admin'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {currentUser.role === 'super_admin' && <ShieldCheck className="w-2.5 h-2.5" />}
                    {currentUser.role.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Quick Cashier Launch Button */}
          <button
            onClick={() => handleSelectTab('kasir')}
            className="w-full bg-[#964407] hover:bg-[#773300] text-white py-2.5 px-4 rounded-lg font-semibold text-sm shadow-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer"
          >
            <CreditCard className="w-4 h-4" />
            <span>Buka Kasir</span>
          </button>

          <div className="flex flex-col gap-1 mt-1">
            <button
              onClick={onOpenHelp}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-[#645d57] hover:bg-[#ece0d6] transition-colors text-left"
            >
              <HelpCircle className="w-4 h-4 text-[#887368]" />
              <span>Bantuan</span>
            </button>
            <button
              id="sidebar-btn-logout"
              onClick={() => {
                if (onLogout) {
                  onLogout();
                } else {
                  handleSelectTab('dashboard');
                }
              }}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-[#ba1a1a] hover:bg-[#ffdad6] transition-colors text-left cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-[#ba1a1a]" />
              <span>Keluar Akun</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
