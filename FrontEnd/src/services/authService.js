import axiosInstance from './axiosConfig';
import { API_ENDPOINTS } from '../data/dummyData';

export const authService = {
  // Login user
  async login(credentials) {
    try {
      const response = await axiosInstance.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Register user
  async register(userData) {
    try {
      const response = await axiosInstance.post(API_ENDPOINTS.AUTH.REGISTER, userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Logout user
  async logout() {
    try {
      await axiosInstance.post(API_ENDPOINTS.AUTH.LOGOUT);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } catch (error) {
      // Even if the API call fails, clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      throw error;
    }
  },

  // Get current user from localStorage
  getCurrentUser() {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  },

  // Check if user is authenticated
  isAuthenticated() {
    const token = localStorage.getItem('token');
    return !!token;
  },

  // Get auth token
  getToken() {
    return localStorage.getItem('token');
  }
};