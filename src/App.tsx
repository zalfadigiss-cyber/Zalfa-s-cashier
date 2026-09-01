import React, { useState, useEffect } from 'react';
import { TabType, Category, Product, Transaction, StoreSettings } from './types';
import {
  initialCategories,
  initialProducts,
  initialTransactions,
  initialStoreSettings,
} from './data/initialData';
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

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [isOpenMobile, setIsOpenMobile] = useState<boolean>(false);
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);
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

  // Active Receipt to open automatically or from history
  const [activeReceiptTrx, setActiveReceiptTrx] = useState<Transaction | null>(null);

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

  // Product Operations
  const handleAddProduct = (newProd: Omit<Product, 'id'>) => {
    const created: Product = {
      ...newProd,
      id: 'prod-' + Date.now(),
    };
    setProducts((prev) => [created, ...prev]);
  };

  const handleUpdateProduct = (updated: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  const handleUpdateStock = (productId: string, newStock: number) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, stock: newStock } : p))
    );
  };

  // Category Operations
  const handleAddCategory = (newCat: Omit<Category, 'id'>) => {
    const created: Category = {
      ...newCat,
      id: 'cat-' + Date.now(),
    };
    setCategories((prev) => [...prev, created]);
  };

  const handleUpdateCategory = (updated: Category) => {
    setCategories((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  };

  const handleDeleteCategory = (categoryId: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== categoryId));
  };

  // Complete Transaction (decrease stock, record history)
  const handleCompleteTransaction = (newTrx: Transaction) => {
    setTransactions((prev) => [newTrx, ...prev]);

    // Decrement stocks
    setProducts((prev) => {
      return prev.map((prod) => {
        const purchased = newTrx.items.find((item) => item.productId === prod.id);
        if (purchased) {
          const remainingStock = Math.max(0, prod.stock - purchased.quantity);
          return { ...prod, stock: remainingStock };
        }
        return prod;
      });
    });
  };

  const handleOpenReceipt = (trx: Transaction) => {
    setActiveReceiptTrx(trx);
    setActiveTab('riwayat');
  };

  const lowStockCount = products.filter((p) => p.stock <= p.minStock).length;

  return (
    <div className="min-h-screen bg-[#fff8f4] flex flex-col md:flex-row text-[#201b14] overflow-x-hidden">
      {/* Navigation Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpenMobile={isOpenMobile}
        setIsOpenMobile={setIsOpenMobile}
        settings={settings}
        onOpenHelp={() => setIsHelpOpen(true)}
      />

      {/* Main Content Area (offset by sidebar width on md+) */}
      <div className="flex-1 flex flex-col md:pl-64 min-h-screen w-full">
        {/* Top Header */}
        <TopHeader
          onOpenMobileMenu={() => setIsOpenMobile(true)}
          onOpenHelp={() => setIsHelpOpen(true)}
          settings={settings}
          searchQuery={globalSearch}
          setSearchQuery={setGlobalSearch}
          lowStockCount={lowStockCount}
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
              onCompleteTransaction={handleCompleteTransaction}
              onOpenReceipt={handleOpenReceipt}
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
              onSaveSettings={(newSettings) => setSettings(newSettings)}
            />
          )}
        </main>
      </div>

      {/* Global Help Modal */}
      <BantuanModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </div>
  );
}
