import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Camera,
  CameraOff,
  ScanBarcode,
  Package,
  Wrench,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Plus,
  Minus,
  RotateCcw,
  Sparkles,
  Volume2,
  VolumeX,
  Layers,
  ArrowRight,
  RefreshCw,
  Info,
  SlidersHorizontal,
  X,
  Barcode as BarcodeIcon,
  ShieldAlert,
  Zap,
} from 'lucide-react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';

// ==========================================
// 1. DATA MODELS & TYPES
// ==========================================
export type FnBCategoryType = 'packaging' | 'peralatan';

export interface FnBMasterItem {
  barcode: string;
  sku: string;
  name: string;
  category: FnBCategoryType;
  specification: string;
  unit: string;
  price: number;
  stockInWarehouse: number;
  location: string;
  assetTag?: string;
  colorTheme: {
    bg: string;
    border: string;
    text: string;
    badgeBg: string;
    badgeText: string;
  };
}

export interface FnBCartItem {
  id: string;
  masterItem: FnBMasterItem;
  quantity: number;
  lastScannedAt: Date;
  subtotal: number;
}

export type CartTabFilter = 'semua' | 'packaging' | 'peralatan';

// ==========================================
// 2. MASTER F&B MOCK DATABASE
// ==========================================
export const FNB_MASTER_DATABASE: FnBMasterItem[] = [
  // --- PACKAGING & CONSUMABLES ---
  {
    barcode: '899100100201',
    sku: 'PKG-CUP-16OZ',
    name: 'Cup PET 16oz Cold Cup Clear',
    category: 'packaging',
    specification: 'Food-grade PET 16oz / 480ml, isi 50 pcs/slop',
    unit: 'slop',
    price: 28500,
    stockInWarehouse: 240,
    location: 'Gudang Packaging Rak A-02',
    colorTheme: {
      bg: 'bg-amber-50/70',
      border: 'border-amber-200',
      text: 'text-amber-900',
      badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
      badgeText: 'Packaging • Consumable',
    },
  },
  {
    barcode: '899100100202',
    sku: 'PKG-BWL-650',
    name: 'Paper Bowl 650ml Soup & Noodle + Lid',
    category: 'packaging',
    specification: 'Tahan kuah panas 100°C + Tutup PP rapat, isi 25 pcs',
    unit: 'pack',
    price: 34000,
    stockInWarehouse: 180,
    location: 'Gudang Packaging Rak A-04',
    colorTheme: {
      bg: 'bg-amber-50/70',
      border: 'border-amber-200',
      text: 'text-amber-900',
      badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
      badgeText: 'Packaging • Consumable',
    },
  },
  {
    barcode: '899100100203',
    sku: 'PKG-BOX-KRAFTL',
    name: 'Kraft Paper Lunch Box Size L (Anti Bocor)',
    category: 'packaging',
    specification: 'Kraft eco-friendly 320 gsm PE coating, isi 50 pcs',
    unit: 'pack',
    price: 45000,
    stockInWarehouse: 120,
    location: 'Gudang Packaging Rak B-01',
    colorTheme: {
      bg: 'bg-amber-50/70',
      border: 'border-amber-200',
      text: 'text-amber-900',
      badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
      badgeText: 'Packaging • Consumable',
    },
  },
  {
    barcode: '899100100204',
    sku: 'PKG-TW-500ML',
    name: 'Thinwall Persegi 500ml Microwave Safe',
    category: 'packaging',
    specification: 'BPA Free Food Grade tahan microwave/freezer, isi 25 pcs',
    unit: 'pack',
    price: 32500,
    stockInWarehouse: 310,
    location: 'Gudang Packaging Rak B-03',
    colorTheme: {
      bg: 'bg-amber-50/70',
      border: 'border-amber-200',
      text: 'text-amber-900',
      badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
      badgeText: 'Packaging • Consumable',
    },
  },
  {
    barcode: '899100100205',
    sku: 'PKG-STR-PLA12',
    name: 'Sedotan Boba PLA Biodegradable 12mm',
    category: 'packaging',
    specification: 'Bungkus kertas satuan steril, ujung runcing, isi 100 pcs',
    unit: 'pack',
    price: 18000,
    stockInWarehouse: 450,
    location: 'Gudang Bar Rak C-01',
    colorTheme: {
      bg: 'bg-amber-50/70',
      border: 'border-amber-200',
      text: 'text-amber-900',
      badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
      badgeText: 'Packaging • Consumable',
    },
  },
  {
    barcode: '899100100206',
    sku: 'PKG-SEAL-FILM',
    name: 'Roll Cup Sealer Film 2400 Cups (Motif Cafe)',
    category: 'packaging',
    specification: 'Plastik lid sealer kuat kedap udara, lebar 130mm x 2400 cup',
    unit: 'roll',
    price: 85000,
    stockInWarehouse: 65,
    location: 'Gudang Bar Rak C-02',
    colorTheme: {
      bg: 'bg-amber-50/70',
      border: 'border-amber-200',
      text: 'text-amber-900',
      badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
      badgeText: 'Packaging • Consumable',
    },
  },

  // --- PERALATAN DAPUR / ASSETS ---
  {
    barcode: '899200200301',
    sku: 'AST-BLD-COMM22',
    name: 'Commercial Heavy Duty Blender 2200W',
    category: 'peralatan',
    specification: 'Motor tembaga 38.000 RPM + Sound Enclosure cover kedap suara',
    unit: 'unit',
    price: 3250000,
    stockInWarehouse: 8,
    location: 'Barista Counter #1',
    assetTag: 'AST-KFE-2024-001',
    colorTheme: {
      bg: 'bg-blue-50/70',
      border: 'border-blue-200',
      text: 'text-blue-900',
      badgeBg: 'bg-blue-100 text-blue-900 border-blue-300',
      badgeText: 'Peralatan • Asset',
    },
  },
  {
    barcode: '899200200302',
    sku: 'AST-PF-58NAKED',
    name: 'Portafilter Naked Bottomless 58mm E61',
    category: 'peralatan',
    specification: 'Solid Stainless Steel 304 + Pegangan Solid Rosewood Wood',
    unit: 'unit',
    price: 480000,
    stockInWarehouse: 14,
    location: 'Espresso Bar Station',
    assetTag: 'AST-KFE-2024-012',
    colorTheme: {
      bg: 'bg-blue-50/70',
      border: 'border-blue-200',
      text: 'text-blue-900',
      badgeBg: 'bg-blue-100 text-blue-900 border-blue-300',
      badgeText: 'Peralatan • Asset',
    },
  },
  {
    barcode: '899200200303',
    sku: 'AST-SCL-BAR01',
    name: 'Timbangan Digital Presisi Barista 0.1g + Timer',
    category: 'peralatan',
    specification: 'Sensor ultra-presisi 0.1g s/d 3000g, Auto-flow Timer baterai Type-C',
    unit: 'unit',
    price: 245000,
    stockInWarehouse: 18,
    location: 'Pour Over & Espresso Bar',
    assetTag: 'AST-KFE-2024-023',
    colorTheme: {
      bg: 'bg-blue-50/70',
      border: 'border-blue-200',
      text: 'text-blue-900',
      badgeBg: 'bg-blue-100 text-blue-900 border-blue-300',
      badgeText: 'Peralatan • Asset',
    },
  },
  {
    barcode: '899200200304',
    sku: 'AST-JUG-600BLK',
    name: 'Milk Steaming Pitcher Teflon Matte Black 600ml',
    category: 'peralatan',
    specification: 'Stainless Steel 304 coating teflon anti-lengket, spout tajam latte art',
    unit: 'unit',
    price: 165000,
    stockInWarehouse: 22,
    location: 'Steam Bar Station',
    assetTag: 'AST-KFE-2024-034',
    colorTheme: {
      bg: 'bg-blue-50/70',
      border: 'border-blue-200',
      text: 'text-blue-900',
      badgeBg: 'bg-blue-100 text-blue-900 border-blue-300',
      badgeText: 'Peralatan • Asset',
    },
  },
  {
    barcode: '899200200305',
    sku: 'AST-KBX-SS304',
    name: 'Knock Box Stainless Steel Countertop Heavy Duty',
    category: 'peralatan',
    specification: 'Bantalan karet peredam suara hentakan, kapasitas 2.5 liter ampas',
    unit: 'unit',
    price: 285000,
    stockInWarehouse: 10,
    location: 'Espresso Counter Waste Area',
    assetTag: 'AST-KFE-2024-045',
    colorTheme: {
      bg: 'bg-blue-50/70',
      border: 'border-blue-200',
      text: 'text-blue-900',
      badgeBg: 'bg-blue-100 text-blue-900 border-blue-300',
      badgeText: 'Peralatan • Asset',
    },
  },
  {
    barcode: '899200200306',
    sku: 'AST-IND-3500W',
    name: 'Kompor Induksi Komersial Resto 3500W Touch Control',
    category: 'peralatan',
    specification: 'Heavy load plate 80kg, pemanasan cepat bertenaga tinggi, bodi SS 304',
    unit: 'unit',
    price: 2850000,
    stockInWarehouse: 6,
    location: 'Hot Kitchen Main Cooking Line',
    assetTag: 'AST-KFE-2024-056',
    colorTheme: {
      bg: 'bg-blue-50/70',
      border: 'border-blue-200',
      text: 'text-blue-900',
      badgeBg: 'bg-blue-100 text-blue-900 border-blue-300',
      badgeText: 'Peralatan • Asset',
    },
  },
];

