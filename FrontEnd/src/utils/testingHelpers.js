// src/utils/testingHelpers.js
import MLService from '../services/mlService'
import { recommendationService } from '../services/recommendationService'
import { reviewService } from '../services/reviewService'
import { authService } from '../services/authService'
import DatasetProcessor from './datasetProcessor'

export class TestingHelpers {
  // 1. TEST ML SERVICE CONNECTION
  static async testMLConnection() {
    console.log('🔍 Testing ML Service Connection...')
    
    const results = {
      health: false,
      discovery: false,
      category: false,
      location: false,
      dataset: false,
      errors: []
    }
    
    try {
      // Test health endpoint
      console.log('Testing ML Health...')
      results.health = await MLService.checkHealth()
      console.log('🏥 ML Health:', results.health ? '✅ OK' : '❌ FAILED')
      
      // Test discovery endpoint
      console.log('Testing ML Discovery...')
      try {
        const discoveryResponse = await MLService.getDiscoveryRecommendations({
          preferences: { categories: ['Budaya'] },
          limit: 3
        })
        results.discovery = discoveryResponse.success
        console.log('🎯 ML Discovery:', results.discovery ? '✅ OK' : '❌ FAILED')
      } catch (error) {
        results.errors.push(`Discovery: ${error.message}`)
        console.error('❌ Discovery Error:', error.message)
      }
      
      // Test category endpoint
      console.log('Testing ML Category...')
      try {
        const categoryResponse = await MLService.getRecommendationsByCategory('Budaya', { limit: 3 })
        results.category = categoryResponse.success
        console.log('📂 ML Category:', results.category ? '✅ OK' : '❌ FAILED')
      } catch (error) {
        results.errors.push(`Category: ${error.message}`)
        console.error('❌ Category Error:', error.message)
      }
      
      // Test location endpoint
      console.log('Testing ML Location...')
      try {
        const locationResponse = await MLService.getLocationBasedRecommendations(-6.2088, 106.8456, { limit: 3 })
        results.location = locationResponse.success
        console.log('📍 ML Location:', results.location ? '✅ OK' : '❌ FAILED')
      } catch (error) {
        results.errors.push(`Location: ${error.message}`)
        console.error('❌ Location Error:', error.message)
      }
      
      // Test dataset loading
      console.log('Testing Dataset Loading...')
      try {
        const dataset = await DatasetProcessor.loadCSVDataset()
        results.dataset = dataset.data.length > 0
        console.log('📊 Dataset:', results.dataset ? `✅ OK (${dataset.data.length} records)` : '❌ FAILED')
      } catch (error) {
        results.errors.push(`Dataset: ${error.message}`)
        console.error('❌ Dataset Error:', error.message)
      }
      
    } catch (error) {
      console.error('❌ ML Service Test Error:', error)
      results.errors.push(`General: ${error.message}`)
    }
    
    return results
  }

  // 2. TEST BACKEND CONNECTION  
  static async testBackendConnection() {
    console.log('🔍 Testing Backend Service...')
    
    const results = {
      auth: false,
      destinations: false,
      reviews: false,
      errors: []
    }
    
    try {
      // Test auth endpoints
      console.log('Testing Auth API...')
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/health`)
        results.auth = response.status !== 404
        console.log('🔐 Auth API:', results.auth ? '✅ OK' : '❌ FAILED')
      } catch (error) {
        results.errors.push(`Auth: ${error.message}`)
        console.error('❌ Auth Error:', error.message)
      }
      
      // Test destinations endpoints
      console.log('Testing Destinations API...')
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/destinations`)
        results.destinations = response.status !== 404
        console.log('🏛️ Destinations API:', results.destinations ? '✅ OK' : '❌ FAILED')
      } catch (error) {
        results.errors.push(`Destinations: ${error.message}`)
        console.error('❌ Destinations Error:', error.message)
      }
      
