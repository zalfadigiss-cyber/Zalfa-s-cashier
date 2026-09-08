export type TabType =
  | 'dashboard'
  | 'kasir'
  | 'produk'
  | 'kategori'
  | 'stok'
  | 'riwayat'
  | 'laporan'
  | 'pengaturan';

export interface Category {
  id: string;
  name: string;
  description: string;
  iconName: string;
  bgColor: string;
  textColor: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  categoryId: string;
  price: number;
  stock: number;
  minStock: number;
  imageUrl: string;
  imageAlt?: string;
  unit?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  discount?: number;
  notes?: string;
}

export type PaymentMethodType = 'tunai' | 'qris' | 'debit';
export type OrderType = 'dine_in' | 'take_away' | 'delivery';

export interface TransactionItem {
  productId: string;
  productName: string;
  sku: string;
  price: number;
  quantity: number;
  total: number;
  notes?: string;
}

export interface Transaction {
  id: string;
  trxNumber: string;
  date: string; // ISO date string or formatted
  time: string;
  items: TransactionItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: PaymentMethodType;
  cashAmountPaid?: number;
  cashChange?: number;
  cashierName: string;
  status: 'sukses' | 'dibatalkan';
  orderType?: OrderType;
  tableNumber?: string;
  customerName?: string;
  customerPhone?: string;
  voucherCode?: string;
  pointsEarned?: number;
  pointsUsed?: number;
  branchName?: string;
  shiftId?: string;
  notes?: string;
  voidReason?: string;
  voidedAt?: string;
  voidedBy?: string;
}

export interface StoreSettings {
  storeName: string;
  storePhone: string;
  storeAddress: string;
  userName: string;
  userEmail: string;
  userPhotoUrl: string;
  currency: 'IDR' | 'USD';
  defaultTaxPercent: number;
  autoPrintReceipt: boolean;
  enabledPayments: {
    tunai: boolean;
    qris: boolean;
    debit: boolean;
  };
  soundEffectsEnabled: boolean;
  printerPaperWidth: '58mm' | '80mm';
}

export interface SalesTrendData {
  day: string;
  label: string;
  revenue: number;
  transactions: number;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  tier: 'Reguler' | 'Silver' | 'Gold' | 'VIP';
  points: number;
  totalSpent: number;
  transactionsCount: number;
}

export interface VoucherPromo {
  code: string;
  name: string;
  type: 'percent' | 'fixed';
  value: number; // e.g. 10 (10%) or 15000 (Rp 15.000)
  minPurchase: number;
}

export interface HoldOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  orderType: OrderType;
  tableNumber?: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  timestamp: string;
  notes?: string;
}

export interface ShiftLog {
  id: string;
  time: string;
  amount: number;
  reason: string;
  type: 'masuk' | 'keluar';
}

export type CashDrawerLog = ShiftLog;

export interface ShiftSession {
  id: string;
  shiftNumber?: number;
  cashierName: string;
  branchName: string;
  branchId?: string;
  startTime: string;
  startDate: string;
  startingCash: number; // Kas awal laci
  cashInLogs: ShiftLog[];
  cashOutLogs: ShiftLog[];
  status: 'open' | 'closed';
  endTime?: string;
  endDate?: string;
  actualCashEnd?: number; // Kas fisik dihitung kasir saat tutup
  expectedCashEnd?: number; // Kas seharusnya
  discrepancy?: number; // Selisih
  notes?: string;
}

export interface Branch {
  id: string;
  name: string;
  code: string;
  address: string;
  phone: string;
}

export type UserRole = 'super_admin' | 'admin' | 'manager' | 'kasir';

export interface AppUser {
  id: string;
  username: string;
  password?: string;
  name: string;
  role: UserRole;
  email?: string;
  phone?: string;
  avatarUrl?: string;
  createdAt?: string;
}
