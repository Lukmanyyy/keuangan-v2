import React from 'react';
import {
  Utensils,
  Coffee,
  Pizza,
  IceCream,
  Apple,
  Cake,
  Wine,
  Beer,
  Fish,
  ShoppingBag,
  ShoppingCart,
  Shirt,
  Package,
  Gift,
  Tag,
  Sparkles,
  Smartphone,
  Car,
  Bike,
  Bus,
  Plane,
  Train,
  Fuel,
  Navigation,
  MapPin,
  Palmtree,
  Gamepad2,
  Film,
  Video,
  Music,
  Tv,
  Camera,
  Trophy,
  Headphones,
  Smile,
  Receipt,
  Zap,
  Droplet,
  Wifi,
  Home,
  Key,
  Hammer,
  Flame,
  Heart,
  Activity,
  Dumbbell,
  Pill,
  Stethoscope,
  ShieldCheck,
  GraduationCap,
  Briefcase,
  BookOpen,
  Laptop,
  Building,
  Award,
  TrendingUp,
  Wallet,
  CreditCard,
  PiggyBank,
  Coins,
  DollarSign,
  Landmark,
  Dog,
  Cat,
  Baby,
  MoreHorizontal,
  LucideIcon,
} from 'lucide-react';

export interface CategoryItem {
  id: string;
  name: string;
  icon: string;
  color: string; // 'rose' | 'orange' | 'amber' | 'emerald' | 'teal' | 'sky' | 'blue' | 'indigo' | 'purple' | 'pink' | 'slate'
  type?: 'pengeluaran' | 'pemasukan';
  isCustom?: boolean;
}

export interface IconOption {
  id: string;
  label: string;
  group: string;
  icon: LucideIcon;
}

