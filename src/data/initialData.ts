import { Category, Product, StoreSettings, Transaction, SalesTrendData, AppUser } from '../types';

export const initialCategories: Category[] = [
  {
    id: 'cat-kopi',
    name: 'Minuman Kopi',
    description: 'Berbagai macam minuman berbasis espresso dan kopi seduh.',
    iconName: 'coffee',
    bgColor: '#e9ded6',
    textColor: '#69615b',
  },
  {
    id: 'cat-snack',
    name: 'Makanan Ringan',
    description: 'Camilan, roti, dan kue pendamping minuman.',
    iconName: 'bakery_dining',
    bgColor: '#ffdad8',
    textColor: '#792e2f',
  },
  {
    id: 'cat-nonkopi',
    name: 'Non-Kopi',
    description: 'Teh, susu, cokelat, dan minuman dingin lainnya.',
    iconName: 'icecream',
    bgColor: '#ffdbca',
    textColor: '#773300',
  },
  {
    id: 'cat-bahan',
    name: 'Bahan Baku',
    description: 'Sirup perasa, bubuk minuman, dan biji kopi pilihan.',
    iconName: 'inventory_2',
    bgColor: '#f2e6dc',
    textColor: '#554339',
  },
  {
    id: 'cat-pkg',
    name: 'Packaging',
    description: 'Cup plastik, sedotan ramah lingkungan, dan paper bag.',
    iconName: 'package',
    bgColor: '#e4d8ce',
    textColor: '#362f28',
  },
];

