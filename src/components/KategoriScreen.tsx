import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Tag,
  Coffee,
  UtensilsCrossed,
  Sparkles,
  Package,
  Boxes,
  AlertTriangle,
  X,
  Layers,
} from 'lucide-react';
import { Category, Product } from '../types';

interface KategoriScreenProps {
  categories: Category[];
  products: Product[];
  onAddCategory: (category: Omit<Category, 'id'>) => void;
  onUpdateCategory: (category: Category) => void;
  onDeleteCategory: (categoryId: string) => void;
}

export const KategoriScreen: React.FC<KategoriScreenProps> = ({
  categories,
  products,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    iconName: 'coffee',
    bgColor: '#e9ded6',
    textColor: '#69615b',
  });

  const filteredCategories = useMemo(() => {
    return categories.filter(
      (c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [categories, searchQuery]);

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      description: '',
      iconName: 'coffee',
      bgColor: '#e9ded6',
      textColor: '#69615b',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description,
      iconName: category.iconName,
      bgColor: category.bgColor,
      textColor: category.textColor,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Nama kategori tidak boleh kosong');
      return;
    }

    if (editingCategory) {
      onUpdateCategory({
        ...editingCategory,
        ...formData,
      });
    } else {
      onAddCategory(formData);
    }
    setIsModalOpen(false);
  };

  const getProductCountForCategory = (catId: string) => {
    return products.filter((p) => p.categoryId === catId).length;
  };

  const colorPresets = [
    { bg: '#e9ded6', text: '#69615b', label: 'Cokelat Espresso' },
    { bg: '#ffdad8', text: '#792e2f', label: 'Merah Muda Berry' },
    { bg: '#ffdbca', text: '#773300', label: 'Oranye Latte' },
    { bg: '#f2e6dc', text: '#554339', label: 'Krem Kayu' },
    { bg: '#e4d8ce', text: '#362f28', label: 'Abu Tua Netral' },
    { bg: '#d1fae5', text: '#065f46', label: 'Hijau Matcha' },
  ];

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="font-serif-header text-3xl font-bold text-[#201b14]">
              Kategori Produk
            </h2>
            <span className="bg-[#ffdbca] text-[#964407] text-xs font-bold px-2.5 py-1 rounded-full">
              {categories.length} Kategori
            </span>
          </div>
          <p className="text-xs md:text-sm text-[#554339] mt-0.5">
            Atur pengelompokan produk untuk memudahkan kasir mencari menu.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="bg-[#964407] hover:bg-[#773300] text-white px-4 py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Kategori</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-2xl border border-[#dbc1b5]/40 shadow-xs flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#887368]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari kategori..."
            className="w-full pl-9.5 pr-4 py-2 bg-[#fef1e7] border border-[#dbc1b5] rounded-xl text-xs text-[#201b14] placeholder-[#887368] focus:outline-none focus:border-[#964407]"
          />
        </div>
      </div>

      {/* Categories Table / Cards */}
      <div className="bg-white rounded-2xl border border-[#dbc1b5]/40 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f8ece1]/70 border-b border-[#dbc1b5]/40 text-xs font-bold text-[#645d57]">
                <th className="py-3.5 px-4">Nama Kategori</th>
                <th className="py-3.5 px-4">Deskripsi</th>
                <th className="py-3.5 px-4 text-center">Jumlah Produk</th>
                <th className="py-3.5 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#dbc1b5]/20 text-xs">
              {filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-[#887368]">
                    Tidak ada kategori yang ditemukan.
                  </td>
                </tr>
              ) : (
                filteredCategories.map((cat) => {
                  const count = getProductCountForCategory(cat.id);

                  return (
                    <tr key={cat.id} className="hover:bg-[#f8ece1]/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            style={{ backgroundColor: cat.bgColor, color: cat.textColor }}
                            className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 border border-black/5"
                          >
                            <Tag className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-bold text-[#201b14] text-xs md:text-sm">
                              {cat.name}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-[#554339] max-w-md">
                        {cat.description || '-'}
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-[#201b14]">
                        <span className="bg-[#f8ece1] px-3 py-1 rounded-full text-xs font-semibold">
                          {count} Produk
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenEdit(cat)}
                            className="p-1.5 text-[#554339] hover:bg-[#f8ece1] hover:text-[#964407] rounded-lg transition-colors"
                            title="Edit Kategori"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(cat)}
                            className="p-1.5 text-[#ba1a1a] hover:bg-[#ffdad6] rounded-lg transition-colors"
                            title="Hapus Kategori"
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
      </div>

      {/* MODAL: Tambah / Edit Kategori */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-[#dbc1b5]/50">
            <div className="p-4 border-b border-[#dbc1b5]/40 flex justify-between items-center bg-[#fff8f4]">
              <h3 className="font-serif-header text-xl font-bold text-[#201b14]">
                {editingCategory ? 'Edit Kategori' : 'Tambah Kategori Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-[#645d57] hover:bg-[#ece0d6] rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#554339] mb-1">
                  Nama Kategori *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: Minuman Kopi"
                  className="w-full px-3.5 py-2 border border-[#dbc1b5] rounded-xl text-xs text-[#201b14] focus:outline-none focus:border-[#964407]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#554339] mb-1">
                  Deskripsi Singkat
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Deskripsi kategori atau jenis menu..."
                  className="w-full px-3.5 py-2 border border-[#dbc1b5] rounded-xl text-xs text-[#201b14] focus:outline-none focus:border-[#964407]"
                />
              </div>

              {/* Color Scheme Picker */}
              <div>
                <label className="block text-xs font-bold text-[#554339] mb-1.5">
                  Warna Label Kategori
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {colorPresets.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          bgColor: preset.bg,
                          textColor: preset.text,
                        })
                      }
                      style={{ backgroundColor: preset.bg, color: preset.text }}
                      className={`p-2 rounded-xl text-[11px] font-bold border transition-all ${
                        formData.bgColor === preset.bg
                          ? 'ring-2 ring-[#964407] border-[#964407] scale-105'
                          : 'border-transparent opacity-85 hover:opacity-100'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
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
                  {editingCategory ? 'Simpan Perubahan' : 'Tambah Kategori'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EXACT DIALOG FROM SCREENSHOT: Hapus Kategori? */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl border border-[#ffdad6] space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#ffdad6] rounded-xl text-[#ba1a1a]">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="font-serif-header text-2xl font-bold text-[#201b14]">
                Hapus Kategori?
              </h3>
            </div>

            <p className="text-xs md:text-sm text-[#554339] leading-relaxed">
              Apakah Anda yakin ingin menghapus kategori{' '}
              <strong className="text-[#201b14]">"{deleteTarget.name}"</strong>?
              Tindakan ini tidak dapat dibatalkan dan produk dalam kategori ini akan
              dipindahkan ke kategori default.
            </p>

            <div className="flex justify-end gap-3 pt-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-5 py-2.5 bg-[#f8ece1] text-[#554339] text-xs font-bold rounded-xl hover:bg-[#ece0d6] transition-colors"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  onDeleteCategory(deleteTarget.id);
                  setDeleteTarget(null);
                }}
                className="px-5 py-2.5 bg-[#ba1a1a] text-white text-xs font-bold rounded-xl hover:bg-[#93000a] shadow-sm transition-all active:scale-95"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
