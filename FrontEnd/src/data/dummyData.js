// API Endpoints Configuration
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    PROFILE: '/api/auth/profile'
  },
  DESTINATIONS: {
    ALL: '/api/destinations',
    POPULAR: '/api/destinations/popular',
    SEARCH: '/api/destinations/search',
    NEARBY: '/api/destinations/nearby'
  },
  RECOMMENDATIONS: {
    USER: '/api/recommendations/user',
    LOCATION: '/api/recommendations/location',
    CATEGORY: '/api/recommendations/category',
    SIMILAR: '/api/recommendations/similar'
  },
  REVIEWS: {
    ALL: '/api/reviews',
    CREATE: '/api/reviews',
    BY_DESTINATION: '/api/reviews/destination'
  },
  ML: {
    DESTINATIONS: '/api/ml/destinations',
    SEARCH: '/api/ml/search',
    RECOMMENDATIONS: '/api/ml/recommendations',
    INTERACTIONS: '/api/ml/interactions',
    TRENDING: '/api/ml/trending'
  }
};

// Sample destinations data (ini akan digantikan dengan data dari ML)
export const destinations = [
  {
    id: 1,
    name: "Candi Borobudur",
    location: "Magelang, Jawa Tengah",
    image: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=800&h=600&fit=crop",
    rating: 4.8,
    category: "budaya",
    price: "Rp 50.000",
    description: "Candi Buddha terbesar di dunia dan situs warisan dunia UNESCO",
    coordinates: {
      latitude: -7.6079,
      longitude: 110.2038
    },
    features: ["Arsitektur Kuno", "Sunrise View", "UNESCO Heritage"],
    gallery: [
      "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?w=800&h=600&fit=crop"
    ]
  },
  {
    id: 2,
    name: "Raja Ampat",
    location: "Papua Barat",
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&h=600&fit=crop",
    rating: 4.9,
    category: "alam",
    price: "Rp 200.000",
    description: "Surga bawah laut dengan keanekaragaman hayati tertinggi di dunia",
    coordinates: {
      latitude: -0.2312,
      longitude: 130.5256
    },
    features: ["Diving", "Marine Life", "Island Hopping"],
    gallery: [
      "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop"
    ]
  },
  {
    id: 3,
    name: "Danau Toba",
    location: "Sumatera Utara",
    image: "https://images.unsplash.com/photo-1587223962930-cb7f31384c19?w=800&h=600&fit=crop",
    rating: 4.7,
    category: "alam",
    price: "Rp 30.000",
    description: "Danau vulkanik terbesar di dunia dengan Pulau Samosir di tengahnya",
    coordinates: {
      latitude: 2.6845,
      longitude: 98.8756
    },
    features: ["Lake View", "Cultural Experience", "Batak Heritage"],
    gallery: [
      "https://images.unsplash.com/photo-1587223962930-cb7f31384c19?w=800&h=600&fit=crop"
    ]
  },
  {
    id: 4,
    name: "Taman Nasional Komodo",
    location: "Nusa Tenggara Timur",
    image: "https://images.unsplash.com/photo-1591123720307-7909d75da4f5?w=800&h=600&fit=crop",
    rating: 4.8,
    category: "alam",
    price: "Rp 150.000",
    description: "Habitat asli komodo dan pantai berpasir pink yang eksotis",
    coordinates: {
      latitude: -8.5434,
      longitude: 119.4883
    },
    features: ["Komodo Dragons", "Pink Beach", "National Park"],
    gallery: [
      "https://images.unsplash.com/photo-1591123720307-7909d75da4f5?w=800&h=600&fit=crop"
    ]
  }
];

