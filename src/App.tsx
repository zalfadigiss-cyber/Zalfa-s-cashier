import React, { useState, useEffect } from 'react';
import {
  TabType,
  Category,
  Product,
  Transaction,
  StoreSettings,
  Branch,
  Customer,
  VoucherPromo,
  ShiftSession,
  HoldOrder,
  ShiftLog,
  AppUser,
} from './types';
import {
  initialCategories,
  initialProducts,
  initialTransactions,
  initialStoreSettings,
  initialBranches,
  initialCustomers,
  initialVouchers,
  initialActiveShift,
  initialUsers,
} from './data/initialData';
import { AuthScreen } from './components/AuthScreen';
import { Sidebar } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { DashboardScreen } from './components/DashboardScreen';
import { KasirScreen } from './components/KasirScreen';
import { ProdukScreen } from './components/ProdukScreen';
import { KategoriScreen } from './components/KategoriScreen';
import { StokScreen } from './components/StokScreen';
import { RiwayatPenjualanScreen } from './components/RiwayatPenjualanScreen';
import { LaporanScreen } from './components/LaporanScreen';
import { PengaturanScreen } from './components/PengaturanScreen';
import { BantuanModal } from './components/BantuanModal';
import { ShiftModal } from './components/ShiftModal';
import { HotkeysModal } from './components/HotkeysModal';
import { ConfirmationModal } from './components/ConfirmationModal';
import { FnBInventoryScannerModule, FnBCartItem } from './components/FnBInventoryScannerModule';
import { MemberLandingPage } from './components/MemberLandingPage';
import { getIndonesianDate, getIndonesianTime } from './utils/format';
import { api } from './services/api';