export const initialProducts: Product[] = [
  {
    id: 'prod-1',
    name: 'Kopi Susu Gula Aren 250ml',
    sku: 'MIN-KSGA-001',
    categoryId: 'cat-kopi',
    price: 18000,
    stock: 45,
    minStock: 10,
    unit: 'btl',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCA_2ICXQcEPEOJKPS-rxojW9XYb8F5RANx7SLVJqn33YHpOfL9jvuGlKQ0-rGV2hNJt7a_kkLgRAqITPaiWvEmupG2OadxJ_0GY1tFQMnGvbVhxQDO7Tl0yI06-T8PTtU4LX_7UIto5RaoczR3kkVDw19v1LuU3hhJa7b1ouY1UHR8jbmUxKfzcLEJia2KA0S1QQwwx34QvNSXBuZJcEwZruXHHVqLgSViwhS7etEGae1jcJ1-Cg8',
    imageAlt: 'Kopi Susu Gula Aren 250ml',
  },
  {
    id: 'prod-2',
    name: 'Keripik Kentang Original 120g',
    sku: 'SKU-089',
    categoryId: 'cat-snack',
    price: 12500,
    stock: 4,
    minStock: 10,
    unit: 'pcs',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAiGU9bFM9aE5LXuO67gLn5Maon0nmtH9FHB5EP7lar7vs39XIFMaCq820qMTTVBJdy8vSjJmOGQDhCa6wK5R1K5nmzXC2QxZl6kJR9o66DLczlPxE4L1o8AmGGluwrRtkblod_E8x0grM9ZDbJ9QQNisFFYQJfSvSSuJLQyvEDYsh02PCmnCgU4yHOcaN2CXDR4V_9ORuiBLzOg0nzzslPe1cMXqjFeusllUMWmSPAHSs0BOhYkoQ',
    imageAlt: 'Keripik Kentang Original 120g',
  },
  {
    id: 'prod-3',
    name: 'Air Mineral 600ml',
    sku: 'SKU-012',
    categoryId: 'cat-nonkopi',
    price: 4000,
    stock: 120,
    minStock: 20,
    unit: 'btl',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA-t1xlDoAnlWqKENXKSIEQ_L4eP8ckBO4MGHJGf8X1C6rG_cEudS0KjnwJW2kww2mlQTxgc8DqS9CgwvCl0Ptfki_EI8qtL9NoQoeR4fQbvfDk0MlVBiA1BprsdgM7925s3NJ3VEZeWvL8iDHDNAAPaU5x5Rgju_grTDh_sEPI1A3fHWRl7It4ix7B07RJ1WEIUhcrFFMuqUaS_RrTSZWBv-aiHqa9ghxqm7fykDeXGpg5rI0dGq8',
    imageAlt: 'Air Mineral 600ml',
  },
  {
    id: 'prod-4',
    name: 'Soda Cola 330ml',
    sku: 'SKU-024',
    categoryId: 'cat-nonkopi',
    price: 7500,
    stock: 56,
    minStock: 15,
    unit: 'kaleng',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDKzE9iqY-6a4PSGX3zmLqkBlNQoXZ2jpFQV9FZ0_1UfPhZTBEyRz1CdeKy4QDcXDnHjNFG-M96pf1l0alOvStAkMLs38RQMDmmRRNVrfplsDQ5YEla86-Jhij8tbWy4PMXRFc0HJJNmSdlU99AurA94y5IDqMj9mcB4BTdda89JFpui5BF3XMPAcJxtYvqkToSKFd--QtJc7GnwsES49cwbgq8THMs7iSiLoRQDTP7rTDk2QBCen8',
    imageAlt: 'Soda Cola 330ml',
  },
  {
    id: 'prod-5',
    name: 'Roti Bakar Coklat Keju',
    sku: 'MK-RBCK-002',
    categoryId: 'cat-snack',
    price: 25000,
    stock: 85,
    minStock: 15,
    unit: 'porsi',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDrkTTge7cWOHeaeHKpepYOtY6D0E1fa79LvP4vPnmMMozRV8hhuBeY466ZVcsOxb__MFZJH_WkeMJUVIfi-98kxQp5Or1YSYSgKbBaIAFVXs4gN19pTrJXiHXxpuQNqd0Drweao4dNXVbeDzgEqgDybwfDSQ3v_QXSh0Lnfexha3-2cD418SLE6eWsOOrttfqKEQ-XGQFkz3vyLcqZQ6NWjWjGxqYnSxsYNVXiRu2HqRqRyYOm3zQ',
    imageAlt: 'Roti Bakar Coklat Keju',
  },
  {
    id: 'prod-6',
    name: 'Americano Ice',
    sku: 'MIN-AMR-002',
    categoryId: 'cat-kopi',
    price: 15000,
    stock: 60,
    minStock: 10,
    unit: 'cup',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBWQnWum_ZqiQhhpC6ErjXFizaxX1mSPj9Cjaj-Bl2xKp8XRQbNbJ3FMC-_FmMcNd_F-4UL45eC5FyO2ydqBM0Ip1XfKh3uWXNepyLpEgPWonJuUqGDXq5At1pWX7rPRMqL_P41c1Y0p43w2qHg-wZN0MwAK3_xDwKZ9foMYYm6HS7ctXauQmTy3Qhgt4cASfpz-El1ieWI6hgsXmnMEU3EtEaXDfpkf79mIIGJbKrekDkJNbEJJxM',
    imageAlt: 'Americano Ice',
  },
  {
    id: 'prod-7',
    name: 'Croissant Butter',
    sku: 'SNK-CRS-001',
    categoryId: 'cat-snack',
    price: 22000,
    stock: 28,
    minStock: 8,
    unit: 'pcs',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC2MelULSUKL_Z1nVgu4g8QgyZjDdT-CVs3fCnM90AbgdKEOo4qxN3Xnwl3L6P2dEhf_zlTuxcLofPdE8dnfz2GnH1nw5xZTu1ZLe0VLmozEReqPL6r9ljQFwNMgkHm_ICX5XH_0XnVTH_TNqj6tDrl5Fmo5qWAF01LDZK61uwvizSQGt_lLTjFngUcx2vQoASKakBpYJ5oKedECc0MEysI1RHOho4UZBlECpff7GqR8cNA8W0k-zQ',
    imageAlt: 'Croissant Butter',
  },
  {
    id: 'prod-8',
    name: 'Matcha Latte',
    sku: 'MIN-MTC-003',
    categoryId: 'cat-nonkopi',
    price: 24000,
    stock: 35,
    minStock: 10,
    unit: 'cup',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAfTX6ps3GmjQ5Q6x2oxq6xfeApGGdFNcAE224uNKK7g11e31PObYnZi8o7eMW8jjdgfw1ntahLaUzPENaZKAN3u-nrh3kmHv-vsOKqiyU5R8GYA1EbuIdVoJeN71Vr3xzS6rBZdk7OYLkRNhv-3_TOSJldTnLxv3Riu2rsVBf5xr55zMcSWLnP6toGUGh-enmh-85aTKlzey6Vpzbfjb1czhsf8GXiyLHOEDujcbal5UhUgTK8HU8',
    imageAlt: 'Matcha Latte',
  },
  {
    id: 'prod-9',
    name: 'Sirup Vanilla (Botol) 1L',
    sku: 'BHW-SV-015',
    categoryId: 'cat-bahan',
    price: 85000,
    stock: 2,
    minStock: 5,
    unit: 'btl',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBRcBoP5Aa8cRd9AAhm24Ie2FOYSiem2_E2Emqunp51AbmWzG7RmQb5RmxG4zPyccQipoRyXfXxyTW4ZvhhjMcmkYA9KFTBtwv8xd_YcGWYrt0Lg78LBehzxQ-Slj4YTpy9GZUzRkefeB-na1yTpXalba0qMLAQU5d173ZyTXTVI0c_xCPB1gmf4yLwAVWCADQT6-EHSQGz10AyvmUNDf-Rqjy7kMTPS_fME1ofssLU2xrdqq2QhTM',
    imageAlt: 'Sirup Vanilla 1L',
  },
  {
    id: 'prod-10',
    name: 'Biji Kopi Arabica 1Kg',
    sku: 'BHW-BKA-001',
    categoryId: 'cat-bahan',
    price: 120000,
    stock: 0,
    minStock: 3,
    unit: 'pack',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBWQnWum_ZqiQhhpC6ErjXFizaxX1mSPj9Cjaj-Bl2xKp8XRQbNbJ3FMC-_FmMcNd_F-4UL45eC5FyO2ydqBM0Ip1XfKh3uWXNepyLpEgPWonJuUqGDXq5At1pWX7rPRMqL_P41c1Y0p43w2qHg-wZN0MwAK3_xDwKZ9foMYYm6HS7ctXauQmTy3Qhgt4cASfpz-El1ieWI6hgsXmnMEU3EtEaXDfpkf79mIIGJbKrekDkJNbEJJxM',
    imageAlt: 'Biji Kopi Arabica 1Kg',
  },
  {
    id: 'prod-11',
    name: 'Cup Plastik 16oz (Pack 50pcs)',
    sku: 'PK-CP16-042',
    categoryId: 'cat-pkg',
    price: 25000,
    stock: 5,
    minStock: 10,
    unit: 'pack',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAcloc4XuA6TfJQia7iBaVut-csri4PmdwOXAEVOoWzA0oc2PFKFU1QoFq5qTOfVnJvGW7VN591CpXmM3dO6s_uTo4wLPT_evkXw9aayjyryg4lUpJuA0qKnqck92V3sS6LIPIbQhuoLnt9A_kUNeAFM_ELvK446qItgVdaYsfcxyVkBARWBj3oJivpm66Lst-MLkbSEDMwlDdTTdwWR2UwAjtlOIH69bx0bTtDD1iPoxx0t0wG-bw',
    imageAlt: 'Cup Plastik 16oz',
  },
  {
    id: 'prod-12',
    name: 'Chocolate Cake Slice',
    sku: 'SNK-CHK-004',
    categoryId: 'cat-snack',
    price: 28000,
    stock: 14,
    minStock: 5,
    unit: 'slice',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBbJtKKj0LP-KxyWHqguGUN5UsIDgPJI8qtJ3x8hzcCj8_DHWgG7ynCkipYPC7kpmgSHIGGfQKMig5G6iMqsRHv2yDOVpyzNCswi7yQD_WG_SrwogOJfmL6mToWv_2GQWTFbk1fO6PCKnz22aE3AqklvaYInhbDiIEnLChS3sO7sqm3jKmv_FbXQRzChCOErYtc68CNUBz72VWFUAPwwXcQEx1NDExqcM48fS64Lym89M0jFtL9RkA',
    imageAlt: 'Chocolate Cake Slice',
  }
];

