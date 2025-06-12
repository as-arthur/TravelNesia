import React, { useState, useEffect } from 'react'
import { ImageIcon, MapPin, Star, ExternalLink } from 'lucide-react'

const MLImageDisplay = ({ 
  images = [], 
  fallbackImage = "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
  alt = "Destinasi Wisata",
  className = "",
  showOverlay = true,
  destinationInfo = null
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [imageError, setImageError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Pastikan images adalah array dan tidak kosong
  const validImages = Array.isArray(images) && images.length > 0 
    ? images 
    : [fallbackImage]

  const currentImage = validImages[currentImageIndex]

  // Handle image load error
  const handleImageError = () => {
    console.log('Image failed to load, using fallback')
    setImageError(true)
    setIsLoading(false)
  }

  // Handle image load success
  const handleImageLoad = () => {
    setIsLoading(false)
    setImageError(false)
  }

  // Auto-rotate images jika ada lebih dari 1
  useEffect(() => {
    if (validImages.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => 
          prev === validImages.length - 1 ? 0 : prev + 1
        )
      }, 4000) // Ganti gambar setiap 4 detik

      return () => clearInterval(interval)
    }
  }, [validImages.length])

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <ImageIcon className="w-12 h-12 text-gray-400" />
        </div>
      )}

      {/* Main Image */}
      <img
        src={imageError ? fallbackImage : currentImage}
        alt={alt}
        className="w-full h-full object-cover transition-opacity duration-500"
        onError={handleImageError}
        onLoad={handleImageLoad}
        style={{ display: isLoading ? 'none' : 'block' }}
      />

      {/* Overlay dengan informasi destinasi */}
      {showOverlay && destinationInfo && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent">
          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
            <h3 className="text-lg font-bold mb-1">{destinationInfo.name}</h3>
            
            {destinationInfo.location && (
              <div className="flex items-center mb-2">
                <MapPin className="w-4 h-4 mr-1" />
                <span className="text-sm">{destinationInfo.location}</span>
              </div>
            )}

            {destinationInfo.rating && (
              <div className="flex items-center mb-2">
                <Star className="w-4 h-4 mr-1 fill-yellow-400 text-yellow-400" />
                <span className="text-sm">{destinationInfo.rating}</span>
              </div>
            )}

            {/* ML Confidence Score */}
            {destinationInfo.confidence_score && (
              <div className="text-xs opacity-75">
                Confidence: {(destinationInfo.confidence_score * 100).toFixed(1)}%
              </div>
            )}
          </div>
        </div>
      )}

      {/* Image Indicators untuk multiple images */}
      {validImages.length > 1 && (
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
          <div className="flex space-x-1">
            {validImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentImageIndex 
                    ? 'bg-white' 
                    : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Image Counter */}
      {validImages.length > 1 && (
        <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
          {currentImageIndex + 1} / {validImages.length}
        </div>
      )}
    </div>
  )
}

// Komponen untuk Gallery dari ML data
export const MLImageGallery = ({ 
  images = [], 
  columns = 4, 
  onImageClick = null,
  showLightbox = true 
}) => {
  const [selectedImage, setSelectedImage] = useState(null)

  const handleImageClick = (image, index) => {
    if (onImageClick) {
      onImageClick(image, index)
    }
    if (showLightbox) {
      setSelectedImage({ image, index })
    }
  }

  const closeLightbox = () => {
    setSelectedImage(null)
  }

  return (
    <>
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${columns} gap-4`}>
        {images.map((image, index) => (
          <div
            key={index}
            className="relative group cursor-pointer overflow-hidden rounded-lg"
            onClick={() => handleImageClick(image, index)}
          >
            <MLImageDisplay
              images={[image.url || image]}
              alt={image.alt || `Gallery image ${index + 1}`}
              className="h-48 group-hover:scale-110 transition-transform duration-300"
              showOverlay={false}
            />
            
            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
              <ExternalLink className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>

            {/* Image Info */}
            {image.caption && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                <p className="text-white text-sm">{image.caption}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {selectedImage && showLightbox && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          <div className="relative max-w-4xl w-full">
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 text-white hover:text-gray-300 text-2xl z-10"
            >
              ✕
            </button>
            
            <MLImageDisplay
              images={[selectedImage.image.url || selectedImage.image]}
              alt={selectedImage.image.alt || 'Gallery image'}
              className="max-h-[80vh] w-full"
              showOverlay={false}
            />
          </div>
        </div>
      )}
    </>
  )
}

export default MLImageDisplay