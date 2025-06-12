import React, { useState } from 'react'
import { ExternalLink, X, ChevronLeft, ChevronRight, Download, Share2 } from 'lucide-react'
import MLImageDisplay from './MLImageDisplay'

const MLImageGallery = ({ 
  images = [], 
  columns = 4, 
  onImageClick = null,
  showLightbox = true,
  destinationName = '',
  className = ''
}) => {
  const [selectedImage, setSelectedImage] = useState(null)
  const [currentIndex, setCurrentIndex] = useState(0)

  const handleImageClick = (image, index) => {
    if (onImageClick) {
      onImageClick(image, index)
    }
    if (showLightbox) {
      setSelectedImage({ image, index })
      setCurrentIndex(index)
    }
  }

  const closeLightbox = () => {
    setSelectedImage(null)
  }

  const nextImage = () => {
    const nextIndex = (currentIndex + 1) % images.length
    setCurrentIndex(nextIndex)
    setSelectedImage({ image: images[nextIndex], index: nextIndex })
  }

  const prevImage = () => {
    const prevIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1
    setCurrentIndex(prevIndex)
    setSelectedImage({ image: images[prevIndex], index: prevIndex })
  }

  const downloadImage = async (imageUrl) => {
    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${destinationName || 'image'}-${currentIndex + 1}.jpg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading image:', error)
    }
  }

  const shareImage = async (imageUrl) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${destinationName} - TravelNesia`,
          text: `Check out this amazing destination: ${destinationName}`,
          url: imageUrl
        })
      } catch (error) {
        console.error('Error sharing:', error)
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(imageUrl)
      alert('Image URL copied to clipboard!')
    }
  }

  if (!images || images.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <div className="text-4xl mb-2">📷</div>
        <p>No images available</p>
      </div>
    )
  }

  const getGridCols = () => {
    switch (columns) {
      case 2: return 'grid-cols-1 md:grid-cols-2'
      case 3: return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
      case 4: return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
      case 5: return 'grid-cols-1 md:grid-cols-3 lg:grid-cols-5'
      default: return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
    }
  }

  return (
    <>
      <div className={`grid ${getGridCols()} gap-4 ${className}`}>
        {images.map((image, index) => {
          const imageUrl = typeof image === 'string' ? image : image.url || image.src
          const imageAlt = typeof image === 'object' ? image.alt || image.caption : `Gallery image ${index + 1}`
          
          return (
            <div
              key={index}
              className="relative group cursor-pointer overflow-hidden rounded-lg bg-gray-100"
              onClick={() => handleImageClick(image, index)}
            >
              <MLImageDisplay
                images={[imageUrl]}
                alt={imageAlt}
                className="h-48 w-full group-hover:scale-110 transition-transform duration-500"
                showOverlay={false}
              />
              
              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <ExternalLink className="w-8 h-8 text-white drop-shadow-lg" />
                </div>
              </div>

              {/* Image Number */}
              <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                {index + 1} / {images.length}
              </div>

              {/* Image Info (if available) */}
              {typeof image === 'object' && (image.caption || image.title) && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                  <p className="text-white text-sm font-medium">
                    {image.title || image.caption}
                  </p>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Lightbox */}
      {selectedImage && showLightbox && (
        <div 
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          <div className="relative max-w-7xl w-full h-full flex items-center justify-center">
            {/* Close Button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 text-white hover:text-gray-300 text-2xl z-10 bg-black/50 rounded-full p-2 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Navigation Buttons */}
            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    prevImage()
                  }}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 z-10 bg-black/50 rounded-full p-3 transition-colors"
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    nextImage()
                  }}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 z-10 bg-black/50 rounded-full p-3 transition-colors"
                >
                  <ChevronRight className="w-8 h-8" />
                </button>
              </>
            )}

            {/* Action Buttons */}
            <div className="absolute top-4 left-4 flex space-x-2 z-10">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  const imageUrl = typeof selectedImage.image === 'string' 
                    ? selectedImage.image 
                    : selectedImage.image.url || selectedImage.image.src
                  downloadImage(imageUrl)
                }}
                className="bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                title="Download Image"
              >
                <Download className="w-5 h-5" />
              </button>
              
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  const imageUrl = typeof selectedImage.image === 'string' 
                    ? selectedImage.image 
                    : selectedImage.image.url || selectedImage.image.src
                  shareImage(imageUrl)
                }}
                className="bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                title="Share Image"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>

            {/* Main Image */}
            <div 
              className="text-center max-w-full max-h-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={typeof selectedImage.image === 'string' 
                  ? selectedImage.image 
                  : selectedImage.image.url || selectedImage.image.src}
                alt={typeof selectedImage.image === 'object' 
                  ? selectedImage.image.alt || selectedImage.image.caption 
                  : `Gallery image ${selectedImage.index + 1}`}
                className="max-w-full max-h-[80vh] object-contain mx-auto shadow-2xl"
              />
              
              {/* Image Info */}
              <div className="text-white mt-4 max-w-2xl mx-auto">
                {destinationName && (
                  <h3 className="text-xl font-bold mb-2">{destinationName}</h3>
                )}
                
                {typeof selectedImage.image === 'object' && selectedImage.image.caption && (
                  <p className="text-gray-300 text-sm">{selectedImage.image.caption}</p>
                )}
                
                <div className="text-gray-400 text-sm mt-2">
                  Image {currentIndex + 1} of {images.length}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default MLImageGallery