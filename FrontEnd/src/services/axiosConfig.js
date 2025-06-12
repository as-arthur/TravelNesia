import axios from 'axios'

const axiosInstance = axios.create({
  baseURL: 'http://localhost:4000/api', // 
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    console.log('📤 API Request:', config.baseURL + config.url) // Debug log
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

axiosInstance.interceptors.response.use(
  (response) => {
    console.log('📥 API Response:', response.status, response.data) // Debug log
    return response
  },
  (error) => {
    console.error('❌ API Error:', error.response?.status, error.message)
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default axiosInstance