// ==========================================
// 3. SYNTHETIC AUDIO FEEDBACK (WEB AUDIO API)
// ==========================================
class SoundSynthesizer {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setMute(muted: boolean) {
    this.isMuted = muted;
  }

  public getMute(): boolean {
    return this.isMuted;
  }

  // Success: crisp dual-tone melodic affirmative beep (880Hz -> 1320Hz)
  public playSuccessBeep() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gainNode = this.ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(880, now); // A5
      osc1.frequency.exponentialRampToValueAtTime(1320, now + 0.08); // E6

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(1760, now + 0.08);
      osc2.frequency.exponentialRampToValueAtTime(1760, now + 0.16);

      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.25, now + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(this.ctx.destination);

      osc1.start(now);
      osc1.stop(now + 0.1);
      osc2.start(now + 0.08);
      osc2.stop(now + 0.18);
    } catch {
      // AudioContext fallback
    }
  }

  // Error: distinctive low frequency warning buzz (220Hz -> 140Hz)
  public playErrorBeep() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gainNode = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.linearRampToValueAtTime(130, now + 0.28);

      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.3, now + 0.03);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(gainNode);
      gainNode.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.3);
    } catch {
      // AudioContext fallback
    }
  }
}

const synth = new SoundSynthesizer();

// ==========================================
// 4. MAIN INVENTORY SCANNER MODULE COMPONENT
// ==========================================
interface FnBInventoryScannerModuleProps {
  onClose?: () => void;
  onApplyToPos?: (items: FnBCartItem[]) => void;
}

