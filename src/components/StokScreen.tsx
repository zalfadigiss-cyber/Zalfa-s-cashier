import React, { useState, useMemo } from 'react';
import {
  Boxes,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Search,
  Plus,
  Minus,
  ArrowUpDown,
  RefreshCw,
  X,
} from 'lucide-react';
import { Category, Product } from '../types';

interface StokScreenProps {
  products: Product[];
  categories: Category[];
  onUpdateStock: (productId: string, newStock: number) => void;
}

export const StokScreen: React.FC<StokScreenProps> = ({
  products,
  categories,
  onUpdateStock,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'safe' | 'low' | 'out'>('all');
  const [adjustingProduct, setAdjustingProduct] = useState<Product | null>(null);
  const [adjustAmount, setAdjustAmount] = useState<number>(10);
  const [adjustType, setAdjustType] = useState<'in' | 'out'>('in');
  const [adjustNote, setAdjustNote] = useState('Restock barang masuk');

  // Metrics
  const totalSku = products.length;
  const safeStockCount = products.filter((p) => p.stock > p.minStock).length;
  const lowStockCount = products.filter((p) => p.stock > 0 && p.stock <= p.minStock).length;
  const outOfStockCount = products.filter((p) => p.stock <= 0).length;

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase());

      let matchStatus = true;
      if (statusFilter === 'safe') matchStatus = p.stock > p.minStock;
      if (statusFilter === 'low') matchStatus = p.stock > 0 && p.stock <= p.minStock;
      if (statusFilter === 'out') matchStatus = p.stock <= 0;

      return matchSearch && matchStatus;
    });
  }, [products, searchQuery, statusFilter]);

  const handleOpenAdjust = (product: Product, type: 'in' | 'out') => {
    setAdjustingProduct(product);
    setAdjustType(type);
    setAdjustAmount(10);
    setAdjustNote(type === 'in' ? 'Penerimaan stok dari supplier' : 'Penyesuaian stok rusak/kadaluarsa');
  };

  const handleSaveAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingProduct) return;

    let newStock = adjustingProduct.stock;
    if (adjustType === 'in') {
      newStock += Number(adjustAmount);
    } else {
      newStock = Math.max(0, newStock - Number(adjustAmount));
    }

    onUpdateStock(adjustingProduct.id, newStock);
    setAdjustingProduct(null);
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h2 className="font-serif-header text-3xl font-bold text-[#201b14]">
          Manajemen Stok & Inventaris
        </h2>
        <p className="text-xs md:text-sm text-[#554339] mt-0.5">
          Pantau ketersediaan barang dan lakukan penyesuaian stok secara langsung.
        </p>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 md:gap-4">
        {/* Total SKU */}
        <div
          onClick={() => setStatusFilter('all')}
          className={`p-4.5 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'all'
              ? 'bg-white border-[#964407] ring-2 ring-[#ffdbca]'
              : 'bg-white border-[#dbc1b5]/40 hover:border-[#964407]/40'
          }`}
        >
          <div className="flex items-center gap-2 mb-2 text-[#554339]">
            <Boxes className="w-4 h-4 text-[#964407]" />
            <span className="text-xs font-semibold">Total SKU</span>
          </div>
          <p className="font-price text-2xl md:text-3xl font-extrabold text-[#201b14]">
            {totalSku}
          </p>
        </div>

        {/* Stok Aman */}
        <div
          onClick={() => setStatusFilter('safe')}
          className={`p-4.5 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'safe'
              ? 'bg-white border-[#059669] ring-2 ring-[#d1fae5]'
              : 'bg-white border-[#dbc1b5]/40 hover:border-[#059669]/40'
          }`}
        >
          <div className="flex items-center gap-2 mb-2 text-[#059669]">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-xs font-semibold">Stok Aman</span>
          </div>
          <p className="font-price text-2xl md:text-3xl font-extrabold text-[#059669]">
            {safeStockCount}
          </p>
        </div>

        {/* Stok Menipis */}
        <div
          onClick={() => setStatusFilter('low')}
          className={`p-4.5 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'low'
              ? 'bg-white border-[#d97706] ring-2 ring-[#fef3c7]'
              : 'bg-white border-[#dbc1b5]/40 hover:border-[#d97706]/40'
          }`}
        >
          <div className="flex items-center gap-2 mb-2 text-[#d97706]">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-xs font-semibold">Stok Menipis</span>
          </div>
          <p className="font-price text-2xl md:text-3xl font-extrabold text-[#d97706]">
            {lowStockCount}
          </p>
        </div>

        {/* Stok Habis */}
        <div
          onClick={() => setStatusFilter('out')}
          className={`p-4.5 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'out'
              ? 'bg-white border-[#ba1a1a] ring-2 ring-[#ffdad6]'
              : 'bg-white border-[#dbc1b5]/40 hover:border-[#ba1a1a]/40'
          }`}
        >
          <div className="flex items-center gap-2 mb-2 text-[#ba1a1a]">
            <AlertOctagon className="w-4 h-4" />
            <span className="text-xs font-semibold">Stok Habis</span>
          </div>
          <p className="font-price text-2xl md:text-3xl font-extrabold text-[#ba1a1a]">
            {outOfStockCount}
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-[#dbc1b5]/40 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#887368]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari SKU atau nama produk..."
            className="w-full pl-9.5 pr-4 py-2 bg-[#fef1e7] border border-[#dbc1b5] rounded-xl text-xs text-[#201b14] placeholder-[#887368] focus:outline-none focus:border-[#964407]"
          />
        </div>

        <div className="flex gap-1.5 flex-wrap w-full sm:w-auto">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              statusFilter === 'all'
                ? 'bg-[#964407] text-white'
                : 'bg-[#f8ece1] text-[#554339] hover:bg-[#ece0d6]'
            }`}
          >
            Semua
          </button>
          <button
            onClick={() => setStatusFilter('safe')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              statusFilter === 'safe'
                ? 'bg-[#059669] text-white'
                : 'bg-[#d1fae5] text-[#065f46] hover:bg-[#a7f3d0]'
            }`}
          >
            Aman
          </button>
          <button
            onClick={() => setStatusFilter('low')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              statusFilter === 'low'
                ? 'bg-[#d97706] text-white'
                : 'bg-[#fef3c7] text-[#92400e] hover:bg-[#fde68a]'
            }`}
          >
            Menipis
          </button>
          <button
            onClick={() => setStatusFilter('out')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              statusFilter === 'out'
                ? 'bg-[#ba1a1a] text-white'
                : 'bg-[#ffdad6] text-[#93000a] hover:bg-[#fecdd3]'
            }`}
          >
            Habis
          </button>
        </div>
      </div>

      {/* Stock Table */}
      <div className="bg-white rounded-2xl border border-[#dbc1b5]/40 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f8ece1]/70 border-b border-[#dbc1b5]/40 text-xs font-bold text-[#645d57]">
                <th className="py-3.5 px-4">Produk</th>
                <th className="py-3.5 px-4">Kategori</th>
                <th className="py-3.5 px-4 text-center">Batas Min</th>
                <th className="py-3.5 px-4 text-center">Stok Saat Ini</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-center">Penyesuaian Cepat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#dbc1b5]/20 text-xs">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#887368]">
                    Tidak ada data stok yang cocok.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const category = categories.find((c) => c.id === p.categoryId);
                  const isOutOfStock = p.stock <= 0;
                  const isLowStock = p.stock > 0 && p.stock <= p.minStock;

                  return (
                    <tr key={p.id} className="hover:bg-[#f8ece1]/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-[#f8ece1] p-1 shrink-0 flex items-center justify-center border border-[#dbc1b5]/30">
                            <img
                              src={p.imageUrl}
                              alt={p.name}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <div>
                            <p className="font-bold text-[#201b14]">{p.name}</p>
                            <span className="text-[10px] font-semibold text-[#887368] uppercase">
                              {p.sku}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-[#554339]">
                        {category?.name || 'Umum'}
                      </td>

                      <td className="py-3 px-4 text-center font-semibold text-[#645d57]">
                        {p.minStock} {p.unit || 'pcs'}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span className="font-price font-extrabold text-sm text-[#201b14]">
                          {p.stock}
                        </span>
                        <span className="text-[10px] text-[#645d57] ml-1">
                          {p.unit || 'pcs'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            isOutOfStock
                              ? 'bg-[#ffdad6] text-[#ba1a1a]'
                              : isLowStock
                              ? 'bg-[#fef3c7] text-[#d97706]'
                              : 'bg-[#d1fae5] text-[#059669]'
                          }`}
                        >
                          {isOutOfStock ? 'Habis' : isLowStock ? 'Menipis' : 'Aman'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenAdjust(p, 'in')}
                            className="px-2.5 py-1 bg-[#ffdbca] hover:bg-[#ffb68e] text-[#964407] rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                            title="Restock / Tambah Stok"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Restock</span>
                          </button>
                          <button
                            onClick={() => handleOpenAdjust(p, 'out')}
                            className="px-2 py-1 bg-[#f8ece1] hover:bg-[#ece0d6] text-[#554339] rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                            title="Kurangi Stok / Koreksi"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
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

      {/* Restock & Adjustment Modal */}
      {adjustingProduct && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-[#dbc1b5]/50">
            <div className="p-4 border-b border-[#dbc1b5]/40 flex justify-between items-center bg-[#fff8f4]">
              <h3 className="font-serif-header text-xl font-bold text-[#201b14]">
                {adjustType === 'in' ? 'Restock Barang Masuk' : 'Kurangi / Koreksi Stok'}
              </h3>
              <button
                onClick={() => setAdjustingProduct(null)}
                className="p-1.5 text-[#645d57] hover:bg-[#ece0d6] rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAdjustment} className="p-5 space-y-4">
              <div className="p-3 bg-[#f8ece1]/70 rounded-xl flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-white p-1 border border-[#dbc1b5]/40 shrink-0">
                  <img
                    src={adjustingProduct.imageUrl}
                    alt={adjustingProduct.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#201b14]">{adjustingProduct.name}</h4>
                  <p className="text-[11px] text-[#645d57]">
                    Stok saat ini: <strong className="text-[#201b14]">{adjustingProduct.stock} {adjustingProduct.unit || 'pcs'}</strong>
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#554339] mb-1">
                  Jumlah {adjustType === 'in' ? 'Penambahan' : 'Pengurangan'} ({adjustingProduct.unit || 'pcs'})
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 border-2 border-[#964407] rounded-xl font-price text-lg font-bold text-[#201b14] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#554339] mb-1">
                  Catatan / Alasan
                </label>
                <input
                  type="text"
                  value={adjustNote}
                  onChange={(e) => setAdjustNote(e.target.value)}
                  placeholder="Restock supplier, koreksi opname, barang rusak"
                  className="w-full px-3.5 py-2 border border-[#dbc1b5] rounded-xl text-xs text-[#201b14] focus:outline-none focus:border-[#964407]"
                />
              </div>

              <div className="pt-3 border-t border-[#dbc1b5]/40 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setAdjustingProduct(null)}
                  className="px-4 py-2 bg-[#f8ece1] hover:bg-[#ece0d6] text-[#554339] rounded-xl text-xs font-bold transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#964407] hover:bg-[#773300] text-white rounded-xl text-xs font-bold shadow-sm transition-all active:scale-95"
                >
                  Konfirmasi Stok
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
