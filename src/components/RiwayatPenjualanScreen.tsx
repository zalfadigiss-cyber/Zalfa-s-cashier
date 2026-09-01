import React, { useState, useMemo } from 'react';
import {
  Search,
  Calendar,
  Filter,
  Receipt,
  Printer,
  Download,
  Share2,
  X,
  CreditCard,
  QrCode,
  Banknote,
  CheckCircle2,
} from 'lucide-react';
import { StoreSettings, Transaction } from '../types';
import { formatCurrency, formatNumber } from '../utils/format';

interface RiwayatPenjualanScreenProps {
  transactions: Transaction[];
  settings: StoreSettings;
  selectedReceiptTrx?: Transaction | null;
  onCloseReceipt?: () => void;
}

export const RiwayatPenjualanScreen: React.FC<RiwayatPenjualanScreenProps> = ({
  transactions,
  settings,
  selectedReceiptTrx,
  onCloseReceipt,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [activeReceipt, setActiveReceipt] = useState<Transaction | null>(
    selectedReceiptTrx || null
  );

  // Sync if prop changes
  React.useEffect(() => {
    if (selectedReceiptTrx) {
      setActiveReceipt(selectedReceiptTrx);
    }
  }, [selectedReceiptTrx]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const matchSearch =
        t.trxNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.cashierName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchMethod =
        methodFilter === 'all' || t.paymentMethod === methodFilter;

      return matchSearch && matchMethod;
    });
  }, [transactions, searchQuery, methodFilter]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = 'No TRX,Tanggal,Waktu,Kasir,Metode,Subtotal,Pajak,Total\n';
    const rows = filteredTransactions
      .map(
        (t) =>
          `"${t.trxNumber}","${t.date}","${t.time}","${t.cashierName}","${t.paymentMethod}",${t.subtotal},${t.tax},${t.total}`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Laporan_Transaksi_KASIRKU_${Date.now()}.csv`;
    link.click();
  };

  const totalFilteredRevenue = filteredTransactions.reduce((acc, t) => acc + t.total, 0);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif-header text-3xl font-bold text-[#201b14]">
            Riwayat Penjualan
          </h2>
          <p className="text-xs md:text-sm text-[#554339] mt-0.5">
            Daftar seluruh transaksi kasir, detail pesanan, dan cetak ulang struk.
          </p>
        </div>

        <div className="flex gap-2 self-start sm:self-auto">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 bg-white border border-[#dbc1b5] hover:bg-[#f8ece1] text-[#554339] rounded-xl text-xs font-bold flex items-center gap-2 shadow-2xs transition-all active:scale-95 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Ekspor CSV</span>
          </button>
        </div>
      </div>

      {/* Filter and Summary Ribbon */}
      <div className="bg-white p-4 rounded-2xl border border-[#dbc1b5]/40 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto flex-1">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#887368]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari No. TRX (#TRX-001) atau nama kasir..."
              className="w-full pl-9.5 pr-4 py-2 bg-[#fef1e7] border border-[#dbc1b5] rounded-xl text-xs text-[#201b14] placeholder-[#887368] focus:outline-none focus:border-[#964407]"
            />
          </div>

          {/* Payment Method Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#887368]" />
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="px-3 py-2 bg-[#fef1e7] border border-[#dbc1b5] rounded-xl text-xs font-semibold text-[#201b14] focus:outline-none focus:border-[#964407]"
            >
              <option value="all">Semua Metode</option>
              <option value="tunai">Tunai / Cash</option>
              <option value="qris">QRIS</option>
              <option value="debit">Kartu Debit</option>
            </select>
          </div>
        </div>

        {/* Total Summary */}
        <div className="text-right self-end md:self-center">
          <span className="text-[11px] text-[#645d57] font-medium mr-2">
            Total {filteredTransactions.length} Transaksi:
          </span>
          <span className="font-price font-extrabold text-base text-[#964407]">
            {formatCurrency(totalFilteredRevenue)}
          </span>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl border border-[#dbc1b5]/40 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f8ece1]/70 border-b border-[#dbc1b5]/40 text-xs font-bold text-[#645d57]">
                <th className="py-3.5 px-4">No. Transaksi</th>
                <th className="py-3.5 px-4">Waktu</th>
                <th className="py-3.5 px-4">Kasir</th>
                <th className="py-3.5 px-4">Metode</th>
                <th className="py-3.5 px-4 text-center">Jumlah Item</th>
                <th className="py-3.5 px-4 text-right">Total Tagihan</th>
                <th className="py-3.5 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#dbc1b5]/20 text-xs">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#887368]">
                    Tidak ada transaksi yang ditemukan.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((trx) => {
                  const itemsCount = trx.items.reduce((s, i) => s + i.quantity, 0);

                  return (
                    <tr
                      key={trx.id}
                      className="hover:bg-[#f8ece1]/40 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-bold text-[#964407]">
                        {trx.trxNumber}
                      </td>
                      <td className="py-3.5 px-4 text-[#554339]">
                        <div>{trx.date}</div>
                        <div className="text-[10px] text-[#887368]">{trx.time} WIB</div>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-[#201b14]">
                        {trx.cashierName}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="uppercase text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#f8ece1] text-[#554339] inline-flex items-center gap-1">
                          {trx.paymentMethod === 'tunai' && <Banknote className="w-3 h-3 text-[#964407]" />}
                          {trx.paymentMethod === 'qris' && <QrCode className="w-3 h-3 text-[#964407]" />}
                          {trx.paymentMethod === 'debit' && <CreditCard className="w-3 h-3 text-[#964407]" />}
                          <span>{trx.paymentMethod}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center font-semibold text-[#201b14]">
                        {itemsCount} item
                      </td>
                      <td className="py-3.5 px-4 text-right font-price font-extrabold text-sm text-[#201b14]">
                        {formatCurrency(trx.total)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => setActiveReceipt(trx)}
                          className="px-3 py-1.5 bg-[#ffdbca] hover:bg-[#ffb68e] text-[#964407] rounded-lg text-xs font-bold flex items-center gap-1.5 mx-auto transition-colors cursor-pointer"
                        >
                          <Receipt className="w-3.5 h-3.5" />
                          <span>Lihat Struk</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* THERMAL RECEIPT SLIP MODAL */}
      {activeReceipt && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-[#dbc1b5]/60 max-h-[90vh]">
            {/* Modal Top Bar */}
            <div className="p-3.5 bg-[#fff8f4] border-b border-[#dbc1b5]/40 flex justify-between items-center">
              <span className="text-xs font-bold text-[#645d57]">Struk Pembayaran Kasir</span>
              <button
                onClick={() => {
                  setActiveReceipt(null);
                  if (onCloseReceipt) onCloseReceipt();
                }}
                className="p-1 text-[#645d57] hover:bg-[#ece0d6] rounded-full transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Printable Thermal Receipt Paper Container */}
            <div className="p-6 overflow-y-auto flex-1 bg-white font-mono text-xs text-[#201b14]" id="printable-receipt">
              {/* Store Brand Header */}
              <div className="text-center space-y-1 pb-3 border-b border-dashed border-gray-400">
                <h3 className="font-serif-header text-xl font-bold tracking-tight uppercase">
                  {settings.storeName}
                </h3>
                <p className="text-[11px] text-gray-600 font-sans">{settings.storeAddress}</p>
                <p className="text-[11px] text-gray-600 font-sans">Telp: {settings.storePhone}</p>
              </div>

              {/* Transaction Metadata */}
              <div className="py-2.5 border-b border-dashed border-gray-400 text-[11px] space-y-1">
                <div className="flex justify-between">
                  <span>No. TRX:</span>
                  <span className="font-bold">{activeReceipt.trxNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span>Waktu:</span>
                  <span>{activeReceipt.date} {activeReceipt.time}</span>
                </div>
                <div className="flex justify-between">
                  <span>Kasir:</span>
                  <span>{activeReceipt.cashierName}</span>
                </div>
              </div>

              {/* Items List */}
              <div className="py-3 border-b border-dashed border-gray-400 space-y-2">
                {activeReceipt.items.map((item, idx) => (
                  <div key={idx} className="space-y-0.5">
                    <p className="font-bold text-[11px] truncate">{item.productName}</p>
                    <div className="flex justify-between text-[11px] text-gray-600">
                      <span>
                        {item.quantity} x {formatNumber(item.price)}
                      </span>
                      <span className="font-semibold text-black">
                        {formatNumber(item.total)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals Calculation */}
              <div className="py-3 border-b border-dashed border-gray-400 space-y-1.5 text-[11px]">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(activeReceipt.subtotal)}</span>
                </div>
                {activeReceipt.discount > 0 && (
                  <div className="flex justify-between text-green-700">
                    <span>Diskon:</span>
                    <span>-{formatCurrency(activeReceipt.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>PPN ({settings.defaultTaxPercent}%):</span>
                  <span>{formatCurrency(activeReceipt.tax)}</span>
                </div>
                <div className="flex justify-between font-bold text-sm pt-1 border-t border-gray-300">
                  <span>TOTAL:</span>
                  <span>{formatCurrency(activeReceipt.total)}</span>
                </div>
              </div>

              {/* Payment Details */}
              <div className="py-2.5 border-b border-dashed border-gray-400 space-y-1 text-[11px]">
                <div className="flex justify-between uppercase">
                  <span>Metode Bayar:</span>
                  <span className="font-bold">{activeReceipt.paymentMethod}</span>
                </div>
                {activeReceipt.paymentMethod === 'tunai' && (
                  <>
                    <div className="flex justify-between">
                      <span>Uang Diterima:</span>
                      <span>{formatCurrency(activeReceipt.cashAmountPaid || activeReceipt.total)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-green-800">
                      <span>Kembalian:</span>
                      <span>{formatCurrency(activeReceipt.cashChange || 0)}</span>
                    </div>
                  </>
                )}
              </div>

              {/* Footer Note */}
              <div className="pt-4 text-center space-y-1 font-sans text-[10px] text-gray-500">
                <p>Terima kasih atas kunjungan Anda!</p>
                <p>Barang yang sudah dibeli tidak dapat ditukar atau dikembalikan.</p>
                <p className="font-mono text-[9px] pt-1">*** KASIRKU POS SYSTEM ***</p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-[#fff8f4] border-t border-[#dbc1b5]/40 flex gap-2">
              <button
                onClick={handlePrint}
                className="flex-1 py-2.5 bg-[#964407] hover:bg-[#773300] text-white rounded-xl font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Struk</span>
              </button>
              <button
                onClick={() => {
                  setActiveReceipt(null);
                  if (onCloseReceipt) onCloseReceipt();
                }}
                className="px-4 py-2.5 bg-white border border-[#dbc1b5] text-[#554339] hover:bg-[#f8ece1] rounded-xl font-bold text-xs transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
