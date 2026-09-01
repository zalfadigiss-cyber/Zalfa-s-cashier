import React, { useState, useMemo } from 'react';
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
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Category, Product, CartItem, PaymentMethodType, StoreSettings, Transaction } from '../types';
import { formatCurrency, formatNumber, generateTrxId, getIndonesianDate, getIndonesianTime } from '../utils/format';

interface KasirScreenProps {
  products: Product[];
  categories: Category[];
  settings: StoreSettings;
  onCompleteTransaction: (transaction: Transaction) => void;
  onOpenReceipt: (transaction: Transaction) => void;
}

export const KasirScreen: React.FC<KasirScreenProps> = ({
  products,
  categories,
  settings,
  onCompleteTransaction,
  onOpenReceipt,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [cart, setCart] = useState<CartItem[]>([
    // Pre-populate with items to match initial screenshot feel if desired
    {
      product: products.find((p) => p.sku === 'MIN-KSGA-001') || products[0],
      quantity: 2,
    },
    {
      product: products.find((p) => p.sku === 'SKU-089') || products[1],
      quantity: 1,
    },
  ]);

  // Payment Modal state
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('tunai');
  const [cashGiven, setCashGiven] = useState<number>(60000);
  const [showToast, setShowToast] = useState(false);
  const [mobileCartOpen, setMobileCartOpen] = useState(false);

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

  const taxAmount = useMemo(() => {
    return Math.round((subtotal * settings.defaultTaxPercent) / 100);
  }, [subtotal, settings.defaultTaxPercent]);

  const totalAmount = subtotal + taxAmount;
  const totalCartItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Cart Handlers
  const handleAddToCart = (product: Product) => {
    if (product.stock <= 0) return;

    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          alert(`Stok tidak mencukupi. Sisa stok: ${product.stock}`);
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
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            if (newQty > item.product.stock) {
              alert(`Stok maksimal: ${item.product.stock}`);
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
    if (window.confirm('Kosongkan semua pesanan di keranjang?')) {
      setCart([]);
    }
  };

  const handleOpenPayment = () => {
    if (cart.length === 0) return;
    setCashGiven(Math.ceil(totalAmount / 10000) * 10000 || totalAmount);
    setIsPaymentOpen(true);
  };

  // Change calculation
  const cashChange = Math.max(0, cashGiven - totalAmount);

  // Finalize payment
  const handleProcessPayment = () => {
    if (paymentMethod === 'tunai' && cashGiven < totalAmount) {
      alert('Jumlah uang yang diterima kurang dari total tagihan!');
      return;
    }

    const newTransaction: Transaction = {
      id: 'trx-' + Date.now(),
      trxNumber: generateTrxId(Math.floor(Math.random() * 100) + 10),
      date: getIndonesianDate(),
      time: getIndonesianTime(),
      cashierName: settings.userName,
      paymentMethod,
      subtotal,
      discount: 0,
      tax: taxAmount,
      total: totalAmount,
      cashAmountPaid: paymentMethod === 'tunai' ? cashGiven : totalAmount,
      cashChange: paymentMethod === 'tunai' ? cashChange : 0,
      status: 'sukses',
      items: cart.map((item) => ({
        productId: item.product.id,
        productName: item.product.name,
        sku: item.product.sku,
        price: item.product.price,
        quantity: item.quantity,
        total: item.product.price * item.quantity,
      })),
    };

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
    setShowToast(true);

    // Auto open receipt or trigger print
    if (settings.autoPrintReceipt) {
      onOpenReceipt(newTransaction);
    }

    setTimeout(() => {
      setShowToast(false);
    }, 3500);
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden bg-[#fef1e7]/60">
      {/* LEFT COLUMN: Product Catalog (70%) */}
      <section className="flex-1 flex flex-col h-full overflow-hidden bg-[#fff8f4] p-4 md:p-6 lg:p-8">
        {/* Controls: Search & Category Filter Pills */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6 shrink-0">
          <div className="relative flex-1 group">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#887368] group-focus-within:text-[#964407] transition-colors" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama produk, SKU..."
              className="w-full pl-9.5 pr-4 py-2.5 bg-white border border-[#dbc1b5] rounded-xl text-sm text-[#201b14] placeholder-[#887368] focus:outline-none focus:border-[#964407] focus:ring-2 focus:ring-[#ffdbca] shadow-2xs transition-all"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-hide">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all shadow-2xs ${
                selectedCategory === 'all'
                  ? 'bg-[#964407] text-white'
                  : 'bg-white border border-[#dbc1b5] text-[#554339] hover:bg-[#f8ece1]'
              }`}
            >
              Semua Kategori
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all shadow-2xs ${
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

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto pb-24 md:pb-4 pr-1">
          {filteredProducts.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-[#645d57]">
              <Search className="w-10 h-10 text-[#dbc1b5] mb-2" />
              <p className="font-semibold text-sm">Tidak ada produk yang cocok</p>
              <p className="text-xs text-[#887368] mt-1">Coba kata kunci lain atau pilih semua kategori</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3.5 md:gap-4 content-start">
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
                    <div className="aspect-square bg-[#f8ece1] w-full relative overflow-hidden flex items-center justify-center p-3">
                      {isLowStock && (
                        <div className="absolute top-2 right-2 bg-[#ffdad6] text-[#93000a] px-2 py-0.5 rounded-md text-[10px] font-bold z-10 shadow-xs flex items-center gap-1 border border-[#ba1a1a]/20">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Stok Menipis</span>
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
                    <div className="p-3 flex-1 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-semibold text-[#887368] uppercase tracking-wider block mb-0.5">
                          {product.sku}
                        </span>
                        <h3 className="text-xs md:text-sm font-bold text-[#201b14] line-clamp-2 leading-tight">
                          {product.name}
                        </h3>
                      </div>

                      <div className="mt-3 flex items-end justify-between pt-2 border-t border-[#dbc1b5]/20">
                        <span className="font-price font-extrabold text-[#964407] text-xs md:text-sm">
                          {formatCurrency(product.price)}
                        </span>
                        <span
                          className={`text-[11px] font-semibold ${
                            isOutOfStock
                              ? 'text-[#ba1a1a]'
                              : isLowStock
                              ? 'text-[#d97706]'
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

      {/* RIGHT COLUMN: Shopping Cart Panel (30%) */}
      <aside
        className={`fixed md:relative bottom-0 right-0 w-full md:w-[340px] lg:w-[380px] h-[85vh] md:h-full bg-white border-t md:border-t-0 md:border-l border-[#dbc1b5]/60 shadow-2xl md:shadow-none flex flex-col z-40 transition-transform duration-300 rounded-t-3xl md:rounded-none ${
          mobileCartOpen ? 'translate-y-0' : 'translate-y-full md:translate-y-0'
        }`}
      >
        {/* Mobile Pull Handle */}
        <div
          className="w-full flex justify-center py-2.5 md:hidden cursor-pointer bg-white rounded-t-3xl border-b border-[#dbc1b5]/30"
          onClick={() => setMobileCartOpen(false)}
        >
          <div className="w-12 h-1.5 bg-[#dbc1b5] rounded-full" />
        </div>

        {/* Cart Header */}
        <div className="px-5 py-4 border-b border-[#dbc1b5]/40 flex justify-between items-center bg-white shrink-0">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-[#964407]" />
            <h2 className="font-serif-header text-xl font-bold text-[#201b14]">
              Pesanan Saat Ini
            </h2>
            {cart.length > 0 && (
              <span className="bg-[#ffdbca] text-[#964407] text-[11px] font-bold px-2 py-0.5 rounded-full">
                {totalCartItems}
              </span>
            )}
          </div>
          {cart.length > 0 && (
            <button
              onClick={handleClearCart}
              className="p-1.5 text-[#ba1a1a] hover:bg-[#ffdad6] rounded-lg transition-colors"
              title="Kosongkan Keranjang"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#fff8f4]/60">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#645d57]">
              <ShoppingCart className="w-12 h-12 text-[#dbc1b5] mb-2 stroke-1" />
              <p className="text-sm font-bold text-[#201b14]">Keranjang Kosong</p>
              <p className="text-xs text-[#887368] mt-1">
                Pilih produk dari daftar di sebelah kiri untuk menambahkan ke pesanan.
              </p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.product.id}
                className="bg-white p-3 rounded-xl shadow-xs border border-[#dbc1b5]/40 flex items-center gap-3"
              >
                <div className="w-12 h-12 rounded-lg bg-[#f8ece1] p-1 shrink-0 flex items-center justify-center border border-[#dbc1b5]/30">
                  <img
                    src={item.product.imageUrl}
                    alt={item.product.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-[#201b14] truncate">
                    {item.product.name}
                  </h4>
                  <p className="font-price font-extrabold text-[#964407] text-xs mt-0.5">
                    {formatCurrency(item.product.price)}
                  </p>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-1.5 bg-[#f8ece1] border border-[#dbc1b5]/40 rounded-lg p-1">
                  <button
                    onClick={() => handleUpdateQuantity(item.product.id, -1)}
                    className="w-6 h-6 flex items-center justify-center text-[#201b14] hover:bg-white rounded transition-colors active:scale-90"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-price text-xs font-bold w-4 text-center text-[#201b14]">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => handleUpdateQuantity(item.product.id, 1)}
                    className="w-6 h-6 flex items-center justify-center text-[#201b14] hover:bg-white rounded transition-colors active:scale-90"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Cart Summary & Action Button */}
        <div className="bg-white p-5 border-t border-[#dbc1b5]/50 shadow-sm shrink-0">
          <div className="space-y-2 mb-4 text-xs font-medium text-[#554339]">
            <div className="flex justify-between">
              <span>Subtotal ({totalCartItems} item)</span>
              <span className="font-price font-semibold text-[#201b14]">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Pajak ({settings.defaultTaxPercent}%)</span>
              <span className="font-price font-semibold text-[#201b14]">{formatCurrency(taxAmount)}</span>
            </div>
            <div className="flex justify-between items-end pt-2 border-t border-[#dbc1b5]/40 mt-1">
              <span className="font-serif-header text-lg font-bold text-[#201b14]">Total</span>
              <span className="font-price text-2xl lg:text-3xl font-extrabold text-[#964407] tracking-tight">
                {formatCurrency(totalAmount)}
              </span>
            </div>
          </div>

          <button
            disabled={cart.length === 0}
            onClick={handleOpenPayment}
            className="w-full py-3.5 bg-[#645d57] hover:bg-[#4c4640] disabled:bg-[#dbc1b5] disabled:cursor-not-allowed text-white rounded-xl font-serif-header text-lg font-bold flex justify-center items-center gap-2 transition-all active:scale-[0.98] shadow-sm tracking-wide cursor-pointer"
          >
            <Banknote className="w-5 h-5" />
            <span>BAYAR SEKARANG</span>
          </button>
        </div>
      </aside>

      {/* Mobile Floating Cart Summary Bar */}
      <div
        onClick={() => setMobileCartOpen(true)}
        className="md:hidden fixed bottom-4 left-4 right-4 bg-[#964407] text-white rounded-2xl p-4 shadow-xl flex justify-between items-center z-30 active:scale-[0.98] transition-transform cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-xl relative">
            <ShoppingCart className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 bg-[#ba1a1a] text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold">
              {totalCartItems}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-medium opacity-85">Total Pembayaran</span>
            <span className="font-price text-base font-extrabold">{formatCurrency(totalAmount)}</span>
          </div>
        </div>
        <span className="text-xs font-bold bg-white/20 px-3 py-1.5 rounded-lg">
          Buka Keranjang
        </span>
      </div>

      {/* PAYMENT MODAL */}
      {isPaymentOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-[#dbc1b5]/50">
            {/* Header */}
            <div className="p-4 md:p-5 border-b border-[#dbc1b5]/40 flex justify-between items-center bg-[#fff8f4]">
              <h2 className="font-serif-header text-xl md:text-2xl font-bold text-[#201b14]">
                Pilih Metode Pembayaran
              </h2>
              <button
                onClick={() => setIsPaymentOpen(false)}
                className="p-1.5 text-[#645d57] hover:bg-[#ece0d6] rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 md:p-6 flex-1 overflow-y-auto flex flex-col md:flex-row gap-6">
              {/* Left Column: Payment Method Selection */}
              <div className="flex-1 space-y-3">
                {/* Tunai (Cash) */}
                <label
                  onClick={() => setPaymentMethod('tunai')}
                  className={`block cursor-pointer p-4 rounded-xl border-2 transition-all ${
                    paymentMethod === 'tunai'
                      ? 'border-[#964407] bg-[#ffdbca]/20 shadow-2xs'
                      : 'border-[#dbc1b5]/50 hover:bg-[#f8ece1]/40'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                        paymentMethod === 'tunai'
                          ? 'bg-[#964407] text-white'
                          : 'bg-[#f8ece1] text-[#964407]'
                      }`}
                    >
                      <Banknote className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-[#201b14]">Tunai / Cash</h4>
                      <p className="text-[11px] text-[#645d57]">Pembayaran uang fisik langsung</p>
                    </div>
                    {paymentMethod === 'tunai' && (
                      <CheckCircle2 className="w-5 h-5 text-[#964407]" />
                    )}
                  </div>
                </label>

                {/* QRIS */}
                <label
                  onClick={() => setPaymentMethod('qris')}
                  className={`block cursor-pointer p-4 rounded-xl border-2 transition-all ${
                    paymentMethod === 'qris'
                      ? 'border-[#964407] bg-[#ffdbca]/20 shadow-2xs'
                      : 'border-[#dbc1b5]/50 hover:bg-[#f8ece1]/40'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                        paymentMethod === 'qris'
                          ? 'bg-[#964407] text-white'
                          : 'bg-[#f8ece1] text-[#964407]'
                      }`}
                    >
                      <QrCode className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-[#201b14]">QRIS</h4>
                      <p className="text-[11px] text-[#645d57]">GoPay, OVO, Dana, ShopeePay, BCA</p>
                    </div>
                    {paymentMethod === 'qris' && (
                      <CheckCircle2 className="w-5 h-5 text-[#964407]" />
                    )}
                  </div>
                </label>

                {/* EDC / Kartu */}
                <label
                  onClick={() => setPaymentMethod('debit')}
                  className={`block cursor-pointer p-4 rounded-xl border-2 transition-all ${
                    paymentMethod === 'debit'
                      ? 'border-[#964407] bg-[#ffdbca]/20 shadow-2xs'
                      : 'border-[#dbc1b5]/50 hover:bg-[#f8ece1]/40'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                        paymentMethod === 'debit'
                          ? 'bg-[#964407] text-white'
                          : 'bg-[#f8ece1] text-[#964407]'
                      }`}
                    >
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-[#201b14]">Kartu Debit / Kredit</h4>
                      <p className="text-[11px] text-[#645d57]">Mesin EDC terintegrasi</p>
                    </div>
                    {paymentMethod === 'debit' && (
                      <CheckCircle2 className="w-5 h-5 text-[#964407]" />
                    )}
                  </div>
                </label>
              </div>

              {/* Right Column: Calculator / Method Action View */}
              <div className="flex-1 bg-[#fff8f4] rounded-2xl p-5 border border-[#dbc1b5]/50 flex flex-col justify-between">
                <div>
                  <div className="text-center mb-5 pb-4 border-b border-[#dbc1b5]/30">
                    <span className="text-[11px] font-bold text-[#645d57] uppercase tracking-wider block mb-1">
                      Total Tagihan
                    </span>
                    <span className="font-price text-3xl font-extrabold text-[#964407]">
                      {formatCurrency(totalAmount)}
                    </span>
                  </div>

                  {paymentMethod === 'tunai' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-[#554339] mb-1.5">
                          Uang Diterima (Rp)
                        </label>
                        <input
                          type="number"
                          value={cashGiven || ''}
                          onChange={(e) => setCashGiven(Number(e.target.value))}
                          className="w-full px-4 py-2.5 bg-white border-2 border-[#964407] rounded-xl font-price text-xl font-bold text-right text-[#201b14] focus:outline-none"
                        />
                      </div>

                      {/* Quick Cash Buttons */}
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => setCashGiven(totalAmount)}
                          className="py-2 px-1 bg-white border border-[#dbc1b5] rounded-lg text-xs font-bold text-[#201b14] hover:bg-[#f8ece1] transition-colors shadow-2xs"
                        >
                          Uang Pas
                        </button>
                        <button
                          type="button"
                          onClick={() => setCashGiven(Math.ceil(totalAmount / 50000) * 50000 || 50000)}
                          className="py-2 px-1 bg-white border border-[#dbc1b5] rounded-lg text-xs font-bold text-[#201b14] hover:bg-[#f8ece1] transition-colors shadow-2xs"
                        >
                          {formatNumber(Math.ceil(totalAmount / 50000) * 50000 || 50000)}
                        </button>
                        <button
                          type="button"
                          onClick={() => setCashGiven(100000)}
                          className="py-2 px-1 bg-white border border-[#dbc1b5] rounded-lg text-xs font-bold text-[#201b14] hover:bg-[#f8ece1] transition-colors shadow-2xs"
                        >
                          100.000
                        </button>
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'qris' && (
                    <div className="flex flex-col items-center text-center p-3 space-y-2 bg-white rounded-xl border border-[#dbc1b5]/40">
                      <div className="w-36 h-36 bg-[#f8ece1] p-2 rounded-xl flex items-center justify-center border-2 border-[#964407]/20">
                        {/* Dynamic Mock QR Code */}
                        <div className="w-full h-full bg-[#201b14] p-1.5 rounded-lg flex flex-col items-center justify-center text-white text-[10px] font-mono leading-tight">
                          <QrCode className="w-20 h-20 text-white stroke-1" />
                          <span className="font-sans font-bold text-[9px] mt-1 tracking-wider text-[#ffdbca]">
                            QRIS STANDAR
                          </span>
                        </div>
                      </div>
                      <p className="text-xs font-semibold text-[#201b14]">
                        Tunjukkan QR ke pelanggan
                      </p>
                      <p className="text-[11px] text-[#645d57]">
                        Scan otomatis terverifikasi secara real-time
                      </p>
                    </div>
                  )}

                  {paymentMethod === 'debit' && (
                    <div className="text-center p-4 bg-white rounded-xl border border-[#dbc1b5]/40 space-y-2">
                      <CreditCard className="w-10 h-10 text-[#964407] mx-auto stroke-1" />
                      <p className="text-xs font-bold text-[#201b14]">
                        Gesek atau Tempel Kartu di Mesin EDC
                      </p>
                      <p className="text-[11px] text-[#645d57]">
                        Mendukung GPN, Visa, Mastercard, dan Tap-to-Pay
                      </p>
                    </div>
                  )}
                </div>

                {/* Bottom Section with Kembalian & Submit */}
                <div className="mt-6 pt-4 border-t border-[#dbc1b5]/50 space-y-3">
                  {paymentMethod === 'tunai' && (
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium text-[#645d57]">Kembalian:</span>
                      <span className="font-price text-xl font-extrabold text-[#059669]">
                        {formatCurrency(cashChange)}
                      </span>
                    </div>
                  )}

                  <button
                    onClick={handleProcessPayment}
                    className="w-full py-3.5 bg-[#964407] hover:bg-[#773300] text-white rounded-xl font-serif-header text-base font-bold shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Selesai & Cetak Struk</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Toast Notification */}
      {showToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#362f28] text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 z-50 animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-5 h-5 text-[#ffdbca]" />
          <span className="text-xs font-semibold">Transaksi berhasil disimpan & dicatat!</span>
        </div>
      )}
    </div>
  );
};