export const initialTransactions: Transaction[] = [
  {
    id: 'trx-1',
    trxNumber: '#TRX-001',
    date: '24 Okt 2023',
    time: '14:30',
    cashierName: 'Budi Santoso',
    paymentMethod: 'qris',
    subtotal: 95000,
    discount: 5000,
    tax: 9900,
    total: 99900,
    cashAmountPaid: 99900,
    cashChange: 0,
    status: 'sukses',
    items: [
      {
        productId: 'prod-1',
        productName: 'Kopi Susu Gula Aren',
        sku: 'MIN-KSGA-001',
        price: 25000,
        quantity: 2,
        total: 50000,
      },
      {
        productId: 'prod-5',
        productName: 'Roti Bakar Coklat Keju',
        sku: 'MK-RBCK-002',
        price: 35000,
        quantity: 1,
        total: 35000,
      },
      {
        productId: 'prod-3',
        productName: 'Air Mineral 600ml',
        sku: 'SKU-012',
        price: 5000,
        quantity: 2,
        total: 10000,
      },
    ],
  },
  {
    id: 'trx-2',
    trxNumber: '#TRX-002',
    date: '24 Okt 2023',
    time: '13:15',
    cashierName: 'Siti Aminah',
    paymentMethod: 'tunai',
    subtotal: 40540,
    discount: 0,
    tax: 4460,
    total: 45000,
    cashAmountPaid: 50000,
    cashChange: 5000,
    status: 'sukses',
    items: [
      {
        productId: 'prod-1',
        productName: 'Kopi Susu Gula Aren 250ml',
        sku: 'MIN-KSGA-001',
        price: 18000,
        quantity: 2,
        total: 36000,
      },
      {
        productId: 'prod-4',
        productName: 'Soda Cola 330ml',
        sku: 'SKU-024',
        price: 7500,
        quantity: 1,
        total: 7500,
      },
    ],
  },
  {
    id: 'trx-3',
    trxNumber: '#TRX-003',
    date: '24 Okt 2023',
    time: '11:45',
    cashierName: 'Budi Santoso',
    paymentMethod: 'debit',
    subtotal: 288288,
    discount: 0,
    tax: 31712,
    total: 320000,
    cashAmountPaid: 320000,
    cashChange: 0,
    status: 'sukses',
    items: [
      {
        productId: 'prod-10',
        productName: 'Biji Kopi Arabica 1Kg',
        sku: 'BHW-BKA-001',
        price: 120000,
        quantity: 2,
        total: 240000,
      },
      {
        productId: 'prod-9',
        productName: 'Sirup Vanilla (Botol) 1L',
        sku: 'BHW-SV-015',
        price: 85000,
        quantity: 1,
        total: 85000,
      },
    ],
  },
  {
    id: 'trx-4',
    trxNumber: '#TRX-004',
    date: '24 Okt 2023',
    time: '10:20',
    cashierName: 'Siti Aminah',
    paymentMethod: 'tunai',
    subtotal: 76576,
    discount: 0,
    tax: 8424,
    total: 85000,
    cashAmountPaid: 100000,
    cashChange: 15000,
    status: 'sukses',
    items: [
      {
        productId: 'prod-7',
        productName: 'Croissant Butter',
        sku: 'SNK-CRS-001',
        price: 22000,
        quantity: 2,
        total: 44000,
      },
      {
        productId: 'prod-6',
        productName: 'Americano Ice',
        sku: 'MIN-AMR-002',
        price: 15000,
        quantity: 2,
        total: 30000,
      },
    ],
  },
  {
    id: 'trx-5',
    trxNumber: '#TRX-005',
    date: '24 Okt 2023',
    time: '09:10',
    cashierName: 'Budi Santoso',
    paymentMethod: 'qris',
    subtotal: 189189,
    discount: 0,
    tax: 20811,
    total: 210000,
    cashAmountPaid: 210000,
    cashChange: 0,
    status: 'sukses',
    items: [
      {
        productId: 'prod-12',
        productName: 'Chocolate Cake Slice',
        sku: 'SNK-CHK-004',
        price: 28000,
        quantity: 5,
        total: 140000,
      },
      {
        productId: 'prod-8',
        productName: 'Matcha Latte',
        sku: 'MIN-MTC-003',
        price: 24000,
        quantity: 3,
        total: 72000,
      },
    ],
  },
];

