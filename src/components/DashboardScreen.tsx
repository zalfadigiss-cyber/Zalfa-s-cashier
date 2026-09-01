import React from 'react';
import {
  TrendingUp,
  Receipt,
  ShoppingBag,
  AlertTriangle,
  ChevronRight,
  MoreVertical,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import { Product, TabType, Transaction } from '../types';
import { formatCurrency, formatNumber, getIndonesianFullDate } from '../utils/format';

interface DashboardScreenProps {
  products: Product[];
  transactions: Transaction[];
  setActiveTab: (tab: TabType) => void;
  onOpenQuickCheckout?: () => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  products,
  transactions,
  setActiveTab,
}) => {
  // Calculations
  const todayRevenue = transactions.reduce((acc, t) => acc + t.total, 0);
  const todayTransactionsCount = transactions.length;
  const todayItemsSold = transactions.reduce(
    (acc, t) => acc + t.items.reduce((sum, item) => sum + item.quantity, 0),
    0
  );
  const lowStockProducts = products.filter((p) => p.stock <= p.minStock);

  // Top selling products calculated from transactions
  const productSalesMap = new Map<string, number>();
  transactions.forEach((t) => {
    t.items.forEach((item) => {
      productSalesMap.set(item.productId, (productSalesMap.get(item.productId) || 0) + item.quantity);
    });
  });

  const topProducts = [...products]
    .map((p) => ({
      ...p,
      sold: productSalesMap.get(p.id) || (p.id === 'prod-1' ? 45 : p.id === 'prod-12' ? 32 : p.id === 'prod-7' ? 28 : 22),
    }))
    .sort((a, b) => b.sold - a.sold)
    .slice(0, 4);

  // Sales Trend chart data (7 days)
  const chartData = [
    { day: 'Sen', label: 'Senin', rev: 850000 },
    { day: 'Sel', label: 'Selasa', rev: 920000 },
    { day: 'Rab', label: 'Rabu', rev: 780000 },
    { day: 'Kam', label: 'Kamis', rev: 1100000 },
    { day: 'Jum', label: 'Jumat', rev: 1450000 },
    { day: 'Sab', label: 'Sabtu', rev: 1800000 },
    { day: 'Min', label: 'Minggu', rev: 1250000 },
  ];
  const maxRev = 2000000;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h2 className="font-serif-header text-3xl md:text-4xl font-bold text-[#201b14] tracking-tight">
            Dashboard Overview
          </h2>
          <p className="text-sm text-[#554339] mt-1">
            Ringkasan performa toko dan aktivitas penjualan hari ini.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#554339] bg-[#f8ece1] border border-[#dbc1b5]/60 px-3.5 py-1.5 rounded-full shadow-2xs self-start sm:self-auto">
          <span className="w-2 h-2 rounded-full bg-[#059669] animate-pulse" />
          {getIndonesianFullDate()}
        </div>
      </div>

      {/* Bento Grid: 4 Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Pendapatan */}
        <div className="bg-white p-5 rounded-2xl shadow-xs border border-[#dbc1b5]/40 flex flex-col justify-between relative overflow-hidden group hover:border-[#964407]/40 transition-all">
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-[#ffdbca] text-[#964407]">
                <Receipt className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-[#554339]">Total Penjualan Hari Ini</span>
            </div>
          </div>
          <div className="my-2">
            <h3 className="font-price text-2xl lg:text-3xl font-extrabold text-[#201b14] tracking-tight">
              {formatCurrency(todayRevenue)}
            </h3>
          </div>
          <div className="pt-2.5 border-t border-[#dbc1b5]/30 flex items-center text-xs font-semibold text-[#059669]">
            <TrendingUp className="w-3.5 h-3.5 mr-1" />
            <span>+12.5% vs kemarin</span>
          </div>
        </div>

        {/* KPI 2: Transaksi */}
        <div className="bg-white p-5 rounded-2xl shadow-xs border border-[#dbc1b5]/40 flex flex-col justify-between relative overflow-hidden group hover:border-[#964407]/40 transition-all">
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-[#e9ded6] text-[#69615b]">
                <Receipt className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-[#554339]">Total Transaksi</span>
            </div>
          </div>
          <div className="my-2">
            <h3 className="font-price text-2xl lg:text-3xl font-extrabold text-[#201b14]">
              {formatNumber(todayTransactionsCount)}
            </h3>
          </div>
          <div className="pt-2.5 border-t border-[#dbc1b5]/30 flex items-center text-xs font-semibold text-[#554339]">
            <span>Hari ini</span>
          </div>
        </div>

        {/* KPI 3: Produk Terjual */}
        <div className="bg-white p-5 rounded-2xl shadow-xs border border-[#dbc1b5]/40 flex flex-col justify-between relative overflow-hidden group hover:border-[#964407]/40 transition-all">
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-[#ffdbca] text-[#964407]">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-[#554339]">Produk Terjual</span>
            </div>
          </div>
          <div className="my-2">
            <h3 className="font-price text-2xl lg:text-3xl font-extrabold text-[#201b14]">
              {formatNumber(todayItemsSold)}
            </h3>
          </div>
          <div className="pt-2.5 border-t border-[#dbc1b5]/30 flex items-center text-xs font-semibold text-[#059669]">
            <TrendingUp className="w-3.5 h-3.5 mr-1" />
            <span>+5.0% vs kemarin</span>
          </div>
        </div>

        {/* KPI 4: Stok Menipis */}
        <div
          onClick={() => setActiveTab('stok')}
          className="bg-white p-5 rounded-2xl shadow-xs border border-[#ffdad6] flex flex-col justify-between relative overflow-hidden cursor-pointer hover:bg-[#fff8f4] hover:border-[#ba1a1a]/40 transition-all group"
        >
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-[#ffdad6] text-[#ba1a1a]">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-[#ba1a1a]">Stok Menipis</span>
            </div>
          </div>
          <div className="my-2">
            <h3 className="font-price text-2xl lg:text-3xl font-extrabold text-[#ba1a1a]">
              {lowStockProducts.length}
            </h3>
          </div>
          <div className="pt-2.5 border-t border-[#ffdad6] flex items-center justify-between text-xs font-bold text-[#ba1a1a]">
            <span>Lihat Detail</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </div>

      {/* Middle Section: Chart & Top Selling Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart (2 Cols) */}
        <div className="lg:col-span-2 bg-white border border-[#dbc1b5]/40 rounded-2xl shadow-xs p-5 md:p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-serif-header text-xl font-bold text-[#201b14]">
                Tren Penjualan (7 Hari Terakhir)
              </h3>
              <p className="text-xs text-[#554339]">Statistik omzet harian dalam sepekan</p>
            </div>
            <button
              onClick={() => setActiveTab('laporan')}
              className="text-xs font-semibold text-[#964407] hover:underline flex items-center gap-1"
            >
              <span>Laporan Lengkap</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Simulated Clean SVG Line/Area Chart */}
          <div className="flex-1 w-full min-h-[220px] flex flex-col justify-end">
            <div className="relative h-48 w-full flex items-end justify-between px-3 pt-6 pb-2 gap-2">
              {/* Grid Lines */}
              <div className="absolute inset-x-0 top-0 border-b border-dashed border-[#dbc1b5]/30 text-[10px] text-[#887368] pl-1">
                Rp 2.0M
              </div>
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-b border-dashed border-[#dbc1b5]/30 text-[10px] text-[#887368] pl-1">
                Rp 1.0M
              </div>
              <div className="absolute inset-x-0 bottom-6 border-b border-[#dbc1b5]/50 text-[10px] text-[#887368] pl-1">
                Rp 0
              </div>

              {/* Bar Columns */}
              {chartData.map((item, idx) => {
                const heightPercent = Math.min(100, Math.max(15, (item.rev / maxRev) * 100));
                const isHighlight = item.day === 'Sab' || item.day === 'Kam';
                return (
                  <div
                    key={idx}
                    className="flex-1 flex flex-col items-center h-full justify-end group z-10"
                  >
                    <div className="relative w-full max-w-[42px] flex flex-col items-center">
                      {/* Tooltip on hover */}
                      <div className="opacity-0 group-hover:opacity-100 absolute -top-9 bg-[#362f28] text-white text-[11px] font-semibold py-1 px-2 rounded-md shadow-md pointer-events-none transition-all duration-150 whitespace-nowrap z-20">
                        {formatCurrency(item.rev)}
                      </div>
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={`w-full rounded-t-lg transition-all duration-300 ${
                          isHighlight
                            ? 'bg-[#964407] group-hover:bg-[#773300]'
                            : 'bg-[#ffdbca] group-hover:bg-[#b65c21]'
                        }`}
                      />
                    </div>
                    <span
                      className={`text-xs mt-2 font-medium ${
                        isHighlight ? 'text-[#964407] font-bold' : 'text-[#645d57]'
                      }`}
                    >
                      {item.day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Top Selling Products (1 Col) */}
        <div className="bg-white border border-[#dbc1b5]/40 rounded-2xl shadow-xs p-5 md:p-6 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-serif-header text-xl font-bold text-[#201b14]">
              Produk Terlaris
            </h3>
            <button
              onClick={() => setActiveTab('produk')}
              className="text-xs font-semibold text-[#964407] hover:underline"
            >
              Lihat Semua
            </button>
          </div>

          <div className="flex-1 space-y-3">
            {topProducts.map((prod, index) => (
              <div
                key={prod.id}
                className="flex items-center gap-3 p-2 rounded-xl hover:bg-[#f8ece1]/70 transition-colors"
              >
                <div className="w-12 h-12 rounded-lg bg-[#f8ece1] border border-[#dbc1b5]/40 overflow-hidden shrink-0 flex items-center justify-center">
                  <img
                    src={prod.imageUrl}
                    alt={prod.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-[#201b14] truncate">
                    {prod.name}
                  </h4>
                  <p className="text-[11px] text-[#645d57]">
                    Terjual: <span className="font-semibold text-[#201b14]">{prod.sold}</span>
                  </p>
                </div>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    index === 0
                      ? 'bg-[#ffdad8] text-[#792e2f]'
                      : 'bg-[#f8ece1] text-[#645d57]'
                  }`}
                >
                  #{index + 1}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Section: Recent Transactions & Low Stock Alert */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions Table */}
        <div className="bg-white border border-[#dbc1b5]/40 rounded-2xl shadow-xs p-5 md:p-6 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-serif-header text-xl font-bold text-[#201b14]">
              Transaksi Terbaru
            </h3>
            <button
              onClick={() => setActiveTab('riwayat')}
              className="text-xs font-semibold text-[#964407] bg-[#ffdbca] hover:bg-[#ffb68e] px-3 py-1 rounded-full transition-colors"
            >
              Semua Riwayat
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#dbc1b5]/40 text-xs font-semibold text-[#645d57]">
                  <th className="pb-2.5">ID</th>
                  <th className="pb-2.5">Waktu</th>
                  <th className="pb-2.5">Metode</th>
                  <th className="pb-2.5 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="text-xs divide-y divide-[#dbc1b5]/20">
                {transactions.slice(0, 4).map((trx) => (
                  <tr
                    key={trx.id}
                    onClick={() => setActiveTab('riwayat')}
                    className="hover:bg-[#f8ece1]/50 transition-colors cursor-pointer"
                  >
                    <td className="py-3 font-semibold text-[#964407]">{trx.trxNumber}</td>
                    <td className="py-3 text-[#645d57]">{trx.time}</td>
                    <td className="py-3">
                      <span className="uppercase text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#f8ece1] text-[#554339]">
                        {trx.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3 text-right font-price font-bold text-[#201b14]">
                      {formatCurrency(trx.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Warning Table */}
        <div className="bg-white border border-[#ffdad6] rounded-2xl shadow-xs p-5 md:p-6 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2 text-[#ba1a1a]">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="font-serif-header text-xl font-bold text-[#201b14]">
                Peringatan Stok
              </h3>
            </div>
            <button
              onClick={() => setActiveTab('stok')}
              className="text-xs font-semibold text-[#554339] hover:text-[#964407] transition-colors"
            >
              Kelola Stok
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#dbc1b5]/40 text-xs font-semibold text-[#645d57]">
                  <th className="pb-2.5">Produk</th>
                  <th className="pb-2.5">SKU</th>
                  <th className="pb-2.5 text-right">Sisa Stok</th>
                </tr>
              </thead>
              <tbody className="text-xs divide-y divide-[#dbc1b5]/20">
                {lowStockProducts.slice(0, 4).map((p) => (
                  <tr key={p.id} className="hover:bg-[#ffdad6]/20 transition-colors">
                    <td className="py-3 font-semibold text-[#201b14]">{p.name}</td>
                    <td className="py-3 text-[#645d57]">{p.sku}</td>
                    <td className="py-3 text-right">
                      <span
                        className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${
                          p.stock === 0
                            ? 'bg-[#ffdad6] text-[#ba1a1a]'
                            : 'bg-[#fef3c7] text-[#d97706]'
                        }`}
                      >
                        {p.stock} {p.unit || 'pcs'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
