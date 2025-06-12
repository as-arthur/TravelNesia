// Sample reviews data untuk development dan testing
export const sampleReviews = [
  {
    id: 1,
    userId: "user_001",
    userName: "Andi Pratama",
    userAvatar: "https://ui-avatars.com/api/?name=Andi+Pratama&background=3B82F6&color=fff",
    destinationId: 1,
    rating: 5,
    title: "Pengalaman Luar Biasa di Borobudur!",
    comment: "Candi Borobudur benar-benar memukau! Arsitektur yang megah dan sunrise yang indah membuat perjalanan ini tak terlupakan. Guide-nya juga sangat informatif menjelaskan sejarah candi.",
    visitDate: "2024-01-15",
    wouldRecommend: true,
    images: [
      {
        url: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=400&h=300&fit=crop",
        filename: "borobudur-sunrise.jpg"
      },
      {
        url: "https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?w=400&h=300&fit=crop",
        filename: "borobudur-temple.jpg"
      }
    ],
    helpfulVotes: 15,
    notHelpfulVotes: 2,
    createdAt: "2024-01-16T10:30:00Z",
    updatedAt: "2024-01-16T10:30:00Z"
  },
  {
    id: 2,
    userId: "user_002", 
    userName: "Sari Dewi",
    userAvatar: "https://ui-avatars.com/api/?name=Sari+Dewi&background=EF4444&color=fff",
    destinationId: 2,
    rating: 5,
    title: "Raja Ampat - Surga Bawah Laut!",
    comment: "Diving di Raja Ampat adalah pengalaman yang tidak akan pernah saya lupakan. Keanekaragaman biota laut yang luar biasa dan air yang jernih membuat setiap detik di bawah air sangat berharga.",
    visitDate: "2024-02-20",
    wouldRecommend: true,
    images: [
      {
        url: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=400&h=300&fit=crop",
        filename: "raja-ampat-diving.jpg"
      }
    ],
    helpfulVotes: 22,
    notHelpfulVotes: 1,
    createdAt: "2024-02-21T14:20:00Z",
    updatedAt: "2024-02-21T14:20:00Z"
  },
  {
    id: 3,
    userId: "user_003",
    userName: "Budi Santoso",
    userAvatar: "https://ui-avatars.com/api/?name=Budi+Santoso&background=10B981&color=fff",
    destinationId: 3,
    rating: 4,
    title: "Danau Toba yang Menawan",
    comment: "Danau Toba memiliki pemandangan yang sangat indah dan udara yang sejuk. Pulau Samosir juga menarik untuk dijelajahi. Hanya saja akses ke beberapa tempat masih kurang baik.",
    visitDate: "2024-03-10",
    wouldRecommend: true,
    images: [],
    helpfulVotes: 8,
    notHelpfulVotes: 3,
    createdAt: "2024-03-11T09:15:00Z",
    updatedAt: "2024-03-11T09:15:00Z"
  },
  {
    id: 4,
    userId: "user_004",
    userName: "Lisa Maharani",
    userAvatar: "https://ui-avatars.com/api/?name=Lisa+Maharani&background=8B5CF6&color=fff",
    destinationId: null, // General review
    rating: 5,
    title: "TravelNesia Sangat Membantu!",
    comment: "Aplikasi TravelNesia sangat membantu saya menemukan destinasi wisata yang sesuai dengan preferensi. Rekomendasi ML-nya akurat dan review dari pengguna lain sangat informatif.",
    visitDate: null,
    wouldRecommend: true,
    images: [],
    helpfulVotes: 31,
    notHelpfulVotes: 0,
    createdAt: "2024-03-15T16:45:00Z",
    updatedAt: "2024-03-15T16:45:00Z"
  },
  {
    id: 5,
    userId: "user_005",
    userName: "Rizki Fauzi",
    userAvatar: "https://ui-avatars.com/api/?name=Rizki+Fauzi&background=F59E0B&color=fff",
    destinationId: 4,
    rating: 5,
    title: "Komodo dan Pink Beach Luar Biasa!",
    comment: "Melihat komodo secara langsung di habitat aslinya sangat menakjubkan! Pink Beach juga indah sekali dengan pasir merah mudanya yang unik. Perjalanan yang worth it!",
    visitDate: "2024-02-28",
    wouldRecommend: true,
    images: [
      {
        url: "https://images.unsplash.com/photo-1591123720307-7909d75da4f5?w=400&h=300&fit=crop",
        filename: "komodo-dragon.jpg"
      },
      {
        url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
        filename: "pink-beach.jpg"
      }
    ],
    helpfulVotes: 18,
    notHelpfulVotes: 1,
    createdAt: "2024-03-01T11:30:00Z",
    updatedAt: "2024-03-01T11:30:00Z"
  },
  {
    id: 6,
    userId: "user_006",
    userName: "Maya Sinta",
    userAvatar: "https://ui-avatars.com/api/?name=Maya+Sinta&background=EC4899&color=fff",
    destinationId: 1,
    rating: 4,
    title: "Borobudur Indah tapi Ramai",
    comment: "Candi Borobudur memang indah dan bersejarah, tapi saat saya kunjungi sangat ramai pengunjung. Disarankan datang pagi-pagi sekali untuk menghindari kerumunan.",
    visitDate: "2024-03-20",
    wouldRecommend: true,
    images: [],
    helpfulVotes: 12,
    notHelpfulVotes: 2,
    createdAt: "2024-03-21T08:20:00Z",
    updatedAt: "2024-03-21T08:20:00Z"
  }
]