export const initialStoreSettings: StoreSettings = {
  storeName: 'KASIRKU ENTERPRISE',
  storePhone: '0812-3456-7890',
  storeAddress: 'Jl. Jend. Sudirman No. 45, Jakarta Pusat, 10220',
  userName: 'Budi Santoso',
  userEmail: 'budi.admin@kasirku.id',
  userPhotoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBtoonZhAVzy1UW5qR3PlzN6UW1Y5aqeMMvjJp1k3NdbL6FUeNZEr8jgEsKsZ3MWDLWIqB9ooRHN2sjKs6XO-_iGoeUhRcdfu6mYkwZN4HwlKUL8dWNUhvYucP-7g1yfZ8ql-p0y6pNephBf0XzK-RVu57IEP85lvq3Nc0PzuLKUEJxh_d7GR3ndJMsw7RZ0RGUKSprUiOSS2Tg02GKzrN1sukma4AsSs1nUiFM26LCEgRcfhLzWW8',
  currency: 'IDR',
  defaultTaxPercent: 11,
  autoPrintReceipt: true,
  enabledPayments: {
    tunai: true,
    qris: true,
    debit: true,
  },
  soundEffectsEnabled: true,
  printerPaperWidth: '58mm',
};

export const initialBranches: { id: string; name: string; code: string; address: string; phone: string }[] = [
  {
    id: 'br-01',
    name: 'Cabang Utama - Sudirman',
    code: 'SDR-01',
    address: 'Gedung Menara Sudirman Lt. 1, Jakarta Pusat',
    phone: '021-5790123',
  },
  {
    id: 'br-02',
    name: 'Cabang Tebet Raya',
    code: 'TBT-02',
    address: 'Jl. Tebet Raya No. 18, Jakarta Selatan',
    phone: '021-8370987',
  },
  {
    id: 'br-03',
    name: 'Cabang Senopati Food Hall',
    code: 'SNP-03',
    address: 'Jl. Senopati No. 42, Kebayoran Baru',
    phone: '021-7220541',
  },
];

