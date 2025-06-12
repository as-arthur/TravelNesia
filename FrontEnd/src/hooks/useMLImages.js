import { useState, useEffect, useCallback } from 'react'

// Custom hook untuk handle ML images dengan loading dan error states
export const useMLImages = (destinationData, options = {}) => {
  const [images, setImages] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const {
    fallbackImage = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
    maxImages = 5,
    autoRotate = false,
    rotateInterval = 4000
  } = options

  // Process images dari ML data
  const processMLImages = useCallback((data) => {
    if (!data) return []

    const processedImages = []

    // Handle different image formats dari ML
    if (data.image) {
      processedImages.push(getImageURL(data.image))
    }

    if (data.images && Array.isArray(data.images)) {
      data.images.forEach(img => {
        processedImages.push(getImageURL(img))
      })
    }

    if (data.gallery && Array.isArray(data.gallery)) {
      data.gallery.forEach(img => {
        processedImages.push(getImageURL(img))
      })
    }

    // Remove duplicates dan limit
    const uniqueImages = [...new Set(processedImages)]
    return uniqueImages.slice(0, maxImages)
  }, [maxImages])

  // Get proper image URL
  const getImageURL = useCallback((imageData) => {
    if (!imageData) return fallbackImage

    // Jika sudah full URL
    if (typeof imageData === 'string' && imageData.startsWith('http')) {
      return imageData
    }

    // Jika object dengan url property
    if (typeof imageData === 'object' && imageData.url) {
      return imageData.url
    }

    // Jika relative path dari ML service
    if (typeof imageData === 'string') {
      const mlBaseUrl = import.meta.env.VITE_ML_ASSETS_URL || import.meta.env.VITE_ML_API_URL
      return `${mlBaseUrl}/static/images/${imageData}`
    }

    return fallbackImage
  }, [fallbackImage])

  // Load images ketika destinationData berubah
  useEffect(() => {
    const loadImages = async () => {
      try {
        setIsLoading(true)
        setError(null)

        if (!destinationData) {
          setImages([fallbackImage])
          return
        }

        const processedImages = processMLImages(destinationData)
        
        if (processedImages.length === 0) {
          setImages([fallbackImage])
        } else {
          // Validate images dengan mencoba load
          const validatedImages = await validateImages(processedImages)
          setImages(validatedImages.length > 0 ? validatedImages : [fallbackImage])
        }

      } catch (err) {
        console.error('Error loading ML images:', err)
        setError(err.message)
        setImages([fallbackImage])
      } finally {
        setIsLoading(false)
      }
    }

    loadImages()
  }, [destinationData, processMLImages, fallbackImage])

  // Validate images dengan loading test
  const validateImages = async (imageUrls) => {
    const validImages = []

    for (const url of imageUrls) {
      try {
        await new Promise((resolve, reject) => {
          const img = new Image()
          img.onload = resolve
          img.onerror = reject
          img.src = url
        })
        validImages.push(url)
      } catch (error) {
        console.warn('Image failed to load:', url)
      }
    }

    return validImages
  }

  // Auto rotate images
  useEffect(() => {
    if (autoRotate && images.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex(prev => 
          prev === images.length - 1 ? 0 : prev + 1
        )
      }, rotateInterval)

      return () => clearInterval(interval)
    }
  }, [autoRotate, images.length, rotateInterval])

  // Navigation functions
  const nextImage = useCallback(() => {
    setCurrentImageIndex(prev => 
      prev === images.length - 1 ? 0 : prev + 1
    )
  }, [images.length])

  const prevImage = useCallback(() => {
    setCurrentImageIndex(prev => 
      prev === 0 ? images.length - 1 : prev - 1
    )
  }, [images.length])

  const goToImage = useCallback((index) => {
    if (index >= 0 && index < images.length) {
      setCurrentImageIndex(index)
    }
  }, [images.length])

  // Get current image
  const currentImage = images[currentImageIndex] || fallbackImage

  return {
    // Data
    images,
    currentImage,
    currentImageIndex,
    hasMultipleImages: images.length > 1,
    
    // States
    isLoading,
    error,
    
    // Actions
    nextImage,
    prevImage,
    goToImage,
    setCurrentImageIndex,
    
    // Utils
    getImageURL,
    processMLImages
  }
}

