import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Filter,
  Image as ImageIcon,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  X,
  Check,
  Package,
} from 'lucide-react';
import { Category, Product } from '../types';
import { formatCurrency } from '../utils/format';

interface ProdukScreenProps {
  products: Product[];
  categories: Category[];
  onAddProduct: (product: Omit<Product, 'id'>) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
}

export const ProdukScreen: React.FC<ProdukScreenProps> = ({
  products,
  categories,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State for Add / Edit
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    categoryId: categories[0]?.id || '',
    price: 15000,
    stock: 20,
    minStock: 5,
    unit: 'pcs',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCA_2ICXQcEPEOJKPS-rxojW9XYb8F5RANx7SLVJqn33YHpOfL9jvuGlKQ0-rGV2hNJt7a_kkLgRAqITPaiWvEmupG2OadxJ_0GY1tFQMnGvbVhxQDO7Tl0yI06-T8PTtU4LX_7UIto5RaoczR3kkVDw19v1LuU3hhJa7b1ouY1UHR8jbmUxKfzcLEJia2KA0S1QQwwx34QvNSXBuZJcEwZruXHHVqLgSViwhS7etEGae1jcJ1-Cg8',
  });

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCat =
        selectedCategory === 'all' || p.categoryId === selectedCategory;
      const matchSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  // Open modal for Create
  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      sku: `SKU-${Math.floor(100 + Math.random() * 900)}`,
      categoryId: categories[0]?.id || '',
      price: 15000,
      stock: 20,
      minStock: 5,
      unit: 'pcs',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCA_2ICXQcEPEOJKPS-rxojW9XYb8F5RANx7SLVJqn33YHpOfL9jvuGlKQ0-rGV2hNJt7a_kkLgRAqITPaiWvEmupG2OadxJ_0GY1tFQMnGvbVhxQDO7Tl0yI06-T8PTtU4LX_7UIto5RaoczR3kkVDw19v1LuU3hhJa7b1ouY1UHR8jbmUxKfzcLEJia2KA0S1QQwwx34QvNSXBuZJcEwZruXHHVqLgSViwhS7etEGae1jcJ1-Cg8',
    });
    setIsModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      sku: product.sku,
      categoryId: product.categoryId,
      price: product.price,
      stock: product.stock,
      minStock: product.minStock,
      unit: product.unit || 'pcs',
      imageUrl: product.imageUrl,
    });
    setIsModalOpen(true);
  };

  // Submit Handler
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Nama produk tidak boleh kosong');
      return;
    }

    if (editingProduct) {
      onUpdateProduct({
        ...editingProduct,
        ...formData,
      });
    } else {
      onAddProduct(formData);
    }
    setIsModalOpen(false);
  };

  const sampleImages = [
    { label: 'Kopi Susu', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCA_2ICXQcEPEOJKPS-rxojW9XYb8F5RANx7SLVJqn33YHpOfL9jvuGlKQ0-rGV2hNJt7a_kkLgRAqITPaiWvEmupG2OadxJ_0GY1tFQMnGvbVhxQDO7Tl0yI06-T8PTtU4LX_7UIto5RaoczR3kkVDw19v1LuU3hhJa7b1ouY1UHR8jbmUxKfzcLEJia2KA0S1QQwwx34QvNSXBuZJcEwZruXHHVqLgSViwhS7etEGae1jcJ1-Cg8' },
    { label: 'Keripik', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAiGU9bFM9aE5LXuO67gLn5Maon0nmtH9FHB5EP7lar7vs39XIFMaCq820qMTTVBJdy8vSjJmOGQDhCa6wK5R1K5nmzXC2QxZl6kJR9o66DLczlPxE4L1o8AmGGluwrRtkblod_E8x0grM9ZDbJ9QQNisFFYQJfSvSSuJLQyvEDYsh02PCmnCgU4yHOcaN2CXDR4V_9ORuiBLzOg0nzzslPe1cMXqjFeusllUMWmSPAHSs0BOhYkoQ' },
    { label: 'Air Mineral', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA-t1xlDoAnlWqKENXKSIEQ_L4eP8ckBO4MGHJGf8X1C6rG_cEudS0KjnwJW2kww2mlQTxgc8DqS9CgwvCl0Ptfki_EI8qtL9NoQoeR4fQbvfDk0MlVBiA1BprsdgM7925s3NJ3VEZeWvL8iDHDNAAPaU5x5Rgju_grTDh_sEPI1A3fHWRl7It4ix7B07RJ1WEIUhcrFFMuqUaS_RrTSZWBv-aiHqa9ghxqm7fykDeXGpg5rI0dGq8' },
    { label: 'Roti Bakar', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDrkTTge7cWOHeaeHKpepYOtY6D0E1fa79LvP4vPnmMMozRV8hhuBeY466ZVcsOxb__MFZJH_WkeMJUVIfi-98kxQp5Or1YSYSgKbBaIAFVXs4gN19pTrJXiHXxpuQNqd0Drweao4dNXVbeDzgEqgDybwfDSQ3v_QXSh0Lnfexha3-2cD418SLE6eWsOOrttfqKEQ-XGQFkz3vyLcqZQ6NWjWjGxqYnSxsYNVXiRu2HqRqRyYOm3zQ' },
    { label: 'Croissant', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC2MelULSUKL_Z1nVgu4g8QgyZjDdT-CVs3fCnM90AbgdKEOo4qxN3Xnwl3L6P2dEhf_zlTuxcLofPdE8dnfz2GnH1nw5xZTu1ZLe0VLmozEReqPL6r9ljQFwNMgkHm_ICX5XH_0XnVTH_TNqj6tDrl5Fmo5qWAF01LDZK61uwvizSQGt_lLTjFngUcx2vQoASKakBpYJ5oKedECc0MEysI1RHOho4UZBlECpff7GqR8cNA8W0k-zQ' },
    { label: 'Matcha', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAfTX6ps3GmjQ5Q6x2oxq6xfeApGGdFNcAE224uNKK7g11e31PObYnZi8o7eMW8jjdgfw1ntahLaUzPENaZKAN3u-nrh3kmHv-vsOKqiyU5R8GYA1EbuIdVoJeN71Vr3xzS6rBZdk7OYLkRNhv-3_TOSJldTnLxv3Riu2rsVBf5xr55zMcSWLnP6toGUGh-enmh-85aTKlzey6Vpzbfjb1czhsf8GXiyLHOEDujcbal5UhUgTK8HU8' },
  ];

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif-header text-3xl font-bold text-[#201b14]">
            Daftar Produk
          </h2>
          <p className="text-xs md:text-sm text-[#554339] mt-0.5">
            Kelola katalog menu, harga jual, dan stok barang di toko Anda.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="bg-[#964407] hover:bg-[#773300] text-white px-4 py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Produk</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#dbc1b5]/40 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#887368]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari produk atau SKU..."
            className="w-full pl-9.5 pr-4 py-2 bg-[#fef1e7] border border-[#dbc1b5] rounded-xl text-xs text-[#201b14] placeholder-[#887368] focus:outline-none focus:border-[#964407] transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-[#887368]" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="flex-1 sm:flex-none px-3 py-2 bg-[#fef1e7] border border-[#dbc1b5] rounded-xl text-xs font-semibold text-[#201b14] focus:outline-none focus:border-[#964407]"
          >
            <option value="all">Semua Kategori</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Product Table */}
      <div className="bg-white rounded-2xl border border-[#dbc1b5]/40 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f8ece1]/70 border-b border-[#dbc1b5]/40 text-xs font-bold text-[#645d57]">
                <th className="py-3.5 px-4">Produk</th>
                <th className="py-3.5 px-4">Kategori</th>
                <th className="py-3.5 px-4 font-price">Harga Jual</th>
                <th className="py-3.5 px-4">Status Stok</th>
                <th className="py-3.5 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#dbc1b5]/20 text-xs">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-[#887368]">
                    Tidak ada produk yang sesuai dengan filter.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const category = categories.find((c) => c.id === p.categoryId);
                  const isOutOfStock = p.stock <= 0;
                  const isLowStock = p.stock > 0 && p.stock <= p.minStock;

                  return (
                    <tr key={p.id} className="hover:bg-[#f8ece1]/40 transition-colors">
                      {/* Product details */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-lg bg-[#f8ece1] border border-[#dbc1b5]/40 overflow-hidden shrink-0 flex items-center justify-center p-1">
                            <img
                              src={p.imageUrl}
                              alt={p.name}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <div>
                            <p className="font-bold text-[#201b14] text-xs md:text-sm">
                              {p.name}
                            </p>
                            <span className="text-[10px] font-semibold text-[#887368] uppercase tracking-wider">
                              {p.sku}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4">
                        <span
                          style={{
                            backgroundColor: category?.bgColor || '#f8ece1',
                            color: category?.textColor || '#554339',
                          }}
                          className="px-2.5 py-1 rounded-full text-[10px] font-bold inline-block"
                        >
                          {category?.name || 'Umum'}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="py-3 px-4 font-price font-bold text-[#201b14]">
                        {formatCurrency(p.price)}
                      </td>

                      {/* Stock Status */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              isOutOfStock
                                ? 'bg-[#ffdad6] text-[#ba1a1a]'
                                : isLowStock
                                ? 'bg-[#fef3c7] text-[#d97706]'
                                : 'bg-[#d1fae5] text-[#059669]'
                            }`}
                          >
                            {isOutOfStock
                              ? 'Habis (0)'
                              : isLowStock
                              ? `Menipis (${p.stock} ${p.unit || 'pcs'})`
                              : `Aman (${p.stock} ${p.unit || 'pcs'})`}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenEditModal(p)}
                            className="p-1.5 text-[#554339] hover:bg-[#f8ece1] hover:text-[#964407] rounded-lg transition-colors"
                            title="Edit Produk"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(p.id)}
                            className="p-1.5 text-[#ba1a1a] hover:bg-[#ffdad6] rounded-lg transition-colors"
                            title="Hapus Produk"
                          >
                            <Trash2 className="w-4 h-4" />
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

        {/* Footer pagination info */}
        <div className="p-4 border-t border-[#dbc1b5]/30 flex items-center justify-between text-xs text-[#645d57]">
          <span>Menampilkan {filteredProducts.length} dari {products.length} produk</span>
        </div>
      </div>

      {/* MODAL: Tambah / Edit Produk */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-[#dbc1b5]/50">
            <div className="p-4 border-b border-[#dbc1b5]/40 flex justify-between items-center bg-[#fff8f4]">
              <h3 className="font-serif-header text-xl font-bold text-[#201b14]">
                {editingProduct ? 'Edit Produk' : 'Tambah Produk Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-[#645d57] hover:bg-[#ece0d6] rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-5 overflow-y-auto space-y-4">
              {/* Product Photo Selector */}
              <div>
                <label className="block text-xs font-bold text-[#554339] mb-1.5">
                  Foto Produk
                </label>
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-xl bg-[#f8ece1] border border-[#dbc1b5] overflow-hidden p-1 shrink-0 flex items-center justify-center">
                    {formData.imageUrl ? (
                      <img
                        src={formData.imageUrl}
                        alt="Preview"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-[#887368]" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <p className="text-[11px] text-[#645d57]">Pilih template foto:</p>
                    <div className="flex gap-1.5 flex-wrap">
                      {sampleImages.map((s, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setFormData({ ...formData, imageUrl: s.url })}
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${
                            formData.imageUrl === s.url
                              ? 'bg-[#964407] text-white border-[#964407]'
                              : 'bg-[#fef1e7] text-[#554339] border-[#dbc1b5]'
                          }`}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-[#554339] mb-1">
                  Nama Produk *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: Kopi Susu Gula Aren 250ml"
                  className="w-full px-3.5 py-2 border border-[#dbc1b5] rounded-xl text-xs text-[#201b14] focus:outline-none focus:border-[#964407]"
                />
              </div>

              {/* SKU & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#554339] mb-1">
                    Kode SKU *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="Contoh: MIN-KSGA-001"
                    className="w-full px-3.5 py-2 border border-[#dbc1b5] rounded-xl text-xs font-mono uppercase text-[#201b14] focus:outline-none focus:border-[#964407]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#554339] mb-1">
                    Kategori *
                  </label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full px-3.5 py-2 border border-[#dbc1b5] rounded-xl text-xs font-medium text-[#201b14] focus:outline-none focus:border-[#964407]"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Price & Unit */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#554339] mb-1">
                    Harga Jual (Rp) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 border border-[#dbc1b5] rounded-xl text-xs font-price font-bold text-[#201b14] focus:outline-none focus:border-[#964407]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#554339] mb-1">
                    Satuan
                  </label>
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    placeholder="pcs, btl, cup, porsi"
                    className="w-full px-3.5 py-2 border border-[#dbc1b5] rounded-xl text-xs text-[#201b14] focus:outline-none focus:border-[#964407]"
                  />
                </div>
              </div>

              {/* Stock & Min Stock Alert */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#554339] mb-1">
                    Jumlah Stok
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 border border-[#dbc1b5] rounded-xl text-xs font-bold text-[#201b14] focus:outline-none focus:border-[#964407]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#554339] mb-1">
                    Batas Peringatan Stok
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.minStock}
                    onChange={(e) => setFormData({ ...formData, minStock: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 border border-[#dbc1b5] rounded-xl text-xs font-bold text-[#201b14] focus:outline-none focus:border-[#964407]"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-[#dbc1b5]/40 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-[#f8ece1] hover:bg-[#ece0d6] text-[#554339] rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#964407] hover:bg-[#773300] text-white rounded-xl text-xs font-bold shadow-sm transition-all active:scale-95 cursor-pointer"
                >
                  {editingProduct ? 'Simpan Perubahan' : 'Tambah Produk'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-sm rounded-2xl p-5 shadow-2xl border border-[#ffdad6] space-y-4">
            <div className="flex items-center gap-3 text-[#ba1a1a]">
              <div className="p-2.5 bg-[#ffdad6] rounded-xl">
                <AlertTriangle className="w-6 h-6 text-[#ba1a1a]" />
              </div>
              <h3 className="font-serif-header text-xl font-bold text-[#201b14]">
                Hapus Produk?
              </h3>
            </div>
            <p className="text-xs text-[#554339]">
              Produk ini akan dihapus permanen dari daftar dan tidak akan muncul di layar kasir.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 bg-[#f8ece1] text-[#554339] text-xs font-bold rounded-xl hover:bg-[#ece0d6]"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  onDeleteProduct(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="px-4 py-2 bg-[#ba1a1a] text-white text-xs font-bold rounded-xl hover:bg-[#93000a] shadow-sm"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
