import axiosInstance from './axiosConfig';

class MLService {
  constructor() {
    // ML API Base URL dari tim ML
    this.baseURL = import.meta.env.VITE_ML_API_URL || 'http://0.0.0.0:8000'
    this.isEnabled = import.meta.env.VITE_ENABLE_ML === 'true'
    
    // Dataset endpoints
    this.endpoints = {
      discovery: '/discovery',
      recomId: '/recom-id',
      recomCategory: '/recom-category', 
      recomLokasi: '/recom-lokasi',
      recomDefault: '/recom-default',
      rekomLengkap: '/rekom-lengkap'
    }
  }

  // Check if ML service is available
  async checkHealth() {
    try {
      const response = await fetch(`${this.baseURL}/health`)
      return response.ok
    } catch (error) {
      console.warn('ML Service not available:', error)
      return false
    }
  }

  // DISCOVERY API - Main recommendation endpoint
  async getDiscoveryRecommendations(requestData = {}) {
    try {
      console.log('🚀 Frontend: Calling ML Discovery API', requestData)
      
      const response = await fetch(`${this.baseURL}${this.endpoints.discovery}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_preferences: requestData.preferences || {},
          location: requestData.location || null,
          filters: requestData.filters || {},
          limit: requestData.limit || 10
        })
      })

      if (!response.ok) {
        throw new Error(`ML API Error: ${response.status}`)
      }

      const data = await response.json()
      console.log('✅ ML Discovery Response:', data)
      
      return this.transformMLResponse(data)
    } catch (error) {
      console.error('❌ ML Discovery Error:', error)
      return this.getFallbackRecommendations()
    }
  }

  // RECOM-ID - Recommendations by destination ID
  async getRecommendationsById(destinationId, options = {}) {
    try {
      console.log('🔍 Frontend: Getting ML recommendations by ID', destinationId)
      
      const response = await fetch(`${this.baseURL}${this.endpoints.recomId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          destination_id: destinationId,
          limit: options.limit || 5,
          include_similar: options.includeSimilar || true
        })
      })

      if (!response.ok) {
        throw new Error(`ML API Error: ${response.status}`)
      }

      const data = await response.json()
      console.log('✅ ML Recom-ID Response:', data)
      
