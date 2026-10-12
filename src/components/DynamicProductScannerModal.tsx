import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Camera,
  CameraOff,
  ScanBarcode,
  Package,
  Plus,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Zap,
  Volume2,
  VolumeX,
  Keyboard,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Product, Category } from '../types';
import { formatCurrency } from '../utils/format';

interface DynamicProductScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  categories: Category[];
  onAddProduct: (product: Omit<Product, 'id'>) => void;
  onUpdateProduct: (product: Product) => void;
}

export const DynamicProductScannerModal: React.FC<DynamicProductScannerModalProps> = ({
  isOpen,
  onClose,
  products,
  categories,
  onAddProduct,
  onUpdateProduct,
}) => {
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [manualBarcodeInput, setManualBarcodeInput] = useState<string>('');
  
  // Last scanned barcode info
  const [scannedBarcode, setScannedBarcode] = useState<string | null>(null);
  const [foundProduct, setFoundProduct] = useState<Product | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // New product form for unregistered barcode
  const [newProdName, setNewProdName] = useState('');
  const [newProdCategory, setNewProdCategory] = useState(categories[0]?.id || '');
  const [newProdPrice, setNewProdPrice] = useState<number>(20000);
  const [newProdStock, setNewProdStock] = useState<number>(25);
  const [newProdMinStock, setNewProdMinStock] = useState<number>(5);
  const [newProdUnit, setNewProdUnit] = useState<string>('pcs');

  // Restock quantity for existing product
  const [restockQty, setRestockQty] = useState<number>(5);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = 'dynamic-product-scanner-viewport';

  // Sound tone using Web Audio API
  const playSound = (type: 'success' | 'alert') => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (type === 'success') {
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
        osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.08); // A5
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.25);
      } else {
        osc.frequency.setValueAtTime(440, audioCtx.currentTime);
        osc.frequency.setValueAtTime(349.23, audioCtx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
      }
    } catch {}
  };

  // Handle scanned barcode (from camera, hardware scanner, or manual input)
  const processBarcode = (code: string) => {
    const cleanCode = code.trim();
    if (!cleanCode) return;

    setScannedBarcode(cleanCode);
    setActionSuccessMsg(null);

    // Check if barcode/SKU matches any existing product
    const match = products.find(
      (p) => p.sku.toLowerCase() === cleanCode.toLowerCase() || p.id === cleanCode
    );

    if (match) {
      setFoundProduct(match);
      playSound('success');
    } else {
      setFoundProduct(null);
      // Auto-suggest product name based on prefix or generic
      setNewProdName('');
      setNewProdCategory(categories[0]?.id || '');
      setNewProdPrice(20000);
      setNewProdStock(20);
      playSound('alert');
    }
  };

  // Listen to hardware USB/Bluetooth barcode scanner (keystrokes ending with Enter)
  useEffect(() => {
    if (!isOpen) return;

    let buffer = '';
    let lastKeyTime = Date.now();

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is currently typing in an input or textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
        return;
      }

      const currentTime = Date.now();
      if (currentTime - lastKeyTime > 150) {
        buffer = '';
      }
      lastKeyTime = currentTime;

      if (e.key === 'Enter') {
        if (buffer.length >= 3) {
          processBarcode(buffer);
          buffer = '';
        }
      } else if (e.key.length === 1) {
        buffer += e.key;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, products]);

  // Start Camera Scanner
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode(scannerContainerId, {
          formatsToSupport: [
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.EAN_8,
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.CODE_39,
            Html5QrcodeSupportedFormats.UPC_A,
            Html5QrcodeSupportedFormats.UPC_E,
            Html5QrcodeSupportedFormats.QR_CODE,
          ],
          verbose: false,
        });
      }

      await scannerRef.current.start(
        { facingMode: 'environment' },
        {
          fps: 12,
          qrbox: { width: 260, height: 160 },
          aspectRatio: 1.5,
        },
        (decodedText) => {
          processBarcode(decodedText);
        },
        () => {}
      );
      setIsCameraActive(true);
    } catch (err: any) {
      console.warn('[Camera Scanner Error]', err);
      setCameraError('Kamera tidak dapat diakses atau diblokir oleh browser. Anda tetap dapat menggunakan scan hardware atau input manual.');
      setIsCameraActive(false);
    }
  };

  // Stop Camera Scanner
  const stopCamera = async () => {
    if (scannerRef.current && isCameraActive) {
      try {
        await scannerRef.current.stop();
      } catch {}
      setIsCameraActive(false);
    }
  };

  // Cleanup on unmount or modal close
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setScannedBarcode(null);
      setFoundProduct(null);
      setActionSuccessMsg(null);
    }
  }, [isOpen]);

  // Handle restock existing product
  const handleRestock = (qtyToAdd: number) => {
    if (!foundProduct) return;
    const updated: Product = {
      ...foundProduct,
      stock: foundProduct.stock + qtyToAdd,
    };
    onUpdateProduct(updated);
    setFoundProduct(updated);
    setActionSuccessMsg(`Stok berhasil ditambah +${qtyToAdd} ${updated.unit || 'pcs'}! Total stok sekarang: ${updated.stock}`);
    playSound('success');
  };

  // Handle submit new product from scanned barcode
  const handleSaveNewProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scannedBarcode) return;
    if (!newProdName.trim()) {
      alert('Nama produk tidak boleh kosong.');
      return;
    }

    const newProdPayload: Omit<Product, 'id'> = {
      name: newProdName.trim(),
      sku: scannedBarcode.trim(),
      categoryId: newProdCategory,
      price: Number(newProdPrice) || 10000,
      stock: Number(newProdStock) || 10,
      minStock: Number(newProdMinStock) || 5,
      unit: newProdUnit.trim() || 'pcs',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCA_2ICXQcEPEOJKPS-rxojW9XYb8F5RANx7SLVJqn33YHpOfL9jvuGlKQ0-rGV2hNJt7a_kkLgRAqITPaiWvEmupG2OadxJ_0GY1tFQMnGvbVhxQDO7Tl0yI06-T8PTtU4LX_7UIto5RaoczR3kkVDw19v1LuU3hhJa7b1ouY1UHR8jbmUxKfzcLEJia2KA0S1QQwwx34QvNSXBuZJcEwZruXHHVqLgSViwhS7etEGae1jcJ1-Cg8',
    };

    onAddProduct(newProdPayload);
    setActionSuccessMsg(`Produk baru "${newProdName}" berhasil didaftarkan ke database Turso!`);
    playSound('success');

    // Convert found product to newly added product view
    setFoundProduct({
      id: 'temp-' + Date.now(),
      ...newProdPayload,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#1c1511] rounded-3xl shadow-2xl border border-[#dbc1b5]/60 dark:border-[#423126] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#dbc1b5]/40 dark:border-[#423126] flex items-center justify-between bg-[#fff8f4] dark:bg-[#231a15]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#964407] to-[#592600] text-white flex items-center justify-center shadow-md shadow-[#964407]/20">
              <ScanBarcode className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#201b14] dark:text-[#f7ece4] font-serif flex items-center gap-2">
                <span>Scan Dinamis Barang & Produk</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800/60">
                  AI Auto-Input
                </span>
              </h2>
              <p className="text-xs text-[#645d57] dark:text-[#c7b3a5]">
                Pindai kamera / scanner barcode untuk cek stok & input produk baru otomatis
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 rounded-xl text-[#554339] dark:text-[#c7b3a5] hover:bg-[#ebdcd3] dark:hover:bg-[#2e231c] transition-colors"
              title={soundEnabled ? 'Matikan Suara Beep' : 'Aktifkan Suara Beep'}
            >
              {soundEnabled ? <Volume2 className="w-5 h-5 text-[#964407]" /> : <VolumeX className="w-5 h-5" />}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-[#887368] hover:text-[#201b14] dark:hover:text-white hover:bg-stone-100 dark:hover:bg-[#2e231c] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {/* Scanner Viewport Section */}
          <div className="bg-[#140e0b] rounded-2xl overflow-hidden border border-[#3d2f26] relative">
            <div
              id={scannerContainerId}
              className={`w-full min-h-[180px] sm:min-h-[220px] flex items-center justify-center text-white ${
                !isCameraActive ? 'p-6' : ''
              }`}
            >
              {!isCameraActive && (
                <div className="text-center space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-white/10 mx-auto flex items-center justify-center text-[#ffbe99] border border-white/15">
                    <Camera className="w-7 h-7" />
                  </div>
                  <p className="text-sm font-semibold text-white/90">
                    Kamera Scanner Belum Aktif
                  </p>
                  <p className="text-xs text-white/60 max-w-sm mx-auto">
                    Anda bisa mengaktifkan kamera atau langsung menembak barcode dengan scanner hardware USB/Bluetooth.
                  </p>
                  <button
                    type="button"
                    onClick={startCamera}
                    className="px-4 py-2 rounded-xl bg-[#964407] hover:bg-[#b65c21] text-white text-xs font-bold shadow-md transition-all cursor-pointer active:scale-95 inline-flex items-center gap-2"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Aktifkan Kamera Scanner</span>
                  </button>
                </div>
              )}
            </div>

            {/* Camera Active Controls Bar */}
            {isCameraActive && (
              <div className="absolute top-3 right-3 z-10">
                <button
                  type="button"
                  onClick={stopCamera}
                  className="px-3 py-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white text-xs font-semibold backdrop-blur-xs transition-colors flex items-center gap-1.5"
                >
                  <CameraOff className="w-3.5 h-3.5 text-red-400" />
                  <span>Matikan Kamera</span>
                </button>
              </div>
            )}

            {cameraError && (
              <div className="p-3 bg-red-950/80 border-t border-red-900/80 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{cameraError}</span>
              </div>
            )}
          </div>

          {/* Manual Input & Hardware Scanner Notice */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={manualBarcodeInput}
                onChange={(e) => setManualBarcodeInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    processBarcode(manualBarcodeInput);
                  }
                }}
                placeholder="Scan dengan Barcode Scanner atau ketik SKU/Barcode..."
                className="w-full pl-3.5 pr-20 py-2.5 rounded-xl border border-[#dbc1b5] dark:border-[#423126] text-xs font-mono text-[#201b14] dark:text-[#f7ece4] bg-white dark:bg-[#140e0b] focus:outline-none focus:border-[#964407]"
              />
              <button
                type="button"
                onClick={() => processBarcode(manualBarcodeInput)}
                className="absolute right-1.5 top-1.5 bottom-1.5 px-3 rounded-lg bg-[#964407] hover:bg-[#7e3905] text-white text-xs font-bold transition-all cursor-pointer"
              >
                Pindai
              </button>
            </div>

            {/* Demo Barcode Samples */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-1">
              <span className="text-[10px] font-bold text-[#887368] uppercase shrink-0">
                Uji Coba:
              </span>
              {products.slice(0, 2).map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => processBarcode(p.sku)}
                  className="px-2.5 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-200 text-[11px] font-bold whitespace-nowrap hover:bg-amber-100 transition-colors"
                >
                  {p.sku} ({p.name.split(' ')[0]})
                </button>
              ))}
              <button
                type="button"
                onClick={() => processBarcode('8992753' + Math.floor(10000 + Math.random() * 90000))}
                className="px-2.5 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-blue-900 dark:text-blue-200 text-[11px] font-bold whitespace-nowrap hover:bg-blue-100 transition-colors"
              >
                + Barcode Baru Acak
              </button>
            </div>
          </div>

          {/* Action Success Toast */}
          {actionSuccessMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs font-medium flex items-center gap-2 animate-in zoom-in-95 duration-150">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{actionSuccessMsg}</span>
            </div>
          )}

          {/* Dynamic Detection State */}
          {scannedBarcode && (
            <div className="pt-2">
              {/* CASE A: EXISTING PRODUCT FOUND */}
              {foundProduct ? (
                <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/60 dark:bg-[#1a251c] border border-emerald-300/80 dark:border-emerald-700/60 space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-white dark:bg-[#140e0b] border border-emerald-200 dark:border-emerald-800 shrink-0">
                        <img
                          src={foundProduct.imageUrl}
                          alt={foundProduct.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 uppercase">
                            Produk Ditemukan
                          </span>
                          <span className="font-mono text-xs font-bold text-[#645d57] dark:text-[#a89487]">
                            {foundProduct.sku}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-[#201b14] dark:text-[#f7ece4] mt-0.5">
                          {foundProduct.name}
                        </h3>
                        <p className="text-xs font-price font-bold text-[#964407] dark:text-[#ffbe99]">
                          {formatCurrency(foundProduct.price)} • Stok Saat Ini: {foundProduct.stock} {foundProduct.unit || 'pcs'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Restock Buttons */}
                  <div className="p-3 bg-white dark:bg-[#140e0b] rounded-xl border border-emerald-200 dark:border-emerald-800/60 space-y-2">
                    <span className="text-xs font-bold text-[#554339] dark:text-[#c7b3a5] block">
                      ⚡ Tambah / Restock Stok Cepat:
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleRestock(1)}
                        className="flex-1 py-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 hover:bg-emerald-200 text-emerald-900 dark:text-emerald-200 font-bold text-xs transition-colors cursor-pointer"
                      >
                        +1 {foundProduct.unit || 'pcs'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRestock(5)}
                        className="flex-1 py-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 hover:bg-emerald-200 text-emerald-900 dark:text-emerald-200 font-bold text-xs transition-colors cursor-pointer"
                      >
                        +5 {foundProduct.unit || 'pcs'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRestock(10)}
                        className="flex-1 py-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 hover:bg-emerald-200 text-emerald-900 dark:text-emerald-200 font-bold text-xs transition-colors cursor-pointer"
                      >
                        +10 {foundProduct.unit || 'pcs'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRestock(25)}
                        className="flex-1 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors cursor-pointer"
                      >
                        +25 {foundProduct.unit || 'pcs'}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* CASE B: NEW UNREGISTERED BARCODE -> AUTO INPUT FORM */
                <form
                  onSubmit={handleSaveNewProduct}
                  className="p-4 sm:p-5 rounded-2xl bg-amber-50/70 dark:bg-[#241a13] border border-amber-300 dark:border-amber-800/80 space-y-4 animate-in fade-in duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold">
                        <Plus className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-amber-900 dark:text-amber-200 block">
                          Barcode Baru Terdeteksi (Belum Terdaftar)
                        </span>
                        <span className="font-mono text-xs font-bold text-[#964407] dark:text-[#ffbe99]">
                          {scannedBarcode}
                        </span>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-100 uppercase">
                      Input Langsung
                    </span>
                  </div>

                  {/* Form fields */}
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-[#554339] dark:text-[#c7b3a5] mb-1">
                        Nama Barang / Produk <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: Kopi Susu Aren Botol 250ml"
                        value={newProdName}
                        onChange={(e) => setNewProdName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-[#dbc1b5] dark:border-[#4a382d] bg-white dark:bg-[#140e0b] text-xs font-semibold text-[#201b14] dark:text-[#f7ece4] focus:outline-none focus:border-[#964407]"
                        autoFocus
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-[#554339] dark:text-[#c7b3a5] mb-1">
                          Kategori
                        </label>
                        <select
                          value={newProdCategory}
                          onChange={(e) => setNewProdCategory(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-[#dbc1b5] dark:border-[#4a382d] bg-white dark:bg-[#140e0b] text-xs font-semibold text-[#201b14] dark:text-[#f7ece4] focus:outline-none focus:border-[#964407]"
                        >
                          {categories.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#554339] dark:text-[#c7b3a5] mb-1">
                          Harga Jual (Rp)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="500"
                          required
                          value={newProdPrice}
                          onChange={(e) => setNewProdPrice(Number(e.target.value))}
                          className="w-full px-3 py-2 rounded-xl border border-[#dbc1b5] dark:border-[#4a382d] bg-white dark:bg-[#140e0b] text-xs font-bold font-price text-[#201b14] dark:text-[#f7ece4] focus:outline-none focus:border-[#964407]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-xs font-bold text-[#554339] dark:text-[#c7b3a5] mb-1">
                          Stok Awal
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={newProdStock}
                          onChange={(e) => setNewProdStock(Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-[#dbc1b5] dark:border-[#4a382d] bg-white dark:bg-[#140e0b] text-xs font-bold text-center"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#554339] dark:text-[#c7b3a5] mb-1">
                          Min. Stok
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={newProdMinStock}
                          onChange={(e) => setNewProdMinStock(Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-[#dbc1b5] dark:border-[#4a382d] bg-white dark:bg-[#140e0b] text-xs font-bold text-center"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#554339] dark:text-[#c7b3a5] mb-1">
                          Satuan
                        </label>
                        <input
                          type="text"
                          value={newProdUnit}
                          onChange={(e) => setNewProdUnit(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-[#dbc1b5] dark:border-[#4a382d] bg-white dark:bg-[#140e0b] text-xs font-bold text-center"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-[#964407] hover:bg-[#7e3905] text-white font-extrabold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Daftarkan &amp; Simpan Produk ke Database Turso</span>
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 sm:p-4 border-t border-[#dbc1b5]/40 dark:border-[#423126] bg-[#fff8f4] dark:bg-[#231a15] flex items-center justify-between">
          <span className="text-[11px] text-[#887368] dark:text-[#a89487]">
            Mendukung scanner USB, Bluetooth, kamera ponsel, dan input manual
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white dark:bg-[#1c1511] border border-[#dbc1b5] dark:border-[#423126] text-xs font-bold text-[#554339] dark:text-[#c7b3a5] hover:bg-stone-50 transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
