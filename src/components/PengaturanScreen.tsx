import React, { useState } from 'react';
import {
  Settings,
  Store,
  User,
  Percent,
  Printer,
  CheckCircle2,
  Save,
  CreditCard,
  QrCode,
  Banknote,
  Camera,
} from 'lucide-react';
import { StoreSettings } from '../types';

interface PengaturanScreenProps {
  settings: StoreSettings;
  onSaveSettings: (newSettings: StoreSettings) => void;
}

export const PengaturanScreen: React.FC<PengaturanScreenProps> = ({
  settings,
  onSaveSettings,
}) => {
  const [form, setForm] = useState<StoreSettings>(settings);
  const [isSaved, setIsSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(form);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const avatarOptions = [
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBtoonZhAVzy1UW5qR3PlzN6UW1Y5aqeMMvjJp1k3NdbL6FUeNZEr8jgEsKsZ3MWDLWIqB9ooRHN2sjKs6XO-_iGoeUhRcdfu6mYkwZN4HwlKUL8dWNUhvYucP-7g1yfZ8ql-p0y6pNephBf0XzK-RVu57IEP85lvq3Nc0PzuLKUEJxh_d7GR3ndJMsw7RZ0RGUKSprUiOSS2Tg02GKzrN1sukma4AsSs1nUiFM26LCEgRcfhLzWW8',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDrkTTge7cWOHeaeHKpepYOtY6D0E1fa79LvP4vPnmMMozRV8hhuBeY466ZVcsOxb__MFZJH_WkeMJUVIfi-98kxQp5Or1YSYSgKbBaIAFVXs4gN19pTrJXiHXxpuQNqd0Drweao4dNXVbeDzgEqgDybwfDSQ3v_QXSh0Lnfexha3-2cD418SLE6eWsOOrttfqKEQ-XGQFkz3vyLcqZQ6NWjWjGxqYnSxsYNVXiRu2HqRqRyYOm3zQ',
  ];

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h2 className="font-serif-header text-3xl font-bold text-[#201b14]">
          Pengaturan Toko & Kasir
        </h2>
        <p className="text-xs md:text-sm text-[#554339] mt-0.5">
          Atur informasi profil, identitas struk pembayaran, pajak, dan metode transaksi.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl border border-[#dbc1b5]/40 shadow-xs p-6 space-y-4">
          <div className="flex items-center gap-2 text-[#964407] border-b border-[#dbc1b5]/30 pb-3">
            <User className="w-5 h-5" />
            <h3 className="font-serif-header text-xl font-bold text-[#201b14]">
              Profil Kasir & Admin
            </h3>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-5">
            <div className="relative group">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-[#f8ece1] border-2 border-[#964407]/40 shadow-xs">
                <img
                  src={form.userPhotoUrl}
                  alt={form.userName}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
              <div>
                <label className="block text-xs font-bold text-[#554339] mb-1">
                  Nama Lengkap Kasir
                </label>
                <input
                  type="text"
                  required
                  value={form.userName}
                  onChange={(e) => setForm({ ...form, userName: e.target.value })}
                  className="w-full px-3.5 py-2 border border-[#dbc1b5] rounded-xl text-xs text-[#201b14] focus:outline-none focus:border-[#964407]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#554339] mb-1">
                  Email Akun
                </label>
                <input
                  type="email"
                  required
                  value={form.userEmail}
                  onChange={(e) => setForm({ ...form, userEmail: e.target.value })}
                  className="w-full px-3.5 py-2 border border-[#dbc1b5] rounded-xl text-xs text-[#201b14] focus:outline-none focus:border-[#964407]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Store Info Card */}
        <div className="bg-white rounded-2xl border border-[#dbc1b5]/40 shadow-xs p-6 space-y-4">
          <div className="flex items-center gap-2 text-[#964407] border-b border-[#dbc1b5]/30 pb-3">
            <Store className="w-5 h-5" />
            <h3 className="font-serif-header text-xl font-bold text-[#201b14]">
              Informasi Toko (Tampil di Struk)
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#554339] mb-1">
                Nama Usaha / Toko
              </label>
              <input
                type="text"
                required
                value={form.storeName}
                onChange={(e) => setForm({ ...form, storeName: e.target.value })}
                className="w-full px-3.5 py-2 border border-[#dbc1b5] rounded-xl text-xs text-[#201b14] focus:outline-none focus:border-[#964407]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#554339] mb-1">
                Nomor Telepon Toko
              </label>
              <input
                type="text"
                required
                value={form.storePhone}
                onChange={(e) => setForm({ ...form, storePhone: e.target.value })}
                className="w-full px-3.5 py-2 border border-[#dbc1b5] rounded-xl text-xs text-[#201b14] focus:outline-none focus:border-[#964407]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[#554339] mb-1">
                Alamat Lengkap Toko
              </label>
              <textarea
                rows={2}
                required
                value={form.storeAddress}
                onChange={(e) => setForm({ ...form, storeAddress: e.target.value })}
                className="w-full px-3.5 py-2 border border-[#dbc1b5] rounded-xl text-xs text-[#201b14] focus:outline-none focus:border-[#964407]"
              />
            </div>
          </div>
        </div>

        {/* POS Preferences */}
        <div className="bg-white rounded-2xl border border-[#dbc1b5]/40 shadow-xs p-6 space-y-4">
          <div className="flex items-center gap-2 text-[#964407] border-b border-[#dbc1b5]/30 pb-3">
            <Percent className="w-5 h-5" />
            <h3 className="font-serif-header text-xl font-bold text-[#201b14]">
              Preferensi Transaksi & Pajak
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#554339] mb-1">
                Tarif PPN Default (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={form.defaultTaxPercent}
                onChange={(e) => setForm({ ...form, defaultTaxPercent: Number(e.target.value) })}
                className="w-full px-3.5 py-2 border border-[#dbc1b5] rounded-xl text-xs font-price font-bold text-[#201b14] focus:outline-none focus:border-[#964407]"
              />
              <span className="text-[10px] text-[#645d57] mt-1 block">
                Standard PPN di Indonesia adalah 11%.
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#554339] mb-1">
                Mata Uang
              </label>
              <select
                value={form.currency}
                onChange={(e) => setForm({ ...form, currency: e.target.value as 'IDR' | 'USD' })}
                className="w-full px-3.5 py-2 border border-[#dbc1b5] rounded-xl text-xs font-semibold text-[#201b14] focus:outline-none focus:border-[#964407]"
              >
                <option value="IDR">IDR (Rupiah Indonesia - Rp)</option>
                <option value="USD">USD (US Dollar - $)</option>
              </select>
            </div>
          </div>

          {/* Auto print toggle */}
          <div className="pt-2">
            <label className="flex items-center gap-3 cursor-pointer p-3 bg-[#f8ece1]/60 rounded-xl border border-[#dbc1b5]/40 hover:bg-[#f8ece1] transition-colors">
              <input
                type="checkbox"
                checked={form.autoPrintReceipt}
                onChange={(e) => setForm({ ...form, autoPrintReceipt: e.target.checked })}
                className="w-4 h-4 rounded text-[#964407] focus:ring-[#964407]"
              />
              <div>
                <span className="text-xs font-bold text-[#201b14] block">
                  Buka Dialog Struk Otomatis
                </span>
                <span className="text-[11px] text-[#645d57]">
                  Tampilkan struk pembayaran langsung begitu transaksi selesai dicatat.
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Enabled Payments */}
        <div className="bg-white rounded-2xl border border-[#dbc1b5]/40 shadow-xs p-6 space-y-4">
          <div className="flex items-center gap-2 text-[#964407] border-b border-[#dbc1b5]/30 pb-3">
            <CreditCard className="w-5 h-5" />
            <h3 className="font-serif-header text-xl font-bold text-[#201b14]">
              Metode Pembayaran Kasir
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <label
              className={`p-4 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                form.enabledPayments.tunai
                  ? 'border-[#964407] bg-[#ffdbca]/20'
                  : 'border-[#dbc1b5]/40 bg-gray-50'
              }`}
            >
              <input
                type="checkbox"
                checked={form.enabledPayments.tunai}
                onChange={(e) =>
                  setForm({
                    ...form,
                    enabledPayments: { ...form.enabledPayments, tunai: e.target.checked },
                  })
                }
                className="w-4 h-4 rounded text-[#964407]"
              />
              <div className="flex items-center gap-2">
                <Banknote className="w-4 h-4 text-[#964407]" />
                <span className="text-xs font-bold text-[#201b14]">Tunai (Cash)</span>
              </div>
            </label>

            <label
              className={`p-4 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                form.enabledPayments.qris
                  ? 'border-[#964407] bg-[#ffdbca]/20'
                  : 'border-[#dbc1b5]/40 bg-gray-50'
              }`}
            >
              <input
                type="checkbox"
                checked={form.enabledPayments.qris}
                onChange={(e) =>
                  setForm({
                    ...form,
                    enabledPayments: { ...form.enabledPayments, qris: e.target.checked },
                  })
                }
                className="w-4 h-4 rounded text-[#964407]"
              />
              <div className="flex items-center gap-2">
                <QrCode className="w-4 h-4 text-[#964407]" />
                <span className="text-xs font-bold text-[#201b14]">QRIS</span>
              </div>
            </label>

            <label
              className={`p-4 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                form.enabledPayments.debit
                  ? 'border-[#964407] bg-[#ffdbca]/20'
                  : 'border-[#dbc1b5]/40 bg-gray-50'
              }`}
            >
              <input
                type="checkbox"
                checked={form.enabledPayments.debit}
                onChange={(e) =>
                  setForm({
                    ...form,
                    enabledPayments: { ...form.enabledPayments, debit: e.target.checked },
                  })
                }
                className="w-4 h-4 rounded text-[#964407]"
              />
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#964407]" />
                <span className="text-xs font-bold text-[#201b14]">Kartu Debit / EDC</span>
              </div>
            </label>
          </div>
        </div>

        {/* Save CTA */}
        <div className="flex items-center justify-between pt-2">
          {isSaved ? (
            <div className="flex items-center gap-2 text-xs font-bold text-[#059669]">
              <CheckCircle2 className="w-4 h-4" />
              <span>Pengaturan berhasil disimpan!</span>
            </div>
          ) : (
            <div />
          )}

          <button
            type="submit"
            className="px-6 py-3 bg-[#964407] hover:bg-[#773300] text-white rounded-xl font-serif-header text-base font-bold shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Pengaturan</span>
          </button>
        </div>
      </form>
    </div>
  );
};