export const initialCustomers: {
  id: string;
  name: string;
  phone: string;
  email?: string;
  tier: 'Reguler' | 'Silver' | 'Gold' | 'VIP';
  points: number;
  totalSpent: number;
  transactionsCount: number;
}[] = [
  {
    id: 'cust-1',
    name: 'Ahmad Fauzi',
    phone: '081299887711',
    email: 'ahmad.fauzi@gmail.com',
    tier: 'Gold',
    points: 450,
    totalSpent: 1850000,
    transactionsCount: 18,
  },
  {
    id: 'cust-2',
    name: 'Siti Rahmawati',
    phone: '081377665544',
    email: 'siti.rahma@yahoo.com',
    tier: 'VIP',
    points: 820,
    totalSpent: 3400000,
    transactionsCount: 32,
  },
  {
    id: 'cust-3',
    name: 'Kevin Wijaya',
    phone: '085712349900',
    email: 'kevin.w@tech.co.id',
    tier: 'Silver',
    points: 180,
    totalSpent: 750000,
    transactionsCount: 8,
  },
  {
    id: 'cust-4',
    name: 'Dina Lestari',
    phone: '087888990011',
    tier: 'Reguler',
    points: 50,
    totalSpent: 125000,
    transactionsCount: 2,
  },
];

