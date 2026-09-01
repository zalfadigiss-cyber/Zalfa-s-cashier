import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  FileSpreadsheet,
  PieChart,
  ShoppingBag,
  CreditCard,
  Layers,
  ArrowUpRight,
} from 'lucide-react';
import { Category, Product, Transaction } from '../types';
import { formatCurrency, formatNumber } from '../utils/format';

interface LaporanScreenProps {
  products: Product[];
  categories: Category[];
  transactions: Transaction[];
}

export const LaporanScreen: React.FC<LaporanScreenProps> = ({
  products,
  categories,
  transactions,
}) => {
  const [period, setPeriod] = useState<'today' | '7days' | 'month' | 'year'>('7days');

  // Aggregated figures
  const totalRevenue = transactions.reduce((acc, t) => acc + t.total, 0);
  const totalTrx = transactions.length;
  const totalItemsSold = transactions.reduce(
    (acc, t) => acc + t.items.reduce((sum, i) => sum + i.quantity, 0),
    0
  );
  const avgBasketSize = totalTrx > 0 ? Math.round(totalRevenue / totalTrx) : 0;

  // Payment Method Breakdown
  const methodCounts = {
    tunai: transactions.filter((t) => t.paymentMethod === 'tunai').length,
    qris: transactions.filter((t) => t.paymentMethod === 'qris').length,
    debit: transactions.filter((t) => t.paymentMethod === 'debit').length,
  };

  // Product sales map
  const productStats = new Map<string, { qty: number; revenue: number; name: string; sku: string }>();
  transactions.forEach((t) => {
    t.items.forEach((item) => {
      const existing = productStats.get(item.productId) || {
        qty: 0,
        revenue: 0,
        name: item.productName,
        sku: item.sku,
      };
      existing.qty += item.quantity;
      existing.revenue += item.total;
      productStats.set(item.productId, existing);
    });
  });

  const sortedTopProducts = Array.from(productStats.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const handleExport = () => {
    const reportText = `LAPORAN PENJUALAN KASIRKU\nPeriode: ${period.toUpperCase()}\n\nTotal Pendapatan: ${formatCurrency(
      totalRevenue
    )}\nTotal Transaksi: ${totalTrx}\nTotal Produk Terjual: ${totalItemsSold}\nRata-rata per Transaksi: ${formatCurrency(
      avgBasketSize
    )}\n\nMetode Pembayaran:\n- Tunai: ${methodCounts.tunai}\n- QRIS: ${methodCounts.qris}\n- Kartu Debit: ${methodCounts.debit}`;

    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Ringkasan_Laporan_KASIRKU_${Date.now()}.txt`;
    link.click();
  };

  const trendData = [
    { day: 'Senin', rev: 850000, trx: 24 },
    { day: 'Selasa', rev: 920000, trx: 31 },
    { day: 'Rabu', rev: 780000, trx: 22 },
    { day: 'Kamis', rev: 1100000, trx: 45 },
    { day: 'Jumat', rev: 1450000, trx: 56 },
    { day: 'Sabtu', rev: 1800000, trx: 72 },
    { day: 'Minggu', rev: 1250000, trx: 48 },
  ];
  const maxTrend = 2000000;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif-header text-3xl font-bold text-[#201b14]">
            Laporan & Analisis Penjualan
          </h2>
          <p className="text-xs md:text-sm text-[#554339] mt-0.5">
            Analisis omzet, produk terlaris, dan distribusi metode pembayaran.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Period Selector */}
          <div className="bg-white border border-[#dbc1b5] p-1 rounded-xl flex gap-1 shadow-2xs">
            <button
              onClick={() => setPeriod('today')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                period === 'today'
                  ? 'bg-[#964407] text-white'
                  : 'text-[#554339] hover:bg-[#f8ece1]'
              }`}
            >
              Hari Ini
            </button>
            <button
              onClick={() => setPeriod('7days')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                period === '7days'
                  ? 'bg-[#964407] text-white'
                  : 'text-[#554339] hover:bg-[#f8ece1]'
              }`}
            >
              7 Hari
            </button>
            <button
              onClick={() => setPeriod('month')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                period === 'month'
                  ? 'bg-[#964407] text-white'
                  : 'text-[#554339] hover:bg-[#f8ece1]'
              }`}
            >
              Bulan Ini
            </button>
          </div>

          <button
            onClick={handleExport}
            className="px-3.5 py-2 bg-[#964407] hover:bg-[#773300] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Ekspor</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Omzet */}
        <div className="bg-white p-5 rounded-2xl border border-[#dbc1b5]/40 shadow-xs">
          <span className="text-xs font-semibold text-[#554339]">Total Omzet Penjualan</span>
          <h3 className="font-price text-2xl lg:text-3xl font-extrabold text-[#201b14] my-1">
            {formatCurrency(totalRevenue)}
          </h3>
          <div className="flex items-center text-xs font-bold text-[#059669] mt-2">
            <TrendingUp className="w-3.5 h-3.5 mr-1" />
            <span>+14.8% dari periode sebelumnya</span>
          </div>
        </div>

        {/* Total Transaksi */}
        <div className="bg-white p-5 rounded-2xl border border-[#dbc1b5]/40 shadow-xs">
          <span className="text-xs font-semibold text-[#554339]">Jumlah Transaksi</span>
          <h3 className="font-price text-2xl lg:text-3xl font-extrabold text-[#201b14] my-1">
            {formatNumber(totalTrx)}
          </h3>
          <span className="text-xs text-[#645d57]">Struk berhasil dicetak</span>
        </div>

        {/* Total Produk Terjual */}
        <div className="bg-white p-5 rounded-2xl border border-[#dbc1b5]/40 shadow-xs">
          <span className="text-xs font-semibold text-[#554339]">Total Menu / Item Terjual</span>
          <h3 className="font-price text-2xl lg:text-3xl font-extrabold text-[#201b14] my-1">
            {formatNumber(totalItemsSold)}
          </h3>
          <span className="text-xs text-[#645d57]">Item terdistribusi</span>
        </div>

        {/* Rata-rata per Transaksi */}
        <div className="bg-white p-5 rounded-2xl border border-[#dbc1b5]/40 shadow-xs">
          <span className="text-xs font-semibold text-[#554339]">Rata-rata per Transaksi</span>
          <h3 className="font-price text-2xl lg:text-3xl font-extrabold text-[#964407] my-1">
            {formatCurrency(avgBasketSize)}
          </h3>
          <span className="text-xs text-[#645d57]">Basket size rata-rata</span>
        </div>
      </div>

      {/* Sales Trend Chart & Payment Methods Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Chart */}
        <div className="lg:col-span-2 bg-white border border-[#dbc1b5]/40 rounded-2xl shadow-xs p-6 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-serif-header text-xl font-bold text-[#201b14]">
                Grafik Omzet Harian
              </h3>
              <p className="text-xs text-[#554339]">Pergerakan omzet toko dalam periode terpilih</p>
            </div>
          </div>

          <div className="h-60 w-full flex items-end justify-between px-3 pt-6 pb-2 gap-2 relative">
            <div className="absolute inset-x-0 top-0 border-b border-dashed border-[#dbc1b5]/30 text-[10px] text-[#887368]">
              Rp 2.000.000
            </div>
            <div className="absolute inset-x-0 top-1/2 border-b border-dashed border-[#dbc1b5]/30 text-[10px] text-[#887368]">
              Rp 1.000.000
            </div>
            <div className="absolute inset-x-0 bottom-6 border-b border-[#dbc1b5]/50 text-[10px] text-[#887368]">
              Rp 0
            </div>

            {trendData.map((d, i) => {
              const heightPct = (d.rev / maxTrend) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center justify-end h-full z-10 group">
                  <div className="opacity-0 group-hover:opacity-100 absolute -top-4 bg-[#362f28] text-white text-[10px] py-1 px-2 rounded font-semibold pointer-events-none transition-opacity whitespace-nowrap">
                    {formatCurrency(d.rev)} ({d.trx} trx)
                  </div>
                  <div
                    style={{ height: `${heightPct}%` }}
                    className="w-full max-w-[36px] bg-[#964407] group-hover:bg-[#b65c21] rounded-t-lg transition-all"
                  />
                  <span className="text-[11px] font-semibold text-[#645d57] mt-2 truncate w-full text-center">
                    {d.day.slice(0, 3)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Payment Methods Breakdown */}
        <div className="bg-white border border-[#dbc1b5]/40 rounded-2xl shadow-xs p-6 flex flex-col justify-between">
          <div>
            <h3 className="font-serif-header text-xl font-bold text-[#201b14] mb-1">
              Metode Pembayaran
            </h3>
            <p className="text-xs text-[#554339] mb-4">Distribusi preferensi pembayaran pelanggan</p>
          </div>

          <div className="space-y-4 my-auto">
            {/* Tunai */}
            <div>
              <div className="flex justify-between text-xs font-bold text-[#201b14] mb-1">
                <span>Tunai / Cash</span>
                <span>{methodCounts.tunai} Transaksi</span>
              </div>
              <div className="w-full h-2.5 bg-[#f8ece1] rounded-full overflow-hidden">
                <div
                  style={{
                    width: `${totalTrx > 0 ? (methodCounts.tunai / totalTrx) * 100 : 0}%`,
                  }}
                  className="h-full bg-[#964407] rounded-full"
                />
              </div>
            </div>

            {/* QRIS */}
            <div>
              <div className="flex justify-between text-xs font-bold text-[#201b14] mb-1">
                <span>QRIS (E-Wallet & Mobile Banking)</span>
                <span>{methodCounts.qris} Transaksi</span>
              </div>
              <div className="w-full h-2.5 bg-[#f8ece1] rounded-full overflow-hidden">
                <div
                  style={{
                    width: `${totalTrx > 0 ? (methodCounts.qris / totalTrx) * 100 : 0}%`,
                  }}
                  className="h-full bg-[#b65c21] rounded-full"
                />
              </div>
            </div>

            {/* Debit */}
            <div>
              <div className="flex justify-between text-xs font-bold text-[#201b14] mb-1">
                <span>Kartu Debit / EDC</span>
                <span>{methodCounts.debit} Transaksi</span>
              </div>
              <div className="w-full h-2.5 bg-[#f8ece1] rounded-full overflow-hidden">
                <div
                  style={{
                    width: `${totalTrx > 0 ? (methodCounts.debit / totalTrx) * 100 : 0}%`,
                  }}
                  className="h-full bg-[#645d57] rounded-full"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#dbc1b5]/30 text-center text-xs text-[#645d57]">
            Rata-rata 60% transaksi menggunakan non-tunai (QRIS & EDC).
          </div>
        </div>
      </div>

      {/* Top Ranking Products Table */}
      <div className="bg-white rounded-2xl border border-[#dbc1b5]/40 shadow-xs p-6">
        <h3 className="font-serif-header text-xl font-bold text-[#201b14] mb-4">
          Kontribusi Pendapatan per Produk Terlaris
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f8ece1]/70 border-b border-[#dbc1b5]/40 text-xs font-bold text-[#645d57]">
                <th className="py-3 px-4">Peringkat</th>
                <th className="py-3 px-4">Nama Produk</th>
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4 text-center">Unit Terjual</th>
                <th className="py-3 px-4 text-right">Total Nilai Penjualan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#dbc1b5]/20 text-xs">
              {sortedTopProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-[#887368]">
                    Belum ada data penjualan tercatat.
                  </td>
                </tr>
              ) : (
                sortedTopProducts.map((p, idx) => (
                  <tr key={idx} className="hover:bg-[#f8ece1]/40">
                    <td className="py-3 px-4">
                      <span className="w-6 h-6 rounded-full bg-[#ffdbca] text-[#964407] font-bold text-xs inline-flex items-center justify-center">
                        {idx + 1}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-[#201b14]">{p.name}</td>
                    <td className="py-3 px-4 text-[#887368] font-mono">{p.sku}</td>
                    <td className="py-3 px-4 text-center font-semibold text-[#201b14]">
                      {p.qty} unit
                    </td>
                    <td className="py-3 px-4 text-right font-price font-extrabold text-sm text-[#964407]">
                      {formatCurrency(p.revenue)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
