import { useState, useEffect } from 'react'
import { authService } from '../services/authService'

export const useAuth = () => {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = () => {
    try {
      setIsLoading(true)
      const currentUser = authService.getCurrentUser()
      const isAuth = authService.isAuthenticated()
      
      setUser(currentUser)
      setIsAuthenticated(isAuth)
    } catch (error) {
      console.error('Error checking auth status:', error)
      setUser(null)
      setIsAuthenticated(false)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials)
      if (response.user) {
        setUser(response.user)
        setIsAuthenticated(true)
      }
      return response
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  const logout = async () => {
    try {
      await authService.logout()
      setUser(null)
      setIsAuthenticated(false)
    } catch (error) {
      console.error('Logout error:', error)
      // Still clear local state even if API call fails
      setUser(null)
      setIsAuthenticated(false)
    }
  }

  const register = async (userData) => {
    try {
      const response = await authService.register(userData)
      return response
    } catch (error) {
      console.error('Register error:', error)
      throw error
    }
  }

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    register,
    checkAuthStatus
  }
}
