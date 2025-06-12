import React from 'react'
import { Star, ThumbsUp, MessageCircle, TrendingUp, Users, Award } from 'lucide-react'

const ReviewStats = ({ 
  stats = {},
  showDetailed = true,
  className = ''
}) => {
  const {
    totalReviews = 0,
    averageRating = 0,
    ratingDistribution = {},
    helpfulVotes = 0,
    notHelpfulVotes = 0,
    reviewsWithImages = 0,
    reviewsWithRecommendation = 0,
    recommendationPercentage = 0
  } = stats

  const totalVotes = helpfulVotes + notHelpfulVotes
  const helpfulPercentage = totalVotes > 0 ? (helpfulVotes / totalVotes * 100).toFixed(1) : 0

  const getRatingBars = () => {
    const maxCount = Math.max(...Object.values(ratingDistribution))
    
    return [5, 4, 3, 2, 1].map(rating => {
      const count = ratingDistribution[rating] || 0
      const percentage = totalReviews > 0 ? (count / totalReviews * 100).toFixed(1) : 0
      const barWidth = maxCount > 0 ? (count / maxCount * 100) : 0

      return (
        <div key={rating} className="flex items-center space-x-3 text-sm">
          <div className="flex items-center space-x-1 w-12">
            <span>{rating}</span>
            <Star className="w-3 h-3 text-yellow-400 fill-current" />
          </div>
          
          <div className="flex-1 bg-gray-200 rounded-full h-2 relative overflow-hidden">
            <div 
              className="bg-yellow-400 h-2 rounded-full transition-all duration-500"
              style={{ width: `${barWidth}%` }}
            />
          </div>
          
          <div className="text-gray-600 text-xs w-16 text-right">
            {count} ({percentage}%)
          </div>
        </div>
      )
    })
  }

  if (totalReviews === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-gray-600 mb-2">
          Belum Ada Review
        </h3>
        <p className="text-gray-500">
          Jadilah yang pertama memberikan review!
        </p>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Average Rating */}
        <div className="text-center p-6 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
          <div className="text-3xl font-bold text-gray-800 mb-2">
            {averageRating.toFixed(1)}
          </div>
          <div className="flex items-center justify-center space-x-1 mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-5 h-5 ${
                  star <= Math.round(averageRating)
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <div className="text-sm text-gray-600">
            dari {totalReviews} review
          </div>
        </div>

        {/* Total Reviews */}
        <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
          <div className="text-3xl font-bold text-gray-800 mb-2">
            {totalReviews.toLocaleString()}
          </div>
          <div className="flex items-center justify-center space-x-1 mb-2">
            <MessageCircle className="w-5 h-5 text-blue-500" />
            <span className="text-blue-600 font-medium">Reviews</span>
          </div>
          <div className="text-sm text-gray-600">
            Total ulasan pengguna
          </div>
        </div>

        {/* Recommendation Rate */}
        <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
          <div className="text-3xl font-bold text-gray-800 mb-2">
            {recommendationPercentage}%
          </div>
          <div className="flex items-center justify-center space-x-1 mb-2">
            <Award className="w-5 h-5 text-green-500" />
            <span className="text-green-600 font-medium">Recommend</span>
          </div>
          <div className="text-sm text-gray-600">
            Merekomendasikan tempat ini
          </div>
        </div>
      </div>

      {/* Detailed Stats */}
      {showDetailed && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Rating Distribution */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-blue-500" />
              Distribusi Rating
            </h4>
            <div className="space-y-3">
              {getRatingBars()}
            </div>
          </div>

          {/* Additional Stats */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2 text-purple-500" />
              Statistik Tambahan
            </h4>
            
            <div className="space-y-4">
              {/* Helpful Votes */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ThumbsUp className="w-4 h-4 text-green-500" />
                  <span className="text-gray-700">Votes Membantu</span>
                </div>
                <div className="text-right">
                  <span className="font-semibold">{helpfulVotes.toLocaleString()}</span>
                  <div className="text-xs text-gray-500">
                    {helpfulPercentage}% helpful
                  </div>
                </div>
              </div>

              {/* Reviews with Images */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-purple-500 rounded flex items-center justify-center">
                    <span className="text-white text-xs">📷</span>
                  </div>
                  <span className="text-gray-700">Review dengan Foto</span>
                </div>
                <div className="text-right">
                  <span className="font-semibold">{reviewsWithImages}</span>
                  <div className="text-xs text-gray-500">
                    {totalReviews > 0 ? ((reviewsWithImages / totalReviews) * 100).toFixed(1) : 0}% dari total
                  </div>
                </div>
              </div>

              {/* Total Votes */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-blue-500 rounded flex items-center justify-center">
                    <span className="text-white text-xs">👍</span>
                  </div>
                  <span className="text-gray-700">Total Voting</span>
                </div>
                <div className="text-right">
                  <span className="font-semibold">{totalVotes.toLocaleString()}</span>
                  <div className="text-xs text-gray-500">
                    {helpfulVotes} helpful, {notHelpfulVotes} not helpful
                  </div>
                </div>
              </div>

              {/* Average per Review */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <span className="text-gray-700 font-medium">Rata-rata per Review</span>
                <div className="text-right">
                  <span className="font-semibold">
                    {totalReviews > 0 ? (totalVotes / totalReviews).toFixed(1) : 0}
                  </span>
                  <div className="text-xs text-gray-500">votes per review</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
        <div className="flex items-start space-x-3">
          <div className="bg-blue-500 rounded-full p-2">
            <Award className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-800 mb-1">Ringkasan Review</h4>
            <p className="text-sm text-gray-600 leading-relaxed">
              Destinasi ini memiliki rating rata-rata <strong>{averageRating.toFixed(1)} dari 5 bintang</strong> berdasarkan {totalReviews} review dari pengunjung. 
              {recommendationPercentage > 50 && (
                <span> <strong>{recommendationPercentage}%</strong> pengunjung merekomendasikan tempat ini kepada orang lain.</span>
              )}
              {helpfulPercentage > 70 && (
                <span> Review-review yang diberikan dinilai sangat membantu oleh pengunjung lain ({helpfulPercentage}% helpful rate).</span>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReviewStats