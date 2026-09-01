import React from 'react';
import { HelpCircle, X, ShoppingCart, Boxes, Printer, QrCode, Tag, Check } from 'lucide-react';

interface BantuanModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BantuanModal: React.FC<BantuanModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] border border-[#dbc1b5]/60">
        {/* Header */}
        <div className="p-4 bg-[#fff8f4] border-b border-[#dbc1b5]/40 flex justify-between items-center">
          <div className="flex items-center gap-2 text-[#964407]">
            <HelpCircle className="w-5 h-5" />
            <h3 className="font-serif-header text-xl font-bold text-[#201b14]">
              Panduan KASIRKU POS
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#645d57] hover:bg-[#ece0d6] rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs text-[#554339] leading-relaxed">
          <div className="p-3 bg-[#f8ece1]/60 rounded-xl border border-[#dbc1b5]/40 space-y-1">
            <h4 className="font-bold text-[#201b14] flex items-center gap-1.5 text-xs">
              <ShoppingCart className="w-4 h-4 text-[#964407]" />
              Cara Menggunakan Kasir
            </h4>
            <p>
              1. Pilih menu / produk dari daftar atau gunakan pencarian SKU.
              <br />
              2. Jumlah pesanan akan bertambah di panel pesanan kanan.
              <br />
              3. Klik tombol <strong>BAYAR SEKARANG</strong>, pilih metode (Tunai/QRIS/Debit), lalu klik <strong>Selesai & Cetak Struk</strong>.
            </p>
          </div>

          <div className="p-3 bg-[#f8ece1]/60 rounded-xl border border-[#dbc1b5]/40 space-y-1">
            <h4 className="font-bold text-[#201b14] flex items-center gap-1.5 text-xs">
              <Boxes className="w-4 h-4 text-[#964407]" />
              Pengelolaan Inventaris & Stok
            </h4>
            <p>
              Stok produk akan otomatis berkurang setiap kali transaksi berhasil. Gunakan menu <strong>Stok</strong> untuk melakukan restock atau melihat produk dengan stok menipis.
            </p>
          </div>

          <div className="p-3 bg-[#f8ece1]/60 rounded-xl border border-[#dbc1b5]/40 space-y-1">
            <h4 className="font-bold text-[#201b14] flex items-center gap-1.5 text-xs">
              <Printer className="w-4 h-4 text-[#964407]" />
              Cetak Struk Thermal
            </h4>
            <p>
              Struk didesain khusus standar printer thermal 58mm / 80mm. Anda juga dapat mencetak ulang struk kapan saja melalui tab <strong>Riwayat Penjualan</strong>.
            </p>
          </div>

          <div className="pt-2 text-center text-[11px] text-[#887368]">
            KASIRKU POS Version 2.4 &bull; Dukungan: support@kasirku.id
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#fff8f4] border-t border-[#dbc1b5]/40 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#964407] hover:bg-[#773300] text-white rounded-xl text-xs font-bold transition-all"
          >
            Mengerti
          </button>
        </div>
      </div>
    </div>
  );
};
