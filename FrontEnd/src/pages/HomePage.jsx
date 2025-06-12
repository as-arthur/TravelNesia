import React, { useState, useEffect } from 'react'
import { Search, MapPin, Star, ChevronLeft, ChevronRight, Loader2, Plus, MessageCircle } from 'lucide-react'
import DestinationCard from '../components/cards/DestinationCard'
import TestimonialCard from '../components/cards/TestimonialCard'
import ReviewsList from '../components/display/ReviewsList'
import ReviewForm from '../components/forms/ReviewForm'
import Modal from '../components/ui/Modal'
import { destinations, popularDestinations, testimonials } from '../data/dummyData'
import { recommendationService } from '../services/recommendationService'
import { reviewService } from '../services/reviewService'
import { authService } from '../services/authService'
import MLService from '../services/mlService'

const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [currentDestinationIndex, setCurrentDestinationIndex] = useState(0)
  const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0)
  
  // State untuk ML Recommendations dari Dataset Real
  const [mlRecommendations, setMLRecommendations] = useState({
    personalized: [],
    location_based: [],
    trending: [],
    category_based: {}
  })
  const [isLoadingML, setIsLoadingML] = useState(false)
  const [mlError, setMLError] = useState(null)
  
  // User state
  const [userLocation, setUserLocation] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const currentUser = authService.getCurrentUser()

  // Review state
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [reviews, setReviews] = useState([])
  const [isLoadingReviews, setIsLoadingReviews] = useState(false)
  const [reviewStats, setReviewStats] = useState({
    totalReviews: 0,
    averageRating: 0,
    ratingDistribution: {}
  })

  // Get user location on component mount
  useEffect(() => {
    getCurrentLocation()
    loadMLRecommendations()
    loadReviews()
    loadReviewStats()
  }, [])

  // Function to get user's current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }
          setUserLocation(location)
          console.log('📍 User location obtained:', location)
        },
        (error) => {
          console.error('❌ Error getting location:', error)
          // Fallback to Jakarta coordinates
          const fallbackLocation = { latitude: -6.2088, longitude: 106.8456 }
          setUserLocation(fallbackLocation)
        }
      )
    }
  }

  // Load ML recommendations dari dataset real
  const loadMLRecommendations = async () => {
    try {
      setIsLoadingML(true)
      setMLError(null)

      console.log('🚀 Loading ML recommendations from real dataset...')

      // Get comprehensive homepage recommendations
      const mlResponse = await recommendationService.getHomepageRecommendations(
        currentUser?.id,
        userLocation
      )

      if (mlResponse.success) {
        console.log('✅ ML Dataset recommendations loaded:', mlResponse.data)
        setMLRecommendations(mlResponse.data)
      } else {
        throw new Error('Failed to load ML recommendations')
      }

    } catch (error) {
      console.error('❌ Error loading ML recommendations:', error)
      setMLError('Gagal memuat rekomendasi dari dataset ML')
      
      // Fallback to static data
      setMLRecommendations({
        personalized: destinations.slice(0, 4),
        location_based: popularDestinations.slice(0, 4),
        trending: destinations.slice(4, 8),
        category_based: {
          budaya: destinations.filter(d => d.category === 'budaya').slice(0, 3),
          alam: destinations.filter(d => d.category === 'alam').slice(0, 3)
        }
      })
    } finally {
      setIsLoadingML(false)
    }
  }

  // Load reviews
  const loadReviews = async () => {
    try {
      setIsLoadingReviews(true)
      const response = await reviewService.getReviews({
        limit: 6,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      })
      
      if (response.success) {
        setReviews(response.data || [])
      }
    } catch (error) {
      console.error('Error loading reviews:', error)
    } finally {
      setIsLoadingReviews(false)
    }
  }

  // Load review statistics
  const loadReviewStats = async () => {
    try {
      const response = await reviewService.getReviewStats()
      
      if (response.success) {
        setReviewStats(response.data)
      }
    } catch (error) {
      console.error('Error loading review stats:', error)
    }
  }

  // Handle new review submitted
  const handleNewReview = (newReview) => {
    setReviews(prev => [newReview, ...prev.slice(0, 5)])
    loadReviewStats()
    setShowReviewModal(false)
  }

  // Handle search dengan ML Discovery API
  const handleSearch = async (e) => {
    e.preventDefault()
    
    if (!searchQuery.trim()) return
    
    try {
      setIsLoadingML(true)
      setMLError(null)
      
      console.log('🔍 Searching with ML Discovery API:', searchQuery)
      
      const searchResponse = await recommendationService.searchDestinations(searchQuery, {
        category: selectedCategory,
        location: userLocation,
        limit: 8
      })
      
      if (searchResponse.success) {
        console.log('✅ ML Search results:', searchResponse.data)
        
        // Update personalized section with search results
        setMLRecommendations(prev => ({
          ...prev,
          personalized: searchResponse.data
        }))
        
        // Track search interaction
        if (currentUser) {
          await recommendationService.trackUserInteraction({
            userId: currentUser.id,
            destinationId: null,
            type: 'search',
            metadata: {
              query: searchQuery,
              results_count: searchResponse.data.length,
              category: selectedCategory
            }
          })
        }
      }
      
    } catch (error) {
      console.error('❌ Error searching:', error)
      setMLError('Gagal mencari destinasi')
    } finally {
      setIsLoadingML(false)
    }
  }

  // Handle category selection dengan ML Recom-Category API
  const handleCategorySelect = async (category) => {
    setSelectedCategory(category)
    
    try {
      setIsLoadingML(true)
      console.log('📂 Loading category recommendations:', category)
      
      if (category === 'all') {
        // Reload all recommendations
        await loadMLRecommendations()
      } else {
        // Get specific category recommendations
        const categoryResponse = await recommendationService.getDestinationsByCategory(category)
        
        if (categoryResponse.success) {
          console.log('✅ Category recommendations:', categoryResponse.data)
          
          setMLRecommendations(prev => ({
            ...prev,
            category_based: {
              ...prev.category_based,
              [category]: categoryResponse.data
            }
          }))
        }
      }
      
    } catch (error) {
      console.error('❌ Error loading category:', error)
      setMLError(`Gagal memuat kategori ${category}`)
    } finally {
      setIsLoadingML(false)
    }
  }

  // Handle destination card click untuk tracking
  const handleDestinationClick = async (destination) => {
    console.log('🎯 User clicked destination:', destination.name)
    
    // Track interaction dengan ML
    if (currentUser) {
      try {
        await recommendationService.trackUserInteraction({
          userId: currentUser.id,
          destinationId: destination.id,
          type: 'view',
          metadata: {
            source: 'homepage',
            category: destination.category,
            confidence_score: destination.confidence_score,
            recommendation_reason: destination.recommendation_reason
          }
        })
      } catch (error) {
        console.error('Failed to track interaction:', error)
      }
    }
    
    // Navigate to destination detail (implement as needed)
    console.log('Navigate to destination detail:', destination.id)
  }

  // Navigation functions
  const nextPersonalized = () => {
    setCurrentDestinationIndex((prev) => 
      prev === mlRecommendations.personalized.length - 1 ? 0 : prev + 1
    )
  }

  const prevPersonalized = () => {
    setCurrentDestinationIndex((prev) => 
      prev === 0 ? mlRecommendations.personalized.length - 1 : prev - 1
    )
  }

  const nextTestimonial = () => {
    setCurrentTestimonialIndex((prev) => 
      prev === testimonials.length - 1 ? 0 : prev + 1
    )
  }

  const prevTestimonial = () => {
    setCurrentTestimonialIndex((prev) => 
      prev === 0 ? testimonials.length - 1 : prev - 1
    )
  }

  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="relative min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=1920&h=1080&fit=crop')"
          }}
        ></div>
        
        <div className="relative z-10 container mx-auto px-6 py-20 flex flex-col justify-center min-h-screen text-center text-white">
          <h1 className="text-5xl lg:text-6xl font-bold mb-6 animate-fade-in">
            Explore Indonesia
          </h1>
          
          <div className="max-w-2xl mx-auto mb-8">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Cari destinasi wisata..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-6 py-4 rounded-full text-gray-800 text-lg focus:outline-none focus:ring-4 focus:ring-blue-300"
              />
              <button
                type="submit"
                disabled={isLoadingML}
                className="absolute right-2 top-2 bg-blue-500 hover:bg-blue-600 p-2 rounded-full transition-colors disabled:opacity-50"
              >
                {isLoadingML ? (
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                ) : (
                  <Search className="w-6 h-6 text-white" />
                )}
              </button>
            </form>
          </div>

          <p className="text-xl mb-12 opacity-90 max-w-3xl mx-auto">
            Jelajahi Keindahan Tersembunyi Indonesia dengan Rekomendasi AI
          </p>

          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-full px-6 py-3 flex items-center space-x-2">
              <MapPin className="w-5 h-5" />
              <span>Didukung Dataset ML Real</span>
            </div>
          </div>

          {/* Category Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <button 
              onClick={() => handleCategorySelect('all')}
              className={`bg-gray-600 bg-opacity-50 backdrop-blur-sm rounded-lg px-6 py-3 hover:bg-opacity-70 transition-all ${
                selectedCategory === 'all' ? 'ring-2 ring-yellow-400' : ''
              }`}
            >
              <MapPin className="w-5 h-5 mx-auto mb-2" />
              LOKASI SEKITAR
            </button>
            <button 
              onClick={() => handleCategorySelect('Budaya')}
              className={`bg-gray-600 bg-opacity-50 backdrop-blur-sm rounded-lg px-6 py-3 hover:bg-opacity-70 transition-all ${
                selectedCategory === 'Budaya' ? 'ring-2 ring-yellow-400' : ''
              }`}
            >
              <Star className="w-5 h-5 mx-auto mb-2" />
              WISATA BUDAYA
            </button>
            <button 
              onClick={() => handleCategorySelect('Alam')}
              className={`bg-gray-600 bg-opacity-50 backdrop-blur-sm rounded-lg px-6 py-3 hover:bg-opacity-70 transition-all ${
                selectedCategory === 'Alam' ? 'ring-2 ring-yellow-400' : ''
              }`}
            >
              <Star className="w-5 h-5 mx-auto mb-2" />
              WISATA ALAM
            </button>
          </div>
        </div>
      </section>

      {/* ML Error Display */}
      {mlError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mx-6 my-4">
          <div className="flex items-center">
            <span className="font-medium">ML Dataset Error:</span>
            <span className="ml-2">{mlError}</span>
            <button 
              onClick={loadMLRecommendations}
              className="ml-4 text-blue-600 hover:text-blue-800 underline"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      )}

      {/* Personalized Recommendations dari ML Dataset */}
      {mlRecommendations.personalized.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-800 mb-4">
                Rekomendasi Personal dari AI
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Berdasarkan analisis dataset wisata Indonesia dengan machine learning
              </p>
              {isLoadingML && (
                <div className="flex justify-center mt-4">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                  <span className="ml-2 text-blue-500">Loading dari ML API...</span>
                </div>
              )}
            </div>

            <div className="relative">
              <button
                onClick={prevPersonalized}
                disabled={isLoadingML}
                className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
                {mlRecommendations.personalized.map((destination, index) => (
                  <DestinationCard
                    key={destination.id || index}
                    destination={destination}
                    className={index === currentDestinationIndex ? 'ring-2 ring-blue-500' : ''}
                    onCardClick={handleDestinationClick}
                    trackInteraction={true}
                  />
                ))}
              </div>

              <button
                onClick={nextPersonalized}
                disabled={isLoadingML}
                className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            {/* ML Dataset Info */}
            <div className="text-center mt-8">
              <div className="inline-flex items-center space-x-4 px-4 py-2 bg-blue-100 rounded-full text-sm text-blue-800">
                <span>📊 Dataset: data_wisata_indonesia1.csv</span>
                <span>•</span>
                <span>🤖 ML API: Discovery Endpoint</span>
                <span>•</span>
                <span>⚡ Real-time Recommendations</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Location-based Recommendations dari ML Recom-Lokasi */}
      {mlRecommendations.location_based.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-800 mb-4">
                Destinasi Di Sekitar Anda
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Rekomendasi berdasarkan lokasi dari ML Recom-Lokasi API
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {mlRecommendations.location_based.map((destination, index) => (
                <DestinationCard
                  key={destination.id || index}
                  destination={destination}
                  showTag={true}
                  onCardClick={handleDestinationClick}
                  trackInteraction={true}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Category Recommendations dari ML Recom-Category */}
      {Object.keys(mlRecommendations.category_based).length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-800 mb-4">
                Eksplorasi Berdasarkan Kategori
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Rekomendasi kategori dari ML Recom-Category API
              </p>
            </div>

            {Object.entries(mlRecommendations.category_based).map(([category, destinations]) => (
              destinations.length > 0 && (
                <div key={category} className="mb-12">
                  <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                    Wisata {category.charAt(0).toUpperCase() + category.slice(1)}
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                    {destinations.map((destination, index) => (
                      <DestinationCard
                        key={destination.id || index}
                        destination={destination}
                        onCardClick={handleDestinationClick}
                        trackInteraction={true}
                      />
                    ))}
                  </div>
                </div>
              )
            ))}
          </div>
        </section>
      )}

      {/* Trending Destinations dari ML Default API */}
      {mlRecommendations.trending.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-800 mb-4">
                Destinasi Trending
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Destinasi populer dari ML Recom-Default API
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {mlRecommendations.trending.map((destination) => (
                <DestinationCard
                  key={destination.id}
                  destination={destination}
                  showTag={true}
                  onCardClick={handleDestinationClick}
                  trackInteraction={true}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Updated Testimonials Section - "Apa Yang Pengguna Katakan" */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center space-x-4 mb-4">
              <h2 className="text-4xl font-bold text-gray-800">
                Apa Yang Pengguna Katakan ?
              </h2>
              
              {/* Add Review Button - hanya muncul jika user sudah login */}
              {currentUser && (
                <button
                  onClick={() => setShowReviewModal(true)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tulis Review</span>
                </button>
              )}
            </div>

            {/* Review Stats */}
            {reviewStats.totalReviews > 0 && (
              <div className="flex items-center justify-center space-x-6 text-sm text-gray-600 mb-6">
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span>{reviewStats.averageRating.toFixed(1)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MessageCircle className="w-4 h-4" />
                  <span>{reviewStats.totalReviews} Reviews</span>
                </div>
              </div>
            )}

            {/* Login prompt untuk non-logged in users */}
            {!currentUser && (
              <p className="text-gray-600 max-w-2xl mx-auto mb-4">
                <a href="/login" className="text-blue-500 hover:text-blue-600 font-medium">
                  Login
                </a> untuk membagikan pengalaman perjalanan Anda!
              </p>
            )}
          </div>

          {/* Reviews List */}
          {isLoadingReviews ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : (
            <ReviewsList 
              limit={6}
              showAddButton={false}
            />
          )}

          {/* Fallback Testimonials jika belum ada reviews */}
          {reviews.length === 0 && !isLoadingReviews && (
            <div>
              <div className="relative">
                <button
                  onClick={prevTestimonial}
                  className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-colors"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {testimonials.map((testimonial) => (
                    <TestimonialCard
                      key={testimonial.id}
                      testimonial={testimonial}
                    />
                  ))}
                </div>

                <button
                  onClick={nextTestimonial}
                  className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-colors"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Review Modal */}
      <Modal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        size="lg"
        title="Bagikan Pengalaman Anda"
      >
        <ReviewForm
          onClose={() => setShowReviewModal(false)}
          onSuccess={handleNewReview}
        />
      </Modal>
    </div>
  )
}

export default HomePage