// Popular destinations (untuk section terpisah)
export const popularDestinations = [
  {
    id: 5,
    name: "Pulau Morotai",
    location: "Maluku Utara",
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=400&h=300&fit=crop",
    rating: 4.9,
    category: "alam",
    tag: "TRENDING"
  },
  {
    id: 6,
    name: "Tanjung Kelayang",
    location: "Bangka Belitung",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
    rating: 4.8,
    category: "alam",
    tag: "TRENDING"
  },
  {
    id: 7,
    name: "Danau Toba",
    location: "Sumatera Utara",
    image: "https://images.unsplash.com/photo-1587223962930-cb7f31384c19?w=400&h=300&fit=crop",
    rating: 4.7,
    category: "alam",
    tag: "TRENDING"
  },
  {
    id: 8,
    name: "Wakatobi",
    location: "Sulawesi Tenggara",
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=400&h=300&fit=crop",
    rating: 4.9,
    category: "alam",
    tag: "TRENDING"
  }
];

// Gallery images untuk halaman galeri
export const galleryImages = [
  {
    id: 1,
    title: "Pulau Derawan",
    location: "Kalimantan Timur",
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=400&h=300&fit=crop"
  },
  {
    id: 2,
    title: "Tanjung Kelayang",
    location: "Bangka Belitung",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop"
  },
  {
    id: 3,
    title: "Nusa Penida",
    location: "Bali",
    image: "https://images.unsplash.com/photo-1591123720307-7909d75da4f5?w=400&h=300&fit=crop"
  },
  {
    id: 4,
    title: "Bromo Valley",
    location: "Jawa Timur",
    image: "https://images.unsplash.com/photo-1587223962930-cb7f31384c19?w=400&h=300&fit=crop"
  },
  {
    id: 5,
    title: "Marine Tours",
    location: "Maluku",
    image: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=400&h=300&fit=crop"
  },
  {
    id: 6,
    title: "Bajau Kapala",
    location: "Sulawesi",
    image: "https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?w=400&h=300&fit=crop"
  },
  {
    id: 7,
    title: "Teletok Valley",
    location: "Papua",
    image: "https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=400&h=300&fit=crop"
  },
  {
    id: 8,
    title: "Skater Valley",
    location: "Sumatra",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop"
  },
  {
    id: 9,
    title: "Blue Valley",
    location: "Belitung",
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=400&h=300&fit=crop"
  },
  {
    id: 10,
    title: "Narah Kaghan",
    location: "Flores",
    image: "https://images.unsplash.com/photo-1591123720307-7909d75da4f5?w=400&h=300&fit=crop"
  },
  {
    id: 11,
    title: "Narah Kaghan",
    location: "Flores",
    image: "https://images.unsplash.com/photo-1587223962930-cb7f31384c19?w=400&h=300&fit=crop"
  },
  {
    id: 12,
    title: "Narah Kaghan",
    location: "Flores",
    image: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=400&h=300&fit=crop"
  }
];

// Testimonials data
export const testimonials = [
  {
    id: 1,
    name: "Haikal",
    city: "Jakarta",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    comment: "Aplikasi ini sangat membantu perjalanan saya ke Raja Ampat. Informasi yang akurat dan rekomendasi yang tepat sesuai dengan preferensi saya. Sangat recommended!"
  },
  {
    id: 2,
    name: "Saya Siapa",
    city: "Malang",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b9e92419?w=100&h=100&fit=crop&crop=face",
    comment: "Fitur deteksi lokasi sangat berguna! Saat sedang traveling di Yogyakarta, aplikasi langsung memberikan rekomendasi tempat menarik di sekitar."
  },
  {
    id: 3,
    name: "namnama",
    city: "Bali",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    comment: "Sebagai pecinta budaya Indonesia, saya sangat menyukai kategori wisata budaya di aplikasi ini. Banyak tempat tersembunyi yang belum pernah saya kunjungi sebelumnya."
  },
  {
    id: 4,
    name: "Membiasanak",
    city: "Bandung",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    comment: "Fitur rekomendasi personal benar-benar akurat! Setelah beberapa kali menggunakan aplikasi, rekomendasi yang diberikan semakin sesuai dengan selera traveling saya."
  }
];

