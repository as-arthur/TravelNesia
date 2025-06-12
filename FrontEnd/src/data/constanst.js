export const APP_CONFIG = {
  name: 'TravelNesia',
  description: 'Rekomendasi Cerdas Tempat Wisata Indonesia',
  version: '1.0.0',
  author: 'TravelNesia Team'
}

export const REVIEW_CONFIG = {
  minCommentLength: 10,
  maxCommentLength: 500,
  maxTitleLength: 100,
  maxImages: 3,
  maxImageSize: 10 * 1024 * 1024, // 10MB
  allowedImageTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
}

export const RATING_LABELS = {
  1: 'Sangat Buruk',
  2: 'Buruk',
  3: 'Biasa',
  4: 'Bagus',
  5: 'Sangat Bagus'
}

export const CATEGORIES = [
  { id: 'all', name: 'Semua', icon: '🌏' },
  { id: 'Alam', name: 'Alam', icon: '🏔️' },
  { id: 'Budaya', name: 'Budaya', icon: '🏛️' },
  { id: 'Bahari', name: 'Bahari', icon: '🏖️' },
  { id: 'Cagar Alam', name: 'Cagar Alam', icon: '🌿' },
  { id: 'Taman Hiburan', name: 'Hiburan', icon: '🎢' },
  { id: 'Tempat Ibadah', name: 'Religi', icon: '🕌' },
  { id: 'Pusat Perbelanjaan', name: 'Belanja', icon: '🛍️' }
]

export const SORT_OPTIONS = [
  { value: 'createdAt', label: 'Terbaru', order: 'desc' },
  { value: 'rating', label: 'Rating Tertinggi', order: 'desc' },
  { value: 'helpfulVotes', label: 'Paling Membantu', order: 'desc' },
  { value: 'name', label: 'Nama A-Z', order: 'asc' },
  { value: 'createdAt', label: 'Terlama', order: 'asc' }
]

export const provinces = [
  'Aceh', 'Sumatera Utara', 'Sumatera Barat', 'Riau', 'Kepulauan Riau', 'Jambi', 
  'Sumatera Selatan', 'Bangka Belitung', 'Bengkulu', 'Lampung', 'DKI Jakarta', 
  'Jawa Barat', 'Jawa Tengah', 'DI Yogyakarta', 'Jawa Timur', 'Banten', 'Bali', 
  'Nusa Tenggara Barat', 'Nusa Tenggara Timur', 'Kalimantan Barat', 'Kalimantan Tengah', 
  'Kalimantan Selatan', 'Kalimantan Timur', 'Kalimantan Utara', 'Sulawesi Utara', 
  'Sulawesi Tengah', 'Sulawesi Selatan', 'Sulawesi Tenggara', 'Gorontalo', 
  'Sulawesi Barat', 'Maluku', 'Maluku Utara', 'Papua', 'Papua Barat'
]