export const CATEGORY_ICON_OPTIONS: IconOption[] = [
  // Makanan & Minuman
  { id: 'Utensils', label: 'Makan / Resto', group: 'Makanan & Minuman', icon: Utensils },
  { id: 'Coffee', label: 'Kopi / Cafe', group: 'Makanan & Minuman', icon: Coffee },
  { id: 'Pizza', label: 'Pizza / Fast Food', group: 'Makanan & Minuman', icon: Pizza },
  { id: 'IceCream', label: 'Snack / Dessert', group: 'Makanan & Minuman', icon: IceCream },
  { id: 'Apple', label: 'Buah / Sayur', group: 'Makanan & Minuman', icon: Apple },
  { id: 'Cake', label: 'Kue / Roti', group: 'Makanan & Minuman', icon: Cake },
  { id: 'Wine', label: 'Minuman / Bar', group: 'Makanan & Minuman', icon: Wine },
  { id: 'Beer', label: 'Nongkrong', group: 'Makanan & Minuman', icon: Beer },
  { id: 'Fish', label: 'Seafood / Pasar', group: 'Makanan & Minuman', icon: Fish },

  // Belanja & Kebutuhan
  { id: 'ShoppingBag', label: 'Belanja Harian', group: 'Belanja & Mall', icon: ShoppingBag },
  { id: 'ShoppingCart', label: 'Supermarket', group: 'Belanja & Mall', icon: ShoppingCart },
  { id: 'Shirt', label: 'Pakaian / Fashion', group: 'Belanja & Mall', icon: Shirt },
  { id: 'Package', label: 'Paket / Kurir', group: 'Belanja & Mall', icon: Package },
  { id: 'Gift', label: 'Kado / Hadiah', group: 'Belanja & Mall', icon: Gift },
  { id: 'Tag', label: 'Diskon / Promo', group: 'Belanja & Mall', icon: Tag },
  { id: 'Sparkles', label: 'Skincare / Kosmetik', group: 'Belanja & Mall', icon: Sparkles },
  { id: 'Smartphone', label: 'Gadget / Elektronik', group: 'Belanja & Mall', icon: Smartphone },

  // Transportasi & Jalan
  { id: 'Car', label: 'Mobil / Ojol', group: 'Transportasi', icon: Car },
  { id: 'Bike', label: 'Motor / Sepeda', group: 'Transportasi', icon: Bike },
  { id: 'Bus', label: 'Bus / Angkot', group: 'Transportasi', icon: Bus },
  { id: 'Fuel', label: 'Bensin / SPBU', group: 'Transportasi', icon: Fuel },
  { id: 'Train', label: 'Kereta / KRL', group: 'Transportasi', icon: Train },
  { id: 'Plane', label: 'Pesawat / Travel', group: 'Transportasi', icon: Plane },
  { id: 'Navigation', label: 'Tol / Navigasi', group: 'Transportasi', icon: Navigation },
  { id: 'MapPin', label: 'Perjalanan', group: 'Transportasi', icon: MapPin },
  { id: 'Palmtree', label: 'Liburan / Wisata', group: 'Transportasi', icon: Palmtree },

  // Hiburan & Hobi
  { id: 'Gamepad2', label: 'Game / Topup', group: 'Hiburan', icon: Gamepad2 },
  { id: 'Film', label: 'Bioskop / Cinema', group: 'Hiburan', icon: Film },
  { id: 'Video', label: 'Streaming / TV', group: 'Hiburan', icon: Video },
  { id: 'Music', label: 'Musik / Konser', group: 'Hiburan', icon: Music },
  { id: 'Tv', label: 'Langganan TV', group: 'Hiburan', icon: Tv },
  { id: 'Camera', label: 'Fotografi / Hobi', group: 'Hiburan', icon: Camera },
  { id: 'Trophy', label: 'Prestasi / Lomba', group: 'Hiburan', icon: Trophy },
  { id: 'Headphones', label: 'Podcast / Audio', group: 'Hiburan', icon: Headphones },
  { id: 'Smile', label: 'Self Reward', group: 'Hiburan', icon: Smile },

  // Tagihan & Rumah Tangga
  { id: 'Receipt', label: 'Tagihan Rutin', group: 'Tagihan & Rumah', icon: Receipt },
  { id: 'Zap', label: 'Listrik / PLN', group: 'Tagihan & Rumah', icon: Zap },
  { id: 'Droplet', label: 'Air / PDAM', group: 'Tagihan & Rumah', icon: Droplet },
  { id: 'Wifi', label: 'Wifi / Internet', group: 'Tagihan & Rumah', icon: Wifi },
  { id: 'Home', label: 'Sewa / Rumah', group: 'Tagihan & Rumah', icon: Home },
  { id: 'Key', label: 'Kos / Kontrakan', group: 'Tagihan & Rumah', icon: Key },
  { id: 'Hammer', label: 'Renovasi / Alat', group: 'Tagihan & Rumah', icon: Hammer },
  { id: 'Flame', label: 'Gas LPG', group: 'Tagihan & Rumah', icon: Flame },

  // Kesehatan & Kebugaran
  { id: 'Heart', label: 'Kesehatan Umum', group: 'Kesehatan', icon: Heart },
  { id: 'Activity', label: 'Pemeriksaan Dokter', group: 'Kesehatan', icon: Activity },
  { id: 'Dumbbell', label: 'Gym / Fitness', group: 'Kesehatan', icon: Dumbbell },
  { id: 'Pill', label: 'Obat / Apotek', group: 'Kesehatan', icon: Pill },
  { id: 'Stethoscope', label: 'Klinik / RS', group: 'Kesehatan', icon: Stethoscope },
  { id: 'ShieldCheck', label: 'Asuransi', group: 'Kesehatan', icon: ShieldCheck },

  // Karir & Edukasi
  { id: 'GraduationCap', label: 'Pendidikan / Kursus', group: 'Karir & Edukasi', icon: GraduationCap },
  { id: 'Briefcase', label: 'Pekerjaan / Bisnis', group: 'Karir & Edukasi', icon: Briefcase },
  { id: 'BookOpen', label: 'Buku / Riset', group: 'Karir & Edukasi', icon: BookOpen },
  { id: 'Laptop', label: 'Software / IT', group: 'Karir & Edukasi', icon: Laptop },
  { id: 'Building', label: 'Kantor / Sewa', group: 'Karir & Edukasi', icon: Building },
  { id: 'Award', label: 'Sertifikasi', group: 'Karir & Edukasi', icon: Award },

  // Finansial & Investasi
  { id: 'TrendingUp', label: 'Investasi / Saham', group: 'Finansial', icon: TrendingUp },
  { id: 'Wallet', label: 'Gaji & Pendapatan', group: 'Finansial', icon: Wallet },
  { id: 'CreditCard', label: 'Cicilan / Kartu', group: 'Finansial', icon: CreditCard },
  { id: 'PiggyBank', label: 'Tabungan / Celengan', group: 'Finansial', icon: PiggyBank },
  { id: 'Coins', label: 'Uang Saku / Koin', group: 'Finansial', icon: Coins },
  { id: 'DollarSign', label: 'Deviden / Bonus', group: 'Finansial', icon: DollarSign },
  { id: 'Landmark', label: 'Pajak / Negara', group: 'Finansial', icon: Landmark },

  // Keluarga & Lainnya
  { id: 'Dog', label: 'Hewan / Pet', group: 'Keluarga & Lainnya', icon: Dog },
  { id: 'Cat', label: 'Kucing / Vet', group: 'Keluarga & Lainnya', icon: Cat },
  { id: 'Baby', label: 'Anak & Perlengkapan', group: 'Keluarga & Lainnya', icon: Baby },
  { id: 'MoreHorizontal', label: 'Lainnya', group: 'Keluarga & Lainnya', icon: MoreHorizontal },
];

