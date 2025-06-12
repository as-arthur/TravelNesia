import { useState, useEffect, useCallback } from 'react'
import { reviewService } from '../services/reviewService'
import { authService } from '../services/authService'

// Hook khusus untuk manage user's own reviews
export const useUserReviews = (userId = null) => {
  const [userReviews, setUserReviews] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [stats, setStats] = useState({
    totalReviews: 0,
    averageRating: 0,
    totalVotes: 0,
    helpfulVotes: 0
  })
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    hasMore: true
  })

  const currentUser = authService.getCurrentUser()
  const targetUserId = userId || currentUser?.id

  // Load user reviews
  const loadUserReviews = useCallback(async (page = 1, reset = false) => {
    if (!targetUserId) return

    try {
      setIsLoading(true)
      setError(null)

      const response = await reviewService.getUserReviews(targetUserId, {
        page,
        limit: pagination.limit,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      })

      if (response.success) {
        const newReviews = response.data || []
        
        if (reset || page === 1) {
          setUserReviews(newReviews)
        } else {
          setUserReviews(prev => [...prev, ...newReviews])
        }

        setPagination(prev => ({
          ...prev,
          page,
          total: response.total || 0,
          hasMore: newReviews.length === pagination.limit
        }))

        // Calculate stats
        calculateStats(reset ? newReviews : [...userReviews, ...newReviews])
      }
    } catch (err) {
      console.error('Error loading user reviews:', err)
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [targetUserId, pagination.limit, userReviews])

  // Calculate user review statistics
  const calculateStats = useCallback((reviews) => {
    if (!reviews || reviews.length === 0) {
      setStats({
        totalReviews: 0,
        averageRating: 0,
        totalVotes: 0,
        helpfulVotes: 0
      })
      return
    }

    const totalReviews = reviews.length
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0)
    const averageRating = totalRating / totalReviews
    const totalVotes = reviews.reduce((sum, review) => sum + (review.helpfulVotes || 0) + (review.notHelpfulVotes || 0), 0)
    const helpfulVotes = reviews.reduce((sum, review) => sum + (review.helpfulVotes || 0), 0)

    setStats({
      totalReviews,
      averageRating: Math.round(averageRating * 10) / 10,
      totalVotes,
      helpfulVotes
    })
  }, [])

  // Add new review to list
  const addReview = useCallback((newReview) => {
    setUserReviews(prev => [newReview, ...prev])
    calculateStats([newReview, ...userReviews])
  }, [userReviews, calculateStats])

  // Update existing review
  const updateReview = useCallback((reviewId, updatedData) => {
    setUserReviews(prev => prev.map(review => 
      review.id === reviewId 
        ? { ...review, ...updatedData, updatedAt: new Date().toISOString() }
        : review
    ))
  }, [])

  // Delete review
  const deleteReview = useCallback(async (reviewId) => {
    try {
      await reviewService.deleteReview(reviewId)
      
      setUserReviews(prev => {
        const filtered = prev.filter(review => review.id !== reviewId)
        calculateStats(filtered)
        return filtered
      })
      
      return { success: true }
    } catch (err) {
      console.error('Error deleting review:', err)
      setError(err.message)
      return { success: false, error: err.message }
    }
  }, [calculateStats])

  // Load more reviews (pagination)
  const loadMore = useCallback(() => {
    if (!isLoading && pagination.hasMore) {
      loadUserReviews(pagination.page + 1, false)
    }
  }, [isLoading, pagination.hasMore, pagination.page, loadUserReviews])

  // Refresh reviews
  const refresh = useCallback(() => {
    loadUserReviews(1, true)
  }, [loadUserReviews])

  // Load reviews on mount and when userId changes
  useEffect(() => {
    if (targetUserId) {
      loadUserReviews(1, true)
    }
  }, [targetUserId])

  return {
    // Data
    userReviews,
    stats,
    pagination,
    isLoading,
    error,
    
    // Actions
    addReview,
    updateReview,
    deleteReview,
    loadMore,
    refresh,
    
    // Utils
    hasReviews: userReviews.length > 0,
    isOwnReviews: targetUserId === currentUser?.id
  }
}

