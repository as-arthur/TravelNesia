// src/utils/datasetProcessor.js
import Papa from 'papaparse'

export class DatasetProcessor {
  constructor() {
    this.datasetBaseUrl = import.meta.env.VITE_ML_DATASET_URL || '/api/datasets'
  }

  // Load CSV dataset dari GitHub atau local
  async loadCSVDataset(filename = 'data_wisata_indonesia1.csv') {
    try {
      console.log('📊 Loading CSV dataset:', filename)
      
      // Try GitHub first, then fallback to local
      const githubUrl = `https://raw.githubusercontent.com/as-arthur/TravelNesia/main/ML/Dataset/${filename}`
      const localUrl = `${this.datasetBaseUrl}/${filename}`
      
      let csvText
      try {
        const response = await fetch(githubUrl)
        if (response.ok) {
          csvText = await response.text()
          console.log('✅ Loaded from GitHub:', githubUrl)
        } else {
          throw new Error('GitHub not accessible')
        }
      } catch (githubError) {
        console.warn('⚠️ GitHub failed, trying local:', githubError.message)
        const response = await fetch(localUrl)
        csvText = await response.text()
        console.log('✅ Loaded from local:', localUrl)
      }
      
      return this.parseCSVData(csvText)
    } catch (error) {
      console.error('❌ Error loading CSV dataset:', error)
      return this.getMockDataset()
    }
  }

  // Load JSON dataset
  async loadJSONDataset(filename = 'data_wisata_indonesia1.json') {
    try {
      console.log('📊 Loading JSON dataset:', filename)
      
      const githubUrl = `https://raw.githubusercontent.com/as-arthur/TravelNesia/main/ML/Dataset/${filename}`
      const localUrl = `${this.datasetBaseUrl}/${filename}`
      
      let jsonData
      try {
        const response = await fetch(githubUrl)
        if (response.ok) {
          jsonData = await response.json()
          console.log('✅ JSON loaded from GitHub:', githubUrl)
        } else {
          throw new Error('GitHub not accessible')
        }
      } catch (githubError) {
        console.warn('⚠️ GitHub failed, trying local:', githubError.message)
        const response = await fetch(localUrl)
        jsonData = await response.json()
        console.log('✅ JSON loaded from local:', localUrl)
      }
      
      return this.processJSONData(jsonData)
    } catch (error) {
      console.error('❌ Error loading JSON dataset:', error)
      return this.getMockDataset()
    }
  }