export const CATEGORY_COLORS = [
  { id: 'rose', name: 'Mawar', bgClass: 'bg-rose-50', borderClass: 'border-rose-200', textClass: 'text-rose-500', ringClass: 'ring-rose-500', hex: '#F43F5E' },
  { id: 'orange', name: 'Oranye', bgClass: 'bg-orange-50', borderClass: 'border-orange-200', textClass: 'text-orange-500', ringClass: 'ring-orange-500', hex: '#F97316' },
  { id: 'amber', name: 'Kuning Amber', bgClass: 'bg-amber-50', borderClass: 'border-amber-200', textClass: 'text-amber-500', ringClass: 'ring-amber-500', hex: '#F59E0B' },
  { id: 'emerald', name: 'Hijau Emerald', bgClass: 'bg-emerald-50', borderClass: 'border-emerald-200', textClass: 'text-emerald-500', ringClass: 'ring-emerald-500', hex: '#10B981' },
  { id: 'teal', name: 'Teal Mint', bgClass: 'bg-teal-50', borderClass: 'border-teal-200', textClass: 'text-teal-500', ringClass: 'ring-teal-500', hex: '#14B8A6' },
  { id: 'sky', name: 'Biru Muda', bgClass: 'bg-sky-50', borderClass: 'border-sky-200', textClass: 'text-sky-500', ringClass: 'ring-sky-500', hex: '#0EA5E9' },
  { id: 'blue', name: 'Biru', bgClass: 'bg-blue-50', borderClass: 'border-blue-200', textClass: 'text-blue-500', ringClass: 'ring-blue-500', hex: '#3B82F6' },
  { id: 'indigo', name: 'Indigo', bgClass: 'bg-indigo-50', borderClass: 'border-indigo-200', textClass: 'text-indigo-500', ringClass: 'ring-indigo-500', hex: '#6366F1' },
  { id: 'purple', name: 'Ungu', bgClass: 'bg-purple-50', borderClass: 'border-purple-200', textClass: 'text-purple-500', ringClass: 'ring-purple-500', hex: '#8B5CF6' },
  { id: 'pink', name: 'Merah Muda', bgClass: 'bg-pink-50', borderClass: 'border-pink-200', textClass: 'text-pink-500', ringClass: 'ring-pink-500', hex: '#EC4899' },
  { id: 'slate', name: 'Abu Netral', bgClass: 'bg-slate-100', borderClass: 'border-slate-300', textClass: 'text-slate-600', ringClass: 'ring-slate-500', hex: '#64748B' },
];

export const DEFAULT_EXPENSE_CATEGORIES: CategoryItem[] = [
  { id: 'exp-makan', name: 'Makan & Minum', icon: 'Utensils', color: 'rose', type: 'pengeluaran' },
  { id: 'exp-belanja', name: 'Belanja Harian', icon: 'ShoppingBag', color: 'pink', type: 'pengeluaran' },
  { id: 'exp-transport', name: 'Transportasi', icon: 'Car', color: 'blue', type: 'pengeluaran' },
  { id: 'exp-tagihan', name: 'Tagihan & Utilitas', icon: 'Receipt', color: 'emerald', type: 'pengeluaran' },
  { id: 'exp-hiburan', name: 'Hiburan & Hobi', icon: 'Gamepad2', color: 'purple', type: 'pengeluaran' },
  { id: 'exp-kesehatan', name: 'Kesehatan & Medis', icon: 'Heart', color: 'rose', type: 'pengeluaran' },
  { id: 'exp-pendidikan', name: 'Pendidikan', icon: 'GraduationCap', color: 'indigo', type: 'pengeluaran' },
  { id: 'exp-keluarga', name: 'Keluarga & Donasi', icon: 'Gift', color: 'amber', type: 'pengeluaran' },
  { id: 'exp-lainnya', name: 'Lainnya', icon: 'MoreHorizontal', color: 'slate', type: 'pengeluaran' },
];

