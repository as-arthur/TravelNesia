import axiosInstance from './axiosConfig';
import MLService from './mlService';
import { API_ENDPOINTS } from '../data/dummyData';

export const recommendationService = {
  // Get personalized recommendations menggunakan ML Discovery API
  async getUserRecommendations(userId, preferences = {}) {
    try {
      console.log('🎯 Frontend request: Getting user recommendations via ML Discovery', { userId, preferences });
      
      // Prepare request data untuk ML Discovery API
      const requestData = {
        preferences: {
          user_id: userId,
          categories: preferences.categories || ['alam', 'budaya'],
          budget_range: preferences.budgetRange || 'medium',
          travel_style: preferences.travelStyle || 'family',
          ...preferences
        },
        filters: {
          category: preferences.category || 'all',
          limit: preferences.limit || 8
        }
      };

      // Call ML Discovery API
      const mlResponse = await MLService.getDiscoveryRecommendations(requestData);
      
      if (mlResponse.success) {
        console.log('✅ ML Discovery Response received:', mlResponse);
        return mlResponse;
      } else {
        throw new Error('ML Discovery API failed');
      }
      
    } catch (error) {
      console.error('❌ Error getting user recommendations:', error);
      
      // Fallback to ML Complete Recommendations
      try {
        console.log('🔄 Trying ML Complete Recommendations as fallback');
        const fallbackResponse = await MLService.getCompleteRecommendations(userId, preferences);
        return fallbackResponse;
      } catch (fallbackError) {
        console.error('❌ Fallback also failed:', fallbackError);
        return MLService.getFallbackRecommendations();
      }
    }
  },

  // Get recommendations berdasarkan lokasi menggunakan ML Recom-Lokasi
  async getLocationBasedRecommendations(latitude, longitude, radius = 50) {
    try {
      console.log('📍 Frontend request: Getting location recommendations via ML', { latitude, longitude, radius });
      
      const options = {
        radius: radius,
        limit: 6,
        category: null // Semua kategori
      };

      const mlResponse = await MLService.getLocationBasedRecommendations(latitude, longitude, options);
      
      if (mlResponse.success) {
        console.log('✅ ML Location Response received:', mlResponse);
        return mlResponse;
      } else {
        throw new Error('ML Location API failed');
      }
      
    } catch (error) {
      console.error('❌ Error getting location recommendations:', error);
      return MLService.getFallbackRecommendations();
    }
  },

  // Get recommendations by category menggunakan ML Recom-Category
  async getDestinationsByCategory(category) {
    try {
      console.log('📂 Frontend request: Getting category recommendations via ML', { category });
      
      const options = {
        limit: 6,
        region: null,
        priceRange: null
      };

      const mlResponse = await MLService.getRecommendationsByCategory(category, options);
      
      if (mlResponse.success) {
        console.log('✅ ML Category Response received:', mlResponse);
        return mlResponse;
      } else {
        throw new Error('ML Category API failed');
      }
      
    } catch (error) {
      console.error('❌ Error getting category recommendations:', error);
      return MLService.getFallbackRecommendations();
    }
  },

  // Search dengan ML Discovery API
  async searchDestinations(query, filters = {}) {
    try {
      console.log('🔍 Frontend request: ML search', { query, filters });
      
      const requestData = {
        preferences: {
          search_query: query,
          categories: filters.categories || ['all'],
          budget_range: filters.budgetRange || 'all'
        },
        location: filters.location || null,
        filters: {
          category: filters.category || 'all',
          limit: filters.limit || 10,
          ...filters
        }
      };

      const mlResponse = await MLService.getDiscoveryRecommendations(requestData);
      
      if (mlResponse.success) {
        console.log('✅ ML Search Response received:', mlResponse);
        return mlResponse;
      } else {
        throw new Error('ML Search API failed');
      }
      
    } catch (error) {
      console.error('❌ Error searching with ML:', error);
      return MLService.getFallbackRecommendations();
    }
  },

  // Get similar destinations menggunakan ML Recom-ID
  async getSimilarDestinations(destinationId, limit = 4) {
    try {
      console.log('🔗 Frontend request: Similar destinations via ML', { destinationId, limit });
      
      const options = {
        limit: limit,
        includeSimilar: true
      };

      const mlResponse = await MLService.getRecommendationsById(destinationId, options);
      
      if (mlResponse.success) {
        console.log('✅ ML Similar Response received:', mlResponse);
        return mlResponse;
      } else {
        throw new Error('ML Similar API failed');
      }
      
    } catch (error) {
      console.error('❌ Error getting similar destinations:', error);
      return MLService.getFallbackRecommendations();
    }
  },

  // Get trending destinations
  async getTrendingDestinations(timeframe = '7d') {
    try {
      console.log('📈 Frontend request: Trending destinations', { timeframe });
      
      // Gunakan ML Default Recommendations untuk trending
      const options = {
        limit: 8,
        includePopular: true,
        mixCategories: true
      };

      const mlResponse = await MLService.getDefaultRecommendations(options);
      
      if (mlResponse.success) {
        console.log('✅ ML Trending Response received:', mlResponse);
        return mlResponse;
      } else {
        throw new Error('ML Trending API failed');
      }
      
    } catch (error) {
      console.error('❌ Error getting trending destinations:', error);
      return MLService.getFallbackRecommendations();
    }
  },

  // Send user interaction data to ML untuk training
  async trackUserInteraction(interactionData) {
    try {
      const requestData = {
        userId: interactionData.userId,
        destinationId: interactionData.destinationId,
        type: interactionData.type, // 'view', 'like', 'visit', 'search', 'click'
        timestamp: new Date().toISOString(),
        metadata: {
          source: 'frontend',
          user_agent: navigator.userAgent,
          session_id: sessionStorage.getItem('session_id') || 'anonymous',
          confidence_score: interactionData.confidence_score || null,
          recommendation_reason: interactionData.recommendation_reason || null,
          ...interactionData.metadata
        }
      };

      console.log('📊 Tracking user interaction:', requestData);

      // Track via ML Service
      await MLService.trackInteraction(requestData);
      
      console.log('✅ Interaction tracked successfully');
      return { success: true };
      
    } catch (error) {
      console.error('❌ Error tracking interaction:', error);
      // Tidak throw error karena tracking bukan critical feature
      return { success: false, error: error.message };
    }
  },

  // Update user preferences untuk ML personalization
  async updateUserPreferences(userId, preferences) {
    try {
      const requestData = {
        user_id: userId,
        preferences: {
          categories: preferences.categories || [],
          budget_range: preferences.budgetRange || 'medium',
          travel_style: preferences.travelStyle || 'family',
          preferred_regions: preferences.regions || [],
          interests: preferences.interests || [],
          ...preferences
        },
        timestamp: new Date().toISOString()
      };

      console.log('⚙️ Updating user preferences:', requestData);

      // Send to backend untuk simpan di database
      const response = await axiosInstance.put('/api/users/preferences', requestData);
      
      console.log('✅ User preferences updated:', requestData);
      return response.data;
      
    } catch (error) {
      console.error('❌ Error updating preferences:', error);
      throw error;
    }
  },

  // Get recommendations untuk homepage dengan mix dari berbagai API
  async getHomepageRecommendations(userId = null, userLocation = null) {
    try {
      console.log('🏠 Frontend request: Homepage recommendations', { userId, userLocation });
      
      const results = {
        personalized: [],
        location_based: [],
        trending: [],
        category_based: {}
      };

      // 1. Get personalized recommendations jika user login
      if (userId) {
        try {
          const personalizedResponse = await this.getUserRecommendations(userId, { limit: 6 });
          if (personalizedResponse.success) {
            results.personalized = personalizedResponse.data;
          }
        } catch (error) {
          console.warn('Failed to get personalized recommendations:', error);
        }
      }

      // 2. Get location-based recommendations jika ada geolocation
      if (userLocation) {
        try {
          const locationResponse = await this.getLocationBasedRecommendations(
            userLocation.latitude, 
            userLocation.longitude, 
            50
          );
          if (locationResponse.success) {
            results.location_based = locationResponse.data;
          }
        } catch (error) {
          console.warn('Failed to get location recommendations:', error);
        }
      }

      // 3. Get trending/default recommendations
      try {
        const trendingResponse = await this.getTrendingDestinations();
        if (trendingResponse.success) {
          results.trending = trendingResponse.data;
        }
      } catch (error) {
        console.warn('Failed to get trending recommendations:', error);
      }

      // 4. Get category-based recommendations
      const categories = ['budaya', 'alam', 'sejarah'];
      for (const category of categories) {
        try {
          const categoryResponse = await this.getDestinationsByCategory(category);
          if (categoryResponse.success) {
            results.category_based[category] = categoryResponse.data.slice(0, 4);
          }
        } catch (error) {
          console.warn(`Failed to get ${category} recommendations:`, error);
        }
      }

      console.log('✅ Homepage recommendations compiled:', results);
      return {
        success: true,
        data: results,
        metadata: {
          generated_at: new Date().toISOString(),
          user_id: userId,
          has_location: !!userLocation
        }
      };
      
    } catch (error) {
      console.error('❌ Error compiling homepage recommendations:', error);
      return MLService.getFallbackRecommendations();
    }
  },

  // Helper: Transform data untuk kompatibilitas dengan frontend lama
  transformForLegacyComponents(mlResponse) {
    if (!mlResponse || !mlResponse.success) {
      return [];
    }

    return mlResponse.data.map(item => ({
      id: item.id,
      name: item.name,
      location: item.location,
      image: item.image,
      rating: item.rating,
      category: item.category,
      price: item.price,
      description: item.description,
      coordinates: item.coordinates,
      features: item.features,
      // Legacy fields
      tag: item.popularity_score > 0.8 ? 'TRENDING' : null,
      // ML fields
      confidence_score: item.confidence_score,
      recommendation_reason: item.recommendation_reason
    }));
  }
};