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
  AlertTriangle,
  Ban,
  RotateCcw,
  Check,
} from 'lucide-react';
import { StoreSettings, Transaction } from '../types';
import { formatCurrency, formatNumber, getIndonesianDate, getIndonesianTime } from '../utils/format';

interface RiwayatPenjualanScreenProps {
  transactions: Transaction[];
  settings: StoreSettings;
  selectedReceiptTrx?: Transaction | null;
  onCloseReceipt?: () => void;
  onVoidTransaction?: (trxId: string, reason: string) => void;
}

export const RiwayatPenjualanScreen: React.FC<RiwayatPenjualanScreenProps> = ({
  transactions,
  settings,
  selectedReceiptTrx,
  onCloseReceipt,
  onVoidTransaction,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeReceipt, setActiveReceipt] = useState<Transaction | null>(
    selectedReceiptTrx || null
  );

  // Void modal state
  const [voidModalTrx, setVoidModalTrx] = useState<Transaction | null>(null);
  const [voidReason, setVoidReason] = useState<string>('Pelanggan membatalkan pesanan');
  const [paperWidth, setPaperWidth] = useState<'58mm' | '80mm'>('58mm');

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
        t.cashierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.customerName && t.customerName.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchMethod =
        methodFilter === 'all' || t.paymentMethod === methodFilter;
      const matchStatus =
        statusFilter === 'all' || t.status === statusFilter;

      return matchSearch && matchMethod && matchStatus;
    });
  }, [transactions, searchQuery, methodFilter, statusFilter]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = 'No TRX,Status,Tanggal,Waktu,Kasir,Pelanggan,Metode,Subtotal,Diskon,Pajak,Total,Catatan Void\n';
    const rows = filteredTransactions
      .map(
        (t) =>
          `"${t.trxNumber}","${t.status}","${t.date}","${t.time}","${t.cashierName}","${t.customerName || '-'}","${t.paymentMethod}",${t.subtotal},${t.discount},${t.tax},${t.total},"${t.voidReason || ''}"`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Laporan_Transaksi_KASIRKU_${Date.now()}.csv`;
    link.click();
  };

  const totalFilteredRevenue = filteredTransactions
    .filter((t) => t.status === 'sukses')
    .reduce((acc, t) => acc + t.total, 0);

  const handleConfirmVoid = () => {
    if (!voidModalTrx || !onVoidTransaction) return;
    onVoidTransaction(voidModalTrx.id, voidReason);
    setVoidModalTrx(null);
    if (activeReceipt?.id === voidModalTrx.id) {
      setActiveReceipt({
        ...activeReceipt,
        status: 'dibatalkan',
        voidReason,
        voidedAt: `${getIndonesianDate()} ${getIndonesianTime()}`,
        voidedBy: settings.userName,
      });
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif-header text-3xl font-bold text-[#201b14]">
            Riwayat Penjualan & Audit Kasir
          </h2>
          <p className="text-xs md:text-sm text-[#554339] mt-0.5">
            Daftar transaksi kasir, audit void/retur, detail pesanan, dan cetak ulang struk thermal.
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
              placeholder="Cari No. TRX, nama pelanggan, kasir..."
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

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-[#fef1e7] border border-[#dbc1b5] rounded-xl text-xs font-semibold text-[#201b14] focus:outline-none focus:border-[#964407]"
            >
              <option value="all">Semua Status</option>
              <option value="sukses">Sukses (Aktif)</option>
              <option value="dibatalkan">Dibatalkan / Void</option>
            </select>
          </div>
        </div>

        {/* Total Summary */}
        <div className="text-right self-end md:self-center">
          <span className="text-[11px] text-[#645d57] font-medium mr-2">
            Omzet Sukses ({filteredTransactions.filter((t) => t.status === 'sukses').length} Transaksi):
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
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Waktu</th>
                <th className="py-3.5 px-4">Kasir / Pelanggan</th>
                <th className="py-3.5 px-4">Metode</th>
                <th className="py-3.5 px-4 text-center">Item</th>
                <th className="py-3.5 px-4 text-right">Total Tagihan</th>
                <th className="py-3.5 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#dbc1b5]/20 text-xs">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#887368]">
                    Tidak ada transaksi yang ditemukan.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((trx) => {
                  const itemsCount = trx.items.reduce((s, i) => s + i.quantity, 0);
                  const isVoid = trx.status === 'dibatalkan';

                  return (
                    <tr
                      key={trx.id}
                      className={`hover:bg-[#f8ece1]/40 transition-colors ${
                        isVoid ? 'bg-gray-50/70 opacity-70' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 font-bold text-[#964407]">
                        {trx.trxNumber}
                      </td>
                      <td className="py-3.5 px-4">
                        {isVoid ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-800 border border-rose-200 uppercase">
                            Void / Batal
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase">
                            Sukses
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-[#554339]">
                        <div>{trx.date}</div>
                        <div className="text-[10px] text-[#887368]">{trx.time} WIB</div>
                      </td>
                      <td className="py-3.5 px-4 text-[#201b14]">
                        <div className="font-semibold">{trx.cashierName}</div>
                        {trx.customerName && (
                          <div className="text-[10px] text-[#887368]">
                            Cust: {trx.customerName}
                          </div>
                        )}
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
                      <td
                        className={`py-3.5 px-4 text-right font-price font-extrabold text-sm ${
                          isVoid ? 'line-through text-[#887368]' : 'text-[#201b14]'
                        }`}
                      >
                        {formatCurrency(trx.total)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setActiveReceipt(trx)}
                            className="px-2.5 py-1.5 bg-[#ffdbca] hover:bg-[#ffb68e] text-[#964407] rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <Receipt className="w-3.5 h-3.5" />
                            <span>Struk</span>
                          </button>
                          {!isVoid && onVoidTransaction && (
                            <button
                              onClick={() => setVoidModalTrx(trx)}
                              title="Batalkan / Void Transaksi"
                              className="px-2 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <Ban className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Void</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* VOID CONFIRMATION MODAL */}
      {voidModalTrx && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-rose-200 overflow-hidden">
            <div className="p-4 bg-rose-50 border-b border-rose-200 flex items-center gap-2.5 text-rose-800">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
              <div>
                <h3 className="font-serif-header text-lg font-bold">
                  Batalkan Transaksi ({voidModalTrx.trxNumber})?
                </h3>
                <p className="text-xs text-rose-700">
                  Stok produk akan otomatis dikembalikan ke inventaris.
                </p>
              </div>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-500">Nilai Transaksi:</span>
                  <span className="font-bold font-price text-sm text-[#201b14]">
                    {formatCurrency(voidModalTrx.total)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Metode Bayar:</span>
                  <span className="font-semibold uppercase">{voidModalTrx.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Jumlah Menu/Item:</span>
                  <span className="font-semibold">{voidModalTrx.items.length} jenis</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#554339] mb-1">
                  Pilih Alasan Pembatalan / Void:
                </label>
                <select
                  value={voidReason}
                  onChange={(e) => setVoidReason(e.target.value)}
                  className="w-full px-3 py-2 border border-[#dbc1b5] rounded-xl text-xs text-[#201b14] focus:outline-none focus:border-rose-500"
                >
                  <option value="Pelanggan membatalkan pesanan">Pelanggan membatalkan pesanan</option>
                  <option value="Salah input item menu kasir">Salah input item menu kasir</option>
                  <option value="Uang tunai / kembalian salah hitung">Uang tunai / kembalian salah hitung</option>
                  <option value="Masalah pada metode pembayaran digital / EDC">Masalah pada metode pembayaran digital / EDC</option>
                  <option value="Retur produk rusak / tidak layak">Retur produk rusak / tidak layak</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setVoidModalTrx(null)}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-100 cursor-pointer"
                >
                  Kembali
                </button>
                <button
                  onClick={handleConfirmVoid}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Konfirmasi Void & Pulihkan Stok</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* THERMAL RECEIPT SLIP MODAL */}
      {activeReceipt && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div
            className={`bg-white w-full rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-[#dbc1b5]/60 max-h-[90vh] ${
              paperWidth === '58mm' ? 'max-w-xs' : 'max-w-sm'
            }`}
          >
            {/* Modal Top Bar */}
            <div className="p-3 bg-[#fff8f4] border-b border-[#dbc1b5]/40 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#645d57]">Format Kertas:</span>
                <button
                  onClick={() => setPaperWidth('58mm')}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    paperWidth === '58mm' ? 'bg-[#964407] text-white' : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  58mm
                </button>
                <button
                  onClick={() => setPaperWidth('80mm')}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    paperWidth === '80mm' ? 'bg-[#964407] text-white' : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  80mm
                </button>
              </div>
              <button
                onClick={() => {
                  setActiveReceipt(null);
                  if (onCloseReceipt) onCloseReceipt();
                }}
                className="p-1 text-[#645d57] hover:bg-[#ece0d6] rounded-full transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Printable Thermal Receipt Paper Container */}
            <div className="p-5 overflow-y-auto flex-1 bg-white font-mono text-xs text-[#201b14] relative" id="printable-receipt">
              {/* Void watermark if applicable */}
              {activeReceipt.status === 'dibatalkan' && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20 rotate-[-25deg]">
                  <span className="text-4xl font-extrabold border-4 border-rose-600 text-rose-600 px-4 py-2 rounded-xl">
                    DIBATALKAN (VOID)
                  </span>
                </div>
              )}

              {/* Store Brand Header */}
              <div className="text-center space-y-1 pb-3 border-b border-dashed border-gray-400">
                <h3 className="font-serif-header text-lg font-bold tracking-tight uppercase">
                  {settings.storeName}
                </h3>
                <p className="text-[10px] text-gray-600 font-sans">{settings.storeAddress}</p>
                <p className="text-[10px] text-gray-600 font-sans">Telp: {settings.storePhone}</p>
              </div>

              {/* Transaction Metadata */}
              <div className="py-2.5 border-b border-dashed border-gray-400 text-[10px] space-y-0.5">
                <div className="flex justify-between">
                  <span>No. Struk:</span>
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
                {activeReceipt.orderType && (
                  <div className="flex justify-between">
                    <span>Tipe Pesanan:</span>
                    <span className="font-semibold uppercase">
                      {activeReceipt.orderType === 'dine_in'
                        ? `Dine In ${activeReceipt.tableNumber ? `(Meja ${activeReceipt.tableNumber})` : ''}`
                        : activeReceipt.orderType === 'take_away'
                        ? 'Take Away'
                        : 'Delivery'}
                    </span>
                  </div>
                )}
                {activeReceipt.customerName && (
                  <div className="flex justify-between">
                    <span>Pelanggan:</span>
                    <span>{activeReceipt.customerName}</span>
                  </div>
                )}
                {activeReceipt.status === 'dibatalkan' && (
                  <div className="pt-1 text-rose-600 font-bold">
                    Alasan Void: {activeReceipt.voidReason || 'Dibatalkan kasir'}
                  </div>
                )}
              </div>

              {/* Items List */}
              <div className="py-2.5 border-b border-dashed border-gray-400 space-y-2">
                {activeReceipt.items.map((item, idx) => (
                  <div key={idx} className="space-y-0.5">
                    <div className="font-bold text-[11px]">{item.productName}</div>
                    <div className="flex justify-between text-[10px] text-gray-600">
                      <span>{item.quantity}x @{formatCurrency(item.price)}</span>
                      <span className="font-bold text-gray-900">{formatCurrency(item.total)}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Payment Math Summary */}
              <div className="py-2.5 border-b border-dashed border-gray-400 space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatCurrency(activeReceipt.subtotal)}</span>
                </div>
                {activeReceipt.discount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Diskon {activeReceipt.voucherCode ? `(${activeReceipt.voucherCode})` : ''}</span>
                    <span>-{formatCurrency(activeReceipt.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>PPN ({settings.defaultTaxPercent}%)</span>
                  <span>{formatCurrency(activeReceipt.tax)}</span>
                </div>
                <div className="flex justify-between font-extrabold text-sm pt-1 border-t border-gray-300">
                  <span>TOTAL TAGIHAN</span>
                  <span>{formatCurrency(activeReceipt.total)}</span>
                </div>

                <div className="pt-2 border-t border-dashed border-gray-400 space-y-0.5 text-[10px]">
                  <div className="flex justify-between">
                    <span>Metode Bayar:</span>
                    <span className="font-bold uppercase">{activeReceipt.paymentMethod}</span>
                  </div>
                  {activeReceipt.paymentMethod === 'tunai' && (
                    <>
                      <div className="flex justify-between">
                        <span>Uang Diterima:</span>
                        <span>{formatCurrency(activeReceipt.cashAmountPaid || activeReceipt.total)}</span>
                      </div>
                      <div className="flex justify-between font-bold">
                        <span>Kembalian:</span>
                        <span>{formatCurrency(activeReceipt.cashChange || 0)}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Receipt Footer */}
              <div className="text-center pt-3 text-[10px] space-y-1 text-gray-500">
                <p className="font-bold text-gray-800">TERIMA KASIH ATAS KUNJUNGAN ANDA</p>
                <p>Barang yang sudah dibeli tidak dapat ditukar kecuali perjanjian sebelumnya.</p>
                <p className="pt-1 font-mono text-[9px]">KASIRKU ENTERPRISE POS SYSTEM</p>
              </div>
            </div>

            {/* Print Action Buttons */}
            <div className="p-3 bg-[#fff8f4] border-t border-[#dbc1b5]/40 flex gap-2">
              <button
                onClick={handlePrint}
                className="flex-1 py-2 bg-[#964407] hover:bg-[#773300] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Thermal</span>
              </button>
              <button
                onClick={() => {
                  setActiveReceipt(null);
                  if (onCloseReceipt) onCloseReceipt();
                }}
                className="px-4 py-2 border border-[#dbc1b5] hover:bg-[#ece0d6] text-[#554339] rounded-xl text-xs font-bold transition-all cursor-pointer"
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