export default function App() {
  // Top-level View Mode: 'landing' for Member Landing Page, 'pos' for Point of Sale & Staff
  const [viewMode, setViewMode] = useState<'landing' | 'pos'>('landing');

  // Navigation State
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [isOpenMobile, setIsOpenMobile] = useState<boolean>(false);
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);
  const [isShiftModalOpen, setIsShiftModalOpen] = useState<boolean>(false);
  const [isHotkeysOpen, setIsHotkeysOpen] = useState<boolean>(false);
  const [isFnBScannerOpen, setIsFnBScannerOpen] = useState<boolean>(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState<boolean>(false);
  const [globalSearch, setGlobalSearch] = useState<string>('');

  // Primary Data State with Local Storage fallback
  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const saved = localStorage.getItem('kasirku_categories');
      return saved ? JSON.parse(saved) : initialCategories;
    } catch {
      return initialCategories;
    }
  });

  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('kasirku_products');
      return saved ? JSON.parse(saved) : initialProducts;
    } catch {
      return initialProducts;
    }
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem('kasirku_transactions');
      return saved ? JSON.parse(saved) : initialTransactions;
    } catch {
      return initialTransactions;
    }
  });

  const [settings, setSettings] = useState<StoreSettings>(() => {
    try {
      const saved = localStorage.getItem('kasirku_settings');
      return saved ? JSON.parse(saved) : initialStoreSettings;
    } catch {
      return initialStoreSettings;
    }
  });

  // Enterprise Users & Authentication State
  const [users, setUsers] = useState<AppUser[]>(() => {
    try {
      const saved = localStorage.getItem('kasirku_users');
      if (saved) {
        const parsed: AppUser[] = JSON.parse(saved);
        // Guarantee Super Admin zalfaw4 is always present in users
        if (!parsed.some((u) => u.username === 'zalfaw4')) {
          parsed.unshift(initialUsers[0]);
        }
        return parsed;
      }
      return initialUsers;
    } catch {
      return initialUsers;
    }
  });

  const [currentUser, setCurrentUser] = useState<AppUser | null>(() => {
    try {
      const saved = localStorage.getItem('kasirku_current_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Enterprise Multi-Branch State
  const [branches, setBranches] = useState<Branch[]>(() => {
    try {
      const saved = localStorage.getItem('kasirku_branches');
      return saved ? JSON.parse(saved) : initialBranches;
    } catch {
      return initialBranches;
    }
  });
  const [activeBranchId, setActiveBranchId] = useState<string>(branches[0]?.id || 'branch-01');

  // Enterprise CRM Customers & Loyalty
  const [customers, setCustomers] = useState<Customer[]>(() => {
    try {
      const saved = localStorage.getItem('kasirku_customers');
      return saved ? JSON.parse(saved) : initialCustomers;
    } catch {
      return initialCustomers;
    }
  });

  // Enterprise Vouchers
  const [vouchers, setVouchers] = useState<VoucherPromo[]>(() => {
    try {
      const saved = localStorage.getItem('kasirku_vouchers');
      return saved ? JSON.parse(saved) : initialVouchers;
    } catch {
      return initialVouchers;
    }
  });

  // Enterprise Shift & Cash Drawer
  const [currentShift, setCurrentShift] = useState<ShiftSession | null>(() => {
    try {
      const saved = localStorage.getItem('kasirku_active_shift');
      return saved ? JSON.parse(saved) : initialActiveShift;
    } catch {
      return initialActiveShift;
    }
  });

  // Enterprise Held Orders (Tahan Pesanan)
  const [heldOrders, setHeldOrders] = useState<HoldOrder[]>(() => {
    try {
      const saved = localStorage.getItem('kasirku_held_orders');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Active Receipt to open automatically or from history
  const [activeReceiptTrx, setActiveReceiptTrx] = useState<Transaction | null>(null);

  // Sync with Turso Edge Database on Mount
  useEffect(() => {
    async function loadTursoData() {
      try {
        const [cats, prods, trxs, sets, usrs, custs, vchs, shift] = await Promise.all([
          api.getCategories(),
          api.getProducts(),
          api.getTransactions(),
          api.getSettings(),
          api.getUsers(),
          api.getCustomers(),
          api.getVouchers(),
          api.getActiveShift(),
        ]);

        if (cats && cats.length > 0) setCategories(cats);
        if (prods && prods.length > 0) setProducts(prods);
        if (trxs && trxs.length > 0) setTransactions(trxs);
        if (sets) setSettings(sets);
        if (usrs && usrs.length > 0) {
          // Guarantee Super Admin zalfaw4 is always present in users
          const hasAdmin = usrs.some((u) => u.username === 'zalfaw4');
          setUsers(hasAdmin ? usrs : [initialUsers[0], ...usrs]);
        }
        if (custs && custs.length > 0) setCustomers(custs);
        if (vchs && vchs.length > 0) setVouchers(vchs);
        if (shift) setCurrentShift(shift);
      } catch (err) {
        console.warn('[Turso] Using offline cached state:', err);
      }
    }
    loadTursoData();
  }, []);

  // Sync to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('kasirku_categories', JSON.stringify(categories));
    } catch {
      // ignore
    }
  }, [categories]);

  useEffect(() => {
    try {
      localStorage.setItem('kasirku_products', JSON.stringify(products));
    } catch {
      // ignore
    }
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem('kasirku_transactions', JSON.stringify(transactions));
    } catch {
      // ignore
    }
  }, [transactions]);

  useEffect(() => {
    try {
      localStorage.setItem('kasirku_settings', JSON.stringify(settings));
    } catch {
      // ignore
    }
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem('kasirku_users', JSON.stringify(users));
    } catch {
      // ignore
    }
  }, [users]);

  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem('kasirku_current_user', JSON.stringify(currentUser));
      } else {
        localStorage.removeItem('kasirku_current_user');
      }
    } catch {
      // ignore
    }
  }, [currentUser]);

  useEffect(() => {
    try {
      localStorage.setItem('kasirku_branches', JSON.stringify(branches));
    } catch {
      // ignore
    }
  }, [branches]);

  useEffect(() => {
    try {
      localStorage.setItem('kasirku_customers', JSON.stringify(customers));
    } catch {
      // ignore
    }
  }, [customers]);

  useEffect(() => {
    try {
      localStorage.setItem('kasirku_active_shift', JSON.stringify(currentShift));
    } catch {
      // ignore
    }
  }, [currentShift]);

  useEffect(() => {
    try {
      localStorage.setItem('kasirku_held_orders', JSON.stringify(heldOrders));
    } catch {
      // ignore
    }
  }, [heldOrders]);

  // Active Branch helper
  const activeBranch = branches.find((b) => b.id === activeBranchId) || branches[0];

  // User Authentication & Account Handlers
  const handleLogin = (user: AppUser) => {
    setCurrentUser(user);
    // Automatically update cashier identity on receipts & session
    setSettings((prev) => ({
      ...prev,
      userName: user.name,
      userEmail: user.email || prev.userEmail,
      userPhotoUrl: user.avatarUrl || prev.userPhotoUrl,
    }));
  };

  const handleRegister = (newUser: AppUser) => {
    setUsers((prev) => [newUser, ...prev]);
    api.saveUser(newUser);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const handleDeleteUser = (userId: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    api.deleteUser(userId);
  };

  // Product Operations
  const handleAddProduct = (newProd: Omit<Product, 'id'>) => {
    const created: Product = {
      ...newProd,
      id: 'prod-' + Date.now(),
    };
    setProducts((prev) => [created, ...prev]);
    api.saveProduct(created, true);
  };

  const handleUpdateProduct = (updated: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    api.saveProduct(updated, false);
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    api.deleteProduct(productId);
  };

  const handleUpdateStock = (productId: string, newStock: number) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          const updatedProd = { ...p, stock: newStock };
          api.saveProduct(updatedProd, false);
          return updatedProd;
        }
        return p;
      })
    );
  };

  // Category Operations
  const handleAddCategory = (newCat: Omit<Category, 'id'>) => {
    const created: Category = {
      ...newCat,
      id: 'cat-' + Date.now(),
    };
    setCategories((prev) => [...prev, created]);
    api.saveCategory(created, true);
  };

  const handleUpdateCategory = (updated: Category) => {
    setCategories((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    api.saveCategory(updated, false);
  };

  const handleDeleteCategory = (categoryId: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== categoryId));
    api.deleteCategory(categoryId);
  };

  // Complete Transaction (decrease stock, record history, add loyalty points, record to shift)
  const handleCompleteTransaction = (newTrx: Transaction) => {
    const transactionWithBranch: Transaction = {
      ...newTrx,
      branchName: activeBranch?.name || settings.storeName,
      shiftId: currentShift ? currentShift.id : undefined,
    };

    setTransactions((prev) => [transactionWithBranch, ...prev]);
    api.saveTransaction(transactionWithBranch);

    // Decrement stocks
    setProducts((prev) => {
      return prev.map((prod) => {
        const purchased = newTrx.items.find((item) => item.productId === prod.id);
        if (purchased) {
          const remainingStock = Math.max(0, prod.stock - purchased.quantity);
          const updatedProd = { ...prod, stock: remainingStock };
          api.saveProduct(updatedProd, false);
          return updatedProd;
        }
        return prod;
      });
    });

    // Update Customer loyalty points & total spent if linked
    if (newTrx.customerPhone || newTrx.customerName) {
      setCustomers((prev) =>
        prev.map((cust) => {
          if (
            (newTrx.customerPhone && cust.phone === newTrx.customerPhone) ||
            cust.name === newTrx.customerName
          ) {
            const addedPoints = newTrx.pointsEarned || Math.floor(newTrx.total / 10000);
            const deductedPoints = newTrx.pointsUsed || 0;
            const updatedPoints = Math.max(0, cust.points + addedPoints - deductedPoints);
            const updatedSpent = cust.totalSpent + newTrx.total;

            let updatedTier = cust.tier;
            if (updatedSpent > 2500000) updatedTier = 'VIP';
            else if (updatedSpent > 1000000) updatedTier = 'Gold';
            else if (updatedSpent > 300000) updatedTier = 'Silver';

            return {
              ...cust,
              points: updatedPoints,
              totalSpent: updatedSpent,
              tier: updatedTier,
            };
          }
          return cust;
        })
      );
    }
  };

  // Void / Cancel Transaction (Audit record & stock replenishment)
  const handleVoidTransaction = (trxId: string, reason: string) => {
    const targetTrx = transactions.find((t) => t.id === trxId);
    if (!targetTrx || targetTrx.status === 'dibatalkan') return;

    // Mark as void
    setTransactions((prev) =>
      prev.map((t) =>
        t.id === trxId
          ? {
              ...t,
              status: 'dibatalkan',
              voidReason: reason,
              voidedAt: `${getIndonesianDate()} ${getIndonesianTime()}`,
              voidedBy: settings.userName,
            }
          : t
      )
    );

    api.voidTransaction(trxId, reason, settings.userName);

    // Replenish product inventory
    setProducts((prev) =>
      prev.map((prod) => {
        const item = targetTrx.items.find((i) => i.productId === prod.id);
        if (item) {
          const replenished = { ...prod, stock: prod.stock + item.quantity };
          api.saveProduct(replenished, false);
          return replenished;
        }
        return prod;
      })
    );
  };

  // Shift Management Handlers
  const handleOpenNewShift = (startingCash: number) => {
    const newShiftNumber = currentShift?.shiftNumber ? currentShift.shiftNumber + 1 : 1;
    const newSession: ShiftSession = {
      id: 'shift-' + Date.now(),
      shiftNumber: newShiftNumber,
      cashierName: settings.userName,
      branchId: activeBranchId,
      branchName: activeBranch?.name || settings.storeName,
      startDate: getIndonesianDate(),
      startTime: getIndonesianTime(),
      startingCash,
      cashInLogs: [],
      cashOutLogs: [],
      status: 'open',
    };
    setCurrentShift(newSession);
  };

  const handleAddCashLog = (type: 'masuk' | 'keluar', amount: number, reason: string) => {
    if (!currentShift) return;
    const newLog: ShiftLog = {
      id: 'log-' + Date.now(),
      time: getIndonesianTime(),
      amount,
      reason,
      type,
    };
    if (type === 'masuk') {
      setCurrentShift({
        ...currentShift,
        cashInLogs: [...currentShift.cashInLogs, newLog],
      });
    } else {
      setCurrentShift({
        ...currentShift,
        cashOutLogs: [...currentShift.cashOutLogs, newLog],
      });
    }
    api.addShiftLog(currentShift.id, type, amount, reason);
  };

  const handleCloseShift = (actualCash: number, notes: string) => {
    if (!currentShift) return;
    const shiftTransactions = transactions.filter(
      (t) => t.status === 'sukses'
    );
    const cashSales = shiftTransactions
      .filter((t) => t.paymentMethod === 'tunai')
      .reduce((sum, t) => sum + t.total, 0);

    const totalCashIn = currentShift.cashInLogs.reduce((sum, l) => sum + l.amount, 0);
    const totalCashOut = currentShift.cashOutLogs.reduce((sum, l) => sum + l.amount, 0);

    const expectedCashEnd = currentShift.startingCash + cashSales + totalCashIn - totalCashOut;
    const discrepancy = actualCash - expectedCashEnd;

    const closed: ShiftSession = {
      ...currentShift,
      endTime: getIndonesianTime(),
      endDate: getIndonesianDate(),
      expectedCashEnd,
      actualCashEnd: actualCash,
      discrepancy,
      notes,
      status: 'closed',
    };

    setCurrentShift(closed);
    api.closeShift(currentShift.id, actualCash, expectedCashEnd, discrepancy, notes);
  };

  // Hold Order Handlers
  const handleHoldOrder = (order: HoldOrder) => {
    setHeldOrders((prev) => [order, ...prev]);
  };

  const handleRestoreHeldOrder = (orderId: string) => {
    setHeldOrders((prev) => prev.filter((o) => o.id !== orderId));
  };

  const handleDeleteHeldOrder = (orderId: string) => {
    setHeldOrders((prev) => prev.filter((o) => o.id !== orderId));
  };

  const handleOpenReceipt = (trx: Transaction) => {
    setActiveReceiptTrx(trx);
    setActiveTab('riwayat');
  };

  const lowStockCount = products.filter((p) => p.stock <= p.minStock).length;

  // 1. If viewMode === 'landing', show the high-conversion Member Landing Page
  if (viewMode === 'landing') {
    return (
      <MemberLandingPage
        settings={settings}
        customers={customers}
        vouchers={vouchers}
        onOpenPos={() => setViewMode('pos')}
        onCustomerRegistered={(newCust) => {
          setCustomers((prev) => [newCust, ...prev.filter((c) => c.id !== newCust.id)]);
        }}
      />
    );
  }

  // 2. Gate access with Login / Register screen if user not logged in to POS
  if (!currentUser) {
    return (
      <AuthScreen
        onLogin={handleLogin}
        onRegister={handleRegister}
        users={users}
        onOpenMemberPortal={() => setViewMode('landing')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#fff8f4] flex flex-col md:flex-row text-[#201b14] overflow-x-hidden">
      {/* Navigation Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab === 'member') {
            setViewMode('landing');
          } else {
            setActiveTab(tab);
          }
        }}
        isOpenMobile={isOpenMobile}
        setIsOpenMobile={setIsOpenMobile}
        settings={settings}
        currentUser={currentUser}
        onLogout={() => setIsLogoutConfirmOpen(true)}
        onOpenHelp={() => setIsHelpOpen(true)}
      />

      {/* Main Content Area (offset by sidebar width on md+) */}
      <div className="flex-1 flex flex-col md:pl-64 min-h-screen w-full">
        {/* Top Header */}
        <TopHeader
          onOpenMobileMenu={() => setIsOpenMobile(true)}
          onOpenHelp={() => setIsHelpOpen(true)}
          settings={settings}
          currentUser={currentUser}
          onLogout={() => setIsLogoutConfirmOpen(true)}
          searchQuery={globalSearch}
          setSearchQuery={setGlobalSearch}
          lowStockCount={lowStockCount}
          branches={branches}
          activeBranchId={activeBranchId}
          onSelectBranch={setActiveBranchId}
          currentShift={currentShift}
          onOpenShiftModal={() => setIsShiftModalOpen(true)}
          onOpenHotkeysGuide={() => setIsHotkeysOpen(true)}
          onOpenFnBScanner={() => setIsFnBScannerOpen(true)}
          onOpenMemberPortal={() => setViewMode('landing')}
        />

        {/* View Routing */}
        <main className="flex-1 flex flex-col overflow-y-auto">
          {activeTab === 'dashboard' && (
            <DashboardScreen
              products={products}
              transactions={transactions}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'kasir' && (
            <KasirScreen
              products={products}
              categories={categories}
              settings={settings}
              customers={customers}
              vouchers={vouchers}
              heldOrders={heldOrders}
              activeBranchName={activeBranch?.name || settings.storeName}
              onCompleteTransaction={handleCompleteTransaction}
              onOpenReceipt={handleOpenReceipt}
              onHoldOrder={handleHoldOrder}
              onRestoreHeldOrder={handleRestoreHeldOrder}
              onDeleteHeldOrder={handleDeleteHeldOrder}
              onOpenHotkeysGuide={() => setIsHotkeysOpen(true)}
              onOpenFnBScanner={() => setIsFnBScannerOpen(true)}
            />
          )}

          {activeTab === 'produk' && (
            <ProdukScreen
              products={products}
              categories={categories}
              onAddProduct={handleAddProduct}
              onUpdateProduct={handleUpdateProduct}
              onDeleteProduct={handleDeleteProduct}
            />
          )}

          {activeTab === 'kategori' && (
            <KategoriScreen
              categories={categories}
              products={products}
              onAddCategory={handleAddCategory}
              onUpdateCategory={handleUpdateCategory}
              onDeleteCategory={handleDeleteCategory}
            />
          )}

          {activeTab === 'stok' && (
            <StokScreen
              products={products}
              categories={categories}
              onUpdateStock={handleUpdateStock}
            />
          )}

          {activeTab === 'riwayat' && (
            <RiwayatPenjualanScreen
              transactions={transactions}
              settings={settings}
              selectedReceiptTrx={activeReceiptTrx}
              onCloseReceipt={() => setActiveReceiptTrx(null)}
              onVoidTransaction={handleVoidTransaction}
            />
          )}

          {activeTab === 'laporan' && (
            <LaporanScreen
              products={products}
              categories={categories}
              transactions={transactions}
            />
          )}

          {activeTab === 'pengaturan' && (
            <PengaturanScreen
              settings={settings}
              currentUser={currentUser}
              users={users}
              customers={customers}
              onDeleteUser={handleDeleteUser}
              onSaveSettings={(newSettings) => {
                setSettings(newSettings);
                api.saveSettings(newSettings);
              }}
            />
          )}

          {activeTab === 'member' && (
            <div className="p-4 sm:p-6 lg:p-8">
              <MemberLandingPage
                settings={settings}
                customers={customers}
                vouchers={vouchers}
                onOpenPos={() => setActiveTab('kasir')}
                onCustomerRegistered={(newCust) => {
                  setCustomers((prev) => [newCust, ...prev.filter((c) => c.id !== newCust.id)]);
                }}
              />
            </div>
          )}
        </main>
      </div>

      {/* Global Help Modal */}
      <BantuanModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />

      {/* Shift & Cash Drawer Modal */}
      <ShiftModal
        isOpen={isShiftModalOpen}
        onClose={() => setIsShiftModalOpen(false)}
        currentShift={currentShift}
        transactions={transactions}
        settings={settings}
        activeBranchName={activeBranch?.name || settings.storeName}
        onOpenNewShift={handleOpenNewShift}
        onAddCashLog={handleAddCashLog}
        onCloseShift={handleCloseShift}
      />

      {/* Keyboard Shortcuts Guide */}
      <HotkeysModal
        isOpen={isHotkeysOpen}
        onClose={() => setIsHotkeysOpen(false)}
      />

      {/* F&B Barcode & Inventory Scanner Module Modal */}
      {isFnBScannerOpen && (
        <div
          id="fnb-scanner-modal-backdrop"
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6"
        >
          <div
            id="fnb-scanner-modal-container"
            className="w-full max-w-6xl h-[92vh] max-h-[850px] bg-white rounded-3xl shadow-2xl border border-[#ebdcd3] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
          >
            <FnBInventoryScannerModule
              onClose={() => setIsFnBScannerOpen(false)}
              onApplyToPos={(scannedItems) => {
                setIsFnBScannerOpen(false);
                setActiveTab('kasir');
                // Optional notification
                alert(
                  `Berhasil memproses ${scannedItems.length} SKU F&B ke transaksi kasir aktif!`
                );
              }}
            />
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      <ConfirmationModal
        id="confirm-logout"
        isOpen={isLogoutConfirmOpen}
        title="Konfirmasi Keluar Sesi"
        message={`Apakah Anda yakin ingin keluar dari akun ${currentUser?.name || ''} (@${currentUser?.username || ''})? Sesi kasir Anda saat ini akan diakhiri.`}
        confirmText="Ya, Keluar Akun"
        cancelText="Batal"
        danger={true}
        onConfirm={() => {
          setIsLogoutConfirmOpen(false);
          handleLogout();
        }}
        onCancel={() => setIsLogoutConfirmOpen(false)}
      />
    </div>
  );
}
