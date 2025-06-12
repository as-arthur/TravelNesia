import axiosInstance from './axiosConfig';
import { API_ENDPOINTS } from '../data/dummyData';

export const destinationService = {
  // Get all destinations
  async getAllDestinations(params = {}) {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.DESTINATIONS.ALL, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching destinations:', error);
      throw error;
    }
  },

  // Get destination by ID
  async getDestinationById(id) {
    try {
      const response = await axiosInstance.get(`${API_ENDPOINTS.DESTINATIONS.ALL}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching destination:', error);
      throw error;
    }
  },

  // Search destinations with ML recommendations
  async searchDestinations(query, filters = {}) {
    try {
      const params = {
        q: query,
        ...filters
      };
      const response = await axiosInstance.get(API_ENDPOINTS.DESTINATIONS.SEARCH, { params });
      return response.data;
    } catch (error) {
      console.error('Error searching destinations:', error);
      throw error;
    }
  },

  // Get destinations by category (for ML filtering)
  async getDestinationsByCategory(category, limit = 10) {
    try {
      const params = { category, limit };
      const response = await axiosInstance.get(`${API_ENDPOINTS.DESTINATIONS.ALL}/category`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching destinations by category:', error);
      throw error;
    }
  },

  // Upload destination images
  async uploadDestinationImages(destinationId, images) {
    try {
      const formData = new FormData();
      
      // Add destination ID
      formData.append('destinationId', destinationId);
      
      // Add each image file
      images.forEach((imageObj, index) => {
        formData.append(`images`, imageObj.file);
      });

      const response = await axiosInstance.post(
        `${API_ENDPOINTS.DESTINATIONS.ALL}/${destinationId}/images`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error uploading images:', error);
      throw error;
    }
  },

  // Get popular destinations (dari ML)
  async getPopularDestinations(limit = 8) {
    try {
      const params = { limit };
      const response = await axiosInstance.get(API_ENDPOINTS.DESTINATIONS.POPULAR, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching popular destinations:', error);
      throw error;
    }
  },

  // Get destinations by location (koordinat dari geolocation)
  async getDestinationsByLocation(latitude, longitude, radius = 50) {
    try {
      const params = { 
        lat: latitude, 
        lng: longitude, 
        radius: radius 
      };
      const response = await axiosInstance.get(`${API_ENDPOINTS.DESTINATIONS.ALL}/nearby`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching nearby destinations:', error);
      throw error;
    }
  },

  // Add destination to favorites
  async addToFavorites(destinationId) {
    try {
      const response = await axiosInstance.post(`${API_ENDPOINTS.DESTINATIONS.ALL}/${destinationId}/favorite`);
      return response.data;
    } catch (error) {
      console.error('Error adding to favorites:', error);
      throw error;
    }
  },

  // Remove from favorites
  async removeFromFavorites(destinationId) {
    try {
      const response = await axiosInstance.delete(`${API_ENDPOINTS.DESTINATIONS.ALL}/${destinationId}/favorite`);
      return response.data;
    } catch (error) {
      console.error('Error removing from favorites:', error);
      throw error;
    }
  },

  // Rate destination
  async rateDestination(destinationId, rating) {
    try {
      const response = await axiosInstance.post(`${API_ENDPOINTS.DESTINATIONS.ALL}/${destinationId}/rate`, {
        rating: rating
      });
      return response.data;
    } catch (error) {
      console.error('Error rating destination:', error);
      throw error;
    }
  },

  // Get destinations from ML dataset
  async getMLDestinations(filters = {}) {
    try {
      const response = await axiosInstance.get('/api/ml/destinations', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching ML destinations:', error);
      // Fallback to dummy data jika ML service gagal
      return { data: [], success: false };
    }
  }
};