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
}

export type PaymentMethodType = 'tunai' | 'qris' | 'debit';

export interface TransactionItem {
  productId: string;
  productName: string;
  sku: string;
  price: number;
  quantity: number;
  total: number;
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
}

export interface SalesTrendData {
  day: string;
  label: string;
  revenue: number;
  transactions: number;
}
