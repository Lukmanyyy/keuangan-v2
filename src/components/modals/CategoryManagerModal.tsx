import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  Edit2,
  Check,
  Search,
  Sparkles,
  RotateCcw,
  ArrowLeft,
} from 'lucide-react';
import {
  CategoryItem,
  CATEGORY_ICON_OPTIONS,
  CATEGORY_COLORS,
  DEFAULT_CATEGORIES,
  getCategoryIconComponent,
  getCategoryColorMeta,
} from '../../data/categories';

interface CategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: CategoryItem[];
  onSaveCategories: (updated: CategoryItem[]) => void;
  initialEditingCategory?: CategoryItem | null;
  onSelectCategory?: (categoryName: string) => void;
  initialType?: 'pengeluaran' | 'pemasukan';
}

export const CategoryManagerModal: React.FC<CategoryManagerModalProps> = ({
  isOpen,
  onClose,
  categories,
  onSaveCategories,
  initialEditingCategory,
  onSelectCategory,
  initialType = 'pengeluaran',
}) => {
  const [activeTabType, setActiveTabType] = useState<'pengeluaran' | 'pemasukan'>(
    initialEditingCategory?.type || initialType
  );
  const [mode, setMode] = useState<'list' | 'editor'>(
    initialEditingCategory ? 'editor' : 'list'
  );
  const [editingId, setEditingId] = useState<string | null>(
    initialEditingCategory ? initialEditingCategory.id : null
  );

  // Editor states
  const [name, setName] = useState(initialEditingCategory ? initialEditingCategory.name : '');
  const [selectedColor, setSelectedColor] = useState(
    initialEditingCategory ? initialEditingCategory.color : 'indigo'
  );
  const [selectedIcon, setSelectedIcon] = useState(
    initialEditingCategory ? initialEditingCategory.icon : 'ShoppingBag'
  );

  // Icon search & group filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string>('Semua');

  // Confirmation state for deleting
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Sync state whenever modal opens or initial context changes
  useEffect(() => {
    if (isOpen) {
      if (initialEditingCategory) {
        setMode('editor');
        setEditingId(initialEditingCategory.id);
        setName(initialEditingCategory.name);
        setSelectedColor(initialEditingCategory.color || 'indigo');
        setSelectedIcon(initialEditingCategory.icon || 'ShoppingBag');
        setActiveTabType(initialEditingCategory.type || initialType);
      } else {
        setMode('list');
        setEditingId(null);
        setName('');
        setActiveTabType(initialType);
      }
      setErrorMessage('');
      setDeleteConfirmId(null);
    }
  }, [isOpen, initialType, initialEditingCategory]);

  if (!isOpen) return null;

  const groups = [
    'Semua',
    'Makanan & Minuman',
    'Belanja & Mall',
    'Transportasi',
    'Hiburan',
    'Tagihan & Rumah',
    'Kesehatan',
    'Karir & Edukasi',
    'Finansial',
    'Keluarga & Lainnya',
  ];

  const filteredIcons = CATEGORY_ICON_OPTIONS.filter((opt) => {
    const matchesGroup = selectedGroup === 'Semua' || opt.group === selectedGroup;
    const matchesSearch =
      !searchQuery.trim() ||
      opt.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opt.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opt.group.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesGroup && matchesSearch;
  });

  const handleOpenAdd = () => {
    setEditingId(null);
    setName('');
    setSelectedColor('indigo');
    setSelectedIcon(activeTabType === 'pemasukan' ? 'Wallet' : 'ShoppingBag');
    setSearchQuery('');
    setSelectedGroup('Semua');
    setErrorMessage('');
    setMode('editor');
  };

  const handleOpenEdit = (cat: CategoryItem) => {
    setEditingId(cat.id);
    setName(cat.name);
    setSelectedColor(cat.color || 'indigo');
    setSelectedIcon(cat.icon || 'Utensils');
    if (cat.type) {
      setActiveTabType(cat.type);
    }
    setSearchQuery('');
    setSelectedGroup('Semua');
    setErrorMessage('');
    setMode('editor');
  };

  const handleDeleteCategory = (catId: string) => {
    const listInType = categories.filter((c) => (c.type || 'pengeluaran') === activeTabType);
    if (listInType.length <= 1) {
      setErrorMessage(`Minimal harus ada 1 kategori untuk ${activeTabType}.`);
      return;
    }
    const updated = categories.filter((c) => c.id !== catId);
    onSaveCategories(updated);
    setDeleteConfirmId(null);
    if (editingId === catId) {
      setMode('list');
      setEditingId(null);
    }
  };

  const handleResetDefaults = () => {
    onSaveCategories(DEFAULT_CATEGORIES);
    setDeleteConfirmId(null);
    setErrorMessage('');
  };

  const handleSaveEditor = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setErrorMessage('Nama kategori tidak boleh kosong.');
      return;
    }

    // Check duplicate name within same category type
    const isDuplicate = categories.some(
      (c) =>
        (c.type || 'pengeluaran') === activeTabType &&
        c.name.toLowerCase() === trimmed.toLowerCase() &&
        c.id !== editingId
    );
    if (isDuplicate) {
      setErrorMessage(`Kategori ${activeTabType} dengan nama ini sudah ada.`);
      return;
    }

    let updated: CategoryItem[];
    if (editingId) {
      // Update existing
      updated = categories.map((c) => {
        if (c.id === editingId) {
          return {
            ...c,
            name: trimmed,
            color: selectedColor,
            icon: selectedIcon,
            type: activeTabType,
          };
        }
        return c;
      });
    } else {
      // Add new
      const newCat: CategoryItem = {
        id: 'cat_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        name: trimmed,
        color: selectedColor,
        icon: selectedIcon,
        type: activeTabType,
        isCustom: true,
      };
      updated = [...categories, newCat];
      if (onSelectCategory) {
        onSelectCategory(trimmed);
      }
    }

    onSaveCategories(updated);
    setMode('list');
    setEditingId(null);
    setErrorMessage('');
  };

  const currentColorMeta = getCategoryColorMeta(selectedColor);
  const CurrentPreviewIcon = getCategoryIconComponent(selectedIcon);

  const displayedCategories = categories.filter(
    (c) => (c.type || 'pengeluaran') === activeTabType
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Top Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-2.5">
            {mode === 'editor' && (
              <button
                type="button"
                onClick={() => {
                  setMode('list');
                  setEditingId(null);
                  setErrorMessage('');
                }}
                className="w-8 h-8 rounded-full hover:bg-slate-200/80 flex items-center justify-center text-slate-600 transition-colors cursor-pointer mr-1"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div>
              <h3 className="font-extrabold text-base text-slate-900">
                {mode === 'editor'
                  ? editingId
                    ? `Edit Kategori ${activeTabType === 'pemasukan' ? 'Pemasukan' : 'Pengeluaran'}`
                    : `Tambah Kategori ${activeTabType === 'pemasukan' ? 'Pemasukan' : 'Pengeluaran'}`
                  : `Kelola Kategori ${activeTabType === 'pemasukan' ? 'Pemasukan' : 'Pengeluaran'}`}
              </h3>
              <p className="text-[11px] text-slate-500">
                {mode === 'editor'
                  ? `Atur nama, warna aksen, dan pilih variasi logo untuk ${activeTabType}`
                  : `Tersedia ${displayedCategories.length} kategori ${activeTabType} yang siap digunakan`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-200/80 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 flex items-center justify-between">
              <span>{errorMessage}</span>
              <button
                type="button"
                onClick={() => setErrorMessage('')}
                className="text-rose-500 hover:text-rose-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {mode === 'list' ? (
            /* ================= VIEW: LIST CATEGORIES ================= */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">
                  Daftar Kategori {activeTabType === 'pemasukan' ? 'Pemasukan' : 'Pengeluaran'}
                </span>
                <button
                  type="button"
                  onClick={handleOpenAdd}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95 ${
                    activeTabType === 'pemasukan'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Tambah Baru</span>
                </button>
              </div>

              {/* Grid of existing categories */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {displayedCategories.map((cat) => {
                  const IconComp = getCategoryIconComponent(cat.icon);
                  const colorMeta = getCategoryColorMeta(cat.color);
                  const isConfirmingDelete = deleteConfirmId === cat.id;

                  return (
                    <div
                      key={cat.id}
                      className="p-3 rounded-2xl border border-slate-200/80 bg-white hover:border-slate-300 transition-all flex items-center justify-between group shadow-2xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${colorMeta.bgClass} ${colorMeta.textClass} border ${colorMeta.borderClass}`}
                        >
                          <IconComp className="w-5 h-5" />
                        </div>
                        <div className="truncate">
                          <span className="text-xs font-bold text-slate-800 block truncate">
                            {cat.name}
                          </span>
                          <span className="text-[10px] text-slate-400 capitalize">
                            Ikon: {cat.icon}
                          </span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1 shrink-0 ml-2">
                        {isConfirmingDelete ? (
                          <div className="flex items-center gap-1 bg-rose-50 p-1 rounded-xl border border-rose-200">
                            <button
                              type="button"
                              onClick={() => handleDeleteCategory(cat.id)}
                              className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold rounded-lg cursor-pointer transition-colors"
                            >
                              Hapus
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteConfirmId(null)}
                              className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 text-[10px] font-bold rounded-lg cursor-pointer transition-colors"
                            >
                              Batal
                            </button>
                          </div>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(cat)}
                              title="Edit Kategori"
                              className="w-8 h-8 rounded-xl hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 flex items-center justify-center transition-colors cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteConfirmId(cat.id)}
                              title="Hapus Kategori"
                              className="w-8 h-8 rounded-xl hover:bg-rose-50 text-slate-400 hover:text-rose-600 flex items-center justify-center transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Reset to defaults footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <button
                  type="button"
                  onClick={handleResetDefaults}
                  className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-800 font-semibold cursor-pointer py-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Pulihkan Kategori Bawaan</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Selesai
                </button>
              </div>
            </div>
          ) : (
            /* ================= VIEW: EDITOR (ADD / EDIT) ================= */
            <form onSubmit={handleSaveEditor} className="space-y-4">
              {/* Live Preview Card */}
              <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                    Tampilan Tombol di Aplikasi
                  </span>
                  <span className="text-xs text-slate-600">
                    Ini bentuk tombol kategori yang akan muncul saat input transaksi:
                  </span>
                </div>
                <div
                  className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border transition-all min-w-[90px] shadow-xs ${currentColorMeta.bgClass} ${currentColorMeta.borderClass} ${currentColorMeta.textClass}`}
                >
                  <div className="mb-1">
                    <CurrentPreviewIcon className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-bold leading-tight truncate max-w-[100px] text-center">
                    {name.trim() || 'Nama Kategori'}
                  </span>
                </div>
              </div>

              {/* 1. Category Name Input */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Nama Kategori <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="Contoh: Skincare & Kosmetik, Kucing, Zakat..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  autoFocus
                  required
                />
              </div>

              {/* 2. Color Palette */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Warna Aksen Kategori
                </label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORY_COLORS.map((col) => {
                    const isSelected = selectedColor === col.id;
                    return (
                      <button
                        type="button"
                        key={col.id}
                        onClick={() => setSelectedColor(col.id)}
                        className={`w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                          isSelected
                            ? 'ring-2 ring-offset-2 ' + col.ringClass + ' scale-110 shadow-xs'
                            : 'hover:scale-105 opacity-85 hover:opacity-100'
                        }`}
                        style={{ backgroundColor: col.hex }}
                        title={col.name}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Icon Library Picker */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">
                    Pilih Logo / Ikon Kategori
                  </label>
                  <span className="text-[10px] text-slate-400 font-semibold">
                    {filteredIcons.length} variasi logo
                  </span>
                </div>

                {/* Search Bar */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari logo (misal: kopi, baju, bensin, ojol, dokter, pet)..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Group Filter Chips */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
                  {groups.map((grp) => {
                    const isGrp = selectedGroup === grp;
                    return (
                      <button
                        type="button"
                        key={grp}
                        onClick={() => setSelectedGroup(grp)}
                        className={`px-2.5 py-1 rounded-lg font-bold shrink-0 transition-colors cursor-pointer ${
                          isGrp
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                        }`}
                      >
                        {grp}
                      </button>
                    );
                  })}
                </div>

                {/* Icons Grid */}
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-48 overflow-y-auto p-1 border border-slate-100 rounded-2xl bg-slate-50/50">
                  {filteredIcons.map((opt) => {
                    const Icon = opt.icon;
                    const isSelected = selectedIcon === opt.id;

                    return (
                      <button
                        type="button"
                        key={opt.id}
                        onClick={() => setSelectedIcon(opt.id)}
                        title={opt.label}
                        className={`p-2 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer text-center group ${
                          isSelected
                            ? `${currentColorMeta.bgClass} ${currentColorMeta.borderClass} ${currentColorMeta.textClass} ring-2 ${currentColorMeta.ringClass}/40 shadow-xs scale-102`
                            : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-100/60 text-slate-600'
                        }`}
                      >
                        <Icon
                          className={`w-5 h-5 mb-1 transition-transform group-hover:scale-110 ${
                            isSelected ? currentColorMeta.textClass : 'text-slate-600'
                          }`}
                        />
                        <span className="text-[9px] font-medium leading-tight truncate w-full">
                          {opt.label.split('/')[0].trim()}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                {editingId && (
                  <button
                    type="button"
                    onClick={() => handleDeleteCategory(editingId)}
                    className="px-3 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold rounded-xl text-xs transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus Kategori</span>
                  </button>
                )}
                <div className="flex items-center gap-2 ml-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('list');
                      setEditingId(null);
                    }}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-indigo-500/25 cursor-pointer active:scale-98 flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4 stroke-[2.5]" />
                    <span>{editingId ? 'Simpan Perubahan' : 'Buat Kategori'}</span>
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
