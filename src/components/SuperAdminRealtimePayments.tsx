import React, { useState, useEffect, useMemo } from 'react';
import {
  CreditCard,
  QrCode,
  Banknote,
  Search,
  Filter,
  RefreshCw,
  Printer,
  FileText,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Download,
  Calendar,
  ExternalLink,
} from 'lucide-react';
import { Transaction } from '../types';
import { formatCurrency, formatNumber, getIndonesianDate, getIndonesianTime } from '../utils/format';
import { api } from '../services/api';
import { globalPrinter } from '../services/printerService';

interface SuperAdminRealtimePaymentsProps {
  initialTransactions?: Transaction[];
  onOpenReceipt?: (trx: Transaction) => void;
}

export const SuperAdminRealtimePayments: React.FC<SuperAdminRealtimePaymentsProps> = ({
  initialTransactions = [],
  onOpenReceipt,
}) => {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<string>(getIndonesianTime());
  const [searchQuery, setSearchQuery] = useState('');
  const [methodFilter, setMethodFilter] = useState<'all' | 'qris' | 'tunai' | 'debit'>('all');
  const [timeFilter, setTimeFilter] = useState<'today' | 'all'>('all');
  const [printSuccessId, setPrintSuccessId] = useState<string | null>(null);

  // Sync initialTransactions when prop changes
  useEffect(() => {
    if (initialTransactions.length > 0) {
      setTransactions((prev) => {
        // Merge without losing latest
        const ids = new Set(initialTransactions.map((t) => t.id));
        const custom = prev.filter((t) => !ids.has(t.id));
        return [...initialTransactions, ...custom];
      });
    }
  }, [initialTransactions]);

  // Real-time live polling every 3.5 seconds
  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const latest = await api.getTransactions();
        if (latest && Array.isArray(latest) && latest.length > 0) {
          setTransactions(latest);
          setLastRefreshedAt(getIndonesianTime());
        }
      } catch (e) {
        // Silently continue polling
      }
    };

    const interval = setInterval(fetchLatest, 3500);
    return () => clearInterval(interval);
  }, []);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      const latest = await api.getTransactions();
      if (latest && Array.isArray(latest)) {
        setTransactions(latest);
      }
      setLastRefreshedAt(getIndonesianTime());
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    const today = getIndonesianDate();
    return transactions.filter((trx) => {
      // Method filter
      if (methodFilter !== 'all' && trx.paymentMethod !== methodFilter) {
        return false;
      }
      // Time filter
      if (timeFilter === 'today' && trx.date !== today) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTrx = trx.trxNumber.toLowerCase().includes(q);
        const matchCustomer = (trx.customerName || '').toLowerCase().includes(q);
        const matchCashier = (trx.cashierName || '').toLowerCase().includes(q);
        const matchItems = trx.items.some((i) => i.productName.toLowerCase().includes(q));
        if (!matchTrx && !matchCustomer && !matchCashier && !matchItems) {
          return false;
        }
      }
      return true;
    });
  }, [transactions, methodFilter, timeFilter, searchQuery]);

  // Real-time Metric Totals
  const metrics = useMemo(() => {
    let totalRevenue = 0;
    let qrisRevenue = 0;
    let qrisCount = 0;
    let cashRevenue = 0;
    let cashCount = 0;

    transactions.forEach((t) => {
      if (t.status === 'sukses') {
        totalRevenue += t.total;
        if (t.paymentMethod === 'qris') {
          qrisRevenue += t.total;
          qrisCount += 1;
        } else if (t.paymentMethod === 'tunai') {
          cashRevenue += t.total;
          cashCount += 1;
        }
      }
    });

    const avgTicket = transactions.length > 0 ? Math.round(totalRevenue / transactions.length) : 0;

    return {
      totalRevenue,
      qrisRevenue,
      qrisCount,
      cashRevenue,
      cashCount,
      avgTicket,
      totalCount: transactions.length,
    };
  }, [transactions]);

  // Direct print to Mini Thermal Printer
  const handlePrintMiniThermal = async (trx: Transaction) => {
    const receiptText = `
================================
         ANUGERAH STORE         
      NMID: ID1025371471182     
          TERMINAL: A01         
--------------------------------
No. Trx : ${trx.trxNumber}
Tanggal : ${trx.date} ${trx.time}
Kasir   : ${trx.cashierName}
Metode  : ${trx.paymentMethod.toUpperCase()} ${trx.paymentMethod === 'qris' ? '(ASPI DINAMIS)' : ''}
--------------------------------
${trx.items.map((it) => `${it.productName.slice(0, 18).padEnd(18)} x${it.quantity} ${formatCurrency(it.total)}`).join('\n')}
--------------------------------
Subtotal: ${formatCurrency(trx.subtotal)}
Diskon  : ${formatCurrency(trx.discount || 0)}
Total   : ${formatCurrency(trx.total)}
${trx.paymentMethod === 'tunai' ? `Bayar   : ${formatCurrency(trx.cashAmountPaid || trx.total)}\nKembali : ${formatCurrency(trx.cashChange || 0)}` : 'Status  : LUNAS OTOMATIS'}
================================
  TERIMA KASIH ATAS KUNJUNGANNYA 
`;
    await globalPrinter.printReceipt(receiptText);
    setPrintSuccessId(trx.id);
    setTimeout(() => setPrintSuccessId(null), 2500);
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['No Trx', 'Tanggal', 'Waktu', 'Kasir', 'Metode', 'Total', 'Status'];
    const rows = filteredTransactions.map((t) => [
      t.trxNumber,
      t.date,
      t.time,
      t.cashierName,
      t.paymentMethod.toUpperCase(),
      t.total,
      t.status,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `riwayat-pembayaran-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Live Stream Header Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-[#1c1511] to-[#261c16] text-white border border-emerald-500/30 shadow-md">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center">
            <span className="w-3.5 h-3.5 rounded-full bg-emerald-400 animate-ping absolute" />
            <span className="w-3 h-3 rounded-full bg-emerald-500 relative" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-extrabold tracking-tight">
                Live Real-Time Payment Feed
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500 text-black">
                Aktif
              </span>
            </div>
            <p className="text-xs text-stone-300">
              Memantau transaksi QRIS Anugerah Store &amp; Tunai masuk secara real-time • Sinkronisasi terakhir: {lastRefreshedAt}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleManualRefresh}
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 border border-white/10"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Segarkan</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Real-time Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Total Omzet */}
        <div className="p-4 bg-white dark:bg-[#1e1713] rounded-2xl border border-[#dbc1b5]/50 dark:border-[#3d2f25] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-[#887368] dark:text-[#a89487] uppercase tracking-wider block">
              Total Omzet Real-Time
            </span>
            <span className="text-xl font-price font-extrabold text-[#201b14] dark:text-[#f7ece4] mt-0.5 block">
              {formatCurrency(metrics.totalRevenue)}
            </span>
            <span className="text-[10px] text-emerald-600 font-bold">
              {metrics.totalCount} Transaksi Sukses
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center font-bold">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* QRIS Dinamis */}
        <div className="p-4 bg-white dark:bg-[#1e1713] rounded-2xl border border-red-200 dark:border-red-900/40 shadow-xs flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1">
              <span className="text-[11px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wider block">
                QRIS Dinamis ASPI
              </span>
            </div>
            <span className="text-xl font-price font-extrabold text-red-700 dark:text-red-300 mt-0.5 block">
              {formatCurrency(metrics.qrisRevenue)}
            </span>
            <span className="text-[10px] text-red-500 font-medium">
              {metrics.qrisCount} Trx • NMID ID1025371471182
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/50 text-red-600 flex items-center justify-center font-bold">
            <QrCode className="w-5 h-5" />
          </div>
        </div>

        {/* Pembayaran Tunai */}
        <div className="p-4 bg-white dark:bg-[#1e1713] rounded-2xl border border-emerald-200 dark:border-emerald-900/40 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">
              Pembayaran Tunai (Cash)
            </span>
            <span className="text-xl font-price font-extrabold text-emerald-800 dark:text-emerald-300 mt-0.5 block">
              {formatCurrency(metrics.cashRevenue)}
            </span>
            <span className="text-[10px] text-emerald-600 font-medium">
              {metrics.cashCount} Trx Tunai Kasir
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 flex items-center justify-center font-bold">
            <Banknote className="w-5 h-5" />
          </div>
        </div>

        {/* Rata-Rata Transaksi (AOV) */}
        <div className="p-4 bg-white dark:bg-[#1e1713] rounded-2xl border border-[#dbc1b5]/50 dark:border-[#3d2f25] shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-[#887368] dark:text-[#a89487] uppercase tracking-wider block">
              Rata-Rata Transaksi (AOV)
            </span>
            <span className="text-xl font-price font-extrabold text-[#964407] dark:text-[#ffbe99] mt-0.5 block">
              {formatCurrency(metrics.avgTicket)}
            </span>
            <span className="text-[10px] text-[#645d57] dark:text-[#a89487]">
              Nilai keranjang rata-rata
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#ffbe99]/30 text-[#964407] flex items-center justify-center font-bold">
            <CreditCard className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-[#1e1713] p-4 rounded-2xl border border-[#dbc1b5]/50 dark:border-[#3d2f25] shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#887368]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari No. Trx, kasir, atau menu..."
            className="w-full pl-9.5 pr-4 py-2 bg-[#fff8f4] dark:bg-[#140e0b] border border-[#dbc1b5] dark:border-[#423126] rounded-xl text-xs text-[#201b14] dark:text-[#f7ece4] placeholder-[#887368] focus:outline-none focus:border-[#964407]"
          />
        </div>

        {/* Method filter pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <button
            type="button"
            onClick={() => setMethodFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              methodFilter === 'all'
                ? 'bg-[#964407] text-white shadow-2xs'
                : 'bg-[#fff8f4] dark:bg-[#231a15] text-[#554339] dark:text-[#cbb8ad] hover:bg-[#ece0d6]'
            }`}
          >
            Semua Metode ({transactions.length})
          </button>

          <button
            type="button"
            onClick={() => setMethodFilter('qris')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              methodFilter === 'qris'
                ? 'bg-red-600 text-white shadow-2xs'
                : 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 hover:bg-red-100'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>QRIS Dinamis ({metrics.qrisCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setMethodFilter('tunai')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              methodFilter === 'tunai'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100'
            }`}
          >
            <Banknote className="w-3.5 h-3.5" />
            <span>Tunai ({metrics.cashCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setTimeFilter(timeFilter === 'today' ? 'all' : 'today')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              timeFilter === 'today'
                ? 'bg-[#201b14] text-white shadow-2xs'
                : 'bg-stone-100 dark:bg-[#231a15] text-[#554339] dark:text-[#cbb8ad]'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>{timeFilter === 'today' ? 'Hanya Hari Ini' : 'Semua Waktu'}</span>
          </button>
        </div>
      </div>

      {/* Transaction Feed List */}
      <div className="space-y-3">
        {filteredTransactions.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-[#1e1713] rounded-2xl border border-[#dbc1b5]/50 dark:border-[#3d2f25] space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-stone-100 dark:bg-stone-800 text-stone-400 mx-auto flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-[#554339] dark:text-[#cbb8ad]">
              Belum ada riwayat pembayaran yang cocok dengan filter
            </p>
            <p className="text-xs text-[#887368]">
              Setiap kali pembayaran Kasir selesai dicatat, data akan langsung muncul di sini secara otomatis.
            </p>
          </div>
        ) : (
          filteredTransactions.map((trx) => {
            const isQris = trx.paymentMethod === 'qris';
            const isTunai = trx.paymentMethod === 'tunai';

            return (
              <div
                key={trx.id}
                className="bg-white dark:bg-[#1e1713] rounded-2xl border border-[#dbc1b5]/50 dark:border-[#3d2f25] p-4 sm:p-5 shadow-xs hover:border-[#964407] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                {/* Left Col: ID & Payment Info */}
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-extrabold text-[#201b14] dark:text-[#f7ece4]">
                      {trx.trxNumber}
                    </span>

                    {/* Method Badge */}
                    {isQris ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 flex items-center gap-1">
                        <QrCode className="w-3 h-3" />
                        <span>QRIS Dinamis • Anugerah Store</span>
                      </span>
                    ) : isTunai ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                        <Banknote className="w-3 h-3" />
                        <span>Tunai (Cash)</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 flex items-center gap-1">
                        <CreditCard className="w-3 h-3" />
                        <span>Debit / EDC</span>
                      </span>
                    )}

                    {/* Status Badge */}
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>LUNAS</span>
                    </span>

                    {/* Timestamp */}
                    <span className="text-[11px] text-[#887368] dark:text-[#a89487]">
                      {trx.date} • {trx.time}
                    </span>
                  </div>

                  {/* Items summary */}
                  <div className="text-xs text-[#554339] dark:text-[#cbb8ad]">
                    <span className="font-bold">
                      {trx.items.length} Menu ({trx.items.reduce((s, it) => s + it.quantity, 0)} item):
                    </span>{' '}
                    <span className="text-[#887368] dark:text-[#a89487]">
                      {trx.items.map((i) => `${i.productName} (x${i.quantity})`).join(', ')}
                    </span>
                  </div>

                  {/* Cashier & Details */}
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#887368] dark:text-[#a89487]">
                    <span>Kasir: <b>{trx.cashierName}</b></span>
                    {trx.customerName && <span>Pelanggan: <b>{trx.customerName}</b></span>}
                    {isQris && (
                      <span className="font-mono text-[10px] text-red-600 dark:text-red-400">
                        NMID: ID1025371471182 (A01)
                      </span>
                    )}
                    {isTunai && trx.cashAmountPaid && (
                      <span>
                        Diterima: <b>{formatCurrency(trx.cashAmountPaid)}</b> • Kembali: <b>{formatCurrency(trx.cashChange || 0)}</b>
                      </span>
                    )}
                  </div>
                </div>

                {/* Right Col: Amount & Actions */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-[#dbc1b5]/30">
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] text-[#887368] block uppercase font-bold">Total Lunas</span>
                    <span className="text-lg font-price font-extrabold text-[#201b14] dark:text-[#f7ece4]">
                      {formatCurrency(trx.total)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handlePrintMiniThermal(trx)}
                      className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 transition-colors cursor-pointer"
                      title="Cetak langsung ke Printer Mini Thermal Bluetooth"
                    >
                      <Printer className="w-4 h-4" />
                    </button>

                    {onOpenReceipt && (
                      <button
                        type="button"
                        onClick={() => onOpenReceipt(trx)}
                        className="px-3 py-1.5 rounded-xl bg-[#fff8f4] hover:bg-[#ece0d6] dark:bg-[#231a15] dark:hover:bg-[#2e231c] border border-[#dbc1b5] dark:border-[#423126] text-[#554339] dark:text-[#cbb8ad] text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <FileText className="w-3.5 h-3.5 text-[#964407]" />
                        <span>Struk</span>
                      </button>
                    )}
                  </div>

                  {printSuccessId === trx.id && (
                    <span className="text-[10px] text-emerald-600 font-bold">
                      Struk dikirim ke printer!
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
