// src/components/cards/ReviewCard.jsx
import React, { useState } from 'react'
import { Star, ThumbsUp, ThumbsDown, Calendar, MoreHorizontal } from 'lucide-react'
import Rating from '../ui/Rating'
import { formatDate } from '../../utils/dateUtils'

const ReviewCard = ({ 
  review, 
  onVote = null, 
  onReport = null,
  currentUserId = null 
}) => {
  const [isVoting, setIsVoting] = useState(false)
  
  const handleVote = async (isHelpful) => {
    if (!onVote || isVoting) return
    
    setIsVoting(true)
    try {
      await onVote(review.id, isHelpful)
    } finally {
      setIsVoting(false)
    }
  }
  
  const isOwnReview = currentUserId === review.userId
  
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <img
            src={review.userAvatar || `https://ui-avatars.com/api/?name=${review.userName}&background=3B82F6&color=fff`}
            alt={review.userName}
            className="w-12 h-12 rounded-full"
          />
          <div>
            <h4 className="font-medium text-gray-800">{review.userName}</h4>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Rating value={review.rating} readonly size="sm" />
              <span>•</span>
              <Calendar className="w-3 h-3" />
              <span>{formatDate(review.createdAt)}</span>
            </div>
          </div>
        </div>
        
        {!isOwnReview && (
          <button className="text-gray-400 hover:text-gray-600">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        )}
      </div>
      
      {/* Content */}
      <div className="space-y-3">
        {review.title && (
          <h5 className="font-medium text-gray-800">{review.title}</h5>
        )}
        
        <p className="text-gray-700 leading-relaxed">{review.comment}</p>
        
        {review.visitDate && (
          <p className="text-sm text-gray-500">
            Berkunjung pada: {formatDate(review.visitDate)}
          </p>
        )}
        
        {/* Images */}
        {review.images && review.images.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-4">
            {review.images.slice(0, 3).map((image, index) => (
              <img
                key={index}
                src={image.url || image}
                alt={`Review image ${index + 1}`}
                className="w-full h-24 object-cover rounded-lg"
              />
            ))}
          </div>
        )}
      </div>
      
      {/* Actions */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => handleVote(true)}
            disabled={isVoting || isOwnReview}
            className="flex items-center space-x-1 text-sm text-gray-500 hover:text-green-600 disabled:cursor-not-allowed"
          >
            <ThumbsUp className="w-4 h-4" />
            <span>Membantu ({review.helpfulVotes || 0})</span>
          </button>
          
          <button
            onClick={() => handleVote(false)}
            disabled={isVoting || isOwnReview}
            className="flex items-center space-x-1 text-sm text-gray-500 hover:text-red-600 disabled:cursor-not-allowed"
          >
            <ThumbsDown className="w-4 h-4" />
            <span>Tidak Membantu ({review.notHelpfulVotes || 0})</span>
          </button>
        </div>
        
        <div className="text-xs text-gray-400">
          {review.helpfulPercentage}% helpful
        </div>
      </div>
    </div>
  )
}

export default ReviewCard
