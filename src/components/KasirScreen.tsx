import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Search,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  AlertTriangle,
  CreditCard,
  QrCode,
  Banknote,
  CheckCircle2,
  Printer,
  X,
  Sparkles,
  Tag,
  User,
  Utensils,
  ShoppingBag,
  Truck,
  Bookmark,
  Scan,
  Keyboard,
  Clock,
  ArrowRight,
  Gift,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  Category,
  Product,
  CartItem,
  PaymentMethodType,
  StoreSettings,
  Transaction,
  Customer,
  VoucherPromo,
  HoldOrder,
  OrderType,
} from '../types';
import { formatCurrency, formatNumber, generateTrxId, getIndonesianDate, getIndonesianTime } from '../utils/format';
import { playScanBeep, playCashChime, playErrorBeep } from '../utils/audio';
import { ConfirmationModal } from './ConfirmationModal';

interface KasirScreenProps {
  products: Product[];
  categories: Category[];
  settings: StoreSettings;
  customers: Customer[];
  vouchers: VoucherPromo[];
  heldOrders: HoldOrder[];
  activeBranchName: string;
  onCompleteTransaction: (transaction: Transaction) => void;
  onOpenReceipt: (transaction: Transaction) => void;
  onHoldOrder: (order: HoldOrder) => void;
  onRestoreHeldOrder: (orderId: string) => void;
  onDeleteHeldOrder: (orderId: string) => void;
  onOpenHotkeysGuide: () => void;
}