export const initialVouchers: {
  code: string;
  name: string;
  type: 'percent' | 'fixed';
  value: number;
  minPurchase: number;
}[] = [
  {
    code: 'HEMAT10',
    name: 'Diskon 10% Spesial',
    type: 'percent',
    value: 10,
    minPurchase: 30000,
  },
  {
    code: 'POTONG15K',
    name: 'Potongan Langsung Rp 15.000',
    type: 'fixed',
    value: 15000,
    minPurchase: 50000,
  },
  {
    code: 'VIPMEMBER',
    name: 'Diskon Spesial Member 15%',
    type: 'percent',
    value: 15,
    minPurchase: 20000,
  },
];

export const initialActiveShift: {
  id: string;
  cashierName: string;
  branchName: string;
  startTime: string;
  startDate: string;
  startingCash: number;
  cashInLogs: { id: string; time: string; amount: number; reason: string; type: 'masuk' }[];
  cashOutLogs: { id: string; time: string; amount: number; reason: string; type: 'keluar' }[];
  status: 'open' | 'closed';
} = {
  id: 'shift-' + Date.now(),
  cashierName: 'Budi Santoso',
  branchName: 'Cabang Utama - Sudirman',
  startTime: '08:00',
  startDate: '24 Okt 2023',
  startingCash: 500000, // Modal Kas Awal Rp 500.000
  cashInLogs: [
    { id: 'cin-1', time: '08:15', amount: 100000, reason: 'Pecahan uang kecil / kembalian', type: 'masuk' },
  ],
  cashOutLogs: [
    { id: 'cout-1', time: '10:30', amount: 25000, reason: 'Beli galon air isi ulang', type: 'keluar' },
  ],
  status: 'open',
};

export const weeklySalesTrend: SalesTrendData[] = [
  { day: 'Sen', label: 'Senin', revenue: 1200000, transactions: 38 },
  { day: 'Sel', label: 'Selasa', revenue: 2100000, transactions: 62 },
  { day: 'Rab', label: 'Rabu', revenue: 1800000, transactions: 51 },
  { day: 'Kam', label: 'Kamis', revenue: 3500000, transactions: 142 },
  { day: 'Jum', label: 'Jumat', revenue: 900000, transactions: 29 },
  { day: 'Sab', label: 'Sabtu', revenue: 2800000, transactions: 88 },
  { day: 'Min', label: 'Minggu', revenue: 2000000, transactions: 70 },
];

export const initialUsers: AppUser[] = [
  {
    id: 'user-superadmin',
    username: 'zalfaw4',
    password: '13februarilove',
    name: 'Zalfa Super Admin',
    role: 'super_admin',
    email: 'zalfadigiss@gmail.com',
    phone: '0812-3456-7890',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    createdAt: '2023-10-01',
  },
  {
    id: 'user-kasir-1',
    username: 'budi_kasir',
    password: '123',
    name: 'Budi Santoso',
    role: 'kasir',
    email: 'budi.kasir@kasirku.id',
    phone: '0812-9876-5432',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBtoonZhAVzy1UW5qR3PlzN6UW1Y5aqeMMvjJp1k3NdbL6FUeNZEr8jgEsKsZ3MWDLWIqB9ooRHN2sjKs6XO-_iGoeUhRcdfu6mYkwZN4HwlKUL8dWNUhvYucP-7g1yfZ8ql-p0y6pNephBf0XzK-RVu57IEP85lvq3Nc0PzuLKUEJxh_d7GR3ndJMsw7RZ0RGUKSprUiOSS2Tg02GKzrN1sukma4AsSs1nUiFM26LCEgRcfhLzWW8',
    createdAt: '2023-10-05',
  },
  {
    id: 'user-manager-1',
    username: 'siti_manager',
    password: '123',
    name: 'Siti Aminah',
    role: 'manager',
    email: 'siti.manager@kasirku.id',
    phone: '0878-1122-3344',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
    createdAt: '2023-10-10',
  },
];