// Sample review statistics
export const sampleReviewStats = {
  totalReviews: 156,
  averageRating: 4.6,
  ratingDistribution: {
    5: 89,
    4: 41,
    3: 18,
    2: 6,
    1: 2
  },
  totalVotes: 342,
  helpfulVotes: 298,
  notHelpfulVotes: 44,
  reviewsWithImages: 78,
  reviewsWithRecommendation: 142,
  recommendationPercentage: 91
}

// Categories untuk filtering reviews
export const reviewCategories = [
  { id: 'all', name: 'Semua Review' },
  { id: 'destination', name: 'Review Destinasi' },
  { id: 'general', name: 'Review Umum' },
  { id: 'recent', name: 'Review Terbaru' },
  { id: 'popular', name: 'Review Populer' }
]

// Sort options untuk reviews
export const reviewSortOptions = [
  { value: 'createdAt_desc', label: 'Terbaru' },
  { value: 'createdAt_asc', label: 'Terlama' },
  { value: 'rating_desc', label: 'Rating Tertinggi' },
  { value: 'rating_asc', label: 'Rating Terendah' },
  { value: 'helpful_desc', label: 'Paling Membantu' },
  { value: 'helpful_asc', label: 'Kurang Membantu' }
]

// Filter options untuk reviews
export const reviewFilterOptions = {
  rating: [
    { value: 'all', label: 'Semua Rating' },
    { value: '5', label: '5 Bintang' },
    { value: '4', label: '4 Bintang' },
    { value: '3', label: '3 Bintang' },
    { value: '2', label: '2 Bintang' },
    { value: '1', label: '1 Bintang' }
  ],
  timeframe: [
    { value: 'all', label: 'Semua Waktu' },
    { value: '7d', label: '7 Hari Terakhir' },
    { value: '30d', label: '30 Hari Terakhir' },
    { value: '90d', label: '3 Bulan Terakhir' },
    { value: '1y', label: '1 Tahun Terakhir' }
  ],
  hasImages: [
    { value: 'all', label: 'Semua Review' },
    { value: 'with_images', label: 'Dengan Gambar' },
    { value: 'without_images', label: 'Tanpa Gambar' }
  ]
}