// Hook untuk single image dengan lazy loading
export const useMLImage = (imageData, options = {}) => {
  const [imageUrl, setImageUrl] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const {
    fallbackImage = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
    lazy = true
  } = options

  useEffect(() => {
    const loadImage = async () => {
      setIsLoading(true)
      setHasError(false)

      if (!imageData) {
        setImageUrl(fallbackImage)
        setIsLoading(false)
        return
      }

      let url = imageData
      
      // Process different image formats
      if (typeof imageData === 'object' && imageData.url) {
        url = imageData.url
      } else if (typeof imageData === 'string' && !imageData.startsWith('http')) {
        const mlBaseUrl = import.meta.env.VITE_ML_ASSETS_URL || import.meta.env.VITE_ML_API_URL
        url = `${mlBaseUrl}/static/images/${imageData}`
      }

      if (lazy) {
        // Validate image exists
        try {
          await new Promise((resolve, reject) => {
            const img = new Image()
            img.onload = resolve
            img.onerror = reject
            img.src = url
          })
          setImageUrl(url)
        } catch (error) {
          console.warn('Image failed to load:', url)
          setImageUrl(fallbackImage)
          setHasError(true)
        }
      } else {
        setImageUrl(url)
      }

      setIsLoading(false)
    }

    loadImage()
  }, [imageData, fallbackImage, lazy])

  return {
    imageUrl,
    isLoading,
    hasError
  }
}

// Hook untuk image gallery dengan lightbox
export const useImageGallery = (images = [], options = {}) => {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  const {
    enableKeyboard = true,
    enableSwipe = true
  } = options

  // Open lightbox
  const openLightbox = useCallback((index = 0) => {
    setLightboxIndex(index)
    setIsLightboxOpen(true)
  }, [])

  // Close lightbox
  const closeLightbox = useCallback(() => {
    setIsLightboxOpen(false)
  }, [])

  // Navigate in lightbox
  const nextInLightbox = useCallback(() => {
    setLightboxIndex(prev => 
      prev === images.length - 1 ? 0 : prev + 1
    )
  }, [images.length])

  const prevInLightbox = useCallback(() => {
    setLightboxIndex(prev => 
      prev === 0 ? images.length - 1 : prev - 1
    )
  }, [images.length])

  // Keyboard navigation
  useEffect(() => {
    if (!enableKeyboard || !isLightboxOpen) return

    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'Escape':
          closeLightbox()
          break
        case 'ArrowLeft':
          prevInLightbox()
          break
        case 'ArrowRight':
          nextInLightbox()
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [enableKeyboard, isLightboxOpen, closeLightbox, prevInLightbox, nextInLightbox])

  // Current lightbox image
  const currentLightboxImage = images[lightboxIndex]

  return {
    // Lightbox state
    isLightboxOpen,
    lightboxIndex,
    currentLightboxImage,
    
    // Actions
    openLightbox,
    closeLightbox,
    nextInLightbox,
    prevInLightbox,
    
    // Utils
    hasImages: images.length > 0,
    imageCount: images.length
  }
}

// Hook untuk optimize image loading
export const useImageOptimization = (originalUrl, options = {}) => {
  const [optimizedUrl, setOptimizedUrl] = useState(originalUrl)

  const {
    width = 800,
    height = 600,
    quality = 80,
    format = 'webp',
    enableOptimization = true
  } = options

  useEffect(() => {
    if (!enableOptimization || !originalUrl) {
      setOptimizedUrl(originalUrl)
      return
    }

    // Optimize Unsplash images
    if (originalUrl.includes('unsplash.com')) {
      const optimized = `${originalUrl}&w=${width}&h=${height}&fit=crop&fm=${format}&q=${quality}`
      setOptimizedUrl(optimized)
      return
    }

    // Add other optimization services here (Cloudinary, etc.)
    
    setOptimizedUrl(originalUrl)
  }, [originalUrl, width, height, quality, format, enableOptimization])

  return optimizedUrl
}

export default useMLImages