export const KasirScreen: React.FC<KasirScreenProps> = ({
  products,
  categories,
  settings,
  customers,
  vouchers,
  heldOrders,
  activeBranchName,
  onCompleteTransaction,
  onOpenReceipt,
  onHoldOrder,
  onRestoreHeldOrder,
  onDeleteHeldOrder,
  onOpenHotkeysGuide,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Cart state
  const [cart, setCart] = useState<CartItem[]>([
    {
      product: products.find((p) => p.sku === 'MIN-KSGA-001') || products[0],
      quantity: 2,
    },
    {
      product: products.find((p) => p.sku === 'SKU-089') || products[1],
      quantity: 1,
    },
  ]);

  // Order Details
  const [orderType, setOrderType] = useState<OrderType>('dine_in');
  const [tableNumber, setTableNumber] = useState<string>('04');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('guest');
  const [usePointsDiscount, setUsePointsDiscount] = useState<boolean>(false);

  // Promo Code
  const [voucherInput, setVoucherInput] = useState<string>('');
  const [appliedVoucher, setAppliedVoucher] = useState<VoucherPromo | null>(null);
  const [voucherError, setVoucherError] = useState<string>('');

  // Payment Modal state
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('tunai');
  const [cashGiven, setCashGiven] = useState<number>(60000);
  const [toastNotification, setToastNotification] = useState<{ message: string; type: 'error' | 'success' | 'info' } | null>(null);
  const [mobileCartOpen, setMobileCartOpen] = useState(false);
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);

  const triggerToast = (message: string, type: 'error' | 'success' | 'info' = 'info') => {
    setToastNotification({ message, type });
  };

  useEffect(() => {
    if (toastNotification) {
      const timer = setTimeout(() => {
        setToastNotification(null);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [toastNotification]);

  // Held Orders Modal state
  const [isHeldModalOpen, setIsHeldModalOpen] = useState(false);
  const [holdCustomerName, setHoldCustomerName] = useState<string>('');

  // Barcode quick scan simulator
  const [isBarcodeSimOpen, setIsBarcodeSimOpen] = useState(false);
  const [barcodeInput, setBarcodeInput] = useState('');

  // Selected customer object
  const activeCustomer = useMemo(() => {
    return customers.find((c) => c.id === selectedCustomerId) || null;
  }, [customers, selectedCustomerId]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory =
        selectedCategory === 'all' || p.categoryId === selectedCategory;
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  // Cart Calculations
  const subtotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  }, [cart]);

  // Member Tier discount (VIP: 15%, Gold: 10%, Silver: 5%)
  const memberDiscount = useMemo(() => {
    if (!activeCustomer) return 0;
    if (activeCustomer.tier === 'VIP') return Math.round(subtotal * 0.15);
    if (activeCustomer.tier === 'Gold') return Math.round(subtotal * 0.1);
    if (activeCustomer.tier === 'Silver') return Math.round(subtotal * 0.05);
    return 0;
  }, [activeCustomer, subtotal]);

  // Voucher discount
  const voucherDiscount = useMemo(() => {
    if (!appliedVoucher) return 0;
    if (subtotal < appliedVoucher.minPurchase) return 0;
    if (appliedVoucher.type === 'percent') {
      return Math.round((subtotal * appliedVoucher.value) / 100);
    }
    return Math.min(subtotal, appliedVoucher.value);
  }, [appliedVoucher, subtotal]);

  // Points Discount (1 point = Rp 100)
  const pointsDiscount = useMemo(() => {
    if (!usePointsDiscount || !activeCustomer || activeCustomer.points <= 0) return 0;
    const maxDiscountFromPoints = activeCustomer.points * 100;
    return Math.min(subtotal, maxDiscountFromPoints);
  }, [usePointsDiscount, activeCustomer, subtotal]);

  const totalDiscount = Math.min(subtotal, memberDiscount + voucherDiscount + pointsDiscount);

  const taxableAmount = Math.max(0, subtotal - totalDiscount);
  const taxAmount = useMemo(() => {
    return Math.round((taxableAmount * settings.defaultTaxPercent) / 100);
  }, [taxableAmount, settings.defaultTaxPercent]);

  const totalAmount = taxableAmount + taxAmount;
  const totalCartItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // F2: focus search
      if (e.key === 'F2') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      // F4: hold order
      if (e.key === 'F4') {
        e.preventDefault();
        if (cart.length > 0) {
          handleHoldOrder();
        }
      }
      // F8: payment
      if (e.key === 'F8') {
        e.preventDefault();
        if (cart.length > 0 && !isPaymentOpen) {
          handleOpenPayment();
        }
      }
      // Esc: close modals
      if (e.key === 'Escape') {
        setIsPaymentOpen(false);
        setIsHeldModalOpen(false);
        setIsBarcodeSimOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cart, isPaymentOpen]);

  // Cart Handlers
  const handleAddToCart = (product: Product) => {
    if (product.stock <= 0) {
      playErrorBeep(settings.soundEffectsEnabled);
      return;
    }

    playScanBeep(settings.soundEffectsEnabled);

    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          playErrorBeep(settings.soundEffectsEnabled);
          triggerToast(`Stok tidak mencukupi. Sisa stok: ${product.stock}`, 'error');
          return prev;
        }
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    playScanBeep(settings.soundEffectsEnabled);
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            if (newQty > item.product.stock) {
              playErrorBeep(settings.soundEffectsEnabled);
              triggerToast(`Batas stok tercapai. Maksimal: ${item.product.stock}`, 'error');
              return item;
            }
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter((item) => item.quantity > 0);
    });
  };

  const handleClearCart = () => {
    if (cart.length === 0) return;
    setIsClearConfirmOpen(true);
  };

  const executeClearCart = () => {
    setCart([]);
    setAppliedVoucher(null);
    setUsePointsDiscount(false);
    setIsClearConfirmOpen(false);
    triggerToast('Keranjang kasir telah dikosongkan.', 'info');
  };

  // Hold Order handler
  const handleHoldOrder = () => {
    if (cart.length === 0) return;
    const labelName =
      activeCustomer?.name ||
      (orderType === 'dine_in' ? `Meja ${tableNumber}` : 'Pelanggan Umum');

    const newHold: HoldOrder = {
      id: 'hold-' + Date.now(),
      orderNumber: `HOLD-#${Math.floor(Math.random() * 900) + 100}`,
      customerName: labelName,
      orderType,
      tableNumber: orderType === 'dine_in' ? tableNumber : undefined,
      items: [...cart],
      subtotal,
      tax: taxAmount,
      total: totalAmount,
      timestamp: `${getIndonesianDate()}, ${getIndonesianTime()}`,
    };

    onHoldOrder(newHold);
    setCart([]);
    setAppliedVoucher(null);
    setUsePointsDiscount(false);
    triggerToast('Pesanan berhasil ditahan sementara (Hold Order).', 'info');
  };

  // Apply Voucher
  const handleApplyVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    setVoucherError('');
    const cleanCode = voucherInput.trim().toUpperCase();
    const found = vouchers.find((v) => v.code.toUpperCase() === cleanCode);

    if (!found) {
      setVoucherError('Kode voucher tidak valid');
      playErrorBeep(settings.soundEffectsEnabled);
      return;
    }
    if (subtotal < found.minPurchase) {
      setVoucherError(`Min. belanja ${formatCurrency(found.minPurchase)}`);
      playErrorBeep(settings.soundEffectsEnabled);
      return;
    }

    setAppliedVoucher(found);
    setVoucherInput('');
    playScanBeep(settings.soundEffectsEnabled);
  };

  const handleOpenPayment = () => {
    if (cart.length === 0) return;
    // suggest round cash denomination
    const suggested = Math.ceil(totalAmount / 10000) * 10000 || totalAmount;
    setCashGiven(suggested);
    setIsPaymentOpen(true);
  };

  // Change calculation
  const cashChange = Math.max(0, cashGiven - totalAmount);

  // Barcode rapid scan simulation
  const handleSimulateScan = (e: React.FormEvent) => {
    e.preventDefault();
    const found = products.find(
      (p) =>
        p.sku.toLowerCase() === barcodeInput.trim().toLowerCase() ||
        p.name.toLowerCase().includes(barcodeInput.trim().toLowerCase())
    );
    if (found) {
      handleAddToCart(found);
      setBarcodeInput('');
      setIsBarcodeSimOpen(false);
      triggerToast(`Produk "${found.name}" berhasil dimasukkan ke keranjang.`, 'success');
    } else {
      playErrorBeep(settings.soundEffectsEnabled);
      triggerToast('SKU atau kode barcode tidak ditemukan di katalog produk.', 'error');
    }
  };

  // Finalize payment
  const handleProcessPayment = () => {
    if (paymentMethod === 'tunai' && cashGiven < totalAmount) {
      playErrorBeep(settings.soundEffectsEnabled);
      triggerToast('Nominal tunai yang diterima belum mencukupi total tagihan.', 'error');
      return;
    }

    const earnedPoints = Math.floor(totalAmount / 10000);

    const newTransaction: Transaction = {
      id: 'trx-' + Date.now(),
      trxNumber: generateTrxId(Math.floor(Math.random() * 100) + 10),
      date: getIndonesianDate(),
      time: getIndonesianTime(),
      cashierName: settings.userName,
      paymentMethod,
      subtotal,
      discount: totalDiscount,
      tax: taxAmount,
      total: totalAmount,
      cashAmountPaid: paymentMethod === 'tunai' ? cashGiven : totalAmount,
      cashChange: paymentMethod === 'tunai' ? cashChange : 0,
      status: 'sukses',
      orderType,
      tableNumber: orderType === 'dine_in' ? tableNumber : undefined,
      customerName: activeCustomer?.name,
      customerPhone: activeCustomer?.phone,
      voucherCode: appliedVoucher?.code,
      pointsEarned: earnedPoints,
      pointsUsed: usePointsDiscount ? activeCustomer?.points : 0,
      branchName: activeBranchName,
      items: cart.map((item) => ({
        productId: item.product.id,
        productName: item.product.name,
        sku: item.product.sku,
        price: item.product.price,
        quantity: item.quantity,
        total: item.product.price * item.quantity,
      })),
    };

    // Play POS audio chime
    playCashChime(settings.soundEffectsEnabled);

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#964407', '#b65c21', '#ffdbca', '#059669'],
      });
    } catch {
      // ignore
    }

    onCompleteTransaction(newTransaction);
    setIsPaymentOpen(false);
    setCart([]);
    setAppliedVoucher(null);
    setUsePointsDiscount(false);
    triggerToast('Transaksi kasir berhasil diselesaikan!', 'success');

    if (settings.autoPrintReceipt) {
      onOpenReceipt(newTransaction);
    }
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden bg-[#fef1e7]/60 relative">
      {/* LEFT COLUMN: Product Catalog (68%) */}
      <section className="flex-1 flex flex-col h-full overflow-hidden bg-[#fff8f4] p-3 sm:p-5 lg:p-6">
        {/* Top Control Ribbon */}
        <div className="flex flex-col gap-3 mb-4 shrink-0">
          {/* Order Type Selector & Shortcuts Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 bg-white p-2.5 rounded-2xl border border-[#dbc1b5]/50 shadow-xs">
            {/* Order Type Pills */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setOrderType('dine_in')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  orderType === 'dine_in'
                    ? 'bg-[#964407] text-white shadow-xs'
                    : 'text-[#645d57] hover:bg-[#f8ece1]'
                }`}
              >
                <Utensils className="w-3.5 h-3.5" />
                <span>Dine In</span>
              </button>
              <button
                onClick={() => setOrderType('take_away')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  orderType === 'take_away'
                    ? 'bg-[#964407] text-white shadow-xs'
                    : 'text-[#645d57] hover:bg-[#f8ece1]'
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Take Away</span>
              </button>
              <button
                onClick={() => setOrderType('delivery')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  orderType === 'delivery'
                    ? 'bg-[#964407] text-white shadow-xs'
                    : 'text-[#645d57] hover:bg-[#f8ece1]'
                }`}
              >
                <Truck className="w-3.5 h-3.5" />
                <span>Delivery</span>
              </button>

              {orderType === 'dine_in' && (
                <div className="flex items-center gap-1 ml-2 bg-[#f8ece1] px-2 py-1 rounded-lg">
                  <span className="text-[11px] font-bold text-[#554339]">Meja:</span>
                  <input
                    type="text"
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                    className="w-10 bg-white border border-[#dbc1b5] rounded text-center text-xs font-bold text-[#201b14] focus:outline-none"
                  />
                </div>
              )}
            </div>

            {/* Quick Actions: Held Orders & Scan Simulator */}
            <div className="flex items-center gap-1.5">
              {/* Held Orders Button */}
              <button
                onClick={() => setIsHeldModalOpen(true)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  heldOrders.length > 0
                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                    : 'bg-[#f8ece1] text-[#554339] hover:bg-[#ecdccf]'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5 text-amber-700" />
                <span>Bill Tertahan</span>
                {heldOrders.length > 0 && (
                  <span className="w-4 h-4 rounded-full bg-amber-600 text-white text-[10px] flex items-center justify-center font-bold">
                    {heldOrders.length}
                  </span>
                )}
              </button>

              {/* Rapid Barcode Simulator */}
              <button
                onClick={() => setIsBarcodeSimOpen(true)}
                className="px-3 py-1.5 bg-[#f8ece1] hover:bg-[#ecdccf] text-[#554339] rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                title="Scan Barcode SKU Cepat"
              >
                <Scan className="w-3.5 h-3.5 text-[#964407]" />
                <span className="hidden sm:inline">Scan SKU</span>
              </button>

              {/* Hotkeys helper */}
              <button
                onClick={onOpenHotkeysGuide}
                className="p-1.5 text-[#887368] hover:text-[#964407] hover:bg-[#f8ece1] rounded-lg transition-colors cursor-pointer"
                title="Keyboard Shortcuts (F2, F4, F8)"
              >
                <Keyboard className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Search & Category Pills */}
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1 group">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#887368] group-focus-within:text-[#964407] transition-colors" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari produk, nama, atau SKU (Tekan F2)..."
                className="w-full pl-9.5 pr-4 py-2 bg-white border border-[#dbc1b5] rounded-xl text-xs text-[#201b14] placeholder-[#887368] focus:outline-none focus:border-[#964407] focus:ring-2 focus:ring-[#ffdbca] shadow-2xs transition-all"
              />
            </div>

            <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-hide">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all shadow-2xs cursor-pointer ${
                  selectedCategory === 'all'
                    ? 'bg-[#964407] text-white'
                    : 'bg-white border border-[#dbc1b5] text-[#554339] hover:bg-[#f8ece1]'
                }`}
              >
                Semua Menu
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all shadow-2xs cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-[#964407] text-white'
                      : 'bg-white border border-[#dbc1b5] text-[#554339] hover:bg-[#f8ece1]'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto pb-24 md:pb-4 pr-1">
          {filteredProducts.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-[#645d57]">
              <Search className="w-10 h-10 text-[#dbc1b5] mb-2" />
              <p className="font-semibold text-sm">Tidak ada menu yang cocok</p>
              <p className="text-xs text-[#887368] mt-1">Coba kata kunci lain atau pilih semua kategori</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3 md:gap-3.5 content-start">
              {filteredProducts.map((product) => {
                const isOutOfStock = product.stock <= 0;
                const isLowStock = product.stock > 0 && product.stock <= product.minStock;

                return (
                  <div
                    key={product.id}
                    onClick={() => !isOutOfStock && handleAddToCart(product)}
                    className={`bg-white rounded-2xl shadow-xs border border-[#dbc1b5]/50 overflow-hidden flex flex-col transition-all group select-none ${
                      isOutOfStock
                        ? 'opacity-60 cursor-not-allowed border-gray-300'
                        : 'cursor-pointer hover:shadow-md hover:border-[#964407]/60 active:scale-[0.98]'
                    }`}
                  >
                    {/* Image Box */}
                    <div className="aspect-square bg-[#f8ece1] w-full relative overflow-hidden flex items-center justify-center p-2.5">
                      {isLowStock && (
                        <div className="absolute top-2 right-2 bg-[#ffdad6] text-[#93000a] px-2 py-0.5 rounded-md text-[10px] font-bold z-10 shadow-xs flex items-center gap-1 border border-[#ba1a1a]/20">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Sisa {product.stock}</span>
                        </div>
                      )}
                      {isOutOfStock && (
                        <div className="absolute inset-0 bg-black/40 z-10 flex items-center justify-center">
                          <span className="bg-[#ba1a1a] text-white px-2.5 py-1 rounded-md text-xs font-bold shadow-md">
                            Habis
                          </span>
                        </div>
                      )}
                      <img
                        src={product.imageUrl}
                        alt={product.imageAlt || product.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
                      />
                    </div>

                    {/* Info */}
                    <div className="p-2.5 flex-1 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-semibold text-[#887368] uppercase tracking-wider block mb-0.5">
                          {product.sku}
                        </span>
                        <h3 className="text-xs font-bold text-[#201b14] line-clamp-2 leading-tight">
                          {product.name}
                        </h3>
                      </div>

                      <div className="mt-2.5 flex items-end justify-between pt-1.5 border-t border-[#dbc1b5]/20">
                        <span className="font-price font-extrabold text-[#964407] text-xs sm:text-sm">
                          {formatCurrency(product.price)}
                        </span>
                        <span
                          className={`text-[10px] font-semibold ${
                            isOutOfStock
                              ? 'text-[#ba1a1a]'
                              : isLowStock
                              ? 'text-[#ba1a1a]'
                              : 'text-[#645d57]'
                          }`}
                        >
                          Stok: {product.stock}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* RIGHT COLUMN: Order / Cart Details (32%) */}
      <aside
        className={`fixed inset-y-0 right-0 z-40 w-full sm:w-96 md:w-[380px] lg:w-[410px] bg-white border-l border-[#dbc1b5]/50 flex flex-col transition-transform duration-300 md:relative md:translate-x-0 ${
          mobileCartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Cart Header */}
        <div className="p-4 bg-[#fff8f4] border-b border-[#dbc1b5]/40 flex flex-col gap-2 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-[#964407]" />
              <h2 className="font-serif-header text-lg font-bold text-[#201b14]">
                Pesanan Aktif ({totalCartItems})
              </h2>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleClearCart}
                disabled={cart.length === 0}
                className="p-1.5 text-[#887368] hover:text-[#ba1a1a] rounded-lg hover:bg-[#ffdad6]/30 transition-colors disabled:opacity-40 cursor-pointer"
                title="Kosongkan Keranjang"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setMobileCartOpen(false)}
                className="p-1.5 text-[#645d57] md:hidden rounded-lg hover:bg-[#ece0d6]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Customer / Membership selector */}
          <div className="flex items-center gap-2 pt-1 border-t border-[#dbc1b5]/30">
            <User className="w-3.5 h-3.5 text-[#964407] shrink-0" />
            <select
              value={selectedCustomerId}
              onChange={(e) => {
                setSelectedCustomerId(e.target.value);
                setUsePointsDiscount(false);
              }}
              className="flex-1 bg-white border border-[#dbc1b5] rounded-lg px-2 py-1 text-xs text-[#201b14] font-medium focus:outline-none focus:border-[#964407]"
            >
              <option value="guest">Pelanggan Umum (Guest)</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.tier} &bull; {c.points} Poin)
                </option>
              ))}
            </select>
          </div>

          {/* Customer Loyalty Tier Badge */}
          {activeCustomer && (
            <div className="flex items-center justify-between bg-[#f8ece1] px-2.5 py-1.5 rounded-lg text-xs">
              <div className="flex items-center gap-1.5">
                <span className="px-1.5 py-0.5 bg-[#964407] text-white rounded text-[10px] font-bold">
                  {activeCustomer.tier}
                </span>
                <span className="text-[#554339] text-[11px]">
                  Poin: <strong>{activeCustomer.points}</strong>
                </span>
              </div>
              {activeCustomer.points > 0 && (
                <label className="flex items-center gap-1 text-[11px] font-semibold text-[#964407] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={usePointsDiscount}
                    onChange={(e) => setUsePointsDiscount(e.target.checked)}
                    className="w-3 h-3 text-[#964407]"
                  />
                  <span>Tukar Poin</span>
                </label>
              )}
            </div>
          )}
        </div>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-[#887368] p-6 space-y-2">
              <ShoppingCart className="w-12 h-12 text-[#dbc1b5]" />
              <p className="font-semibold text-xs text-[#554339]">Keranjang masih kosong</p>
              <p className="text-[11px]">Klik menu di sebelah kiri untuk menambahkan ke pesanan</p>
            </div>
          ) : (
            cart.map((item) => {
              const itemTotal = item.product.price * item.quantity;
              return (
                <div
                  key={item.product.id}
                  className="bg-[#fef1e7]/40 rounded-xl p-3 border border-[#dbc1b5]/40 flex gap-2.5 items-center justify-between shadow-2xs"
                >
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-[#201b14] truncate">
                      {item.product.name}
                    </h4>
                    <span className="font-price font-extrabold text-xs text-[#964407] block mt-0.5">
                      {formatCurrency(item.product.price)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 bg-white border border-[#dbc1b5] rounded-lg p-0.5 shrink-0">
                    <button
                      onClick={() => handleUpdateQuantity(item.product.id, -1)}
                      className="p-1 text-[#645d57] hover:text-[#ba1a1a] hover:bg-[#ffdad6]/40 rounded transition-colors cursor-pointer"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center text-xs font-bold font-price text-[#201b14]">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => handleUpdateQuantity(item.product.id, 1)}
                      className="p-1 text-[#645d57] hover:text-[#964407] hover:bg-[#ffdbca]/40 rounded transition-colors cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="text-right font-price font-extrabold text-xs text-[#201b14] min-w-[70px]">
                    {formatCurrency(itemTotal)}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Voucher Promo Input */}
        <div className="px-4 py-2 border-t border-[#dbc1b5]/30 bg-[#fff8f4]/60">
          {appliedVoucher ? (
            <div className="flex items-center justify-between p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-xs">
              <div className="flex items-center gap-1.5 text-emerald-800">
                <Tag className="w-3.5 h-3.5 text-emerald-600" />
                <span className="font-bold">{appliedVoucher.code}</span>
                <span className="text-[11px] text-emerald-700">
                  (-{formatCurrency(voucherDiscount)})
                </span>
              </div>
              <button
                onClick={() => setAppliedVoucher(null)}
                className="text-emerald-800 hover:text-rose-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <form onSubmit={handleApplyVoucher} className="flex gap-1.5">
              <input
                type="text"
                placeholder="Kode Promo (HEMAT10, POTONG15K)..."
                value={voucherInput}
                onChange={(e) => setVoucherInput(e.target.value)}
                className="flex-1 px-2.5 py-1.5 bg-white border border-[#dbc1b5] rounded-lg text-xs text-[#201b14] placeholder-[#887368] uppercase focus:outline-none focus:border-[#964407]"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-[#964407] text-white rounded-lg text-xs font-bold hover:bg-[#773300] transition-colors cursor-pointer"
              >
                Terapkan
              </button>
            </form>
          )}
          {voucherError && (
            <p className="text-[10px] text-[#ba1a1a] mt-1 font-semibold">{voucherError}</p>
          )}
        </div>

        {/* Cart Calculations Footer */}
        <div className="p-4 bg-[#fff8f4] border-t border-[#dbc1b5]/40 space-y-2 shrink-0">
          <div className="space-y-1.5 text-xs text-[#554339]">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-semibold font-price text-[#201b14]">
                {formatCurrency(subtotal)}
              </span>
            </div>

            {totalDiscount > 0 && (
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Total Diskon (Member/Promo/Poin):</span>
                <span className="font-price">-{formatCurrency(totalDiscount)}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span>PPN ({settings.defaultTaxPercent}%):</span>
              <span className="font-semibold font-price text-[#201b14]">
                {formatCurrency(taxAmount)}
              </span>
            </div>

            <div className="pt-2 border-t border-[#dbc1b5]/40 flex justify-between items-baseline">
              <span className="font-serif-header text-sm font-bold text-[#201b14]">
                Total Tagihan:
              </span>
              <span className="font-price text-xl font-extrabold text-[#964407]">
                {formatCurrency(totalAmount)}
              </span>
            </div>
          </div>

          {/* Hold and Checkout CTA */}
          <div className="grid grid-cols-3 gap-2 pt-2">
            <button
              type="button"
              onClick={handleHoldOrder}
              disabled={cart.length === 0}
              className="col-span-1 py-3 px-2 border border-[#dbc1b5] bg-white hover:bg-[#f8ece1] text-[#554339] rounded-xl text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed flex flex-col items-center justify-center gap-0.5 cursor-pointer shadow-2xs"
              title="Tahan Pesanan (F4)"
            >
              <Bookmark className="w-4 h-4 text-[#964407]" />
              <span>Tahan (F4)</span>
            </button>

            <button
              type="button"
              onClick={handleOpenPayment}
              disabled={cart.length === 0}
              className="col-span-2 py-3 bg-[#964407] hover:bg-[#773300] text-white rounded-xl font-serif-header text-sm font-bold tracking-wide shadow-md hover:shadow-lg transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <CreditCard className="w-4 h-4" />
              <span>BAYAR (F8)</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Floating Mobile Cart Trigger */}
      <div className="md:hidden fixed bottom-4 right-4 z-30">
        <button
          onClick={() => setMobileCartOpen(true)}
          className="px-4 py-3 bg-[#964407] text-white rounded-full shadow-xl flex items-center gap-2.5 font-bold text-xs"
        >
          <ShoppingCart className="w-4 h-4" />
          <span>Pesanan ({totalCartItems}) &bull; {formatCurrency(totalAmount)}</span>
        </button>
      </div>

      {/* HELD ORDERS MODAL */}
      {isHeldModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-[#dbc1b5]/60 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-4 bg-[#fff8f4] border-b border-[#dbc1b5]/40 flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#964407]">
                <Bookmark className="w-5 h-5" />
                <h3 className="font-serif-header text-lg font-bold text-[#201b14]">
                  Daftar Pesanan Tertahan (Hold Bills)
                </h3>
              </div>
              <button
                onClick={() => setIsHeldModalOpen(false)}
                className="p-1 text-[#645d57] hover:bg-[#ece0d6] rounded-full transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-3 text-xs">
              {heldOrders.length === 0 ? (
                <div className="py-12 text-center text-[#887368] space-y-1">
                  <Bookmark className="w-8 h-8 text-[#dbc1b5] mx-auto" />
                  <p className="font-semibold">Tidak ada pesanan yang tertahan.</p>
                  <p className="text-[11px]">Gunakan tombol Tahan (F4) jika pelanggan ingin menambah item nanti.</p>
                </div>
              ) : (
                heldOrders.map((ho) => (
                  <div
                    key={ho.id}
                    className="p-3.5 bg-[#fef1e7]/60 rounded-xl border border-[#dbc1b5]/50 flex items-center justify-between gap-3 shadow-2xs"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#964407]">{ho.orderNumber}</span>
                        <span className="px-2 py-0.5 bg-white border border-[#dbc1b5] rounded-full text-[10px] font-semibold text-[#554339]">
                          {ho.customerName}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#645d57] mt-1">
                        {ho.items.length} jenis item &bull; Disimpan: {ho.timestamp}
                      </p>
                      <p className="font-price font-extrabold text-[#201b14] mt-0.5">
                        {formatCurrency(ho.total)}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => {
                          setCart(ho.items);
                          onRestoreHeldOrder(ho.id);
                          setIsHeldModalOpen(false);
                          playScanBeep(settings.soundEffectsEnabled);
                        }}
                        className="px-3 py-1.5 bg-[#964407] hover:bg-[#773300] text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-all"
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                        <span>Buka</span>
                      </button>
                      <button
                        onClick={() => onDeleteHeldOrder(ho.id)}
                        className="p-1.5 text-[#ba1a1a] hover:bg-rose-50 rounded-lg cursor-pointer"
                        title="Hapus"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-3 bg-[#fff8f4] border-t border-[#dbc1b5]/40 flex justify-end">
              <button
                onClick={() => setIsHeldModalOpen(false)}
                className="px-4 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg text-xs font-bold cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BARCODE RAPID SCAN SIMULATOR MODAL */}
      {isBarcodeSimOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl border border-[#dbc1b5]/60 overflow-hidden">
            <div className="p-4 bg-[#fff8f4] border-b border-[#dbc1b5]/40 flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#964407]">
                <Scan className="w-5 h-5" />
                <h3 className="font-serif-header text-base font-bold text-[#201b14]">
                  Simulasi Scanner Barcode / SKU
                </h3>
              </div>
              <button
                onClick={() => setIsBarcodeSimOpen(false)}
                className="p-1 text-[#645d57] hover:bg-[#ece0d6] rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSimulateScan} className="p-5 space-y-4">
              <p className="text-xs text-[#554339]">
                Ketik atau tempel kode SKU produk (misal: <code>MIN-KSGA-001</code> atau <code>SKU-089</code>) untuk mensimulasikan tembakan laser scanner:
              </p>

              <input
                type="text"
                autoFocus
                required
                placeholder="Contoh: MIN-KSGA-001"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                className="w-full px-3.5 py-2.5 border-2 border-[#964407] rounded-xl text-sm font-mono font-bold text-[#201b14] focus:outline-none uppercase"
              />

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsBarcodeSimOpen(false)}
                  className="px-3 py-1.5 border border-[#dbc1b5] rounded-lg text-xs font-bold text-[#554339]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#964407] text-white rounded-lg text-xs font-bold hover:bg-[#773300] cursor-pointer"
                >
                  Scan & Tambah
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PAYMENT CHECKOUT MODAL */}
      {isPaymentOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-[#dbc1b5]/60 max-h-[92vh]">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-[#fff8f4] border-b border-[#dbc1b5]/40 flex justify-between items-center shrink-0">
              <div>
                <h3 className="font-serif-header text-xl font-bold text-[#201b14]">
                  Pembayaran Kasir
                </h3>
                <p className="text-xs text-[#554339]">
                  {orderType === 'dine_in'
                    ? `Dine In (Meja ${tableNumber})`
                    : orderType === 'take_away'
                    ? 'Take Away (Bawa Pulang)'
                    : 'Delivery'} &bull; Cabang: {activeBranchName}
                </p>
              </div>
              <button
                onClick={() => setIsPaymentOpen(false)}
                className="p-1.5 text-[#645d57] hover:bg-[#ece0d6] rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
              {/* Grand Total Display */}
              <div className="p-4 rounded-2xl bg-[#964407] text-white shadow-md text-center">
                <span className="text-xs uppercase tracking-wider text-[#ffdbca] font-bold">
                  Total Tagihan Pembayaran
                </span>
                <div className="text-3xl sm:text-4xl font-extrabold font-price tracking-tight mt-1">
                  {formatCurrency(totalAmount)}
                </div>
                {totalDiscount > 0 && (
                  <span className="inline-block mt-1 text-[11px] bg-white/20 px-2.5 py-0.5 rounded-full">
                    Hemat {formatCurrency(totalDiscount)}
                  </span>
                )}
              </div>

              {/* Payment Methods */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#554339] uppercase tracking-wider block">
                  Pilih Metode Pembayaran
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {settings.enabledPayments.tunai && (
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('tunai')}
                      className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
                        paymentMethod === 'tunai'
                          ? 'border-[#964407] bg-[#ffdbca]/40 text-[#964407] shadow-2xs scale-[1.02]'
                          : 'border-[#dbc1b5] text-[#554339] hover:bg-[#f8ece1]'
                      }`}
                    >
                      <Banknote className="w-5 h-5" />
                      <span>Tunai (Cash)</span>
                    </button>
                  )}

                  {settings.enabledPayments.qris && (
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('qris')}
                      className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
                        paymentMethod === 'qris'
                          ? 'border-[#964407] bg-[#ffdbca]/40 text-[#964407] shadow-2xs scale-[1.02]'
                          : 'border-[#dbc1b5] text-[#554339] hover:bg-[#f8ece1]'
                      }`}
                    >
                      <QrCode className="w-5 h-5" />
                      <span>QRIS Dinamis</span>
                    </button>
                  )}

                  {settings.enabledPayments.debit && (
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('debit')}
                      className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
                        paymentMethod === 'debit'
                          ? 'border-[#964407] bg-[#ffdbca]/40 text-[#964407] shadow-2xs scale-[1.02]'
                          : 'border-[#dbc1b5] text-[#554339] hover:bg-[#f8ece1]'
                      }`}
                    >
                      <CreditCard className="w-5 h-5" />
                      <span>Kartu Debit / EDC</span>
                    </button>
                  )}
                </div>
              </div>

              {/* METHOD-SPECIFIC PANELS */}
              {paymentMethod === 'tunai' && (
                <div className="space-y-3 bg-[#f8ece1]/40 p-4 rounded-2xl border border-[#dbc1b5]/50">
                  <div>
                    <label className="block text-xs font-bold text-[#554339] mb-1">
                      Uang Diterima dari Pelanggan (Rp)
                    </label>
                    <input
                      type="number"
                      min={0}
                      step={1000}
                      value={cashGiven}
                      onChange={(e) => setCashGiven(Number(e.target.value))}
                      className="w-full px-4 py-2.5 border border-[#dbc1b5] rounded-xl text-lg font-price font-extrabold text-[#201b14] bg-white focus:outline-none focus:border-[#964407]"
                    />
                  </div>

                  {/* Quick cash denomination buttons */}
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { label: 'Uang Pas', val: totalAmount },
                      { label: 'Rp 20.000', val: 20000 },
                      { label: 'Rp 50.000', val: 50000 },
                      { label: 'Rp 100.000', val: 100000 },
                      { label: 'Rp 200.000', val: 200000 },
                    ]
                      .filter((d) => d.val >= totalAmount || d.label === 'Uang Pas')
                      .map((denom, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setCashGiven(denom.val)}
                          className="px-3 py-1.5 bg-white hover:bg-[#f8ece1] border border-[#dbc1b5] rounded-lg text-xs font-bold text-[#554339] transition-colors cursor-pointer"
                        >
                          {denom.label}
                        </button>
                      ))}
                  </div>

                  {/* Change Calculation */}
                  <div className="p-3 bg-white rounded-xl border border-[#dbc1b5]/40 flex justify-between items-center">
                    <span className="text-xs font-bold text-[#554339]">Kembalian:</span>
                    <span
                      className={`font-price text-xl font-extrabold ${
                        cashGiven < totalAmount ? 'text-[#ba1a1a]' : 'text-[#059669]'
                      }`}
                    >
                      {cashGiven < totalAmount
                        ? `Kurang ${formatCurrency(totalAmount - cashGiven)}`
                        : formatCurrency(cashChange)}
                    </span>
                  </div>
                </div>
              )}

              {paymentMethod === 'qris' && (
                <div className="p-5 bg-[#f8ece1]/40 rounded-2xl border border-[#dbc1b5]/50 flex flex-col items-center text-center space-y-3">
                  <div className="w-40 h-40 bg-white p-3 rounded-xl border border-[#dbc1b5] shadow-xs flex items-center justify-center">
                    {/* Visual QR Simulator */}
                    <div className="w-full h-full border-2 border-black p-1 flex flex-col justify-between">
                      <div className="flex justify-between">
                        <div className="w-8 h-8 bg-black border-2 border-white" />
                        <div className="w-8 h-8 bg-black border-2 border-white" />
                      </div>
                      <div className="text-[10px] font-extrabold tracking-widest text-center text-gray-800">
                        QRIS STANDAR
                      </div>
                      <div className="flex justify-between items-end">
                        <div className="w-8 h-8 bg-black border-2 border-white" />
                        <div className="text-[9px] font-mono font-bold">KASIRKU</div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#201b14] block">
                      Pindai dengan GoPay, OVO, Dana, BCA, Mandiri
                    </span>
                    <span className="text-[11px] text-[#645d57]">
                      Nominal otomatis tertera: {formatCurrency(totalAmount)}
                    </span>
                  </div>
                </div>
              )}

              {paymentMethod === 'debit' && (
                <div className="p-5 bg-[#f8ece1]/40 rounded-2xl border border-[#dbc1b5]/50 text-center space-y-2 text-xs text-[#554339]">
                  <CreditCard className="w-8 h-8 text-[#964407] mx-auto" />
                  <p className="font-bold text-[#201b14]">
                    Gesek / Tempel Kartu pada Mesin EDC Bank
                  </p>
                  <p className="text-[11px] text-[#645d57]">
                    Pastikan struk EDC berhasil keluar dan dana telah terotorisasi sebelum menyelesaikan transaksi.
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-[#fff8f4] border-t border-[#dbc1b5]/40 flex gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setIsPaymentOpen(false)}
                className="flex-1 py-2.5 border border-[#dbc1b5] hover:bg-[#f8ece1] text-[#554339] rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleProcessPayment}
                disabled={paymentMethod === 'tunai' && cashGiven < totalAmount}
                className="flex-2 py-2.5 bg-[#964407] hover:bg-[#773300] text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Selesai & Cetak Struk</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* In-App Floating Notification Toast */}
      {toastNotification && (
        <div
          id="kasir-toast-banner"
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-2.5 rounded-xl shadow-lg z-50 flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-2 duration-150 border text-xs font-bold ${
            toastNotification.type === 'error'
              ? 'bg-[#ffdad6] text-[#ba1a1a] border-[#ba1a1a]/30'
              : toastNotification.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
              : 'bg-[#201b14] text-white border-white/10'
          }`}
        >
          {toastNotification.type === 'error' ? (
            <AlertTriangle className="w-4 h-4 shrink-0 text-[#ba1a1a]" />
          ) : toastNotification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          ) : (
            <Sparkles className="w-4 h-4 shrink-0 text-[#ffdbca]" />
          )}
          <span>{toastNotification.message}</span>
        </div>
      )}

      {/* Clear Cart Confirmation Dialog */}
      <ConfirmationModal
        id="confirm-clear-cart"
        isOpen={isClearConfirmOpen}
        title="Kosongkan Keranjang Kasir"
        message="Semua item pesanan, voucher promo, dan potongan poin yang sudah dipilih akan dihapus dari transaksi saat ini. Tindakan ini tidak dapat dibatalkan."
        confirmText="Ya, Kosongkan"
        cancelText="Kembali"
        danger={true}
        onConfirm={executeClearCart}
        onCancel={() => setIsClearConfirmOpen(false)}
      />
    </div>
  );
};