      return this.transformMLResponse(data)
    } catch (error) {
      console.error('❌ ML Recom-ID Error:', error)
      return this.getFallbackRecommendations()
    }
  }

  // RECOM-CATEGORY - Recommendations by category
  async getRecommendationsByCategory(category, options = {}) {
    try {
      console.log('📂 Frontend: Getting ML recommendations by category', category)
      
      const response = await fetch(`${this.baseURL}${this.endpoints.recomCategory}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category: category,
          limit: options.limit || 8,
          region: options.region || null,
          price_range: options.priceRange || null
        })
      })

      if (!response.ok) {
        throw new Error(`ML API Error: ${response.status}`)
      }

      const data = await response.json()
      console.log('✅ ML Recom-Category Response:', data)
      
      return this.transformMLResponse(data)
    } catch (error) {
      console.error('❌ ML Recom-Category Error:', error)
      return this.getFallbackRecommendations()
    }
  }

  // RECOM-LOKASI - Location-based recommendations
  async getLocationBasedRecommendations(latitude, longitude, options = {}) {
    try {
      console.log('📍 Frontend: Getting ML location recommendations', { latitude, longitude })
      
      const response = await fetch(`${this.baseURL}${this.endpoints.recomLokasi}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          latitude: latitude,
          longitude: longitude,
          radius_km: options.radius || 50,
          limit: options.limit || 6,
          category_filter: options.category || null
        })
      })

      if (!response.ok) {
        throw new Error(`ML API Error: ${response.status}`)
      }

      const data = await response.json()
      console.log('✅ ML Recom-Lokasi Response:', data)
      
      return this.transformMLResponse(data)
    } catch (error) {
      console.error('❌ ML Recom-Lokasi Error:', error)
      return this.getFallbackRecommendations()
    }
  }

  // RECOM-DEFAULT - Default recommendations
  async getDefaultRecommendations(options = {}) {
    try {
      console.log('🏠 Frontend: Getting ML default recommendations')
      
      const response = await fetch(`${this.baseURL}${this.endpoints.recomDefault}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          limit: options.limit || 10,
          include_popular: options.includePopular || true,
          mix_categories: options.mixCategories || true
        })
      })

      if (!response.ok) {
        throw new Error(`ML API Error: ${response.status}`)
      }

      const data = await response.json()
      console.log('✅ ML Recom-Default Response:', data)
      
      return this.transformMLResponse(data)
    } catch (error) {
      console.error('❌ ML Recom-Default Error:', error)
      return this.getFallbackRecommendations()
    }
  }

  // REKOM-LENGKAP - Complete recommendations with all features
  async getCompleteRecommendations(userId, userPreferences = {}) {
    try {
      console.log('🎯 Frontend: Getting complete ML recommendations', { userId, userPreferences })
      
      const response = await fetch(`${this.baseURL}${this.endpoints.rekomLengkap}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          preferences: {
            categories: userPreferences.categories || ['alam', 'budaya'],
            budget_range: userPreferences.budgetRange || 'medium',
            travel_style: userPreferences.travelStyle || 'family',
            preferred_regions: userPreferences.regions || [],
            ...userPreferences
          },
          limit: userPreferences.limit || 12,
          include_analytics: true
        })
      })

      if (!response.ok) {
        throw new Error(`ML API Error: ${response.status}`)
      }

      const data = await response.json()
      console.log('✅ ML Rekom-Lengkap Response:', data)
      
      return this.transformMLResponse(data)
    } catch (error) {
      console.error('❌ ML Rekom-Lengkap Error:', error)
      return this.getFallbackRecommendations()
    }
  }

  // Transform ML response to frontend format berdasarkan struktur dataset
  transformMLResponse(mlData) {
    if (!mlData || (!mlData.recommendations && !mlData.data && !mlData.results)) {
      console.warn('⚠️ Invalid ML response format')
      return { success: false, data: [] }
    }

    // Handle different response formats from ML API
    const recommendations = mlData.recommendations || mlData.data || mlData.results || []
    
    const transformedData = recommendations.map(item => {
      // Transform berdasarkan struktur data_wisata_indonesia1.csv
      return {
        id: item.Place_Id || item.id || Math.random().toString(36).substr(2, 9),
        name: item.Place_Name || item.name || item.destination_name || 'Unknown Place',
        location: this.formatLocation(item),
        city: item.City || item.city || '',
        category: this.mapCategory(item.Category || item.category || item.type),
        description: item.Description || item.description || 'Destinasi wisata menarik di Indonesia',
        price: this.formatPrice(item.Price || item.price),
        rating: this.formatRating(item.Rating || item.rating),
        
        // Coordinates
        coordinates: {
          latitude: parseFloat(item.Lat || item.latitude || item.lat) || 0,
          longitude: parseFloat(item.Long || item.longitude || item.lng || item.long) || 0
        },
        
        // Images - handle different image formats
        image: this.getImageURL(item.image_url || item.Image || item.image),
        images: this.processImageGallery(item.images || item.gallery),
        
        // Additional ML fields
        confidence_score: item.confidence_score || item.confidence || 1.0,
        similarity_score: item.similarity_score || item.similarity || 0,
        recommendation_reason: item.recommendation_reason || item.reason || this.generateReasonFromScore(item),
        popularity_score: item.popularity_score || item.popularity || 0,
        
        // Features from dataset
        features: this.extractFeatures(item),
        tags: this.extractTags(item),
        
        // Time-based info
        time_minutes: item.Time_Minutes || item.time_minutes || null,
        
        // ML metadata
        ml_metadata: {
          algorithm: mlData.algorithm || 'collaborative_filtering',
          processing_time: mlData.processing_time || 0,
          dataset_version: mlData.dataset_version || '1.0'
        }
      }
    })

    return {
      success: true,
      data: transformedData,
      metadata: {
        total_results: mlData.total || transformedData.length,
        algorithm: mlData.algorithm || 'ml_recommendation',
        confidence: mlData.confidence || 0.85,
        processing_time: mlData.processing_time || 150,
        dataset_info: {
          source: 'data_wisata_indonesia1.csv',
          last_updated: mlData.last_updated || new Date().toISOString()
        }
      }
    }
  }

  // Helper: Format location from dataset
  formatLocation(item) {
    const city = item.City || item.city || ''
    const province = item.Province || item.province || ''
    
    if (city && province) {
      return `${city}, ${province}`
    } else if (city) {
      return city
    } else if (province) {
      return province
    }
    
    return 'Indonesia'
  }

  // Helper: Map category from dataset to frontend format
  mapCategory(category) {
    const categoryMap = {
      'Budaya': 'budaya',
      'Taman Hiburan': 'hiburan',
      'Cagar Alam': 'alam',
      'Bahari': 'pantai',
      'Pusat Perbelanjaan': 'belanja',
      'Tempat Ibadah': 'religi',
      'Alam': 'alam',
      'Sejarah': 'sejarah',
      'Kuliner': 'kuliner'
    }
    
    return categoryMap[category] || category?.toLowerCase() || 'alam'
  }

  // Helper: Format price from dataset
  formatPrice(price) {
    if (!price || price === 0 || price === '0') {
      return 'Gratis'
    }
    
    // Handle different price formats
    if (typeof price === 'string' && price.includes('Rp')) {
      return price
    }
    
    const numPrice = parseInt(price)
    if (isNaN(numPrice)) {
      return 'Gratis'
    }
    
    return `Rp ${numPrice.toLocaleString('id-ID')}`
  }

  // Helper: Format rating from dataset
  formatRating(rating) {
    const numRating = parseFloat(rating)
    if (isNaN(numRating) || numRating === 0) {
      return 4.5 // Default rating
    }
    
    // Ensure rating is between 1-5
    return Math.max(1, Math.min(5, numRating))
  }

  // Helper: Extract features from dataset
  extractFeatures(item) {
    const features = []
    
    // Based on common tourism features
    if (item.Category === 'Budaya') features.push('Cultural Heritage')
    if (item.Category === 'Alam') features.push('Natural Beauty')
    if (item.Category === 'Bahari') features.push('Beach Access')
    if (item.Time_Minutes && item.Time_Minutes > 0) features.push(`${item.Time_Minutes} min visit`)
    if (item.Rating && item.Rating > 4) features.push('Highly Rated')
    
    return features
  }

  // Helper: Extract tags from dataset
  extractTags(item) {
    const tags = []
    
    if (item.Category) tags.push(item.Category)
    if (item.City) tags.push(item.City)
    if (item.Price === 0) tags.push('Free Entry')
    
    return tags
  }

  // Helper: Generate recommendation reason from scores
  generateReasonFromScore(item) {
    const confidence = item.confidence_score || item.confidence || 1.0
    const category = item.Category || 'destinasi'
    
    if (confidence > 0.9) {
      return `Sangat cocok dengan minat ${category.toLowerCase()} Anda`
    } else if (confidence > 0.8) {
      return `Direkomendasikan berdasarkan preferensi Anda`
    } else if (confidence > 0.7) {
      return `Destinasi populer di kategori ${category.toLowerCase()}`
    } else {
      return `Destinasi menarik untuk dijelajahi`
    }
  }

  // Process image URLs dari ML
  getImageURL(imageData) {
    if (!imageData) {
      return 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop'
    }

    // Jika sudah full URL
    if (typeof imageData === 'string' && imageData.startsWith('http')) {
      return imageData
    }

    // Jika relative path dari ML service
    if (typeof imageData === 'string') {
      return `${this.baseURL}/static/images/${imageData}`
    }

    // Fallback
    return 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop'
  }

  // Process gallery images
  processImageGallery(imagesData) {
    if (!imagesData) return []
    
    if (Array.isArray(imagesData)) {
      return imagesData.map(img => this.getImageURL(img))
    }
    
    return [this.getImageURL(imagesData)]
  }

  // Fallback data jika ML service down
  getFallbackRecommendations() {
    return {
      success: true,
      data: [
        {
          id: 1,
          name: "Candi Borobudur",
          location: "Magelang, Jawa Tengah",
          category: "budaya",
          description: "Candi Buddha terbesar di dunia",
          price: "Rp 50.000",
          rating: 4.8,
          coordinates: { latitude: -7.6079, longitude: 110.2038 },
          image: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=800&h=600&fit=crop",
          features: ["UNESCO Heritage", "Sunrise View"],
          confidence_score: 1.0,
          recommendation_reason: "Destinasi budaya populer"
        }
      ],
      metadata: { source: 'fallback', algorithm: 'static' }
    }
  }

  // Track user interaction untuk ML learning
  async trackInteraction(interactionData) {
    try {
      const response = await fetch(`${this.baseURL}/track-interaction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: interactionData.userId,
          destination_id: interactionData.destinationId,
          interaction_type: interactionData.type,
          timestamp: new Date().toISOString(),
          metadata: interactionData.metadata || {}
        })
      })

      if (response.ok) {
        console.log('✅ Interaction tracked successfully')
      }
    } catch (error) {
      console.error('❌ Failed to track interaction:', error)
    }
  }
}

export default new MLService()