  // Parse CSV data dengan Papa Parse
  parseCSVData(csvText) {
    try {
      console.log('🔍 Parsing CSV data...')
      
      const parsed = Papa.parse(csvText, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        delimitersToGuess: [',', '\t', '|', ';'],
        transformHeader: (header) => {
          // Clean headers - remove whitespace and standardize
          return header.trim().replace(/\s+/g, '_')
        }
      })

      if (parsed.errors.length > 0) {
        console.warn('⚠️ CSV parsing errors:', parsed.errors)
      }

      const processedData = parsed.data.map((row, index) => this.transformDatasetRow(row, index))
      
      console.log('✅ CSV parsed successfully:', {
        totalRows: processedData.length,
        sampleRow: processedData[0],
        headers: parsed.meta.fields
      })
      
      return {
        data: processedData,
        metadata: {
          source: 'csv',
          total: processedData.length,
          headers: parsed.meta.fields,
          errors: parsed.errors
        }
      }
    } catch (error) {
      console.error('❌ Error parsing CSV:', error)
      return this.getMockDataset()
    }
  }

  // Process JSON data
  processJSONData(jsonData) {
    try {
      console.log('🔍 Processing JSON data...')
      
      let dataArray
      if (Array.isArray(jsonData)) {
        dataArray = jsonData
      } else if (jsonData.data && Array.isArray(jsonData.data)) {
        dataArray = jsonData.data
      } else {
        throw new Error('Invalid JSON structure')
      }
      
      const processedData = dataArray.map((row, index) => this.transformDatasetRow(row, index))
      
      console.log('✅ JSON processed successfully:', {
        totalRows: processedData.length,
        sampleRow: processedData[0]
      })
      
      return {
        data: processedData,
        metadata: {
          source: 'json',
          total: processedData.length,
          originalFormat: typeof jsonData
        }
      }
    } catch (error) {
      console.error('❌ Error processing JSON:', error)
      return this.getMockDataset()
    }
  }

  // Transform dataset row berdasarkan struktur data_wisata_indonesia1.csv
  transformDatasetRow(row, index) {
    try {
      // Handle different possible field names from dataset
      const placeId = row.Place_Id || row.place_id || row.id || index + 1
      const placeName = row.Place_Name || row.place_name || row.name || `Destinasi ${index + 1}`
      const description = row.Description || row.description || 'Destinasi wisata menarik di Indonesia'
      const category = row.Category || row.category || 'Alam'
      const city = row.City || row.city || ''
      const price = row.Price || row.price || 0
      const rating = row.Rating || row.rating || 4.5
      const timeMinutes = row.Time_Minutes || row.time_minutes || null
      const coordinate = row.Coordinate || row.coordinate || null
      const lat = row.Lat || row.latitude || row.lat || 0
      const long = row.Long || row.longitude || row.lng || row.long || 0

      return {
        // Standard fields untuk frontend
        id: placeId,
        name: placeName,
        location: this.formatLocation(city, row.Province || row.province),
        city: city,
        category: this.mapCategory(category),
        description: description,
        price: this.formatPrice(price),
        rating: this.formatRating(rating),
        
        // Coordinates
        coordinates: {
          latitude: parseFloat(lat) || 0,
          longitude: parseFloat(long) || 0
        },
        
        // Images - generate or use if provided
        image: this.generateImageUrl(placeName, category),
        images: this.generateImageGallery(placeName, category),
        
        // Features dari dataset
        features: this.extractFeatures(row),
        tags: this.extractTags(row),
        
        // Time info
        time_minutes: timeMinutes,
        visit_duration: timeMinutes ? `${timeMinutes} menit` : null,
        
        // Dataset metadata
        dataset_info: {
          source_row: index,
          category_original: category,
          coordinate_string: coordinate,
          price_original: price
        },
        
        // ML fields untuk compatibility
        confidence_score: 1.0,
        similarity_score: 0,
        recommendation_reason: this.generateRecommendationReason(category, rating),
        popularity_score: this.calculatePopularityScore(rating, timeMinutes)
      }
    } catch (error) {
      console.error('❌ Error transforming row:', error, row)
      return this.createFallbackDestination(index)
    }
  }

  // Helper: Format location
  formatLocation(city, province) {
    if (city && province) {
      return `${city}, ${province}`
    } else if (city) {
      return city
    } else if (province) {
      return province
    }
    return 'Indonesia'
  }

  // Helper: Map category from dataset
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

  // Helper: Format price
  formatPrice(price) {
    if (!price || price === 0 || price === '0') {
      return 'Gratis'
    }
    
    const numPrice = parseInt(price)
    if (isNaN(numPrice)) {
      return 'Gratis'
    }
    
    return `Rp ${numPrice.toLocaleString('id-ID')}`
  }

  // Helper: Format rating
  formatRating(rating) {
    const numRating = parseFloat(rating)
    if (isNaN(numRating) || numRating === 0) {
      return 4.5
    }
    
    return Math.max(1, Math.min(5, numRating))
  }

  // Helper: Extract features
  extractFeatures(row) {
    const features = []
    
    const category = row.Category || row.category
    const rating = row.Rating || row.rating
    const price = row.Price || row.price
    const timeMinutes = row.Time_Minutes || row.time_minutes
    
    // Category-based features
    if (category === 'Budaya') features.push('Cultural Heritage')
    if (category === 'Alam') features.push('Natural Beauty')
    if (category === 'Bahari') features.push('Beach Access')
    if (category === 'Cagar Alam') features.push('Nature Reserve')
    
    // Rating-based features
    if (rating && rating > 4.5) features.push('Highly Rated')
    if (rating && rating > 4.0) features.push('Recommended')
    
    // Price-based features
    if (price === 0) features.push('Free Entry')
    if (price && price < 50000) features.push('Budget Friendly')
    
    // Time-based features
    if (timeMinutes && timeMinutes > 0) features.push(`${timeMinutes} min visit`)
    if (timeMinutes && timeMinutes > 120) features.push('Full Day Experience')
    
    return features
  }

  // Helper: Extract tags
  extractTags(row) {
    const tags = []
    
    const category = row.Category || row.category
    const city = row.City || row.city
    const price = row.Price || row.price
    
    if (category) tags.push(category)
    if (city) tags.push(city)
    if (price === 0) tags.push('Gratis')
    
    return tags
  }

  // Helper: Generate image URL
  generateImageUrl(placeName, category) {
    // Map categories to relevant Unsplash images
    const imageMap = {
      'Budaya': 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=800&h=600&fit=crop',
      'Alam': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
      'Bahari': 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&h=600&fit=crop',
      'Cagar Alam': 'https://images.unsplash.com/photo-1587223962930-cb7f31384c19?w=800&h=600&fit=crop',
      'Taman Hiburan': 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=800&h=600&fit=crop',
      'Tempat Ibadah': 'https://images.unsplash.com/photo-1591123720307-7909d75da4f5?w=800&h=600&fit=crop'
    }
    
    return imageMap[category] || imageMap['Alam']
  }

  // Helper: Generate image gallery
  generateImageGallery(placeName, category) {
    const baseUrl = this.generateImageUrl(placeName, category)
    return [
      baseUrl,
      baseUrl.replace('?w=800&h=600', '?w=800&h=600&crop=entropy'),
      baseUrl.replace('?w=800&h=600', '?w=800&h=600&crop=faces')
    ]
  }

  // Helper: Generate recommendation reason
  generateRecommendationReason(category, rating) {
    const categoryReasons = {
      'Budaya': 'Kaya akan nilai sejarah dan budaya',
      'Alam': 'Pemandangan alam yang menakjubkan',
      'Bahari': 'Pantai dan laut yang eksotis',
      'Cagar Alam': 'Keanekaragaman hayati yang unik',
      'Taman Hiburan': 'Hiburan untuk keluarga',
      'Tempat Ibadah': 'Nilai spiritual dan arsitektur indah'
    }
    
    const baseReason = categoryReasons[category] || 'Destinasi menarik untuk dikunjungi'
    
    if (rating > 4.5) {
      return `${baseReason} dengan rating sangat tinggi`
    } else if (rating > 4.0) {
      return `${baseReason} yang direkomendasikan pengunjung`
    }
    
    return baseReason
  }

  // Helper: Calculate popularity score
  calculatePopularityScore(rating, timeMinutes) {
    let score = 0
    
    // Rating contribution (0-70 points)
    if (rating) {
      score += (rating / 5) * 70
    }
    
    // Time contribution (0-30 points)
    if (timeMinutes) {
      // Normalize time (longer visit = more interesting)
      const timeScore = Math.min(timeMinutes / 180, 1) * 30
      score += timeScore
    }
    
    return Math.round(score)
  }

  // Create fallback destination
  createFallbackDestination(index) {
    return {
      id: `fallback_${index}`,
      name: `Destinasi ${index + 1}`,
      location: 'Indonesia',
      category: 'alam',
      description: 'Destinasi wisata menarik di Indonesia',
      price: 'Gratis',
      rating: 4.5,
      coordinates: { latitude: 0, longitude: 0 },
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
      images: [],
      features: ['Destinasi Menarik'],
      tags: ['Indonesia'],
      confidence_score: 1.0,
      recommendation_reason: 'Destinasi wisata Indonesia'
    }
  }

  // Get mock dataset sebagai fallback
  getMockDataset() {
    console.log('📋 Using mock dataset as fallback')
    
    const mockData = [
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
        confidence_score: 1.0
      },
      {
        id: 2,
        name: "Raja Ampat",
        location: "Papua Barat",
        category: "alam",
        description: "Surga bawah laut dengan keanekaragaman hayati tertinggi",
        price: "Rp 200.000",
        rating: 4.9,
        coordinates: { latitude: -0.2312, longitude: 130.5256 },
        image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&h=600&fit=crop",
        features: ["Diving", "Marine Life"],
        confidence_score: 1.0
      }
    ]
    
    return {
      data: mockData,
      metadata: {
        source: 'mock',
        total: mockData.length,
        note: 'Fallback data when dataset loading fails'
      }
    }
  }

  // Filter dataset berdasarkan criteria
  filterDataset(dataset, filters = {}) {
    if (!dataset || !dataset.data) return dataset
    
    let filteredData = [...dataset.data]
    
    // Filter by category
    if (filters.category && filters.category !== 'all') {
      filteredData = filteredData.filter(item => 
        item.category === filters.category || 
        item.dataset_info?.category_original === filters.category
      )
    }
    
    // Filter by city
    if (filters.city) {
      filteredData = filteredData.filter(item => 
        item.city?.toLowerCase().includes(filters.city.toLowerCase())
      )
    }
    
    // Filter by rating
    if (filters.minRating) {
      filteredData = filteredData.filter(item => item.rating >= filters.minRating)
    }
    
    // Filter by price range
    if (filters.priceRange) {
      if (filters.priceRange === 'free') {
        filteredData = filteredData.filter(item => item.price === 'Gratis')
      } else if (filters.priceRange === 'paid') {
        filteredData = filteredData.filter(item => item.price !== 'Gratis')
      }
    }
    
    return {
      ...dataset,
      data: filteredData,
      metadata: {
        ...dataset.metadata,
        filtered: true,
        filters: filters,
        filtered_total: filteredData.length
      }
    }
  }

  // Search dalam dataset
  searchDataset(dataset, query) {
    if (!dataset || !dataset.data || !query) return dataset
    
    const searchTerm = query.toLowerCase()
    const filteredData = dataset.data.filter(item => 
      item.name.toLowerCase().includes(searchTerm) ||
      item.location.toLowerCase().includes(searchTerm) ||
      item.description.toLowerCase().includes(searchTerm) ||
      item.category.toLowerCase().includes(searchTerm)
    )
    
    return {
      ...dataset,
      data: filteredData,
      metadata: {
        ...dataset.metadata,
        searched: true,
        search_query: query,
        search_results: filteredData.length
      }
    }
  }
}

export default new DatasetProcessor()