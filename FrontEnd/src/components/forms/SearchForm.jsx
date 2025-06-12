import React, { useState, useRef, useEffect } from 'react'
import { Search, X, MapPin, Clock, Loader2 } from 'lucide-react'

const SearchForm = ({
  onSearch = () => {},
  placeholder = 'Cari destinasi wisata...',
  showSuggestions = true,
  isLoading = false,
  className = ''
}) => {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [recentSearches, setRecentSearches] = useState([])
  const searchInputRef = useRef(null)
  const suggestionsRef = useRef(null)

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('travelNesia_recent_searches')
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved))
      } catch (error) {
        console.error('Error loading recent searches:', error)
      }
    }
  }, [])

  // Mock suggestions based on common Indonesian destinations
  const mockSuggestions = [
    'Borobudur', 'Raja Ampat', 'Bromo', 'Bali', 'Yogyakarta', 
    'Lombok', 'Danau Toba', 'Komodo', 'Labuan Bajo', 'Toraja',
    'Dieng', 'Bandung', 'Jakarta', 'Medan', 'Malang'
  ]

  const handleInputChange = (e) => {
    const value = e.target.value
    setQuery(value)

    if (value.trim().length > 0 && showSuggestions) {
      // Filter suggestions based on input
      const filtered = mockSuggestions.filter(item =>
        item.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 5)
      
      setSuggestions(filtered)
      setShowSuggestions(true)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (query.trim()) {
      performSearch(query.trim())
    }
  }

  const performSearch = (searchTerm) => {
    // Save to recent searches
    const updatedRecent = [
      searchTerm,
      ...recentSearches.filter(item => item !== searchTerm)
    ].slice(0, 5)
    
    setRecentSearches(updatedRecent)
    localStorage.setItem('travelNesia_recent_searches', JSON.stringify(updatedRecent))
    
    // Hide suggestions
    setShowSuggestions(false)
    
    // Call search handler
    onSearch(searchTerm)
    
    console.log('🔍 Searching for:', searchTerm)
  }

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion)
    performSearch(suggestion)
  }

  const handleRecentClick = (recent) => {
    setQuery(recent)
    performSearch(recent)
  }

  const clearSearch = () => {
    setQuery('')
    setSuggestions([])
    setShowSuggestions(false)
    searchInputRef.current?.focus()
  }

  const clearRecentSearches = () => {
    setRecentSearches([])
    localStorage.removeItem('travelNesia_recent_searches')
  }

  const handleFocus = () => {
    if (query.trim().length > 0) {
      setShowSuggestions(true)
    }
  }

  const handleBlur = (e) => {
    // Delay hiding suggestions to allow clicks
    setTimeout(() => {
      if (!suggestionsRef.current?.contains(e.relatedTarget)) {
        setShowSuggestions(false)
      }
    }, 150)
  }

  return (
    <div className={`relative ${className}`}>
      {/* Search Form */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <input
            ref={searchInputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            className="w-full px-4 py-3 pl-12 pr-16 text-gray-800 bg-white border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
            disabled={isLoading}
          />
          
          {/* Search Icon */}
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
            <Search className="w-5 h-5 text-gray-400" />
          </div>
          
          {/* Clear Button */}
          {query && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-12 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
          
          {/* Search/Loading Button */}
          <button
            type="submit"
            disabled={!query.trim() || isLoading}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white p-2 rounded-full transition-colors"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Search className="w-5 h-5" />
            )}
          </button>
        </div>
      </form>

      {/* Suggestions Dropdown */}
      {showSuggestions && (suggestions.length > 0 || recentSearches.length > 0) && (
        <div 
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto"
        >
          {/* Current Query Suggestion */}
          {query.trim() && (
            <div className="p-2 border-b border-gray-100">
              <button
                onClick={() => performSearch(query.trim())}
                className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded flex items-center space-x-3"
              >
                <Search className="w-4 h-4 text-blue-500" />
                <span>Cari "<strong>{query}</strong>"</span>
              </button>
            </div>
          )}

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="p-2">
              <div className="text-xs font-medium text-gray-500 px-3 py-2">
                Saran Pencarian
              </div>
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded flex items-center space-x-3"
                >
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span>{suggestion}</span>
                </button>
              ))}
            </div>
          )}

          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <div className="p-2 border-t border-gray-100">
              <div className="flex items-center justify-between px-3 py-2">
                <div className="text-xs font-medium text-gray-500 flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>Pencarian Terkini</span>
                </div>
                <button
                  onClick={clearRecentSearches}
                  className="text-xs text-red-500 hover:text-red-700"
                >
                  Hapus
                </button>
              </div>
              {recentSearches.map((recent, index) => (
                <button
                  key={index}
                  onClick={() => handleRecentClick(recent)}
                  className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded flex items-center space-x-3"
                >
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">{recent}</span>
                </button>
              ))}
            </div>
          )}

          {/* No suggestions */}
          {query.trim() && suggestions.length === 0 && recentSearches.length === 0 && (
            <div className="p-4 text-center text-gray-500">
              <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p>Tidak ada saran untuk "{query}"</p>
              <p className="text-sm">Tekan Enter untuk mencari</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default SearchForm