import React, { useState, useEffect } from 'react'
import { Filter, X, MapPin, Star, DollarSign, Calendar, RefreshCw } from 'lucide-react'
import { CATEGORIES, provinces } from '../../data/constants'

const FilterForm = ({ 
  onFilterChange = () => {},
  initialFilters = {},
  className = '',
  showAdvanced = false
}) => {
  const [filters, setFilters] = useState({
    category: 'all',
    province: '',
    city: '',
    minRating: 0,
    maxRating: 5,
    priceRange: 'all',
    sortBy: 'rating',
    sortOrder: 'desc',
    hasImages: false,
    hasRecommendation: false,
    ...initialFilters
  })

  const [isExpanded, setIsExpanded] = useState(false)
  const [activeFiltersCount, setActiveFiltersCount] = useState(0)

  // Update parent component when filters change
  useEffect(() => {
    onFilterChange(filters)
    
    // Count active filters
    const activeCount = Object.entries(filters).reduce((count, [key, value]) => {
      if (key === 'minRating' && value > 0) return count + 1
      if (key === 'maxRating' && value < 5) return count + 1
      if (key === 'category' && value !== 'all') return count + 1
      if (key === 'province' && value !== '') return count + 1
      if (key === 'city' && value !== '') return count + 1
      if (key === 'priceRange' && value !== 'all') return count + 1
      if ((key === 'hasImages' || key === 'hasRecommendation') && value) return count + 1
      return count
    }, 0)
    
    setActiveFiltersCount(activeCount)
  }, [filters, onFilterChange])

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const clearAllFilters = () => {
    setFilters({
      category: 'all',
      province: '',
      city: '',
      minRating: 0,
      maxRating: 5,
      priceRange: 'all',
      sortBy: 'rating',
      sortOrder: 'desc',
      hasImages: false,
      hasRecommendation: false
    })
  }

  const priceRanges = [
    { value: 'all', label: 'Semua Harga' },
    { value: 'free', label: 'Gratis' },
    { value: 'low', label: 'Rp 0 - 50.000' },
    { value: 'medium', label: 'Rp 50.000 - 200.000' },
    { value: 'high', label: 'Rp 200.000+' }
  ]

  const sortOptions = [
    { value: 'rating', label: 'Rating Tertinggi', order: 'desc' },
    { value: 'name', label: 'Nama A-Z', order: 'asc' },
    { value: 'name', label: 'Nama Z-A', order: 'desc' },
    { value: 'createdAt', label: 'Terbaru', order: 'desc' },
    { value: 'price', label: 'Harga Terendah', order: 'asc' },
    { value: 'price', label: 'Harga Tertinggi', order: 'desc' }
  ]

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
      {/* Header */}
      <div 
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-3">
          <Filter className="w-5 h-5 text-gray-600" />
          <span className="font-medium text-gray-800">Filter & Urutkan</span>
          {activeFiltersCount > 0 && (
            <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
              {activeFiltersCount}
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {activeFiltersCount > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                clearAllFilters()
              }}
              className="text-red-500 hover:text-red-700 text-sm flex items-center space-x-1"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reset</span>
            </button>
          )}
          <div className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Filter Content */}
      {isExpanded && (
        <div className="border-t border-gray-200 p-4 space-y-6">
          {/* Basic Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kategori Wisata
              </label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {CATEGORIES.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.icon} {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Province Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-1" />
                Provinsi
              </label>
              <select
                value={filters.province}
                onChange={(e) => handleFilterChange('province', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Semua Provinsi</option>
                {provinces.map(province => (
                  <option key={province} value={province}>
                    {province}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="w-4 h-4 inline mr-1" />
                Rentang Harga
              </label>
              <select
                value={filters.priceRange}
                onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {priceRanges.map(range => (
                  <option key={range.value} value={range.value}>
                    {range.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Rating Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Star className="w-4 h-4 inline mr-1" />
              Rating Minimum
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min="0"
                max="5"
                step="0.5"
                value={filters.minRating}
                onChange={(e) => handleFilterChange('minRating', parseFloat(e.target.value))}
                className="flex-1"
              />
              <div className="flex items-center space-x-1 min-w-24">
                {[1, 2, 3, 4, 5].map(star => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= filters.minRating
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
                <span className="text-sm text-gray-600 ml-2">
                  {filters.minRating}+
                </span>
              </div>
            </div>
          </div>

          {/* City Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kota/Kabupaten
            </label>
            <input
              type="text"
              placeholder="Masukkan nama kota..."
              value={filters.city}
              onChange={(e) => handleFilterChange('city', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Advanced Filters */}
          {showAdvanced && (
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Filter Lanjutan</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Sort Options */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Urutkan Berdasarkan
                  </label>
                  <select
                    value={`${filters.sortBy}-${filters.sortOrder}`}
                    onChange={(e) => {
                      const [sortBy, sortOrder] = e.target.value.split('-')
                      handleFilterChange('sortBy', sortBy)
                      handleFilterChange('sortOrder', sortOrder)
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {sortOptions.map((option, index) => (
                      <option key={index} value={`${option.value}-${option.order}`}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Additional Options */}
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.hasImages}
                      onChange={(e) => handleFilterChange('hasImages', e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Hanya yang ada foto
                    </span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.hasRecommendation}
                      onChange={(e) => handleFilterChange('hasRecommendation', e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Direkomendasikan pengunjung
                    </span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Quick Filters */}
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Filter Cepat</h4>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  handleFilterChange('category', 'alam')
                  handleFilterChange('minRating', 4)
                }}
                className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm hover:bg-green-200 transition-colors"
              >
                🏔️ Wisata Alam Terbaik
              </button>
              
              <button
                onClick={() => {
                  handleFilterChange('category', 'budaya')
                  handleFilterChange('minRating', 4)
                }}
                className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm hover:bg-purple-200 transition-colors"
              >
                🏛️ Budaya Rating Tinggi
              </button>
              
              <button
                onClick={() => {
                  handleFilterChange('priceRange', 'free')
                  handleFilterChange('minRating', 4)
                }}
                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm hover:bg-blue-200 transition-colors"
              >
                🆓 Gratis & Berkualitas
              </button>
              
              <button
                onClick={() => {
                  handleFilterChange('hasImages', true)
                  handleFilterChange('hasRecommendation', true)
                }}
                className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm hover:bg-yellow-200 transition-colors"
              >
                ⭐ Populer & Terdokumentasi
              </button>
            </div>
          </div>

          {/* Active Filters Summary */}
          {activeFiltersCount > 0 && (
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-700">Filter Aktif</h4>
                <button
                  onClick={clearAllFilters}
                  className="text-red-500 hover:text-red-700 text-sm flex items-center space-x-1"
                >
                  <X className="w-4 h-4" />
                  <span>Hapus Semua</span>
                </button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {filters.category !== 'all' && (
                  <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    Kategori: {CATEGORIES.find(c => c.id === filters.category)?.name}
                    <button
                      onClick={() => handleFilterChange('category', 'all')}
                      className="ml-1 hover:text-blue-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                
                {filters.province && (
                  <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    Provinsi: {filters.province}
                    <button
                      onClick={() => handleFilterChange('province', '')}
                      className="ml-1 hover:text-green-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                
                {filters.minRating > 0 && (
                  <span className="inline-flex items-center px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                    Rating: {filters.minRating}+ ⭐
                    <button
                      onClick={() => handleFilterChange('minRating', 0)}
                      className="ml-1 hover:text-yellow-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                
                {filters.priceRange !== 'all' && (
                  <span className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                    Harga: {priceRanges.find(p => p.value === filters.priceRange)?.label}
                    <button
                      onClick={() => handleFilterChange('priceRange', 'all')}
                      className="ml-1 hover:text-purple-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default FilterForm
