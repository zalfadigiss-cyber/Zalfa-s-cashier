import React from 'react';
import { X, Keyboard, Zap, Search, Bookmark, CreditCard, Wallet } from 'lucide-react';

interface HotkeysModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HotkeysModal: React.FC<HotkeysModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const hotkeys = [
    { key: 'F2', desc: 'Fokus Kolom Pencarian / Scan Barcode SKU', icon: Search },
    { key: 'F4', desc: 'Simpan Pesanan Sementara (Hold Bill)', icon: Bookmark },
    { key: 'F8', desc: 'Buka Menu Bayar / Checkout', icon: CreditCard },
    { key: 'F9', desc: 'Buka Manajemen Shift & Kas Laci', icon: Wallet },
    { key: 'ESC', desc: 'Tutup Dialog / Batal Pembayaran', icon: X },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-[#dbc1b5]/60 overflow-hidden">
        <div className="p-4 bg-[#fff8f4] border-b border-[#dbc1b5]/40 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#964407]">
            <Keyboard className="w-5 h-5" />
            <h3 className="font-serif-header text-lg font-bold text-[#201b14]">
              Keyboard Shortcuts Kasir Cepat
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#645d57] hover:bg-[#ece0d6] rounded-full transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-3">
          <p className="text-xs text-[#554339]">
            Gunakan tombol pintas keyboard berikut untuk mempercepat proses transaksi kasir di jam sibuk:
          </p>

          <div className="space-y-2">
            {hotkeys.map((h, idx) => {
              const Icon = h.icon;
              return (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 bg-[#f8ece1]/50 rounded-xl border border-[#dbc1b5]/40"
                >
                  <div className="flex items-center gap-2.5 text-xs text-[#201b14]">
                    <Icon className="w-4 h-4 text-[#964407]" />
                    <span className="font-semibold">{h.desc}</span>
                  </div>
                  <kbd className="px-2.5 py-1 bg-white border border-[#dbc1b5] rounded-md font-mono text-xs font-extrabold text-[#964407] shadow-xs">
                    {h.key}
                  </kbd>
                </div>
              );
            })}
          </div>

          <div className="pt-2 text-center text-[11px] text-[#887368]">
            Tip: Scanner barcode fisik berbasis USB/Bluetooth akan langsung mengirim SKU dan enter otomatis.
          </div>
        </div>

        <div className="p-3 bg-[#fff8f4] border-t border-[#dbc1b5]/40 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#964407] text-white rounded-lg text-xs font-bold hover:bg-[#773300] cursor-pointer"
          >
            Mengerti
          </button>
        </div>
      </div>
    </div>
  );
};