      // Test reviews endpoints
      console.log('Testing Reviews API...')
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/reviews`)
        results.reviews = response.status !== 404
        console.log('⭐ Reviews API:', results.reviews ? '✅ OK' : '❌ FAILED')
      } catch (error) {
        results.errors.push(`Reviews: ${error.message}`)
        console.error('❌ Reviews Error:', error.message)
      }
      
    } catch (error) {
      console.error('❌ Backend Service Error:', error)
      results.errors.push(`General: ${error.message}`)
    }
    
    return results
  }

  // 3. TEST IMAGE LOADING
  static testImageLoading() {
    console.log('🔍 Testing Image Loading...')
    
    return new Promise((resolve) => {
      const results = {
        unsplash: false,
        mlAssets: false,
        localAssets: false,
        errors: []
      }
      
      const testImages = [
        {
          name: 'unsplash',
          url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=100&h=100'
        },
        {
          name: 'mlAssets',
          url: `${import.meta.env.VITE_ML_ASSETS_URL}/test-image.jpg`
        },
        {
          name: 'localAssets',
          url: '/src/assets/images/logo/logo-main.png'
        }
      ]
      
      let completedTests = 0
      
      testImages.forEach(({ name, url }) => {
        const img = new Image()
        
        img.onload = () => {
          results[name] = true
          console.log(`✅ ${name} image loaded:`, url)
          completedTests++
          if (completedTests === testImages.length) resolve(results)
        }
        
        img.onerror = () => {
          results[name] = false
          results.errors.push(`${name}: Failed to load`)
          console.log(`❌ ${name} image failed:`, url)
          completedTests++
          if (completedTests === testImages.length) resolve(results)
        }
        
        img.src = url
      })
    })
  }

  // 4. TEST LOCAL STORAGE
  static testLocalStorage() {
    console.log('🔍 Testing Local Storage...')
    
    const results = {
      read: false,
      write: false,
      delete: false,
      errors: []
    }
    
    try {
      // Test write
      localStorage.setItem('test_key', 'test_value')
      results.write = true
      console.log('✅ LocalStorage write: OK')
      
      // Test read
      const retrieved = localStorage.getItem('test_key')
      results.read = retrieved === 'test_value'
      console.log('✅ LocalStorage read:', results.read ? 'OK' : 'FAILED')
      
      // Test delete
      localStorage.removeItem('test_key')
      const deleted = localStorage.getItem('test_key')
      results.delete = deleted === null
      console.log('✅ LocalStorage delete:', results.delete ? 'OK' : 'FAILED')
      
    } catch (error) {
      console.error('❌ Local Storage Error:', error)
      results.errors.push(error.message)
    }
    
    return results
  }

  // 5. TEST AUTHENTICATION FLOW
  static async testAuthFlow() {
    console.log('🔍 Testing Authentication Flow...')
    
    const results = {
      getCurrentUser: false,
      isAuthenticated: false,
      getToken: false,
      errors: []
    }
    
    try {
      // Test getCurrentUser
      const currentUser = authService.getCurrentUser()
      results.getCurrentUser = currentUser !== null
      console.log('👤 getCurrentUser:', results.getCurrentUser ? '✅ OK' : '❌ No user')
      
      // Test isAuthenticated
      const isAuth = authService.isAuthenticated()
      results.isAuthenticated = typeof isAuth === 'boolean'
      console.log('🔐 isAuthenticated:', results.isAuthenticated ? '✅ OK' : '❌ FAILED')
      
      // Test getToken
      const token = authService.getToken()
      results.getToken = token !== null
      console.log('🎫 getToken:', results.getToken ? '✅ OK' : '❌ No token')
      
    } catch (error) {
      console.error('❌ Auth Flow Error:', error)
      results.errors.push(error.message)
    }
    
    return results
  }

  // 6. TEST RECOMMENDATION FLOW
  static async testRecommendationFlow() {
    console.log('🔍 Testing Recommendation Flow...')
    
    const results = {
      userRecommendations: false,
      locationRecommendations: false,
      categoryRecommendations: false,
      searchRecommendations: false,
      errors: []
    }
    
    try {
      // Test user recommendations
      try {
        const userRecs = await recommendationService.getUserRecommendations('test_user', { limit: 3 })
        results.userRecommendations = userRecs.success
        console.log('👤 User Recommendations:', results.userRecommendations ? '✅ OK' : '❌ FAILED')
      } catch (error) {
        results.errors.push(`User Recs: ${error.message}`)
      }
      
      // Test location recommendations
      try {
        const locationRecs = await recommendationService.getLocationBasedRecommendations(-6.2088, 106.8456, 50)
        results.locationRecommendations = locationRecs.success
        console.log('📍 Location Recommendations:', results.locationRecommendations ? '✅ OK' : '❌ FAILED')
      } catch (error) {
        results.errors.push(`Location Recs: ${error.message}`)
      }
      
      // Test category recommendations
      try {
        const categoryRecs = await recommendationService.getDestinationsByCategory('Budaya')
        results.categoryRecommendations = categoryRecs.success
        console.log('📂 Category Recommendations:', results.categoryRecommendations ? '✅ OK' : '❌ FAILED')
      } catch (error) {
        results.errors.push(`Category Recs: ${error.message}`)
      }
      
      // Test search recommendations
      try {
        const searchRecs = await recommendationService.searchDestinations('pantai', { category: 'alam' })
        results.searchRecommendations = searchRecs.success
        console.log('🔍 Search Recommendations:', results.searchRecommendations ? '✅ OK' : '❌ FAILED')
      } catch (error) {
        results.errors.push(`Search Recs: ${error.message}`)
      }
      
    } catch (error) {
      console.error('❌ Recommendation Flow Error:', error)
      results.errors.push(`General: ${error.message}`)
    }
    
    return results
  }

  // 7. TEST REVIEW SYSTEM
  static async testReviewSystem() {
    console.log('🔍 Testing Review System...')
    
    const results = {
      getReviews: false,
      getStats: false,
      errors: []
    }
    
    try {
      // Test get reviews
      try {
        const reviews = await reviewService.getReviews({ limit: 5 })
        results.getReviews = reviews.success || Array.isArray(reviews.data)
        console.log('⭐ Get Reviews:', results.getReviews ? '✅ OK' : '❌ FAILED')
      } catch (error) {
        results.errors.push(`Get Reviews: ${error.message}`)
      }
      
      // Test get stats
      try {
        const stats = await reviewService.getReviewStats()
        results.getStats = stats.success || typeof stats.data === 'object'
        console.log('📊 Review Stats:', results.getStats ? '✅ OK' : '❌ FAILED')
      } catch (error) {
        results.errors.push(`Get Stats: ${error.message}`)
      }
      
    } catch (error) {
      console.error('❌ Review System Error:', error)
      results.errors.push(`General: ${error.message}`)
    }
    
    return results
  }

  // 8. COMPREHENSIVE TEST - Run all tests
  static async runAllTests() {
    console.log('🚀 Running Comprehensive Tests...')
    console.log('=====================================')
    
    const startTime = performance.now()
    const allResults = {}
    
    try {
      // Run all test categories
      console.log('\n1. Testing ML Connection...')
      allResults.mlConnection = await this.testMLConnection()
      
      console.log('\n2. Testing Backend Connection...')
      allResults.backendConnection = await this.testBackendConnection()
      
      console.log('\n3. Testing Image Loading...')
      allResults.imageLoading = await this.testImageLoading()
      
      console.log('\n4. Testing Local Storage...')
      allResults.localStorage = this.testLocalStorage()
      
      console.log('\n5. Testing Authentication...')
      allResults.authFlow = await this.testAuthFlow()
      
      console.log('\n6. Testing Recommendations...')
      allResults.recommendationFlow = await this.testRecommendationFlow()
      
      console.log('\n7. Testing Review System...')
      allResults.reviewSystem = await this.testReviewSystem()
      
    } catch (error) {
      console.error('❌ Comprehensive Test Error:', error)
    }
    
    const endTime = performance.now()
    const duration = endTime - startTime
    
    // Generate summary
    const summary = this.generateTestSummary(allResults, duration)
    
    console.log('\n=====================================')
    console.log('✅ All tests completed!')
    console.log(`⏱️ Total time: ${duration.toFixed(2)}ms`)
    console.log('📊 Summary:', summary)
    console.log('=====================================')
    
    return {
      results: allResults,
      summary: summary,
      duration: duration
    }
  }

  // 9. GENERATE TEST SUMMARY
  static generateTestSummary(results, duration) {
    let totalTests = 0
    let passedTests = 0
    const categoryResults = {}
    
    for (const [category, result] of Object.entries(results)) {
      const categoryPassed = Object.values(result).filter(val => val === true).length
      const categoryTotal = Object.keys(result).filter(key => key !== 'errors').length
      
      categoryResults[category] = {
        passed: categoryPassed,
        total: categoryTotal,
        percentage: categoryTotal > 0 ? (categoryPassed / categoryTotal * 100).toFixed(1) : 0
      }
      
      totalTests += categoryTotal
      passedTests += categoryPassed
    }
    
    return {
      overall: {
        passed: passedTests,
        total: totalTests,
        percentage: totalTests > 0 ? (passedTests / totalTests * 100).toFixed(1) : 0,
        duration: `${duration.toFixed(2)}ms`
      },
      categories: categoryResults,
      status: passedTests === totalTests ? 'ALL_PASS' : passedTests > totalTests * 0.8 ? 'MOSTLY_PASS' : 'NEEDS_ATTENTION'
    }
  }

  // 10. QUICK HEALTH CHECK
  static async quickHealthCheck() {
    console.log('⚡ Quick Health Check...')
    
    const checks = [
      {
        name: 'ML Service',
        test: () => MLService.checkHealth()
      },
      {
        name: 'Backend API',
        test: async () => {
          try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/health`)
            return response.ok
          } catch {
            return false
          }
        }
      },
      {
        name: 'LocalStorage',
        test: () => {
          try {
            localStorage.setItem('_test', '1')
            localStorage.removeItem('_test')
            return true
          } catch {
            return false
          }
        }
      }
    ]
    
    const results = {}
    
    for (const check of checks) {
      try {
        results[check.name] = await check.test()
        console.log(`${check.name}:`, results[check.name] ? '✅' : '❌')
      } catch (error) {
        results[check.name] = false
        console.log(`${check.name}: ❌ (${error.message})`)
      }
    }
    
    return results
  }
}

// Export for use in development tools
export default TestingHelpers

// Add to window for browser console access
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  window.TravelNesiaDebug = {
    TestingHelpers,
    runAllTests: () => TestingHelpers.runAllTests(),
    quickCheck: () => TestingHelpers.quickHealthCheck(),
    testML: () => TestingHelpers.testMLConnection(),
    testBackend: () => TestingHelpers.testBackendConnection()
  }
  
  console.log('🔧 TravelNesia Debug Tools loaded!')
  console.log('Usage examples:')
  console.log('  window.TravelNesiaDebug.runAllTests()')
  console.log('  window.TravelNesiaDebug.quickCheck()')
  console.log('  window.TravelNesiaDebug.testML()')
}