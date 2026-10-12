import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  X,
  CheckCircle2,
  Copy,
  Check,
  Printer,
  RefreshCw,
  Clock,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { generateDynamicQRIS, DEFAULT_QRIS_CONFIG } from '../utils/qris';
import { formatCurrency } from '../utils/format';
import { globalPrinter } from '../services/printerService';

interface DynamicQRISModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalAmount: number;
  trxNumber: string;
  onConfirmSuccess: () => void;
}

export const DynamicQRISModal: React.FC<DynamicQRISModalProps> = ({
  isOpen,
  onClose,
  totalAmount,
  trxNumber,
  onConfirmSuccess,
}) => {
  const [copiedString, setCopiedString] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(900); // 15 minutes
  const [isSimulatingPayment, setIsSimulatingPayment] = useState(false);

  // Generate dynamic QRIS string
  const { qrisString, config } = generateDynamicQRIS(totalAmount, trxNumber);

  // 15-minute countdown timer
  useEffect(() => {
    if (!isOpen) {
      setSecondsLeft(900);
      setIsSimulatingPayment(false);
      return;
    }

    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const timeFormatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(qrisString);
    setCopiedString(true);
    setTimeout(() => setCopiedString(false), 2000);
  };

  const handleSimulatePaymentReceive = () => {
    setIsSimulatingPayment(true);
    setTimeout(() => {
      setIsSimulatingPayment(false);
      onConfirmSuccess();
    }, 900);
  };

  const handlePrintQRISThermal = () => {
    const text = `
================================
         ANUGERAH STORE         
   NMID: ID1025371471182        
   TERMINAL: A01                
--------------------------------
Tagihan: ${formatCurrency(totalAmount)}
No Ref: ${trxNumber}
Metode: QRIS DINAMIS ASPI       
Silakan scan QRIS pada layar kasir
================================
`;
    globalPrinter.printReceipt(text);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-white dark:bg-[#1a1410] rounded-3xl shadow-2xl border border-[#dbc1b5]/60 dark:border-[#423126] overflow-hidden flex flex-col max-h-[95vh]">
        {/* Header with Close */}
        <div className="p-3.5 sm:p-4 bg-[#fff8f4] dark:bg-[#231a15] border-b border-[#dbc1b5]/40 dark:border-[#423126] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-[#554339] dark:text-[#cbb8ad] uppercase tracking-wider">
              QRIS Dinamis Otomatis
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#887368] hover:text-[#201b14] dark:hover:text-white rounded-lg hover:bg-[#ece0d6] dark:hover:bg-[#2e231c] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable QR Card Body (Exact replica of the uploaded image layout) */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {/* Card Container mimicking the uploaded standee / banner */}
          <div className="bg-white rounded-2xl border-2 border-red-500/20 shadow-md p-5 text-center relative overflow-hidden">
            {/* Top Red & Gray Accents */}
            <div className="absolute -top-12 -left-12 w-28 h-28 bg-red-600/10 rounded-full blur-xl" />
            <div className="absolute -bottom-12 -right-12 w-28 h-28 bg-red-600/15 rounded-full blur-xl" />

            {/* Top Logos: QRIS & GPN */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-1.5">
                <div className="px-2 py-0.5 bg-black text-white text-[11px] font-black rounded-sm tracking-tighter">
                  QRIS
                </div>
                <div className="text-left leading-none">
                  <div className="text-[9px] font-extrabold text-gray-800 tracking-tight">QR Code Standar</div>
                  <div className="text-[8px] font-medium text-gray-500">Pembayaran Nasional</div>
                </div>
              </div>

              {/* GPN Logo Badge */}
              <div className="flex items-center gap-1 px-2 py-0.5 rounded border border-red-200 bg-red-50 text-red-600">
                <span className="text-[10px] font-black tracking-wider">GPN</span>
              </div>
            </div>

            {/* Merchant Identification */}
            <div className="py-3">
              <h3 className="text-xl font-extrabold text-gray-900 tracking-tight font-serif-header">
                {config.merchantName}
              </h3>
              <p className="text-xs font-mono font-semibold text-gray-600 mt-0.5">
                NMID : {config.nmid}
              </p>
              <div className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-700 text-[10px] font-bold">
                {config.terminalId}
              </div>
            </div>

            {/* Dynamic QR Code Canvas */}
            <div className="py-2 flex justify-center">
              <div className="p-3 bg-white rounded-2xl border-2 border-gray-900 shadow-sm inline-block">
                <QRCodeSVG
                  value={qrisString}
                  size={210}
                  level="M"
                  includeMargin={true}
                  className="rounded-lg"
                />
              </div>
            </div>

            {/* Dynamic Amount Banner */}
            <div className="mt-2 py-2 px-3 bg-emerald-50 rounded-xl border border-emerald-200 text-center">
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
                Total Nominal Terkunci:
              </span>
              <span className="text-xl font-price font-extrabold text-emerald-900">
                {formatCurrency(totalAmount)}
              </span>
              <span className="text-[10px] text-emerald-600 block mt-0.5">
                Pembeli tidak perlu mengetik nominal lagi di aplikasi bank / e-wallet.
              </span>
            </div>

            {/* Footer Text from official banner */}
            <div className="mt-3 pt-3 border-t border-gray-100 text-center space-y-1">
              <div className="text-[11px] font-extrabold text-gray-800 tracking-wide uppercase">
                SATU QRIS UNTUK SEMUA
              </div>
              <div className="text-[9px] text-gray-500">
                Cek aplikasi penyelenggara di: <span className="text-blue-600 underline">www.aspi-qris.id</span>
              </div>
              <div className="flex justify-between items-center text-[8px] text-gray-400 pt-1">
                <span>Dicetak oleh: {config.acquirerCode}</span>
                <span>Versi cetak: 1.0.14.08.26</span>
              </div>
            </div>
          </div>

          {/* Real-time Timer & Ref Info */}
          <div className="flex items-center justify-between text-xs text-[#554339] dark:text-[#cbb8ad] px-1">
            <div className="flex items-center gap-1.5 font-medium">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>Berlaku hingga: <b className="font-mono text-[#964407] dark:text-amber-400">{timeFormatted}</b></span>
            </div>
            <div className="font-mono text-[11px] text-[#887368]">
              Ref: {trxNumber}
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={handleCopy}
              className="py-2 px-3 rounded-xl border border-[#dbc1b5] dark:border-[#423126] bg-[#f8ece1]/50 dark:bg-[#231a15] hover:bg-[#ece0d6] text-[#554339] dark:text-[#f7ece4] text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {copiedString ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-[#887368]" />}
              <span>{copiedString ? 'Tersalin' : 'Salin Kode QRIS'}</span>
            </button>

            <button
              type="button"
              onClick={handlePrintQRISThermal}
              className="py-2 px-3 rounded-xl border border-[#dbc1b5] dark:border-[#423126] bg-[#f8ece1]/50 dark:bg-[#231a15] hover:bg-[#ece0d6] text-[#554339] dark:text-[#f7ece4] text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              title="Cetak struk informasi QRIS ke printer mini"
            >
              <Printer className="w-4 h-4 text-[#964407]" />
              <span>Cetak ke Mini Printer</span>
            </button>
          </div>
        </div>

        {/* Footer Confirmation */}
        <div className="p-4 bg-[#fff8f4] dark:bg-[#231a15] border-t border-[#dbc1b5]/40 dark:border-[#423126] flex gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 border border-[#dbc1b5] dark:border-[#423126] hover:bg-[#f8ece1] dark:hover:bg-[#2e231c] text-[#554339] dark:text-[#cbb8ad] rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={handleSimulatePaymentReceive}
            disabled={isSimulatingPayment}
            className="flex-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
          >
            {isSimulatingPayment ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Memverifikasi Pembayaran...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Verifikasi Lunas &amp; Cetak Struk</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