// Mock function untuk generate review data
export const generateMockReview = (overrides = {}) => {
  const names = [
    'Ahmad Wijaya', 'Siti Nurhaliza', 'Budi Prasetyo', 'Dewi Sartika', 
    'Rizki Ramadan', 'Maya Putri', 'Andi Saputra', 'Lisa Permata'
  ]
  
  const titles = [
    'Pengalaman yang Menakjubkan!',
    'Destinasi yang Sangat Direkomendasikan',
    'Tempat yang Indah dan Berkesan',
    'Wisata yang Worth It!',
    'Pemandangan yang Luar Biasa'
  ]

  const comments = [
    'Tempat yang sangat indah dan berkesan. Pasti akan kembali lagi!',
    'Pelayanan yang baik dan fasilitas yang lengkap. Sangat memuaskan.',
    'Pemandangan yang menakjubkan dan udara yang segar. Highly recommended!',
    'Destinasi yang perfect untuk liburan keluarga. Anak-anak sangat senang.',
    'Pengalaman yang tak terlupakan. Guide-nya juga sangat ramah dan informatif.'
  ]

  const randomName = names[Math.floor(Math.random() * names.length)]
  
  return {
    id: Date.now() + Math.random(),
    userId: `user_${Math.random().toString(36).substr(2, 9)}`,
    userName: randomName,
    userAvatar: `https://ui-avatars.com/api/?name=${randomName.replace(' ', '+')}&background=${Math.floor(Math.random()*16777215).toString(16)}&color=fff`,
    destinationId: Math.floor(Math.random() * 10) + 1,
    rating: Math.floor(Math.random() * 5) + 1,
    title: titles[Math.floor(Math.random() * titles.length)],
    comment: comments[Math.floor(Math.random() * comments.length)],
    visitDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    wouldRecommend: Math.random() > 0.2,
    images: [],
    helpfulVotes: Math.floor(Math.random() * 20),
    notHelpfulVotes: Math.floor(Math.random() * 5),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides
  }
}

// Helper function untuk filter reviews
export const filterReviews = (reviews, filters) => {
  let filteredReviews = [...reviews]

  // Filter by rating
  if (filters.rating && filters.rating !== 'all') {
    filteredReviews = filteredReviews.filter(review => review.rating === parseInt(filters.rating))
  }

  // Filter by timeframe
  if (filters.timeframe && filters.timeframe !== 'all') {
    const now = new Date()
    const timeframes = {
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
      '90d': 90 * 24 * 60 * 60 * 1000,
      '1y': 365 * 24 * 60 * 60 * 1000
    }
    
    const cutoffTime = new Date(now.getTime() - timeframes[filters.timeframe])
    filteredReviews = filteredReviews.filter(review => new Date(review.createdAt) > cutoffTime)
  }

  // Filter by images
  if (filters.hasImages && filters.hasImages !== 'all') {
    if (filters.hasImages === 'with_images') {
      filteredReviews = filteredReviews.filter(review => review.images && review.images.length > 0)
    } else if (filters.hasImages === 'without_images') {
      filteredReviews = filteredReviews.filter(review => !review.images || review.images.length === 0)
    }
  }

  // Filter by destination
  if (filters.destinationId) {
    filteredReviews = filteredReviews.filter(review => review.destinationId === filters.destinationId)
  }

  return filteredReviews
}

// Helper function untuk sort reviews
export const sortReviews = (reviews, sortBy) => {
  const [field, order] = sortBy.split('_')
  const sortedReviews = [...reviews]

  sortedReviews.sort((a, b) => {
    let aValue, bValue

    switch (field) {
      case 'createdAt':
        aValue = new Date(a.createdAt)
        bValue = new Date(b.createdAt)
        break
      case 'rating':
        aValue = a.rating
        bValue = b.rating
        break
      case 'helpful':
        aValue = a.helpfulVotes
        bValue = b.helpfulVotes
        break
      default:
        aValue = a[field]
        bValue = b[field]
    }

    if (order === 'desc') {
      return bValue > aValue ? 1 : -1
    } else {
      return aValue > bValue ? 1 : -1
    }
  })

  return sortedReviews
}

export default {
  sampleReviews,
  sampleReviewStats,
  reviewCategories,
  reviewSortOptions,
  reviewFilterOptions,
  generateMockReview,
  filterReviews,
  sortReviews
}