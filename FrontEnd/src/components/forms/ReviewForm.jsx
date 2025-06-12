import React, { useState } from 'react'
import { Star, Send, X, Camera, Loader2 } from 'lucide-react'
import { reviewService } from '../../services/reviewService'
import { authService } from '../../services/authService'
import ImageUpload from './ImageUpload'

const ReviewForm = ({ onClose, onSuccess, destinationId = null }) => {
  const [formData, setFormData] = useState({
    rating: 5,
    title: '',
    comment: '',
    visitDate: '',
    wouldRecommend: true
  })
  const [selectedImages, setSelectedImages] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  const currentUser = authService.getCurrentUser()

  // Validation rules
  const validateForm = () => {
    const errors = {}
    
    if (!formData.comment.trim() || formData.comment.trim().length < 10) {
      errors.comment = 'Review minimal 10 karakter'
    }
    
    if (formData.comment.trim().length > 500) {
      errors.comment = 'Review maksimal 500 karakter'
    }
    
    if (formData.title.length > 100) {
      errors.title = 'Judul maksimal 100 karakter'
    }
    
    if (formData.visitDate) {
      const visitDate = new Date(formData.visitDate)
      const today = new Date()
      if (visitDate > today) {
        errors.visitDate = 'Tanggal kunjungan tidak boleh di masa depan'
      }
    }
    
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    
    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleRatingClick = (rating) => {
    setFormData(prev => ({ ...prev, rating }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!currentUser) {
      setError('Silakan login terlebih dahulu untuk memberikan review')
      return
    }

    if (!validateForm()) {
      setError('Mohon perbaiki kesalahan pada form')
      return
    }

    try {
      setIsSubmitting(true)
      setError('')

      const reviewData = {
        ...formData,
        userId: currentUser.id,
        userName: currentUser.firstName || currentUser.name,
        userAvatar: currentUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.firstName || 'User')}&background=3B82F6&color=fff`,
        destinationId: destinationId,
        images: selectedImages,
        createdAt: new Date().toISOString()
      }

      console.log('Submitting review:', reviewData)

      const response = await reviewService.createReview(reviewData)
      
      if (response.success) {
        console.log('Review submitted successfully:', response)
        
        // Reset form
        setFormData({
          rating: 5,
          title: '',
          comment: '',
          visitDate: '',
          wouldRecommend: true
        })
        setSelectedImages([])
        setFieldErrors({})
        
        // Call success callback
        if (onSuccess) {
          onSuccess(response.data)
        }
        
        // Close modal
        if (onClose) {
          onClose()
        }
      }
    } catch (error) {
      console.error('Error submitting review:', error)
      setError(error.response?.data?.error || error.message || 'Gagal mengirim review. Silakan coba lagi.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getRatingText = (rating) => {
    const ratingTexts = {
      1: 'Sangat Buruk',
      2: 'Buruk', 
      3: 'Biasa',
      4: 'Bagus',
      5: 'Sangat Bagus'
    }
    return ratingTexts[rating] || 'Bagus'
  }

  const getRatingColor = (rating) => {
    const colors = {
      1: 'text-red-500',
      2: 'text-orange-500',
      3: 'text-yellow-500',
      4: 'text-green-500',
      5: 'text-green-600'
    }
    return colors[rating] || 'text-green-500'
  }

  return (
    <div className="bg-white rounded-lg p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-gray-800">
          Bagikan Pengalaman Anda
        </h3>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            disabled={isSubmitting}
          >
            <X className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* User Info */}
      {currentUser && (
        <div className="flex items-center mb-6 p-4 bg-gray-50 rounded-lg">
          <img
            src={currentUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.firstName || 'User')}&background=3B82F6&color=fff`}
            alt={currentUser.firstName || 'User'}
            className="w-12 h-12 rounded-full mr-3"
          />
          <div>
            <p className="font-medium text-gray-800">{currentUser.firstName || currentUser.name}</p>
            <p className="text-sm text-gray-600">Membagikan review sebagai {currentUser.firstName || 'User'}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rating Pengalaman *
          </label>
          <div className="flex items-center space-x-2 mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => handleRatingClick(star)}
                className="transition-all duration-200 hover:scale-110"
                disabled={isSubmitting}
              >
                <Star
                  className={`w-8 h-8 ${
                    star <= formData.rating
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300 hover:text-yellow-200'
                  }`}
                />
              </button>
            ))}
            <span className={`ml-3 text-sm font-medium ${getRatingColor(formData.rating)}`}>
              {getRatingText(formData.rating)}
            </span>
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Judul Review (Opsional)
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="Ringkasan singkat pengalaman Anda..."
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
              fieldErrors.title ? 'border-red-500' : 'border-gray-300'
            }`}
            maxLength={100}
            disabled={isSubmitting}
          />
          {fieldErrors.title && (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.title}</p>
          )}
          <div className="text-right text-sm text-gray-500 mt-1">
            {formData.title.length}/100 karakter
          </div>
        </div>

        {/* Comment */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ceritakan Pengalaman Anda *
          </label>
          <textarea
            name="comment"
            value={formData.comment}
            onChange={handleInputChange}
            placeholder="Bagikan detail pengalaman Anda di tempat ini. Apa yang membuat kunjungan Anda berkesan?"
            rows={4}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-colors ${
              fieldErrors.comment ? 'border-red-500' : 'border-gray-300'
            }`}
            maxLength={500}
            disabled={isSubmitting}
            required
          />
          {fieldErrors.comment && (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.comment}</p>
          )}
          <div className="flex justify-between text-sm text-gray-500 mt-1">
            <span>{formData.comment.length < 10 ? `Minimal 10 karakter (${10 - formData.comment.length} lagi)` : 'Panjang review sudah cukup'}</span>
            <span>{formData.comment.length}/500 karakter</span>
          </div>
        </div>

        {/* Visit Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Kapan Anda Berkunjung? (Opsional)
          </label>
          <input
            type="date"
            name="visitDate"
            value={formData.visitDate}
            onChange={handleInputChange}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
              fieldErrors.visitDate ? 'border-red-500' : 'border-gray-300'
            }`}
            max={new Date().toISOString().split('T')[0]}
            disabled={isSubmitting}
          />
          {fieldErrors.visitDate && (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.visitDate}</p>
          )}
        </div>

        {/* Recommendation */}
        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              name="wouldRecommend"
              checked={formData.wouldRecommend}
              onChange={handleInputChange}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              disabled={isSubmitting}
            />
            <span className="ml-2 text-sm text-gray-700">
              Saya merekomendasikan tempat ini kepada orang lain
            </span>
          </label>
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Camera className="w-4 h-4 inline mr-1" />
            Tambahkan Foto (Opsional)
          </label>
          <ImageUpload
            onImageSelect={setSelectedImages}
            maxFiles={3}
            acceptedTypes="image/*"
            disabled={isSubmitting}
          />
          <p className="mt-1 text-xs text-gray-500">
            Maksimal 3 gambar, ukuran maksimal 10MB per gambar
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <div className="flex items-center">
              <X className="w-4 h-4 mr-2" />
              {error}
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end space-x-3 pt-6 border-t">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Batal
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting || !formData.comment.trim() || formData.comment.length < 10}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Mengirim...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Kirim Review
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default ReviewForm