// ML Integration Helper Functions
export const MLDataHelpers = {
  // Transform ML dataset to frontend format
  transformMLDestination: (mlData) => ({
    id: mlData.destination_id || mlData.id,
    name: mlData.destination_name || mlData.name,
    location: mlData.location || `${mlData.city}, ${mlData.province}`,
    image: mlData.image_url || mlData.image || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
    rating: mlData.rating || mlData.average_rating || 4.5,
    category: mlData.category || mlData.type || 'alam',
    price: mlData.price || mlData.entrance_fee || 'Gratis',
    description: mlData.description || 'Destinasi wisata menarik di Indonesia',
    coordinates: {
      latitude: mlData.latitude || mlData.lat || 0,
      longitude: mlData.longitude || mlData.lng || 0
    },
    features: mlData.features || mlData.facilities || [],
    gallery: mlData.gallery || mlData.images || [],
    // ML specific fields
    confidence_score: mlData.confidence_score || 1.0,
    recommendation_reason: mlData.reason || '',
    similarity_score: mlData.similarity || 0,
    popularity_score: mlData.popularity || 0
  }),

  // Transform user preferences for ML
  transformUserPreferences: (userPrefs) => ({
    categories: userPrefs.categories || ['alam', 'budaya'],
    budget_range: userPrefs.budget || 'medium',
    travel_style: userPrefs.style || 'adventure',
    preferred_regions: userPrefs.regions || [],
    activity_types: userPrefs.activities || []
  }),

  // Create interaction payload for ML tracking
  createInteractionPayload: (userId, destinationId, interactionType, metadata = {}) => ({
    user_id: userId,
    destination_id: destinationId,
    interaction_type: interactionType, // 'view', 'like', 'bookmark', 'visit', 'search', 'rate'
    timestamp: new Date().toISOString(),
    session_id: sessionStorage.getItem('session_id') || 'anonymous',
    metadata: {
      ...metadata,
      user_agent: navigator.userAgent,
      referrer: document.referrer
    }
  })
};

// Categories untuk filtering
export const categories = [
  { id: 'all', name: 'Semua Kategori', icon: '🌏' },
  { id: 'alam', name: 'Wisata Alam', icon: '🏔️' },
  { id: 'budaya', name: 'Wisata Budaya', icon: '🏛️' },
  { id: 'sejarah', name: 'Wisata Sejarah', icon: '📿' },
  { id: 'religi', name: 'Wisata Religi', icon: '🕌' },
  { id: 'kuliner', name: 'Wisata Kuliner', icon: '🍜' },
  { id: 'pantai', name: 'Pantai & Laut', icon: '🏖️' },
  { id: 'gunung', name: 'Gunung & Hiking', icon: '⛰️' }
];

// Indonesian provinces untuk lokasi filtering
export const provinces = [
  'Aceh', 'Sumatera Utara', 'Sumatera Barat', 'Riau', 'Kepulauan Riau', 'Jambi', 
  'Sumatera Selatan', 'Bangka Belitung', 'Bengkulu', 'Lampung', 'DKI Jakarta', 
  'Jawa Barat', 'Jawa Tengah', 'DI Yogyakarta', 'Jawa Timur', 'Banten', 'Bali', 
  'Nusa Tenggara Barat', 'Nusa Tenggara Timur', 'Kalimantan Barat', 'Kalimantan Tengah', 
  'Kalimantan Selatan', 'Kalimantan Timur', 'Kalimantan Utara', 'Sulawesi Utara', 
  'Sulawesi Tengah', 'Sulawesi Selatan', 'Sulawesi Tenggara', 'Gorontalo', 
  'Sulawesi Barat', 'Maluku', 'Maluku Utara', 'Papua', 'Papua Barat'
];

// Sample ML responses untuk testing
export const sampleMLResponses = {
  userRecommendations: {
    success: true,
    data: destinations.slice(0, 4),
    metadata: {
      algorithm: 'collaborative_filtering',
      confidence: 0.85,
      processing_time: 120
    }
  },
  
  categoryRecommendations: {
    success: true,
    data: destinations.filter(d => d.category === 'alam'),
    metadata: {
      algorithm: 'content_based_filtering',
      total_found: 156
    }
  },
  
  locationRecommendations: {
    success: true,
    data: popularDestinations,
    metadata: {
      algorithm: 'geospatial_clustering',
      radius_km: 50,
      total_found: 23
    }
  }
};