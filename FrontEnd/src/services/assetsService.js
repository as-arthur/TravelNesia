// Service untuk manage assets, images, dan file uploads
class AssetsService {
  constructor() {
    this.baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'
    this.assetsURL = import.meta.env.VITE_ASSETS_URL || '/assets'
    this.mlAssetsURL = import.meta.env.VITE_ML_ASSETS_URL || 'http://0.0.0.0:8000/static'
  }

  // Logo paths
  static LOGOS = {
    main: '/src/assets/images/logo/logo-main.png',
    white: '/src/assets/images/logo/logo-white.png',
    icon: '/src/assets/images/logo/logo-icon.png',
    favicon: '/src/assets/images/logo/favicon.ico'
  }

  // Placeholder images
  static PLACEHOLDERS = {
    destination: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
    user: 'https://ui-avatars.com/api/?name=User&background=3B82F6&color=fff',
    gallery: 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=800&h=600&fit=crop',
    review: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=300&fit=crop',
    loading: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIiBmaWxsPSIjOTk5OTk5Ij5Mb2FkaW5nLi4uPC90ZXh0Pjwvc3ZnPg=='
  }

  // Get logo berdasarkan theme
  getLogo(theme = 'main') {
    const logos = AssetsService.LOGOS
    return logos[theme] || logos.main
  }

  // Get placeholder image
  getPlaceholder(type = 'destination') {
    const placeholders = AssetsService.PLACEHOLDERS
    return placeholders[type] || placeholders.destination
  }

  // Generate user avatar URL
  generateUserAvatar(name, options = {}) {
    const {
      size = 100,
      background = '3B82F6',
      color = 'fff',
      rounded = true
    } = options

    const encodedName = encodeURIComponent(name)
    let url = `https://ui-avatars.com/api/?name=${encodedName}&size=${size}&background=${background}&color=${color}`
    
    if (rounded) {
      url += '&rounded=true'
    }

    return url
  }

  // Process image URL dari berbagai sumber
  getImageUrl(imageData, type = 'destination') {
    if (!imageData) {
      return this.getPlaceholder(type)
    }

    // Jika sudah full URL
    if (typeof imageData === 'string' && imageData.startsWith('http')) {
      return imageData
    }

    // Jika data URI
    if (typeof imageData === 'string' && imageData.startsWith('data:')) {
      return imageData
    }

    // Jika object dengan url property
    if (typeof imageData === 'object' && imageData.url) {
      return this.getImageUrl(imageData.url, type)
    }

    // Jika relative path dari assets
    if (typeof imageData === 'string' && imageData.startsWith('/assets')) {
      return `${this.baseURL}${imageData}`
    }

    // Jika filename dari ML service
    if (typeof imageData === 'string' && !imageData.includes('/')) {
      return `${this.mlAssetsURL}/images/${imageData}`
    }

    // Jika relative path lainnya
    if (typeof imageData === 'string') {
      return `${this.assetsURL}/${imageData}`
    }

    return this.getPlaceholder(type)
  }

  // Process multiple images
  processImages(imagesData, type = 'destination') {
    if (!imagesData) return []

    if (Array.isArray(imagesData)) {
      return imagesData.map(img => this.getImageUrl(img, type))
    }

    return [this.getImageUrl(imagesData, type)]
  }