export const DEFAULT_INCOME_CATEGORIES: CategoryItem[] = [
  { id: 'inc-gaji', name: 'Gaji Pokok', icon: 'Briefcase', color: 'emerald', type: 'pemasukan' },
  { id: 'inc-bonus', name: 'Bonus & THR', icon: 'Award', color: 'amber', type: 'pemasukan' },
  { id: 'inc-bisnis', name: 'Usaha & Bisnis', icon: 'Building', color: 'blue', type: 'pemasukan' },
  { id: 'inc-investasi', name: 'Investasi & Dividen', icon: 'TrendingUp', color: 'teal', type: 'pemasukan' },
  { id: 'inc-freelance', name: 'Freelance & Jasa', icon: 'Laptop', color: 'indigo', type: 'pemasukan' },
  { id: 'inc-hadiah', name: 'Hadiah & Hibah', icon: 'Gift', color: 'pink', type: 'pemasukan' },
  { id: 'inc-penjualan', name: 'Penjualan Barang', icon: 'ShoppingBag', color: 'orange', type: 'pemasukan' },
  { id: 'inc-cashback', name: 'Bunga & Cashback', icon: 'Coins', color: 'sky', type: 'pemasukan' },
  { id: 'inc-lainnya', name: 'Lainnya', icon: 'MoreHorizontal', color: 'slate', type: 'pemasukan' },
];

export const DEFAULT_CATEGORIES: CategoryItem[] = [
  ...DEFAULT_EXPENSE_CATEGORIES,
  ...DEFAULT_INCOME_CATEGORIES,
];

export const getCategoryIconComponent = (iconName: string): LucideIcon => {
  const found = CATEGORY_ICON_OPTIONS.find((i) => i.id.toLowerCase() === iconName.toLowerCase());
  return found ? found.icon : MoreHorizontal;
};

export const getCategoryColorMeta = (colorId: string) => {
  const found = CATEGORY_COLORS.find((c) => c.id === colorId);
  return (
    found || {
      id: 'indigo',
      name: 'Indigo',
      bgClass: 'bg-indigo-50',
      borderClass: 'border-indigo-200',
      textClass: 'text-indigo-500',
      ringClass: 'ring-indigo-500',
      hex: '#6366F1',
    }
  );
};

const CATEGORIES_STORAGE_KEY = 'uangku_user_categories_v2';

export const loadStoredCategories = (targetType?: 'pengeluaran' | 'pemasukan'): CategoryItem[] => {
  try {
    const raw = localStorage.getItem(CATEGORIES_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Ensure items have type; if missing, check name or assign default
        const normalized: CategoryItem[] = parsed.map((item) => {
          if (!item.type) {
            const isInc = DEFAULT_INCOME_CATEGORIES.some((ic) => ic.name.toLowerCase() === item.name.toLowerCase());
            return { ...item, type: isInc ? 'pemasukan' : 'pengeluaran' };
          }
          return item;
        });

        // Ensure both expense and income items exist
        const hasExpense = normalized.some((c) => c.type === 'pengeluaran');
        const hasIncome = normalized.some((c) => c.type === 'pemasukan');
        const fullList: CategoryItem[] = [
          ...(hasExpense ? [] : DEFAULT_EXPENSE_CATEGORIES),
          ...(hasIncome ? [] : DEFAULT_INCOME_CATEGORIES),
          ...normalized,
        ];

        if (targetType) {
          return fullList.filter((c) => c.type === targetType);
        }
        return fullList;
      }
    }
  } catch (err) {
    console.error('Failed to load stored categories', err);
  }

  if (targetType === 'pengeluaran') return DEFAULT_EXPENSE_CATEGORIES;
  if (targetType === 'pemasukan') return DEFAULT_INCOME_CATEGORIES;
  return DEFAULT_CATEGORIES;
};

export const saveStoredCategories = (categories: CategoryItem[]) => {
  try {
    localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
  } catch (err) {
    console.error('Failed to save categories', err);
  }
};