// Hook untuk manage review form state
export const useReviewForm = (initialData = null) => {
  const [formData, setFormData] = useState({
    rating: 5,
    title: '',
    comment: '',
    visitDate: '',
    wouldRecommend: true,
    ...initialData
  })
  const [selectedImages, setSelectedImages] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState({})

  // Update form field
  const updateField = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear error when field is updated
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }))
    }
  }, [errors])

  // Validate form
  const validateForm = useCallback(() => {
    const newErrors = {}

    if (!formData.rating || formData.rating < 1 || formData.rating > 5) {
      newErrors.rating = 'Rating harus antara 1-5'
    }

    if (!formData.comment || formData.comment.trim().length < 10) {
      newErrors.comment = 'Komentar minimal 10 karakter'
    }

    if (formData.comment && formData.comment.length > 500) {
      newErrors.comment = 'Komentar maksimal 500 karakter'
    }

    if (formData.title && formData.title.length > 100) {
      newErrors.title = 'Judul maksimal 100 karakter'
    }

    if (formData.visitDate) {
      const visitDate = new Date(formData.visitDate)
      const today = new Date()
      if (visitDate > today) {
        newErrors.visitDate = 'Tanggal kunjungan tidak boleh di masa depan'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData])

  // Submit form
  const submitForm = useCallback(async (destinationId = null) => {
    if (!validateForm()) {
      return { success: false, errors }
    }

    const currentUser = authService.getCurrentUser()
    if (!currentUser) {
      setErrors({ general: 'Silakan login terlebih dahulu' })
      return { success: false, errors: { general: 'Silakan login terlebih dahulu' } }
    }

    try {
      setIsSubmitting(true)
      setErrors({})

      const reviewData = {
        ...formData,
        destinationId,
        userId: currentUser.id,
        userName: currentUser.firstName,
        userAvatar: currentUser.avatar,
        images: selectedImages.map(img => img.file)
      }

      const response = await reviewService.createReview(reviewData)
      
      if (response.success) {
        // Reset form
        setFormData({
          rating: 5,
          title: '',
          comment: '',
          visitDate: '',
          wouldRecommend: true
        })
        setSelectedImages([])
        
        return { success: true, data: response.data }
      } else {
        throw new Error(response.message || 'Gagal mengirim review')
      }
    } catch (err) {
      console.error('Error submitting review:', err)
      const errorMessage = err.message || 'Gagal mengirim review'
      setErrors({ general: errorMessage })
      return { success: false, error: errorMessage }
    } finally {
      setIsSubmitting(false)
    }
  }, [formData, selectedImages, validateForm, errors])

  // Reset form
  const resetForm = useCallback(() => {
    setFormData({
      rating: 5,
      title: '',
      comment: '',
      visitDate: '',
      wouldRecommend: true
    })
    setSelectedImages([])
    setErrors({})
  }, [])

  return {
    // Form data
    formData,
    selectedImages,
    errors,
    isSubmitting,
    
    // Actions
    updateField,
    setSelectedImages,
    submitForm,
    resetForm,
    validateForm,
    
    // Computed
    isValid: Object.keys(errors).length === 0 && formData.comment.trim().length >= 10,
    isDirty: formData.comment.trim().length > 0 || formData.title.trim().length > 0
  }
}

// Hook untuk manage review voting
export const useReviewVoting = () => {
  const [votingStates, setVotingStates] = useState({})

  const voteReview = useCallback(async (reviewId, isHelpful) => {
    // Set loading state
    setVotingStates(prev => ({
      ...prev,
      [reviewId]: { isVoting: true }
    }))

    try {
      const response = await reviewService.voteReview(reviewId, isHelpful)
      
      if (response.success) {
        setVotingStates(prev => ({
          ...prev,
          [reviewId]: { 
            isVoting: false, 
            hasVoted: true, 
            voteType: isHelpful ? 'helpful' : 'not_helpful' 
          }
        }))
        
        return { success: true, data: response.data }
      } else {
        throw new Error(response.message || 'Gagal memberikan vote')
      }
    } catch (err) {
      console.error('Error voting review:', err)
      setVotingStates(prev => ({
        ...prev,
        [reviewId]: { isVoting: false, error: err.message }
      }))
      
      return { success: false, error: err.message }
    }
  }, [])

  const getVotingState = useCallback((reviewId) => {
    return votingStates[reviewId] || { isVoting: false, hasVoted: false }
  }, [votingStates])

  return {
    voteReview,
    getVotingState,
    votingStates
  }
}

export default useUserReviews