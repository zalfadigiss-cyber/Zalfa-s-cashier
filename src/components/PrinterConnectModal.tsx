import React, { useState, useEffect } from 'react';
import {
  X,
  Printer,
  Bluetooth,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Power,
  FileText,
  SlidersHorizontal,
  Sparkles,
} from 'lucide-react';
import { globalPrinter, PrinterDevice, PrinterConnectionStatus } from '../services/printerService';
import { getIndonesianDate, getIndonesianTime } from '../utils/format';

interface PrinterConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrinterConnectModal: React.FC<PrinterConnectModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [status, setStatus] = useState<PrinterConnectionStatus>(globalPrinter.getStatus());
  const [device, setDevice] = useState<PrinterDevice | null>(globalPrinter.getDevice());
  const [paperWidth, setPaperWidth] = useState<'58mm' | '80mm'>('58mm');
  const [isScanning, setIsScanning] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [testSuccess, setTestSuccess] = useState(false);

  useEffect(() => {
    const unsubscribe = globalPrinter.subscribe((newStatus, newDevice) => {
      setStatus(newStatus);
      setDevice(newDevice);
      if (newDevice?.paperWidth) {
        setPaperWidth(newDevice.paperWidth);
      }
    });
    return unsubscribe;
  }, []);

  const handleConnectBluetooth = async () => {
    setIsScanning(true);
    setErrorMessage(null);
    try {
      const ok = await globalPrinter.connectBluetooth(paperWidth);
      if (ok) {
        setTestSuccess(true);
        setTimeout(() => setTestSuccess(false), 3000);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal menyambungkan printer Bluetooth.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleConnectSystem = () => {
    globalPrinter.connectSystemPrinter('Printer Mini Thermal 58mm (Default)', paperWidth);
    setTestSuccess(true);
    setTimeout(() => setTestSuccess(false), 2000);
  };

  const handleDisconnect = () => {
    globalPrinter.disconnect();
    setErrorMessage(null);
  };

  const handleTestPrint = async () => {
    const testReceipt = `
================================
         ANUGERAH STORE         
   TEST CETAK PRINTER MINI     
--------------------------------
Tanggal : ${getIndonesianDate()}
Waktu   : ${getIndonesianTime()}
Koneksi : ${device?.name || 'Printer Thermal'}
Ukuran  : ${paperWidth}
--------------------------------
STATUS PRINTER: NORMAL OK!
SEMUA FITUR SIAP DIGUNAKAN
================================
`;
    await globalPrinter.printReceipt(testReceipt);
    setTestSuccess(true);
    setTimeout(() => setTestSuccess(false), 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-white dark:bg-[#1a1410] rounded-3xl shadow-2xl border border-[#dbc1b5]/60 dark:border-[#423126] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-[#fff8f4] dark:bg-[#231a15] border-b border-[#dbc1b5]/40 dark:border-[#423126] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#964407] text-white flex items-center justify-center shadow-xs">
              <Printer className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#201b14] dark:text-[#f7ece4] font-serif-header">
                Koneksi Printer Mini Thermal
              </h2>
              <p className="text-[11px] text-[#645d57] dark:text-[#c7b3a5]">
                Deteksi otomatis printer Bluetooth &amp; Thermal Roll 58/80mm
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#887368] hover:text-[#201b14] dark:hover:text-white rounded-lg hover:bg-[#ece0d6] dark:hover:bg-[#2e231c] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Status Box */}
          <div
            className={`p-4 rounded-2xl border flex items-center justify-between ${
              status === 'connected'
                ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800'
                : status === 'connecting'
                ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800'
                : 'bg-stone-50 dark:bg-[#231a15] border-stone-200 dark:border-[#382b22]'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-3.5 h-3.5 rounded-full ${
                  status === 'connected'
                    ? 'bg-emerald-500 animate-pulse'
                    : status === 'connecting'
                    ? 'bg-amber-500 animate-spin'
                    : 'bg-stone-400'
                }`}
              />
              <div>
                <span className="text-xs font-bold text-[#201b14] dark:text-[#f7ece4] block">
                  {status === 'connected'
                    ? device?.name || 'Printer Terhubung'
                    : status === 'connecting'
                    ? 'Menghubungkan...'
                    : 'Printer Belum Terhubung'}
                </span>
                <span className="text-[11px] text-[#645d57] dark:text-[#c7b3a5]">
                  {status === 'connected'
                    ? `Tipe: ${device?.type?.toUpperCase()} • Kertas: ${paperWidth}`
                    : 'Pilih koneksi Bluetooth atau sistem'}
                </span>
              </div>
            </div>

            {status === 'connected' && (
              <button
                type="button"
                onClick={handleDisconnect}
                className="px-2.5 py-1 text-[11px] font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg transition-colors cursor-pointer"
              >
                Putuskan
              </button>
            )}
          </div>

          {errorMessage && (
            <div className="p-3 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900 rounded-xl text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {testSuccess && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-800 dark:text-emerald-200 text-xs font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>Printer merespons dengan baik! Struk uji telah dikirim.</span>
            </div>
          )}

          {/* Paper Width Selection */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#554339] dark:text-[#c7b3a5]">
              Lebar Kertas Struk:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPaperWidth('58mm')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  paperWidth === '58mm'
                    ? 'border-[#964407] bg-[#ffdbca]/30 dark:bg-amber-950/40 text-[#964407] dark:text-amber-300 ring-2 ring-[#964407]/20'
                    : 'border-[#dbc1b5] dark:border-[#423126] text-[#645d57] dark:text-[#c7b3a5]'
                }`}
              >
                58 mm (Mini Thermal Standar)
              </button>

              <button
                type="button"
                onClick={() => setPaperWidth('80mm')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  paperWidth === '80mm'
                    ? 'border-[#964407] bg-[#ffdbca]/30 dark:bg-amber-950/40 text-[#964407] dark:text-amber-300 ring-2 ring-[#964407]/20'
                    : 'border-[#dbc1b5] dark:border-[#423126] text-[#645d57] dark:text-[#c7b3a5]'
                }`}
              >
                80 mm (Thermal Lebar)
              </button>
            </div>
          </div>

          {/* Connection Actions */}
          <div className="space-y-2 pt-1">
            <button
              type="button"
              onClick={handleConnectBluetooth}
              disabled={isScanning}
              className="w-full py-2.5 px-4 rounded-xl bg-[#964407] hover:bg-[#7e3905] text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
            >
              {isScanning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Mencari Perangkat Bluetooth Mini...</span>
                </>
              ) : (
                <>
                  <Bluetooth className="w-4 h-4 text-amber-300" />
                  <span>Sambungkan Printer Bluetooth Mini</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleConnectSystem}
              className="w-full py-2.5 px-4 rounded-xl border border-[#dbc1b5] dark:border-[#423126] hover:bg-[#f8ece1] dark:hover:bg-[#2e231c] text-[#554339] dark:text-[#cbb8ad] text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Printer className="w-4 h-4 text-[#964407]" />
              <span>Gunakan Driver Printer Sistem / USB</span>
            </button>

            {status === 'connected' && (
              <button
                type="button"
                onClick={handleTestPrint}
                className="w-full py-2 px-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer hover:bg-emerald-100"
              >
                <FileText className="w-4 h-4 text-emerald-600" />
                <span>Cetak Struk Uji Coba (Test Print)</span>
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-[#fff8f4] dark:bg-[#231a15] border-t border-[#dbc1b5]/40 dark:border-[#423126] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white dark:bg-[#1a1410] border border-[#dbc1b5] dark:border-[#423126] text-xs font-bold text-[#554339] dark:text-[#cbb8ad] hover:bg-stone-50 cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
