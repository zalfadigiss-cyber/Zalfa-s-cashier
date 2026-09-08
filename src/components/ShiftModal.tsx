import React, { useState } from 'react';
import {
  X,
  Wallet,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  Printer,
  History,
  Lock,
  Unlock,
  Building2,
  User,
  Clock,
  Coins,
} from 'lucide-react';
import { ShiftSession, Transaction, StoreSettings } from '../types';
import { formatCurrency, getIndonesianDate, getIndonesianTime } from '../utils/format';

interface ShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentShift: ShiftSession | null;
  transactions: Transaction[];
  settings: StoreSettings;
  activeBranchName?: string;
  onOpenNewShift: (startingCash: number) => void;
  onAddCashLog: (type: 'masuk' | 'keluar', amount: number, reason: string) => void;
  onCloseShift: (actualCash: number, notes: string) => void;
}

export const ShiftModal: React.FC<ShiftModalProps> = ({
  isOpen,
  onClose,
  currentShift,
  transactions,
  settings,
  activeBranchName,
  onOpenNewShift,
  onAddCashLog,
  onCloseShift,
}) => {
  const [activeTab, setActiveTab] = useState<'ringkasan' | 'kas' | 'tutup' | 'zreport'>('ringkasan');
  const [shiftError, setShiftError] = useState<string | null>(null);

  // Petty Cash Form
  const [logType, setLogType] = useState<'masuk' | 'keluar'>('keluar');
  const [logAmount, setLogAmount] = useState<number>(20000);
  const [logReason, setLogReason] = useState<string>('');

  // Close shift form
  const [actualCashCount, setActualCashCount] = useState<number>(0);
  const [closingNotes, setClosingNotes] = useState<string>('');

  // Open shift form (if closed)
  const [newStartingCash, setNewStartingCash] = useState<number>(500000);

  if (!isOpen) return null;

  if (!currentShift) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
        <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-[#dbc1b5]/60 overflow-hidden">
          <div className="p-4 bg-[#fff8f4] border-b border-[#dbc1b5]/40 flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#964407]">
              <Wallet className="w-5 h-5" />
              <h3 className="font-serif-header text-lg font-bold text-[#201b14]">
                Buka Shift Kasir Baru
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-[#645d57] hover:bg-[#f8ece1] rounded-full transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              onOpenNewShift(newStartingCash);
            }}
            className="p-5 space-y-4"
          >
            <p className="text-xs text-[#554339]">
              Shift kasir saat ini belum dibuka. Masukkan jumlah modal kas awal di laci (petty cash) untuk memulai shift:
            </p>

            <div>
              <label className="block text-xs font-bold text-[#554339] mb-1">
                Modal Kas Awal Laci (Rp):
              </label>
              <input
                type="number"
                min={0}
                step={10000}
                value={newStartingCash}
                onChange={(e) => setNewStartingCash(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 border-2 border-[#dbc1b5] focus:border-[#964407] rounded-xl text-lg font-price font-extrabold text-[#201b14] bg-[#fef1e7]/40 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-[#dbc1b5] rounded-xl text-xs font-bold text-[#554339] hover:bg-[#f8ece1] cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#964407] hover:bg-[#773300] text-white rounded-xl text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <Unlock className="w-4 h-4" />
                <span>Buka Shift Sekarang</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Filter transactions created in this shift
  const shiftTrx = transactions.filter(
    (t) => t.status === 'sukses'
  );

  const cashSales = shiftTrx
    .filter((t) => t.paymentMethod === 'tunai')
    .reduce((sum, t) => sum + t.total, 0);

  const qrisSales = shiftTrx
    .filter((t) => t.paymentMethod === 'qris')
    .reduce((sum, t) => sum + t.total, 0);

  const debitSales = shiftTrx
    .filter((t) => t.paymentMethod === 'debit')
    .reduce((sum, t) => sum + t.total, 0);

  const totalSales = cashSales + qrisSales + debitSales;

  const totalCashIn = currentShift.cashInLogs.reduce((sum, l) => sum + l.amount, 0);
  const totalCashOut = currentShift.cashOutLogs.reduce((sum, l) => sum + l.amount, 0);

  // Expected cash in drawer = Starting Cash + Cash Sales + Other Cash In - Cash Out
  const expectedCashInDrawer =
    currentShift.startingCash + cashSales + totalCashIn - totalCashOut;

  const handleSaveCashLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!logAmount || logAmount <= 0) {
      setShiftError('Masukkan nominal kas yang valid (lebih dari 0)!');
      return;
    }
    if (!logReason.trim()) {
      setShiftError('Harap tuliskan keterangan atau alasan mutasi kas!');
      return;
    }
    onAddCashLog(logType, logAmount, logReason.trim());
    setLogReason('');
    setLogAmount(20000);
    setShiftError(null);
    setActiveTab('ringkasan');
  };

  const handleExecuteCloseShift = (e: React.FormEvent) => {
    e.preventDefault();
    if (actualCashCount < 0) {
      setShiftError('Hitungan uang fisik kasir tidak boleh negatif.');
      return;
    }
    setShiftError(null);
    onCloseShift(actualCashCount, closingNotes);
    setActiveTab('zreport');
  };

  const discrepancy = actualCashCount - expectedCashInDrawer;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-[#dbc1b5]/60 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-[#fff8f4] border-b border-[#dbc1b5]/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#ffdbca] text-[#964407] rounded-xl">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif-header text-xl font-bold text-[#201b14]">
                  Manajemen Shift & Kas Laci
                </h3>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                    currentShift.status === 'open'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-rose-100 text-rose-800 border border-rose-300'
                  }`}
                >
                  {currentShift.status === 'open' ? 'Shift Aktif' : 'Shift Ditutup'}
                </span>
              </div>
              <p className="text-xs text-[#645d57] mt-0.5 flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5" /> {currentShift.cashierName}
                </span>
                <span>&bull;</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Buka: {currentShift.startDate}, {currentShift.startTime}
                </span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#645d57] hover:bg-[#f8ece1] rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#dbc1b5]/40 bg-[#fef1e7]/40 px-4 sm:px-6 gap-2 overflow-x-auto text-xs font-bold">
          <button
            onClick={() => setActiveTab('ringkasan')}
            className={`py-3 px-3 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'ringkasan'
                ? 'border-[#964407] text-[#964407]'
                : 'border-transparent text-[#645d57] hover:text-[#201b14]'
            }`}
          >
            Ringkasan Kas Laci
          </button>
          <button
            onClick={() => setActiveTab('kas')}
            className={`py-3 px-3 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'kas'
                ? 'border-[#964407] text-[#964407]'
                : 'border-transparent text-[#645d57] hover:text-[#201b14]'
            }`}
          >
            Kas Masuk / Keluar (+/-)
          </button>
          <button
            onClick={() => {
              setActualCashCount(expectedCashInDrawer);
              setActiveTab('tutup');
            }}
            className={`py-3 px-3 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'tutup'
                ? 'border-[#964407] text-[#964407]'
                : 'border-transparent text-[#645d57] hover:text-[#201b14]'
            }`}
          >
            Tutup Kasir (Z-Report)
          </button>
          {currentShift.status === 'closed' && (
            <button
              onClick={() => setActiveTab('zreport')}
              className={`py-3 px-3 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'zreport'
                  ? 'border-[#964407] text-[#964407]'
                : 'border-transparent text-[#645d57] hover:text-[#201b14]'
              }`}
            >
              Struk Laporan Z
            </button>
          )}
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5 text-[#201b14]">
          {shiftError && (
            <div className="p-3 bg-[#ffdad6]/70 border border-[#ba1a1a]/40 rounded-xl flex items-center justify-between gap-2 text-xs text-[#ba1a1a]">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{shiftError}</span>
              </div>
              <button
                type="button"
                onClick={() => setShiftError(null)}
                className="p-1 hover:bg-[#ba1a1a]/10 rounded-md cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* TAB 1: RINGKASAN */}
          {activeTab === 'ringkasan' && (
            <div className="space-y-4">
              {/* Cash Drawer Status Card */}
              <div className="p-4 rounded-2xl bg-[#964407] text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs uppercase tracking-wider text-[#ffdbca] font-bold">
                    Estimasi Uang Fisik di Laci (Drawer)
                  </span>
                  <div className="text-3xl font-extrabold font-price tracking-tight mt-1">
                    {formatCurrency(expectedCashInDrawer)}
                  </div>
                  <p className="text-[11px] text-white/80 mt-1">
                    Modal Awal + Penjualan Tunai + Kas Masuk - Kas Keluar
                  </p>
                </div>
                <button
                  onClick={() => {
                    setActualCashCount(expectedCashInDrawer);
                    setActiveTab('tutup');
                  }}
                  className="px-4 py-2 bg-white text-[#964407] rounded-xl text-xs font-bold hover:bg-[#ffdbca] transition-all self-start sm:self-auto cursor-pointer shadow-sm"
                >
                  Tutup Shift Sekarang
                </button>
              </div>

              {/* Grid Metrics Breakdown */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-[#f8ece1]/70 rounded-xl border border-[#dbc1b5]/40">
                  <span className="text-[#645d57] font-semibold block">Modal Kas Awal</span>
                  <span className="font-bold text-sm font-price text-[#201b14]">
                    {formatCurrency(currentShift.startingCash)}
                  </span>
                </div>
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                  <span className="text-emerald-800 font-semibold block">Penjualan Tunai</span>
                  <span className="font-bold text-sm font-price text-emerald-900">
                    +{formatCurrency(cashSales)}
                  </span>
                </div>
                <div className="p-3 bg-sky-50 rounded-xl border border-sky-200">
                  <span className="text-sky-800 font-semibold block">Kas Masuk Lain</span>
                  <span className="font-bold text-sm font-price text-sky-900">
                    +{formatCurrency(totalCashIn)}
                  </span>
                </div>
                <div className="p-3 bg-rose-50 rounded-xl border border-rose-200">
                  <span className="text-rose-800 font-semibold block">Kas Keluar (Petty)</span>
                  <span className="font-bold text-sm font-price text-rose-900">
                    -{formatCurrency(totalCashOut)}
                  </span>
                </div>
              </div>

              {/* Non-Cash Transactions */}
              <div className="p-4 bg-white rounded-xl border border-[#dbc1b5]/40 shadow-xs space-y-2">
                <span className="text-xs font-bold text-[#554339] uppercase tracking-wider block">
                  Penjualan Non-Tunai Shift Ini
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div className="flex justify-between items-center p-2.5 bg-[#fff8f4] rounded-lg border border-[#dbc1b5]/30">
                    <span className="text-xs text-[#645d57]">QRIS:</span>
                    <span className="font-bold font-price text-xs text-[#201b14]">
                      {formatCurrency(qrisSales)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2.5 bg-[#fff8f4] rounded-lg border border-[#dbc1b5]/30">
                    <span className="text-xs text-[#645d57]">Kartu Debit:</span>
                    <span className="font-bold font-price text-xs text-[#201b14]">
                      {formatCurrency(debitSales)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2.5 bg-[#ffdbca]/40 rounded-lg border border-[#dbc1b5]/40">
                    <span className="text-xs font-bold text-[#964407]">Total Semua Omzet:</span>
                    <span className="font-extrabold font-price text-xs text-[#964407]">
                      {formatCurrency(totalSales)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Recent Cash Movement Logs */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#201b14]">
                    Riwayat Kas Masuk & Keluar ({currentShift.cashInLogs.length + currentShift.cashOutLogs.length})
                  </span>
                  <button
                    onClick={() => setActiveTab('kas')}
                    className="text-xs font-bold text-[#964407] hover:underline cursor-pointer"
                  >
                    + Catat Kas Masuk / Keluar
                  </button>
                </div>
                <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1 text-xs">
                  {[...currentShift.cashInLogs, ...currentShift.cashOutLogs].length === 0 ? (
                    <p className="text-xs text-[#887368] italic p-3 text-center bg-gray-50 rounded-lg">
                      Belum ada mutasi kas masuk / kas keluar di shift ini.
                    </p>
                  ) : (
                    [...currentShift.cashInLogs, ...currentShift.cashOutLogs].map((log) => (
                      <div
                        key={log.id}
                        className="flex items-center justify-between p-2.5 bg-[#fff8f4] rounded-lg border border-[#dbc1b5]/30"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`p-1 rounded-full ${
                              log.type === 'masuk'
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-rose-100 text-rose-700'
                            }`}
                          >
                            {log.type === 'masuk' ? (
                              <ArrowDownRight className="w-3.5 h-3.5" />
                            ) : (
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            )}
                          </span>
                          <div>
                            <span className="font-semibold text-[#201b14]">{log.reason}</span>
                            <span className="text-[10px] text-[#887368] ml-2">{log.time}</span>
                          </div>
                        </div>
                        <span
                          className={`font-bold font-price ${
                            log.type === 'masuk' ? 'text-emerald-700' : 'text-rose-700'
                          }`}
                        >
                          {log.type === 'masuk' ? '+' : '-'} {formatCurrency(log.amount)}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CATAT KAS MASUK / KELUAR */}
          {activeTab === 'kas' && (
            <form onSubmit={handleSaveCashLog} className="space-y-4">
              <div className="p-3 bg-[#f8ece1]/70 rounded-xl border border-[#dbc1b5]/40 text-xs text-[#554339]">
                Catat pengeluaran operasional kecil (Petty Cash seperti beli galon/es batu) atau penambahan modal receh kasir.
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setLogType('keluar')}
                  className={`p-3.5 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold cursor-pointer transition-all ${
                    logType === 'keluar'
                      ? 'bg-rose-50 border-rose-400 text-rose-800 shadow-xs'
                      : 'bg-white border-[#dbc1b5] text-[#645d57] hover:bg-gray-50'
                  }`}
                >
                  <ArrowUpRight className="w-4 h-4 text-rose-600" />
                  <span>Kas Keluar (Petty Cash)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLogType('masuk')}
                  className={`p-3.5 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold cursor-pointer transition-all ${
                    logType === 'masuk'
                      ? 'bg-emerald-50 border-emerald-400 text-emerald-800 shadow-xs'
                      : 'bg-white border-[#dbc1b5] text-[#645d57] hover:bg-gray-50'
                  }`}
                >
                  <ArrowDownRight className="w-4 h-4 text-emerald-600" />
                  <span>Kas Masuk (Tambah Modal)</span>
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#554339] mb-1">
                  Nominal (Rp)
                </label>
                <input
                  type="number"
                  min="1000"
                  step="500"
                  required
                  value={logAmount}
                  onChange={(e) => setLogAmount(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 border border-[#dbc1b5] rounded-xl text-base font-price font-bold text-[#201b14] focus:outline-none focus:border-[#964407]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#554339] mb-1">
                  Keterangan / Alasan
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Beli es batu kristal 2 kantong, Tukar uang receh..."
                  value={logReason}
                  onChange={(e) => setLogReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-[#dbc1b5] rounded-xl text-xs text-[#201b14] focus:outline-none focus:border-[#964407]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('ringkasan')}
                  className="px-4 py-2 border border-[#dbc1b5] rounded-xl text-xs font-bold text-[#554339] hover:bg-gray-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#964407] hover:bg-[#773300] text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
                >
                  Simpan Mutasi Kas
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: TUTUP KASIR (Z-REPORT) */}
          {activeTab === 'tutup' && (
            <form onSubmit={handleExecuteCloseShift} className="space-y-4">
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
                <strong>Proses Tutup Kasir (End of Shift):</strong> Harap hitung seluruh uang fisik di laci kasir dan masukkan totalnya untuk rekonsiliasi otomatis.
              </div>

              <div className="p-4 bg-[#f8ece1]/70 rounded-xl border border-[#dbc1b5]/40 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#645d57]">Modal Awal:</span>
                  <span className="font-bold font-price">{formatCurrency(currentShift.startingCash)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#645d57]">Total Penjualan Tunai:</span>
                  <span className="font-bold font-price text-emerald-700">+{formatCurrency(cashSales)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#645d57]">Mutasi Kas Bersih (Masuk - Keluar):</span>
                  <span className="font-bold font-price">
                    {formatCurrency(totalCashIn - totalCashOut)}
                  </span>
                </div>
                <div className="pt-2 border-t border-[#dbc1b5]/40 flex justify-between text-sm font-bold text-[#201b14]">
                  <span>Total Kas Seharusnya di Laci:</span>
                  <span className="font-price text-[#964407]">{formatCurrency(expectedCashInDrawer)}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#201b14] mb-1">
                  Uang Fisik Dihitung Kasir (Rp) *
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={actualCashCount}
                  onChange={(e) => setActualCashCount(Number(e.target.value))}
                  className="w-full px-4 py-3 border-2 border-[#964407] rounded-xl text-lg font-price font-extrabold text-[#201b14] focus:outline-none focus:ring-2 focus:ring-[#ffdbca]"
                />
              </div>

              {/* Discrepancy indicator */}
              <div
                className={`p-3 rounded-xl border flex items-center justify-between text-xs font-bold ${
                  discrepancy === 0
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                    : discrepancy > 0
                    ? 'bg-sky-50 border-sky-300 text-sky-800'
                    : 'bg-rose-50 border-rose-300 text-rose-800'
                }`}
              >
                <span>Status Selisih Kas:</span>
                <span>
                  {discrepancy === 0
                    ? 'SEIMBANG / PAS (Tidak ada selisih)'
                    : discrepancy > 0
                    ? `LEBIH (Surplus) +${formatCurrency(discrepancy)}`
                    : `KURANG (Defisit) ${formatCurrency(discrepancy)}`}
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#554339] mb-1">
                  Catatan Tutup Shift (Opsional)
                </label>
                <textarea
                  rows={2}
                  value={closingNotes}
                  onChange={(e) => setClosingNotes(e.target.value)}
                  placeholder="Contoh: Shift berjalan lancar, laci kasir rapi..."
                  className="w-full px-3 py-2 border border-[#dbc1b5] rounded-xl text-xs text-[#201b14] focus:outline-none focus:border-[#964407]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('ringkasan')}
                  className="px-4 py-2 border border-[#dbc1b5] rounded-xl text-xs font-bold text-[#554339] hover:bg-gray-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#ba1a1a] hover:bg-[#93000a] text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Lock className="w-4 h-4" />
                  <span>Konfirmasi & Tutup Kasir</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 4: STRUK Z-REPORT PRINT PREVIEW */}
          {activeTab === 'zreport' && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 border border-gray-300 rounded-xl font-mono text-xs text-gray-800 max-w-md mx-auto space-y-2 shadow-inner">
                <div className="text-center pb-2 border-b border-dashed border-gray-400">
                  <p className="font-bold text-sm uppercase">{settings.storeName}</p>
                  <p className="text-[10px] text-gray-500">{currentShift.branchName}</p>
                  <p className="font-extrabold text-xs mt-1">LAPORAN PENUTUPAN SHIFT (Z-REPORT)</p>
                </div>

                <div className="space-y-0.5 text-[11px] pb-2 border-b border-dashed border-gray-400">
                  <div className="flex justify-between">
                    <span>Kasir:</span> <span>{currentShift.cashierName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Buka:</span> <span>{currentShift.startDate} {currentShift.startTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tutup:</span> <span>{getIndonesianDate()} {getIndonesianTime()}</span>
                  </div>
                </div>

                <div className="space-y-1 text-[11px] pb-2 border-b border-dashed border-gray-400">
                  <div className="flex justify-between">
                    <span>Modal Awal:</span> <span>{formatCurrency(currentShift.startingCash)}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>Penjualan Tunai:</span> <span>{formatCurrency(cashSales)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Penjualan QRIS:</span> <span>{formatCurrency(qrisSales)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Penjualan EDC Debit:</span> <span>{formatCurrency(debitSales)}</span>
                  </div>
                  <div className="flex justify-between font-extrabold text-xs pt-1 border-t border-gray-300">
                    <span>TOTAL OMZET:</span> <span>{formatCurrency(totalSales)}</span>
                  </div>
                </div>

                <div className="space-y-1 text-[11px] pb-2 border-b border-dashed border-gray-400">
                  <div className="flex justify-between">
                    <span>Kas Seharusnya:</span> <span>{formatCurrency(expectedCashInDrawer)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Kas Fisik Dihitung:</span> <span>{formatCurrency(actualCashCount)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-xs">
                    <span>SELISIH KAS:</span> <span>{formatCurrency(discrepancy)}</span>
                  </div>
                </div>

                <div className="text-center pt-2 text-[10px] text-gray-500">
                  *** Z-REPORT TERCETAK OTOMATIS ***
                </div>
              </div>

              <div className="flex justify-center gap-3">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-[#964407] hover:bg-[#773300] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak Z-Report Thermal</span>
                </button>
                <button
                  onClick={() => {
                    onOpenNewShift(500000);
                    setActiveTab('ringkasan');
                  }}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Unlock className="w-4 h-4" />
                  <span>Buka Shift Baru (Rp 500.000)</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-[#fff8f4] border-t border-[#dbc1b5]/40 flex justify-between items-center text-xs">
          <span className="text-[#645d57]">
            Cabang: <strong className="text-[#201b14]">{currentShift.branchName}</strong>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#dbc1b5]/50 hover:bg-[#dbc1b5] text-[#201b14] rounded-lg font-semibold transition-colors cursor-pointer"
          >
            Tutup Jendela
          </button>
        </div>
      </div>
    </div>
  );
};