export function FnBInventoryScannerModule({
  onClose,
  onApplyToPos,
}: FnBInventoryScannerModuleProps) {
  // Cart State
  const [cart, setCart] = useState<FnBCartItem[]>([]);
  const [activeTab, setActiveTab] = useState<CartTabFilter>('semua');

  // Scanner & Camera State
  const [isCameraActive, setIsCameraActive] = useState<boolean>(true);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [cameraErrorMsg, setCameraErrorMsg] = useState<string | null>(null);
  const [isSoundMuted, setIsSoundMuted] = useState<boolean>(false);

  // 2-Second Cooldown Interlock
  const [isCoolingDown, setIsCoolingDown] = useState<boolean>(false);
  const [cooldownRemainingMs, setCooldownRemainingMs] = useState<number>(0);
  const cooldownLockRef = useRef<boolean>(false);
  const cooldownTimerRef = useRef<number | null>(null);

  // Error Alert Banner State
  const [invalidBarcodeAlert, setInvalidBarcodeAlert] = useState<{
    barcode: string;
    timestamp: Date;
  } | null>(null);

  // Success Highlight Animation on Cart
  const [lastScannedId, setLastScannedId] = useState<string | null>(null);

  // Manual Barcode Input State
  const [manualInput, setManualInput] = useState<string>('');

  // Scanner HTML5 Reference
  const scannerInstanceRef = useRef<Html5Qrcode | null>(null);
  const scannerElementId = 'fnb-html5-camera-view';

  // Toggle Mute
  const toggleMute = () => {
    const next = !isSoundMuted;
    setIsSoundMuted(next);
    synth.setMute(next);
  };

  // Trigger Cooldown Interlock (2000 ms = 2 detik)
  const triggerCooldown = useCallback(() => {
    cooldownLockRef.current = true;
    setIsCoolingDown(true);
    setCooldownRemainingMs(2000);

    const startTime = Date.now();
    const interval = window.setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 2000 - elapsed);
      setCooldownRemainingMs(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
        cooldownLockRef.current = false;
        setIsCoolingDown(false);
      }
    }, 50);

    cooldownTimerRef.current = interval;
  }, []);

  // ==========================================
  // 5. CORE CART ENGINE LOGIC
  // ==========================================
  const handleProcessBarcode = useCallback(
    (scannedBarcode: string) => {
      const cleaned = scannedBarcode.trim();
      if (!cleaned) return;

      // 1. Cooldown Interlock Check (2 Seconds debounce)
      if (cooldownLockRef.current) {
        return;
      }

      // 2. Validate against Master F&B Database
      const matchedItem = FNB_MASTER_DATABASE.find(
        (m) => m.barcode === cleaned || m.sku.toLowerCase() === cleaned.toLowerCase()
      );

      // Lock scanner immediately for 2 seconds
      triggerCooldown();

      if (!matchedItem) {
        // Invalid / Unregistered Barcode
        synth.playErrorBeep();
        setInvalidBarcodeAlert({
          barcode: cleaned,
          timestamp: new Date(),
        });
        return;
      }

      // Valid Item Found!
      synth.playSuccessBeep();
      setInvalidBarcodeAlert(null); // Clear previous errors
      setLastScannedId(matchedItem.barcode);

      // 3. Cart Engine: increment existing or append new row
      setCart((prevCart) => {
        const existingIndex = prevCart.findIndex(
          (cartItem) => cartItem.masterItem.barcode === matchedItem.barcode
        );

        if (existingIndex >= 0) {
          // Item exists: +1 quantity
          const updated = [...prevCart];
          const current = updated[existingIndex];
          const newQty = current.quantity + 1;
          updated[existingIndex] = {
            ...current,
            quantity: newQty,
            subtotal: newQty * current.masterItem.price,
            lastScannedAt: new Date(),
          };
          return updated;
        } else {
          // New Item: Create row
          const newItem: FnBCartItem = {
            id: 'cart-' + matchedItem.barcode + '-' + Date.now(),
            masterItem: matchedItem,
            quantity: 1,
            subtotal: matchedItem.price,
            lastScannedAt: new Date(),
          };
          return [newItem, ...prevCart];
        }
      });
    },
    [triggerCooldown]
  );

  // Cart Management Operations
  const handleIncrement = (barcode: string) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.masterItem.barcode === barcode) {
          const nextQty = item.quantity + 1;
          return {
            ...item,
            quantity: nextQty,
            subtotal: nextQty * item.masterItem.price,
          };
        }
        return item;
      })
    );
  };

  const handleDecrement = (barcode: string) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.masterItem.barcode === barcode) {
            const nextQty = item.quantity - 1;
            if (nextQty <= 0) return null;
            return {
              ...item,
              quantity: nextQty,
              subtotal: nextQty * item.masterItem.price,
            };
          }
          return item;
        })
        .filter((it): it is FnBCartItem => it !== null)
    );
  };

  const handleRemoveItem = (barcode: string) => {
    setCart((prev) => prev.filter((item) => item.masterItem.barcode !== barcode));
  };

  const handleClearCart = () => {
    setCart([]);
    setInvalidBarcodeAlert(null);
  };

  // ==========================================
  // 6. CAMERA SCANNER INITIALIZATION
  // ==========================================
  useEffect(() => {
    let html5QrCode: Html5Qrcode | null = null;
    let isMounted = true;

    async function startScanner() {
      try {
        if (!isCameraActive) return;

        // Check DOM container
        const container = document.getElementById(scannerElementId);
        if (!container) return;

        html5QrCode = new Html5Qrcode(scannerElementId, {
          formatsToSupport: [
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.QR_CODE,
            Html5QrcodeSupportedFormats.UPC_A,
            Html5QrcodeSupportedFormats.UPC_E,
            Html5QrcodeSupportedFormats.CODE_39,
          ],
          verbose: false,
        });

        scannerInstanceRef.current = html5QrCode;

        // Config rear camera (environment)
        const cameraConfig = {
          facingMode: { exact: 'environment' },
        };

        const qrConfig = {
          fps: 15,
          qrbox: { width: 260, height: 260 },
          aspectRatio: 1.0,
        };

        // Attempt environment rear camera first; fallback to any available camera
        try {
          await html5QrCode.start(
            cameraConfig,
            qrConfig,
            (decodedText) => {
              if (isMounted) {
                handleProcessBarcode(decodedText);
              }
            },
            () => {
              // Frame scan attempt (silent)
            }
          );
          if (isMounted) {
            setHasCameraPermission(true);
            setCameraErrorMsg(null);
          }
        } catch {
          // Fallback to user facing or general camera
          await html5QrCode.start(
            { facingMode: 'user' },
            qrConfig,
            (decodedText) => {
              if (isMounted) {
                handleProcessBarcode(decodedText);
              }
            },
            () => {}
          );
          if (isMounted) {
            setHasCameraPermission(true);
            setCameraErrorMsg(null);
          }
        }
      } catch (err: unknown) {
        if (isMounted) {
          console.warn('[Scanner] Camera initialisation error:', err);
          const message = err instanceof Error ? err.message : 'Kamera tidak dapat diakses';
          setHasCameraPermission(false);
          setCameraErrorMsg(message);
        }
      }
    }

    startScanner();

    return () => {
      isMounted = false;
      if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop().catch(() => {}).then(() => {
          html5QrCode?.clear();
        });
      }
      if (cooldownTimerRef.current) {
        clearInterval(cooldownTimerRef.current);
      }
    };
  }, [isCameraActive, handleProcessBarcode]);

  // Restart camera when re-enabled
  const toggleCamera = async () => {
    if (isCameraActive) {
      if (scannerInstanceRef.current && scannerInstanceRef.current.isScanning) {
        await scannerInstanceRef.current.stop().catch(() => {});
      }
      setIsCameraActive(false);
    } else {
      setIsCameraActive(true);
    }
  };

  // Filtered Cart List based on Active Tab
  const filteredCart = useMemo(() => {
    if (activeTab === 'packaging') {
      return cart.filter((item) => item.masterItem.category === 'packaging');
    }
    if (activeTab === 'peralatan') {
      return cart.filter((item) => item.masterItem.category === 'peralatan');
    }
    return cart;
  }, [cart, activeTab]);

  // Totals & KPI Metrics
  const summaryMetrics = useMemo(() => {
    let totalItems = 0;
    let totalValue = 0;
    let packagingCount = 0;
    let packagingValue = 0;
    let peralatanCount = 0;
    let peralatanValue = 0;

    cart.forEach((c) => {
      totalItems += c.quantity;
      totalValue += c.subtotal;
      if (c.masterItem.category === 'packaging') {
        packagingCount += c.quantity;
        packagingValue += c.subtotal;
      } else {
        peralatanCount += c.quantity;
        peralatanValue += c.subtotal;
      }
    });

    return {
      totalDistinctSkus: cart.length,
      totalItems,
      totalValue,
      packagingCount,
      packagingValue,
      peralatanCount,
      peralatanValue,
    };
  }, [cart]);

  // Format IDR Rupiah
  const formatRp = (val: number) => {
    return 'Rp ' + Math.round(val).toLocaleString('id-ID');
  };

  return (
    <div
      id="fnb-scanner-module"
      className="flex flex-col h-full bg-[#fdf9f6] text-[#201b14] overflow-hidden"
    >
      {/* ==========================================
          HEADER: ARCHITECTURAL BAR
          ========================================== */}
      <header className="flex items-center justify-between px-4 sm:px-6 py-3.5 bg-white border-b border-[#ebdcd3] shadow-xs shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#964407] text-white flex items-center justify-center shadow-xs">
            <ScanBarcode className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold font-serif-header text-[#201b14] leading-tight">
                F&B Inventory & Barcode Engine
              </h2>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                Live Engine
              </span>
            </div>
            <p className="text-xs text-[#887368]">
              Automasi pemindaian Packaging (Consumables) & Peralatan Dapur (Assets)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Audio Feedback Toggle */}
          <button
            id="fnb-toggle-audio-btn"
            type="button"
            onClick={toggleMute}
            title={isSoundMuted ? 'Suara Dinonaktifkan' : 'Suara AudioContext Aktif'}
            className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
              isSoundMuted
                ? 'bg-stone-100 text-stone-500 border-stone-300'
                : 'bg-emerald-50 text-emerald-800 border-emerald-300'
            }`}
          >
            {isSoundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-700" />}
            <span className="hidden md:inline">{isSoundMuted ? 'Muted' : 'Beep ON'}</span>
          </button>

          {/* Close Modal (if in modal mode) */}
          {onClose && (
            <button
              id="fnb-close-modal-btn"
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-stone-500 hover:text-stone-800 hover:bg-stone-100 transition-colors"
              title="Tutup Modul"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </header>

      {/* ==========================================
          INTERACTIVE ERROR ALERT NOTIFICATION
          ========================================== */}
      {invalidBarcodeAlert && (
        <div
          id="fnb-unregistered-barcode-alert"
          className="mx-4 sm:mx-6 mt-3 p-3.5 bg-rose-50 border-2 border-rose-300 rounded-2xl shadow-sm flex items-start justify-between gap-3 text-rose-950 animate-shake"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 bg-rose-200 text-rose-800 rounded-xl shrink-0">
              <ShieldAlert className="w-5 h-5 text-rose-700" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-rose-900">
                  Barcode Tidak Terdaftar di Database F&B!
                </span>
                <span className="px-2 py-0.5 text-[11px] font-mono font-bold bg-rose-200 text-rose-900 rounded-md">
                  {invalidBarcodeAlert.barcode}
                </span>
              </div>
              <p className="text-xs text-rose-800 mt-0.5">
                Sistem tidak menemukan SKU yang cocok di kategori Packaging maupun Peralatan Dapur.
                Pastikan barcode sudah didaftarkan pada Master Inventaris.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setInvalidBarcodeAlert(null)}
            className="p-1 rounded-lg hover:bg-rose-200/80 text-rose-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ==========================================
          MAIN WORKSPACE LAYOUT (SPLIT SCREEN)
          ========================================== */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 sm:p-6 overflow-y-auto min-h-0">
        {/* LEFT COLUMN: CAMERA VIEWFINDER & QUICK BARCODE SIMULATOR (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* CAMERA VIEWFINDER CONTAINER */}
          <div className="relative bg-stone-900 rounded-2xl overflow-hidden border border-stone-800 shadow-md flex flex-col">
            {/* Viewfinder Top Bar */}
            <div className="flex items-center justify-between px-3.5 py-2 bg-stone-950/80 text-stone-200 text-xs z-10">
              <div className="flex items-center gap-2">
                <Camera className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-semibold">Kamera Belakang (facingMode: environment)</span>
              </div>
              <div className="flex items-center gap-2">
                {isCoolingDown ? (
                  <span className="flex items-center gap-1 text-[11px] text-amber-400 font-mono font-semibold bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-500/40">
                    <Zap className="w-3 h-3 animate-spin" />
                    Cooldown {(cooldownRemainingMs / 1000).toFixed(1)}s
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/40">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    Siap Memindai
                  </span>
                )}
              </div>
            </div>

            {/* VIDEO FEED CONTAINER */}
            <div className="relative w-full aspect-square sm:aspect-4/3 bg-black flex items-center justify-center overflow-hidden">
              {/* HTML5 QRCODE CONTAINER ELEMENT */}
              <div
                id={scannerElementId}
                className="w-full h-full flex items-center justify-center"
              />

              {/* RETICLE OVERLAY & ANIMATED LASER */}
              {isCameraActive && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  {/* Aiming Reticle Brackets */}
                  <div className="relative w-56 h-56 border-2 border-dashed border-amber-400/50 rounded-2xl flex items-center justify-center">
                    {/* Corner Reticle Accents */}
                    <span className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-amber-400 rounded-tl-lg" />
                    <span className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-amber-400 rounded-tr-lg" />
                    <span className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-amber-400 rounded-bl-lg" />
                    <span className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-amber-400 rounded-br-lg" />

                    {/* Laser Scanner Bar */}
                    <div className="absolute inset-x-2 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_12px_#f59e0b] animate-bounce" />

                    {/* Center Crosshair */}
                    <div className="w-3 h-3 border border-amber-400/40 rounded-full" />
                  </div>
                </div>
              )}

              {/* COOLDOWN INTERLOCK OVERLAY (2s) */}
              {isCoolingDown && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-2xs flex flex-col items-center justify-center text-white z-20 transition-all pointer-events-none">
                  <div className="p-3 bg-amber-500/20 border border-amber-400 rounded-2xl flex flex-col items-center gap-1.5 shadow-lg">
                    <CheckCircle2 className="w-8 h-8 text-amber-400 animate-pulse" />
                    <span className="text-sm font-bold text-amber-200">
                      Item Terbaca! (+1)
                    </span>
                    <span className="text-[11px] text-amber-300 font-mono">
                      Debounce Interlock: {(cooldownRemainingMs / 1000).toFixed(1)}s
                    </span>
                    {/* Progress Bar */}
                    <div className="w-36 h-1.5 bg-stone-700 rounded-full overflow-hidden mt-1">
                      <div
                        className="h-full bg-amber-400 transition-all duration-75"
                        style={{ width: `${(cooldownRemainingMs / 2000) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* FALLBACK / PERMISSION ERROR */}
              {hasCameraPermission === false && (
                <div className="absolute inset-0 bg-stone-900/95 flex flex-col items-center justify-center p-6 text-center z-20">
                  <CameraOff className="w-10 h-10 text-stone-400 mb-2" />
                  <p className="text-sm font-semibold text-stone-200">
                    Akses Kamera Tidak Tersedia
                  </p>
                  <p className="text-xs text-stone-400 max-w-xs mt-1 mb-4">
                    {cameraErrorMsg ||
                      'Izinkan akses kamera di peramban, atau gunakan pemindaian instan di bawah ini.'}
                  </p>
                  <button
                    type="button"
                    onClick={toggleCamera}
                    className="px-3.5 py-1.5 bg-[#964407] hover:bg-[#7e3905] text-white rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Coba Hubungkan Ulang
                  </button>
                </div>
              )}
            </div>

            {/* Viewfinder Bottom Bar */}
            <div className="p-3 bg-stone-950 flex items-center justify-between text-xs text-stone-400 border-t border-stone-800">
              <span className="text-[11px]">
                Arahkan kode batang / QR ke dalam kotak target
              </span>
              <button
                type="button"
                onClick={toggleCamera}
                className="text-[11px] font-semibold text-amber-400 hover:text-amber-300 underline"
              >
                {isCameraActive ? 'Jeda Kamera' : 'Aktifkan Kamera'}
              </button>
            </div>
          </div>

          {/* MANUAL INPUT & QUICK TEST BARCODES */}
          <div className="bg-white rounded-2xl p-4 border border-[#ebdcd3] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#964407]">
                <BarcodeIcon className="w-4 h-4" />
                <span>Simulasi & Input Manual Barcode</span>
              </div>
              <span className="text-[10px] text-[#887368] font-mono">
                Click-to-Scan Instant
              </span>
            </div>

            {/* Manual Textbox */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (manualInput.trim()) {
                  handleProcessBarcode(manualInput);
                  setManualInput('');
                }
              }}
              className="flex gap-2"
            >
              <input
                id="fnb-manual-barcode-input"
                type="text"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                placeholder="Ketik barcode (contoh: 899100100201)..."
                className="flex-1 px-3 py-2 text-xs font-mono bg-[#fefaf7] border border-[#dbc1b5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#964407]"
              />
              <button
                id="fnb-manual-barcode-submit"
                type="submit"
                className="px-3.5 py-2 bg-[#964407] hover:bg-[#7d3704] text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1"
              >
                <span>Validasi</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>

            {/* Predefined Quick Test Chips */}
            <div className="space-y-2 pt-1 border-t border-[#ebdcd3]/70">
              <p className="text-[11px] font-medium text-[#6c5950]">
                Klik cepat untuk menguji barcode bawaan:
              </p>

              {/* Packaging Quick Chips */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1">
                  <Package className="w-3 h-3 text-amber-700" />
                  Barang Packaging (Consumables):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {FNB_MASTER_DATABASE.filter((i) => i.category === 'packaging')
                    .slice(0, 4)
                    .map((item) => (
                      <button
                        key={item.barcode}
                        type="button"
                        onClick={() => handleProcessBarcode(item.barcode)}
                        className="px-2 py-1 rounded-lg text-[11px] font-medium bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-300 transition-all text-left flex items-center gap-1"
                        title={item.specification}
                      >
                        <span className="font-mono font-bold text-[10px]">{item.barcode}</span>
                        <span className="truncate max-w-[110px]">{item.name}</span>
                      </button>
                    ))}
                </div>
              </div>

              {/* Peralatan Quick Chips */}
              <div className="space-y-1 pt-1">
                <span className="text-[10px] font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1">
                  <Wrench className="w-3 h-3 text-blue-700" />
                  Peralatan Dapur (Assets):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {FNB_MASTER_DATABASE.filter((i) => i.category === 'peralatan')
                    .slice(0, 3)
                    .map((item) => (
                      <button
                        key={item.barcode}
                        type="button"
                        onClick={() => handleProcessBarcode(item.barcode)}
                        className="px-2 py-1 rounded-lg text-[11px] font-medium bg-blue-50 hover:bg-blue-100 text-blue-950 border border-blue-300 transition-all text-left flex items-center gap-1"
                        title={item.specification}
                      >
                        <span className="font-mono font-bold text-[10px]">{item.barcode}</span>
                        <span className="truncate max-w-[110px]">{item.name}</span>
                      </button>
                    ))}
                </div>
              </div>

              {/* Error Simulation Chip */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => handleProcessBarcode('899999999999')}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-300 transition-all flex items-center gap-1"
                >
                  <AlertTriangle className="w-3 h-3 text-rose-600" />
                  <span>Uji Barcode Error (Tidak Terdaftar)</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: CART ENGINE & INVENTORY MANIFEST (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {/* CART HEADER & CATEGORY TAB FILTERS */}
          <div className="bg-white rounded-2xl p-4 border border-[#ebdcd3] shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold font-serif-header text-[#201b14] flex items-center gap-2">
                  <span>Hasil Pemindaian Inventaris</span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#964407] text-white">
                    {summaryMetrics.totalDistinctSkus} SKU
                  </span>
                </h3>
                <p className="text-xs text-[#887368]">
                  Item otomatis bertambah kuantitas (+1) saat barcode terdeteksi ulang
                </p>
              </div>

              {/* Reset Cart */}
              {cart.length > 0 && (
                <button
                  id="fnb-clear-cart-btn"
                  type="button"
                  onClick={handleClearCart}
                  className="px-2.5 py-1 text-xs text-stone-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-1 self-start sm:self-auto"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Kosongkan</span>
                </button>
              )}
            </div>

            {/* TAB FILTERS: SEMUA, PACKAGING, PERALATAN */}
            <div
              id="fnb-cart-tab-filters"
              className="flex items-center gap-1.5 p-1 bg-[#f4ebe4] rounded-xl border border-[#dbc1b5]/60 text-xs font-semibold"
            >
              <button
                id="fnb-filter-tab-semua"
                type="button"
                onClick={() => setActiveTab('semua')}
                className={`flex-1 py-1.5 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'semua'
                    ? 'bg-white text-[#964407] shadow-xs font-bold'
                    : 'text-[#6c5950] hover:text-[#201b14]'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Semua ({cart.length})</span>
              </button>

              <button
                id="fnb-filter-tab-packaging"
                type="button"
                onClick={() => setActiveTab('packaging')}
                className={`flex-1 py-1.5 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'packaging'
                    ? 'bg-amber-100 text-amber-900 shadow-xs font-bold border border-amber-300'
                    : 'text-[#6c5950] hover:text-[#201b14]'
                }`}
              >
                <Package className="w-3.5 h-3.5 text-amber-700" />
                <span>Packaging ({summaryMetrics.packagingCount})</span>
              </button>

              <button
                id="fnb-filter-tab-peralatan"
                type="button"
                onClick={() => setActiveTab('peralatan')}
                className={`flex-1 py-1.5 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'peralatan'
                    ? 'bg-blue-100 text-blue-900 shadow-xs font-bold border border-blue-300'
                    : 'text-[#6c5950] hover:text-[#201b14]'
                }`}
              >
                <Wrench className="w-3.5 h-3.5 text-blue-700" />
                <span>Peralatan ({summaryMetrics.peralatanCount})</span>
              </button>
            </div>
          </div>

          {/* CART ITEMS SCROLLABLE LIST */}
          <div className="flex-1 bg-white rounded-2xl border border-[#ebdcd3] shadow-xs p-3 overflow-y-auto min-h-[300px] max-h-[460px] space-y-2.5">
            {filteredCart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center py-12 text-center text-stone-400">
                <ScanBarcode className="w-12 h-12 text-stone-300 mb-2 stroke-[1.5]" />
                <p className="text-sm font-semibold text-stone-700">
                  Keranjang Pemindaian Masih Kosong
                </p>
                <p className="text-xs text-stone-500 max-w-sm mt-1">
                  Arahkan kamera ke barcode barang atau klik salah satu barcode uji di sebelah kiri
                  untuk mulai mencatat inventaris.
                </p>
              </div>
            ) : (
              filteredCart.map((cartItem) => {
                const { masterItem, quantity, subtotal } = cartItem;
                const isRecentlyScanned = lastScannedId === masterItem.barcode;

                return (
                  <div
                    key={cartItem.id}
                    id={`fnb-cart-item-${masterItem.barcode}`}
                    className={`p-3.5 rounded-xl border transition-all ${
                      masterItem.category === 'packaging'
                        ? 'bg-[#fffaf5] border-amber-200/80 hover:border-amber-300'
                        : 'bg-[#f7faff] border-blue-200/80 hover:border-blue-300'
                    } ${isRecentlyScanned ? 'ring-2 ring-[#964407] shadow-sm' : 'shadow-2xs'}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      {/* Left: Info & Badges */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5 mb-1">
                          {/* Distinctive Category Badge */}
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${masterItem.colorTheme.badgeBg}`}
                          >
                            {masterItem.category === 'packaging' ? (
                              <Package className="w-3 h-3 text-amber-700" />
                            ) : (
                              <Wrench className="w-3 h-3 text-blue-700" />
                            )}
                            <span>{masterItem.colorTheme.badgeText}</span>
                          </span>

                          {/* Barcode Tag */}
                          <span className="font-mono text-[10px] text-stone-500 bg-stone-100 px-1.5 py-0.5 rounded">
                            {masterItem.barcode}
                          </span>

                          {masterItem.assetTag && (
                            <span className="font-mono text-[10px] text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                              Tag: {masterItem.assetTag}
                            </span>
                          )}
                        </div>

                        <h4 className="text-sm font-bold text-[#201b14] truncate">
                          {masterItem.name}
                        </h4>
                        <p className="text-xs text-[#887368] line-clamp-1 mt-0.5">
                          {masterItem.specification}
                        </p>

                        <div className="flex items-center gap-3 mt-1.5 text-xs text-[#6c5950]">
                          <span className="font-semibold text-[#964407]">
                            {formatRp(masterItem.price)} / {masterItem.unit}
                          </span>
                          <span>&bull;</span>
                          <span className="text-[11px] text-stone-500">
                            Lokasi: {masterItem.location}
                          </span>
                        </div>
                      </div>

                      {/* Right: Subtotal & Quantity Controls */}
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <span className="text-sm font-bold font-mono text-[#201b14]">
                          {formatRp(subtotal)}
                        </span>

                        {/* Quantity Management Buttons (+/-) & Delete */}
                        <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-stone-200 shadow-2xs">
                          <button
                            type="button"
                            onClick={() => handleDecrement(masterItem.barcode)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
                            title="Kurang 1"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>

                          <span className="w-8 text-center font-bold font-mono text-xs text-stone-900">
                            {quantity}
                          </span>

                          <button
                            type="button"
                            onClick={() => handleIncrement(masterItem.barcode)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg bg-[#964407] hover:bg-[#7e3905] text-white transition-colors"
                            title="Tambah 1"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleRemoveItem(masterItem.barcode)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors ml-0.5"
                            title="Hapus dari Keranjang"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* SUMMARY KPI METRICS & ACTION BUTTONS */}
          <div className="bg-white rounded-2xl p-4 border border-[#ebdcd3] shadow-xs space-y-3">
            {/* KPI Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2.5 bg-[#fefaf7] rounded-xl border border-[#ebdcd3]">
                <span className="text-[#887368] text-[11px] block">Total SKU Terdeteksi</span>
                <span className="font-bold text-sm text-[#201b14] font-mono">
                  {summaryMetrics.totalDistinctSkus} Jenis
                </span>
              </div>

              <div className="p-2.5 bg-[#fefaf7] rounded-xl border border-[#ebdcd3]">
                <span className="text-[#887368] text-[11px] block">Total Kuantitas Fisik</span>
                <span className="font-bold text-sm text-[#201b14] font-mono">
                  {summaryMetrics.totalItems} Unit/Pcs
                </span>
              </div>

              <div className="p-2.5 bg-amber-50/70 rounded-xl border border-amber-200">
                <span className="text-amber-800 text-[11px] block">Subtotal Packaging</span>
                <span className="font-bold text-sm text-amber-950 font-mono">
                  {formatRp(summaryMetrics.packagingValue)}
                </span>
              </div>

              <div className="p-2.5 bg-blue-50/70 rounded-xl border border-blue-200">
                <span className="text-blue-800 text-[11px] block">Subtotal Peralatan</span>
                <span className="font-bold text-sm text-blue-950 font-mono">
                  {formatRp(summaryMetrics.peralatanValue)}
                </span>
              </div>
            </div>

            {/* Total Value & Primary CTA */}
            <div className="flex items-center justify-between pt-2 border-t border-[#ebdcd3]">
              <div>
                <span className="text-xs text-[#887368] block">Estimasi Nilai Barang</span>
                <span className="text-lg sm:text-xl font-bold font-mono text-[#964407]">
                  {formatRp(summaryMetrics.totalValue)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {onApplyToPos && (
                  <button
                    id="fnb-apply-to-pos-btn"
                    type="button"
                    disabled={cart.length === 0}
                    onClick={() => onApplyToPos(cart)}
                    className="px-4 py-2.5 bg-[#964407] hover:bg-[#7e3905] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Terapkan ke Kasir POS</span>
                  </button>
                )}

                {onClose && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-xs rounded-xl transition-all"
                  >
                    Tutup
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
