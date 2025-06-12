import React, { useState, useEffect } from 'react'
import { Star, Edit, Trash2, Eye, ThumbsUp, Calendar, MapPin, Plus, Search, Filter } from 'lucide-react'
import { reviewService } from '../services/reviewService'
import { authService } from '../services/authService'
import ReviewForm from '../components/forms/ReviewForm'
import Modal, { ConfirmModal } from '../components/ui/Modal'
import Button from '../components/ui/Button'
import Pagination from '../components/ui/Pagination'

const UserReviewsPage = () => {
  const [reviews, setReviews] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingReview, setEditingReview] = useState(null)
  const [deletingReview, setDeletingReview] = useState(null)
  const [userStats, setUserStats] = useState({
    totalReviews: 0,
    averageRating: 0,
    totalHelpfulVotes: 0
  })

  const currentUser = authService.getCurrentUser()
  const limit = 10

  useEffect(() => {
    if (currentUser) {
      loadUserReviews()
      loadUserStats()
    }
  }, [currentUser, currentPage, sortBy, sortOrder, searchQuery])

  const loadUserReviews = async () => {
    try {
      setIsLoading(true)
      setError('')

      const response = await reviewService.getUserReviews(currentUser.id, {
        page: currentPage,
        limit: limit,
        sortBy: sortBy,
        sortOrder: sortOrder,
        search: searchQuery.trim() || undefined
      })

      if (response.success) {
        const formattedReviews = response.data.map(review => 
          reviewService.formatReviewForDisplay(review)
        )
        setReviews(formattedReviews)
        setTotalPages(response.pagination?.pages || 1)
      }
    } catch (error) {
      console.error('Error loading user reviews:', error)
      setError('Gagal memuat review Anda')
    } finally {
      setIsLoading(false)
    }
  }

  const loadUserStats = async () => {
    try {
      // Calculate stats from user reviews
      const allReviewsResponse = await reviewService.getUserReviews(currentUser.id, {
        page: 1,
        limit: 1000 // Get all reviews for stats
      })

      if (allReviewsResponse.success) {
        const allReviews = allReviewsResponse.data
        const totalReviews = allReviews.length
        const averageRating = totalReviews > 0 
          ? (allReviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews).toFixed(1)
          : 0
        const totalHelpfulVotes = allReviews.reduce((sum, review) => sum + (review.helpfulVotes || 0), 0)

        setUserStats({
          totalReviews,
          averageRating: parseFloat(averageRating),
          totalHelpfulVotes
        })
      }
    } catch (error) {
      console.error('Error loading user stats:', error)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setCurrentPage(1)
    loadUserReviews()
  }

  const handleSort = (newSortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(newSortBy)
      setSortOrder('desc')
    }
    setCurrentPage(1)
  }

  const handleEditReview = (review) => {
    setEditingReview(review)
  }

  const handleDeleteReview = async () => {
    if (!deletingReview) return

    try {
      await reviewService.deleteReview(deletingReview.id)
      
      // Remove from local state
      setReviews(prev => prev.filter(r => r.id !== deletingReview.id))
      setDeletingReview(null)
      
      // Reload stats
      loadUserStats()
      
      // Show success message
      alert('Review berhasil dihapus')
    } catch (error) {
      console.error('Error deleting review:', error)
      alert('Gagal menghapus review')
    }
  }

  const handleReviewSuccess = (newReview) => {
    if (editingReview) {
      // Update existing review
      setReviews(prev => prev.map(r => 
        r.id === editingReview.id 
          ? reviewService.formatReviewForDisplay(newReview)
          : r
      ))
      setEditingReview(null)
    } else {
      // Add new review to the beginning
      setReviews(prev => [reviewService.formatReviewForDisplay(newReview), ...prev])
      setShowAddModal(false)
    }
    
    loadUserStats()
  }

  const getRatingStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < rating
            ? 'text-yellow-400 fill-current'
            : 'text-gray-300'
        }`}
      />
    ))
  }

  const getRatingColor = (rating) => {
    if (rating >= 4.5) return 'text-green-600'
    if (rating >= 4.0) return 'text-green-500'
    if (rating >= 3.0) return 'text-yellow-500'
    if (rating >= 2.0) return 'text-orange-500'
    return 'text-red-500'
  }

  if (!currentUser) {
    return (
      <div className="pt-20 min-h-screen bg-gray-50">
        <div className="container mx-auto px-6 py-12 text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Akses Ditolak
          </h1>
          <p className="text-gray-600 mb-8">
            Silakan login untuk melihat review Anda
          </p>
          <Button onClick={() => window.location.href = '/login'}>
            Login
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Review Saya
              </h1>
              <p className="text-gray-600">
                Kelola semua review perjalanan Anda
              </p>
            </div>
            <Button onClick={() => setShowAddModal(true)} className="mt-4 md:mt-0">
              <Plus className="w-4 h-4 mr-2" />
              Tulis Review Baru
            </Button>
          </div>

          {/* User Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{userStats.totalReviews}</div>
              <div className="text-sm text-gray-600">Total Review</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className={`text-2xl font-bold ${getRatingColor(userStats.averageRating)}`}>
                {userStats.averageRating}
              </div>
              <div className="text-sm text-gray-600">Rating Rata-rata</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{userStats.totalHelpfulVotes}</div>
              <div className="text-sm text-gray-600">Total Helpful Votes</div>
            </div>
          </div>

          {/* Search and Sort */}
          <div className="flex flex-col md:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Cari review Anda..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </form>
            
            <div className="flex gap-2">
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [newSortBy, newSortOrder] = e.target.value.split('-')
                  setSortBy(newSortBy)
                  setSortOrder(newSortOrder)
                  setCurrentPage(1)
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="createdAt-desc">Terbaru</option>
                <option value="createdAt-asc">Terlama</option>
                <option value="rating-desc">Rating Tertinggi</option>
                <option value="rating-asc">Rating Terendah</option>
                <option value="helpfulVotes-desc">Paling Membantu</option>
              </select>
            </div>
          </div>
        </div>

        {/* Reviews List */}
        {isLoading ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat review...</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="text-red-500 mb-4">
              <Eye className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">Error</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={loadUserReviews}>Coba Lagi</Button>
          </div>
        ) : reviews.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="text-gray-400 mb-4">
              <Star className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">
              {searchQuery ? 'Tidak Ada Hasil' : 'Belum Ada Review'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchQuery 
                ? `Tidak ditemukan review yang cocok dengan "${searchQuery}"`
                : 'Anda belum menulis review. Mulai bagikan pengalaman perjalanan Anda!'
              }
            </p>
            {!searchQuery && (
              <Button onClick={() => setShowAddModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Tulis Review Pertama
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review.id} className="bg-white rounded-lg shadow-sm p-6">
                {/* Review Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      {getRatingStars(review.rating)}
                      <span className="font-medium text-gray-800">{review.rating}</span>
                    </div>
                    <span className="text-gray-400">•</span>
                    <span className="text-sm text-gray-500">{review.timeAgo}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditReview(review)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeletingReview(review)}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Hapus
                    </Button>
                  </div>
                </div>

                {/* Review Content */}
                <div className="space-y-3">
                  {review.title && (
                    <h4 className="font-medium text-gray-800">{review.title}</h4>
                  )}
                  
                  <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                  
                  {review.visitDate && (
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span>Berkunjung pada: {review.formattedVisitDate}</span>
                    </div>
                  )}

                  {/* Review Images */}
                  {review.images && review.images.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mt-4">
                      {review.images.slice(0, 3).map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`Review image ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                      ))}
                    </div>
                  )}

                  {/* Review Stats */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <ThumbsUp className="w-4 h-4" />
                        <span>{review.helpfulVotes || 0} helpful</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Eye className="w-4 h-4" />
                        <span>{review.totalVotes || 0} total votes</span>
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-500">
                      {review.helpfulPercentage}% helpful
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </div>
        )}

        {/* Add Review Modal */}
        <Modal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          size="lg"
          title="Tulis Review Baru"
        >
          <ReviewForm
            onClose={() => setShowAddModal(false)}
            onSuccess={handleReviewSuccess}
          />
        </Modal>

        {/* Edit Review Modal */}
        <Modal
          isOpen={!!editingReview}
          onClose={() => setEditingReview(null)}
          size="lg"
          title="Edit Review"
        >
          {editingReview && (
            <ReviewForm
              onClose={() => setEditingReview(null)}
              onSuccess={handleReviewSuccess}
              initialData={editingReview}
              isEditing={true}
            />
          )}
        </Modal>

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          isOpen={!!deletingReview}
          onClose={() => setDeletingReview(null)}
          onConfirm={handleDeleteReview}
          title="Hapus Review"
          message={`Apakah Anda yakin ingin menghapus review "${deletingReview?.title || 'ini'}"? Tindakan ini tidak dapat dibatalkan.`}
          confirmText="Hapus"
          confirmStyle="danger"
        />
      </div>
    </div>
  )
}

export default UserReviewsPage