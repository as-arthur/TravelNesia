import React, { useState } from 'react'
import { Star, MapPin, Heart, Bookmark, Eye } from 'lucide-react'
import MLImageDisplay from './MLImageDisplay'
import { recommendationService } from '../../services/recommendationService'
import { authService } from '../../services/authService'

const DestinationCard = ({ 
  destination, 
  showTag = false, 
  className = "",
  onCardClick = null,
  trackInteraction = true 
}) => {
  const [isLiked, setIsLiked] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [viewCount, setViewCount] = useState(destination.view_count || 0)

  // Handle card click dan tracking
  const handleCardClick = async () => {
    // Track interaction untuk ML
    if (trackInteraction) {
      const currentUser = authService.getCurrentUser()
      if (currentUser) {
        try {
          await recommendationService.trackUserInteraction({
            userId: currentUser.id,
            destinationId: destination.id,
            type: 'view',
            metadata: {
              source: 'destination_card',
              confidence_score: destination.confidence_score,
              recommendation_reason: destination.recommendation_reason
            }
          })
          
          // Update view count
          setViewCount(prev => prev + 1)
        } catch (error) {
          console.error('Failed to track interaction:', error)
        }
      }
    }

    // Call parent callback jika ada
    if (onCardClick) {
      onCardClick(destination)
    }
  }

  // Handle like button
  const handleLike = async (e) => {
    e.stopPropagation() // Prevent card click
    
    const newLikedState = !isLiked
    setIsLiked(newLikedState)
    
    // Track like interaction
    if (trackInteraction) {
      const currentUser = authService.getCurrentUser()
      if (currentUser) {
        try {
          await recommendationService.trackUserInteraction({
            userId: currentUser.id,
            destinationId: destination.id,
            type: newLikedState ? 'like' : 'unlike',
            metadata: {
              source: 'destination_card_like'
            }
          })
        } catch (error) {
          console.error('Failed to track like:', error)
        }
      }
    }
  }

  // Handle bookmark button
  const handleBookmark = async (e) => {
    e.stopPropagation() // Prevent card click
    
    const newBookmarkState = !isBookmarked
    setIsBookmarked(newBookmarkState)
    
    // Track bookmark interaction
    if (trackInteraction) {
      const currentUser = authService.getCurrentUser()
      if (currentUser) {
        try {
          await recommendationService.trackUserInteraction({
            userId: currentUser.id,
            destinationId: destination.id,
            type: newBookmarkState ? 'bookmark' : 'unbookmark',
            metadata: {
              source: 'destination_card_bookmark'
            }
          })
        } catch (error) {
          console.error('Failed to track bookmark:', error)
        }
      }
    }
  }

  // Prepare images untuk MLImageDisplay
  const destinationImages = destination.gallery || destination.images || [destination.image]
  
  return (
    <div 
      className={`card card-hover cursor-pointer ${className}`}
      onClick={handleCardClick}
    >
      {/* Image Section dengan ML Integration */}
      <div className="relative h-48">
        <MLImageDisplay
          images={destinationImages}
          alt={destination.name}
          className="h-full"
          showOverlay={false}
          destinationInfo={destination}
        />
        
        {/* Tag untuk trending/popular */}
        {showTag && destination.tag && (
          <div className="absolute top-2 left-2">
            <span className="bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded">
              {destination.tag}
            </span>
          </div>
        )}

        {/* ML Confidence Score */}
        {destination.confidence_score && destination.confidence_score < 0.8 && (
          <div className="absolute top-2 right-2">
            <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded">
              {(destination.confidence_score * 100).toFixed(0)}%
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="absolute top-2 right-2 flex space-x-1">
          <button
            onClick={handleLike}
            className={`p-1.5 rounded-full transition-colors ${
              isLiked 
                ? 'bg-red-500 text-white' 
                : 'bg-white/80 text-gray-700 hover:bg-white'
            }`}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
          </button>
          
          <button
            onClick={handleBookmark}
            className={`p-1.5 rounded-full transition-colors ${
              isBookmarked 
                ? 'bg-blue-500 text-white' 
                : 'bg-white/80 text-gray-700 hover:bg-white'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2">
          {destination.name}
        </h3>
        
        <div className="flex items-center text-gray-600 mb-2">
          <MapPin className="w-4 h-4 mr-1" />
          <span className="text-sm">{destination.location}</span>
        </div>

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
            <span className="text-sm font-medium">{destination.rating}</span>
          </div>
          
          {destination.price && (
            <span className="text-sm font-bold text-blue-600">
              {destination.price}
            </span>
          )}
        </div>

        {/* Description */}
        {destination.description && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {destination.description}
          </p>
        )}

        {/* ML Features */}
        {destination.features && destination.features.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {destination.features.slice(0, 3).map((feature, index) => (
              <span 
                key={index}
                className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
              >
                {feature}
              </span>
            ))}
          </div>
        )}

        {/* Stats Footer */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center">
            <Eye className="w-3 h-3 mr-1" />
            <span>{viewCount} views</span>
          </div>
          
          {destination.recommendation_reason && (
            <span className="text-blue-500 truncate ml-2" title={destination.recommendation_reason}>
              {destination.recommendation_reason}
            </span>
          )}
        </div>

        {/* ML Metadata (hanya untuk debugging) */}
        {process.env.NODE_ENV === 'development' && destination.confidence_score && (
          <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
            <div>Confidence: {(destination.confidence_score * 100).toFixed(1)}%</div>
            {destination.similarity_score && (
              <div>Similarity: {(destination.similarity_score * 100).toFixed(1)}%</div>
            )}
            {destination.popularity_score && (
              <div>Popularity: {destination.popularity_score}</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default DestinationCard