  // Upload image ke server
  async uploadImage(file, options = {}) {
    const {
      type = 'general',
      maxSize = 10 * 1024 * 1024, // 10MB
      allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    } = options

    try {
      // Validate file
      this.validateImageFile(file, { maxSize, allowedTypes })

      // Compress image jika perlu
      const processedFile = await this.compressImage(file)

      // Prepare form data
      const formData = new FormData()
      formData.append('image', processedFile)
      formData.append('type', type)

      // Upload ke server
      const response = await fetch(`${this.baseURL}/upload`, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      const result = await response.json()

      if (result.success) {
        return {
          success: true,
          url: result.data.url,
          filename: result.data.filename,
          size: result.data.size
        }
      } else {
        throw new Error(result.message || 'Upload failed')
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Upload multiple images
  async uploadImages(files, options = {}) {
    const uploadPromises = files.map(file => this.uploadImage(file, options))
    const results = await Promise.allSettled(uploadPromises)

    const successful = []
    const failed = []

    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value.success) {
        successful.push(result.value)
      } else {
        failed.push({
          file: files[index],
          error: result.reason || result.value?.error || 'Upload failed'
        })
      }
    })

    return {
      success: failed.length === 0,
      successful,
      failed,
      total: files.length
    }
  }

  // Validate image file
  validateImageFile(file, options = {}) {
    const {
      maxSize = 10 * 1024 * 1024,
      allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    } = options

    if (!file) {
      throw new Error('No file provided')
    }

    if (!allowedTypes.includes(file.type)) {
      throw new Error(`File type ${file.type} not allowed. Allowed types: ${allowedTypes.join(', ')}`)
    }

    if (file.size > maxSize) {
      const maxMB = Math.round(maxSize / (1024 * 1024))
      throw new Error(`File size too large. Maximum ${maxMB}MB allowed`)
    }

    return true
  }

  // Compress image
  async compressImage(file, options = {}) {
    const {
      maxWidth = 1200,
      maxHeight = 800,
      quality = 0.8
    } = options

    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }
        
        if (height > maxHeight) {
          width = (width * maxHeight) / height
          height = maxHeight
        }

        canvas.width = width
        canvas.height = height

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height)
        
        canvas.toBlob((blob) => {
          // Create new file with compressed data
          const compressedFile = new File([blob], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now()
          })
          resolve(compressedFile)
        }, 'image/jpeg', quality)
      }

      img.src = URL.createObjectURL(file)
    })
  }

  // Generate thumbnail
  async generateThumbnail(file, size = 200) {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()

      img.onload = () => {
        canvas.width = size
        canvas.height = size

        // Calculate crop area for square thumbnail
        const minDimension = Math.min(img.width, img.height)
        const sourceX = (img.width - minDimension) / 2
        const sourceY = (img.height - minDimension) / 2

        ctx.drawImage(
          img,
          sourceX, sourceY, minDimension, minDimension,
          0, 0, size, size
        )

        canvas.toBlob((blob) => {
          const thumbnailFile = new File([blob], `thumb_${file.name}`, {
            type: 'image/jpeg',
            lastModified: Date.now()
          })
          resolve(thumbnailFile)
        }, 'image/jpeg', 0.8)
      }

      img.src = URL.createObjectURL(file)
    })
  }

  // Delete image dari server
  async deleteImage(filename) {
    try {
      const response = await fetch(`${this.baseURL}/upload/${filename}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      const result = await response.json()
      return result
    } catch (error) {
      console.error('Error deleting image:', error)
      return { success: false, error: error.message }
    }
  }

  // Get image metadata
  getImageMetadata(file) {
    return new Promise((resolve) => {
      const img = new Image()
      
      img.onload = () => {
        resolve({
          width: img.width,
          height: img.height,
          aspectRatio: img.width / img.height,
          size: file.size,
          type: file.type,
          name: file.name
        })
      }

      img.onerror = () => {
        resolve({
          width: 0,
          height: 0,
          aspectRatio: 1,
          size: file.size,
          type: file.type,
          name: file.name
        })
      }

      img.src = URL.createObjectURL(file)
    })
  }

  // Optimize image URL untuk performance
  optimizeImageUrl(url, options = {}) {
    const {
      width = 800,
      height = 600,
      quality = 80,
      format = 'webp'
    } = options

    // Optimize Unsplash images
    if (url.includes('unsplash.com')) {
      return `${url}&w=${width}&h=${height}&fit=crop&fm=${format}&q=${quality}`
    }

    // Optimize Cloudinary images
    if (url.includes('cloudinary.com')) {
      return url.replace('/upload/', `/upload/w_${width},h_${height},c_fill,f_${format},q_${quality}/`)
    }

    // Return original URL if no optimization available
    return url
  }

  // Create image preloader
  preloadImage(url) {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = url
    })
  }

  // Preload multiple images
  async preloadImages(urls) {
    const preloadPromises = urls.map(url => this.preloadImage(url))
    const results = await Promise.allSettled(preloadPromises)
    
    return {
      successful: results.filter(r => r.status === 'fulfilled').length,
      failed: results.filter(r => r.status === 'rejected').length,
      total: urls.length
    }
  }
}

export default new AssetsService()
