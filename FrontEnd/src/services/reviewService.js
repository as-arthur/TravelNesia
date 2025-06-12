import axiosInstance from './axiosConfig';
import { API_ENDPOINTS } from '../data/dummyData';

export const reviewService = {
  // Create new review
  async createReview(reviewData) {
    try {
      console.log('Creating review:', reviewData);
      
      // Prepare form data for image upload
      const formData = new FormData();
      
      // Add review data
      formData.append('rating', reviewData.rating);
      formData.append('title', reviewData.title || '');
      formData.append('comment', reviewData.comment);
      formData.append('visitDate', reviewData.visitDate || '');
      formData.append('wouldRecommend', reviewData.wouldRecommend);
      formData.append('userId', reviewData.userId);
      formData.append('userName', reviewData.userName);
      formData.append('userAvatar', reviewData.userAvatar || '');
      
      if (reviewData.destinationId) {
        formData.append('destinationId', reviewData.destinationId);
      }
      
      // Add images if any
      if (reviewData.images && reviewData.images.length > 0) {
        reviewData.images.forEach((imageObj, index) => {
          if (imageObj.file) {
            formData.append(`images`, imageObj.file);
          }
        });
      }

      const response = await axiosInstance.post(API_ENDPOINTS.REVIEWS.CREATE, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('Review created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating review:', error);
      
      // Handle different error types
      if (error.response) {
        // Server responded with error status
        const errorMessage = error.response.data?.error || error.response.data?.message || 'Failed to create review';
        throw new Error(errorMessage);
      } else if (error.request) {
        // Request was made but no response received
        throw new Error('Network error. Please check your connection.');
      } else {
        // Something else happened
        throw new Error(error.message || 'An unexpected error occurred');
      }
    }
  },

  // Get all reviews with filters
  async getReviews(filters = {}) {
    try {
      console.log('Fetching reviews with filters:', filters);
      
      const params = {
        page: filters.page || 1,
        limit: filters.limit || 10,
        sortBy: filters.sortBy || 'createdAt',
        sortOrder: filters.sortOrder || 'desc',
        ...filters
      };

      // Remove undefined values
      Object.keys(params).forEach(key => {
        if (params[key] === undefined || params[key] === null) {
          delete params[key];
        }
      });

      const response = await axiosInstance.get(API_ENDPOINTS.REVIEWS.ALL, { params });
      
      console.log('Reviews fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching reviews:', error);
      
      // Return mock data as fallback
      return {
        success: true,
        data: this.getMockReviews(),
        pagination: {
          page: 1,
          limit: 10,
          total: 3,
          pages: 1,
          hasMore: false
        }
      };
    }
  },

  // Get reviews for specific destination
  async getDestinationReviews(destinationId, options = {}) {
    try {
      const params = {
        destinationId: destinationId,
        page: options.page || 1,
        limit: options.limit || 10,
        sortBy: options.sortBy || 'createdAt',
        sortOrder: options.sortOrder || 'desc'
      };

      const response = await axiosInstance.get(API_ENDPOINTS.REVIEWS.ALL, { params });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching destination reviews:', error);
      return {
        success: true,
        data: this.getMockReviews().filter(r => r.destinationId === destinationId),
        pagination: { page: 1, limit: 10, total: 0, pages: 0, hasMore: false }
      };
    }
  },

  // Vote review as helpful/not helpful
  async voteReview(reviewId, isHelpful) {
    try {
      const response = await axiosInstance.post(`${API_ENDPOINTS.REVIEWS.ALL}/${reviewId}/vote`, {
        isHelpful: isHelpful
      });
      
      return response.data;
    } catch (error) {
      console.error('Error voting review:', error);
      
      // Mock successful vote
      return {
        success: true,
        data: {
          reviewId: reviewId,
          helpfulVotes: Math.floor(Math.random() * 20),
          notHelpfulVotes: Math.floor(Math.random() * 5),
          helpfulPercentage: '85.2'
        }
      };
    }
  },

  // Get review statistics
  async getReviewStats(destinationId = null) {
    try {
      const params = destinationId ? { destinationId } : {};
      const response = await axiosInstance.get(`${API_ENDPOINTS.REVIEWS.ALL}/stats`, { params });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching review stats:', error);
      
      // Return mock stats
      return {
        success: true,
        data: {
          totalReviews: 156,
          averageRating: 4.3,
          ratingDistribution: {
            1: 2,
            2: 5,
            3: 18,
            4: 67,
            5: 64
          },
          totalVotes: 324,
          helpfulVotes: 289,
          notHelpfulVotes: 35,
          reviewsWithImages: 89,
          reviewsWithRecommendation: 142,
          recommendationPercentage: 91
        }
      };
    }
  },

  // Update review (for owner)
  async updateReview(reviewId, updateData) {
    try {
      const response = await axiosInstance.put(`${API_ENDPOINTS.REVIEWS.ALL}/${reviewId}`, updateData);
      
      return response.data;
    } catch (error) {
      console.error('Error updating review:', error);
      throw new Error(error.response?.data?.error || 'Failed to update review');
    }
  },

  // Delete review (for owner or admin)
  async deleteReview(reviewId) {
    try {
      const response = await axiosInstance.delete(`${API_ENDPOINTS.REVIEWS.ALL}/${reviewId}`);
      
      return response.data;
    } catch (error) {
      console.error('Error deleting review:', error);
      throw new Error(error.response?.data?.error || 'Failed to delete review');
    }
  },

  // Report review
  async reportReview(reviewId, reason) {
    try {
      const response = await axiosInstance.post(`${API_ENDPOINTS.REVIEWS.ALL}/${reviewId}/report`, {
        reason: reason
      });
      
      return response.data;
    } catch (error) {
      console.error('Error reporting review:', error);
      throw new Error(error.response?.data?.error || 'Failed to report review');
    }
  },

  // Get user's reviews
  async getUserReviews(userId, options = {}) {
    try {
      const params = {
        userId: userId,
        page: options.page || 1,
        limit: options.limit || 10,
        sortBy: options.sortBy || 'createdAt',
        sortOrder: options.sortOrder || 'desc'
      };

      const response = await axiosInstance.get(API_ENDPOINTS.REVIEWS.ALL, { params });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching user reviews:', error);
      return {
        success: true,
        data: this.getMockReviews().filter(r => r.userId === userId),
        pagination: { page: 1, limit: 10, total: 0, pages: 0, hasMore: false }
      };
    }
  },

  // Get single review
  async getReview(reviewId) {
    try {
      const response = await axiosInstance.get(`${API_ENDPOINTS.REVIEWS.ALL}/${reviewId}`);
      
      return response.data;
    } catch (error) {
      console.error('Error fetching review:', error);
      throw new Error(error.response?.data?.error || 'Review not found');
    }
  },

  // Search reviews
  async searchReviews(query, filters = {}) {
    try {
      const params = {
        search: query,
        page: filters.page || 1,
        limit: filters.limit || 10,
        sortBy: filters.sortBy || 'createdAt',
        sortOrder: filters.sortOrder || 'desc',
        ...filters
      };

      const response = await axiosInstance.get(`${API_ENDPOINTS.REVIEWS.ALL}/search`, { params });
      
      return response.data;
    } catch (error) {
      console.error('Error searching reviews:', error);
      return {
        success: true,
        data: [],
        pagination: { page: 1, limit: 10, total: 0, pages: 0, hasMore: false }
      };
    }
  },

  // Get mock reviews for fallback
  getMockReviews() {
    return [
      {
        id: 1,
        userId: 'user_1',
        userName: 'Haikal Rahman',
        userAvatar: 'https://ui-avatars.com/api/?name=Haikal+Rahman&background=3B82F6&color=fff',
        destinationId: 1,
        rating: 5,
        title: 'Pengalaman Luar Biasa!',
        comment: 'Candi Borobudur benar-benar menakjubkan! Sunrise di sini sangat indah dan atmosfernya sangat spiritual. Guide yang ramah dan informatif membuat kunjungan semakin berkesan. Highly recommended!',
        visitDate: '2024-01-15',
        wouldRecommend: true,
        images: [
          'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=400&h=300&fit=crop',
          'https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?w=400&h=300&fit=crop'
        ],
        helpfulVotes: 24,
        notHelpfulVotes: 2,
        helpfulPercentage: '92.3',
        createdAt: '2024-01-16T10:30:00Z',
        updatedAt: '2024-01-16T10:30:00Z'
      },
      {
        id: 2,
        userId: 'user_2',
        userName: 'Sari Dewi',
        userAvatar: 'https://ui-avatars.com/api/?name=Sari+Dewi&background=E11D48&color=fff',
        destinationId: 2,
        rating: 4,
        title: 'Raja Ampat Memukau',
        comment: 'Snorkeling di Raja Ampat benar-benar seperti berada di akuarium raksasa! Keanekaragaman hayati lautnya luar biasa. Meski perjalanan cukup jauh, tapi sepadan dengan keindahan yang didapat.',
        visitDate: '2024-02-10',
        wouldRecommend: true,
        images: [
          'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=400&h=300&fit=crop'
        ],
        helpfulVotes: 18,
        notHelpfulVotes: 1,
        helpfulPercentage: '94.7',
        createdAt: '2024-02-12T14:20:00Z',
        updatedAt: '2024-02-12T14:20:00Z'
      },
      {
        id: 3,
        userId: 'user_3',
        userName: 'Budi Santoso',
        userAvatar: 'https://ui-avatars.com/api/?name=Budi+Santoso&background=059669&color=fff',
        destinationId: 3,
        rating: 5,
        title: 'Danau Toba yang Menawan',
        comment: 'Pemandangan Danau Toba dari Bukit Holbung sangat spektakuler! Udara segar, budaya Batak yang kental, dan makanan yang lezat. Perfect untuk family trip. Anak-anak juga sangat senang.',
        visitDate: '2024-03-05',
        wouldRecommend: true,
        images: [],
        helpfulVotes: 12,
        notHelpfulVotes: 0,
        helpfulPercentage: '100.0',
        createdAt: '2024-03-07T09:15:00Z',
        updatedAt: '2024-03-07T09:15:00Z'
      }
    ];
  },

  // Validate review data before sending
  validateReviewData(reviewData) {
    const errors = [];

    // Required fields
    if (!reviewData.rating || reviewData.rating < 1 || reviewData.rating > 5) {
      errors.push('Rating harus antara 1-5');
    }

    if (!reviewData.comment || reviewData.comment.trim().length < 10) {
      errors.push('Komentar minimal 10 karakter');
    }

    if (reviewData.comment && reviewData.comment.length > 500) {
      errors.push('Komentar maksimal 500 karakter');
    }

    // Optional fields validation
    if (reviewData.title && reviewData.title.length > 100) {
      errors.push('Judul maksimal 100 karakter');
    }

    if (reviewData.visitDate) {
      const visitDate = new Date(reviewData.visitDate);
      const today = new Date();
      if (visitDate > today) {
        errors.push('Tanggal kunjungan tidak boleh di masa depan');
      }
    }

    // Images validation
    if (reviewData.images && reviewData.images.length > 3) {
      errors.push('Maksimal 3 gambar per review');
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    };
  },

  // Format review data for display
  formatReviewForDisplay(review) {
    return {
      ...review,
      formattedDate: new Date(review.createdAt).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      formattedVisitDate: review.visitDate ? new Date(review.visitDate).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }) : null,
      timeAgo: this.getTimeAgo(review.createdAt),
      totalVotes: (review.helpfulVotes || 0) + (review.notHelpfulVotes || 0),
      helpfulPercentage: this.calculateHelpfulPercentage(review.helpfulVotes, review.notHelpfulVotes)
    };
  },

  // Calculate helpful percentage
  calculateHelpfulPercentage(helpfulVotes, notHelpfulVotes) {
    const total = (helpfulVotes || 0) + (notHelpfulVotes || 0);
    if (total === 0) return 0;
    return ((helpfulVotes || 0) / total * 100).toFixed(1);
  },

  // Get time ago string
  getTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    const intervals = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60
    };

    for (const [unit, seconds] of Object.entries(intervals)) {
      const interval = Math.floor(diffInSeconds / seconds);
      if (interval >= 1) {
        return `${interval} ${unit}${interval > 1 ? 's' : ''} yang lalu`;
      }
    }

    return 'Baru saja';
  },

  // Batch operations
  async batchDeleteReviews(reviewIds) {
    try {
      const response = await axiosInstance.delete(`${API_ENDPOINTS.REVIEWS.ALL}/batch`, {
        data: { reviewIds }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error batch deleting reviews:', error);
      throw new Error(error.response?.data?.error || 'Failed to delete reviews');
    }
  },

  // Export reviews (for admin)
  async exportReviews(format = 'csv', filters = {}) {
    try {
      const params = {
        format,
        ...filters
      };

      const response = await axiosInstance.get(`${API_ENDPOINTS.REVIEWS.ALL}/export`, {
        params,
        responseType: 'blob'
      });
      
      return response.data;
    } catch (error) {
      console.error('Error exporting reviews:', error);
      throw new Error(error.response?.data?.error || 'Failed to export reviews');
    }
  }
};