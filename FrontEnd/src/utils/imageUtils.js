// imageUtils.js - Utility functions untuk image processing

export const ImageUtils = {
  // Constants
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  QUALITY: {
    HIGH: 0.9,
    MEDIUM: 0.8,
    LOW: 0.6
  },
  
  // Validate image file
  validateFile(file) {
    const errors = []
    
    // Check file type
    if (!this.ALLOWED_TYPES.includes(file.type)) {
      errors.push(`Format file tidak didukung. Gunakan: ${this.ALLOWED_TYPES.join(', ')}`)
    }
    
    // Check file size
    if (file.size > this.MAX_FILE_SIZE) {
      errors.push(`Ukuran file terlalu besar. Maksimal ${this.formatFileSize(this.MAX_FILE_SIZE)}`)
    }
    
    // Check if file is actually an image
    if (!file.type.startsWith('image/')) {
      errors.push('File yang dipilih bukan gambar')
    }
    
    return {
      isValid: errors.length === 0,
      errors: errors
    }
  },

  // Format file size to human readable
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  },

  // Compress image using canvas
  async compressImage(file, maxWidth = 1200, maxHeight = 800, quality = 0.8) {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()
      
      img.onload = () => {
        try {
          // Calculate new dimensions
          let { width, height } = this.calculateDimensions(
            img.width, 
            img.height, 
            maxWidth, 
            maxHeight
          )
          
          // Set canvas size
          canvas.width = width
          canvas.height = height
          
          // Draw and compress
          ctx.drawImage(img, 0, 0, width, height)
          
          // Convert to blob
          canvas.toBlob(
            (blob) => {
              if (blob) {
                // Create new file object
                const compressedFile = new File([blob], file.name, {
                  type: file.type,
                  lastModified: Date.now()
                })
                
                console.log('Image compressed:', {
                  original: this.formatFileSize(file.size),
                  compressed: this.formatFileSize(compressedFile.size),
                  reduction: `${(((file.size - compressedFile.size) / file.size) * 100).toFixed(1)}%`
                })
                
                resolve(compressedFile)
              } else {
                reject(new Error('Failed to compress image'))
              }
            },
            file.type,
            quality
          )
        } catch (error) {
          reject(error)
        }
      }
      
      img.onerror = () => {
        reject(new Error('Failed to load image'))
      }
      
      img.src = URL.createObjectURL(file)
    })
  },

  // Calculate new dimensions while maintaining aspect ratio
  calculateDimensions(originalWidth, originalHeight, maxWidth, maxHeight) {
    let width = originalWidth
    let height = originalHeight
    
    // Calculate aspect ratio
    const aspectRatio = originalWidth / originalHeight
    
    // Resize if too wide
    if (width > maxWidth) {
      width = maxWidth
      height = width / aspectRatio
    }
    
    // Resize if too tall
    if (height > maxHeight) {
      height = maxHeight
      width = height * aspectRatio
    }
    
    return {
      width: Math.round(width),
      height: Math.round(height)
    }
  },

  // Generate thumbnail
  async generateThumbnail(file, size = 200) {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()
      
      img.onload = () => {
        try {
          canvas.width = size
          canvas.height = size
          
          // Calculate crop area for square thumbnail
          const sourceSize = Math.min(img.width, img.height)
          const sourceX = (img.width - sourceSize) / 2
          const sourceY = (img.height - sourceSize) / 2
          
          // Draw cropped and resized image
          ctx.drawImage(
            img, 
            sourceX, sourceY, sourceSize, sourceSize,
            0, 0, size, size
          )
          
          // Convert to blob
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const thumbnailFile = new File([blob], `thumb_${file.name}`, {
                  type: file.type,
                  lastModified: Date.now()
                })
                resolve(thumbnailFile)
              } else {
                reject(new Error('Failed to generate thumbnail'))
              }
            },
            file.type,
            0.8
          )
        } catch (error) {
          reject(error)
        }
      }
      
      img.onerror = () => {
        reject(new Error('Failed to load image for thumbnail'))
      }
      
      img.src = URL.createObjectURL(file)
    })
  },

  // Get image dimensions
  async getImageDimensions(file) {
    return new Promise((resolve, reject) => {
      const img = new Image()
      
      img.onload = () => {
        resolve({
          width: img.width,
          height: img.height,
          aspectRatio: img.width / img.height
        })
      }
      
      img.onerror = () => {
        reject(new Error('Failed to load image'))
      }
      
      img.src = URL.createObjectURL(file)
    })
  },

  // Create preview URL for image
  createPreviewUrl(file) {
    return URL.createObjectURL(file)
  },

  // Cleanup preview URL to prevent memory leaks
  revokePreviewUrl(url) {
    URL.revokeObjectURL(url)
  },

  // Convert image to base64
  async convertToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = () => {
        resolve(reader.result)
      }
      
      reader.onerror = () => {
        reject(new Error('Failed to convert to base64'))
      }
      
      reader.readAsDataURL(file)
    })
  },

  // Batch process multiple images
  async batchProcess(files, options = {}) {
    const {
      maxWidth = 1200,
      maxHeight = 800,
      quality = 0.8,
      generateThumbnails = false,
      thumbnailSize = 200
    } = options

    const results = []
    
    for (const file of files) {
      try {
        // Validate file
        const validation = this.validateFile(file)
        if (!validation.isValid) {
          results.push({
            original: file,
            error: validation.errors[0],
            success: false
          })
          continue
        }

        // Compress image
        const compressed = await this.compressImage(file, maxWidth, maxHeight, quality)
        
        // Generate thumbnail if requested
        let thumbnail = null
        if (generateThumbnails) {
          thumbnail = await this.generateThumbnail(file, thumbnailSize)
        }

        // Get dimensions
        const dimensions = await this.getImageDimensions(compressed)

        results.push({
          original: file,
          compressed: compressed,
          thumbnail: thumbnail,
          dimensions: dimensions,
          preview: this.createPreviewUrl(compressed),
          success: true
        })

      } catch (error) {
        results.push({
          original: file,
          error: error.message,
          success: false
        })
      }
    }

    return results
  },

  // Optimize image for web
  async optimizeForWeb(file, preset = 'medium') {
    const presets = {
      low: { maxWidth: 800, maxHeight: 600, quality: 0.6 },
      medium: { maxWidth: 1200, maxHeight: 800, quality: 0.8 },
      high: { maxWidth: 1920, maxHeight: 1080, quality: 0.9 }
    }

    const config = presets[preset] || presets.medium
    
    try {
      const validation = this.validateFile(file)
      if (!validation.isValid) {
        throw new Error(validation.errors[0])
      }

      const optimized = await this.compressImage(
        file, 
        config.maxWidth, 
        config.maxHeight, 
        config.quality
      )

      return {
        original: file,
        optimized: optimized,
        preset: preset,
        savings: {
          bytes: file.size - optimized.size,
          percentage: ((file.size - optimized.size) / file.size * 100).toFixed(1)
        }
      }
    } catch (error) {
      throw new Error(`Optimization failed: ${error.message}`)
    }
  },

  // Extract EXIF data (basic implementation)
  async extractExifData(file) {
    return new Promise((resolve) => {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        try {
          const arrayBuffer = e.target.result
          const dataView = new DataView(arrayBuffer)
          
          // Basic EXIF extraction (simplified)
          const exifData = {
            hasExif: false,
            orientation: 1,
            camera: null,
            dateTime: null
          }
          
          // Check for EXIF marker
          if (dataView.getUint16(0) === 0xFFD8 && dataView.getUint16(2) === 0xFFE1) {
            exifData.hasExif = true
            // More detailed EXIF parsing would go here
          }
          
          resolve(exifData)
        } catch (error) {
          resolve({ hasExif: false })
        }
      }
      
      reader.onerror = () => {
        resolve({ hasExif: false })
      }
      
      reader.readAsArrayBuffer(file.slice(0, 65536)) // Read first 64KB for EXIF
    })
  },

  // Create image with watermark
  async addWatermark(file, watermarkText, options = {}) {
    const {
      position = 'bottom-right',
      fontSize = 20,
      color = 'rgba(255, 255, 255, 0.7)',
      font = 'Arial'
    } = options

    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()
      
      img.onload = () => {
        try {
          canvas.width = img.width
          canvas.height = img.height
          
          // Draw original image
          ctx.drawImage(img, 0, 0)
          
          // Add watermark
          ctx.font = `${fontSize}px ${font}`
          ctx.fillStyle = color
          ctx.textAlign = 'right'
          ctx.textBaseline = 'bottom'
          
          // Position watermark
          let x = canvas.width - 10
          let y = canvas.height - 10
          
          if (position === 'bottom-left') {
            ctx.textAlign = 'left'
            x = 10
          } else if (position === 'top-right') {
            ctx.textBaseline = 'top'
            y = 10 + fontSize
          } else if (position === 'top-left') {
            ctx.textAlign = 'left'
            ctx.textBaseline = 'top'
            x = 10
            y = 10 + fontSize
          }
          
          ctx.fillText(watermarkText, x, y)
          
          // Convert to blob
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const watermarkedFile = new File([blob], file.name, {
                  type: file.type,
                  lastModified: Date.now()
                })
                resolve(watermarkedFile)
              } else {
                reject(new Error('Failed to add watermark'))
              }
            },
            file.type,
            0.9
          )
        } catch (error) {
          reject(error)
        }
      }
      
      img.onerror = () => {
        reject(new Error('Failed to load image for watermark'))
      }
      
      img.src = URL.createObjectURL(file)
    })
  },

  // Convert between image formats
  async convertFormat(file, targetFormat = 'jpeg', quality = 0.8) {
    const supportedFormats = ['jpeg', 'png', 'webp']
    
    if (!supportedFormats.includes(targetFormat)) {
      throw new Error(`Unsupported target format: ${targetFormat}`)
    }

    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()
      
      img.onload = () => {
        try {
          canvas.width = img.width
          canvas.height = img.height
          
          // For PNG to JPEG, add white background
          if (file.type === 'image/png' && targetFormat === 'jpeg') {
            ctx.fillStyle = 'white'
            ctx.fillRect(0, 0, canvas.width, canvas.height)
          }
          
          ctx.drawImage(img, 0, 0)
          
          const mimeType = `image/${targetFormat}`
          const newFileName = file.name.replace(/\.[^/.]+$/, `.${targetFormat}`)
          
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const convertedFile = new File([blob], newFileName, {
                  type: mimeType,
                  lastModified: Date.now()
                })
                resolve(convertedFile)
              } else {
                reject(new Error('Failed to convert image format'))
              }
            },
            mimeType,
            quality
          )
        } catch (error) {
          reject(error)
        }
      }
      
      img.onerror = () => {
        reject(new Error('Failed to load image for conversion'))
      }
      
      img.src = URL.createObjectURL(file)
    })
  },

  // Create image collage from multiple images
  async createCollage(files, layout = '2x2') {
    if (!files || files.length === 0) {
      throw new Error('No images provided for collage')
    }

    const layouts = {
      '1x2': { rows: 1, cols: 2 },
      '2x1': { rows: 2, cols: 1 },
      '2x2': { rows: 2, cols: 2 },
      '3x3': { rows: 3, cols: 3 }
    }

    const { rows, cols } = layouts[layout] || layouts['2x2']
    const maxImages = rows * cols
    const imagesToUse = files.slice(0, maxImages)

    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      const cellWidth = 400
      const cellHeight = 300
      
      canvas.width = cellWidth * cols
      canvas.height = cellHeight * rows
      
      let loadedImages = 0
      const images = []
      
      imagesToUse.forEach((file, index) => {
        const img = new Image()
        
        img.onload = () => {
          images[index] = img
          loadedImages++
          
          if (loadedImages === imagesToUse.length) {
            // Draw all images
            images.forEach((img, i) => {
              const row = Math.floor(i / cols)
              const col = i % cols
              const x = col * cellWidth
              const y = row * cellHeight
              
              // Draw image to fit cell
              ctx.drawImage(img, x, y, cellWidth, cellHeight)
            })
            
            // Convert to blob
            canvas.toBlob(
              (blob) => {
                if (blob) {
                  const collageFile = new File([blob], `collage_${Date.now()}.jpg`, {
                    type: 'image/jpeg',
                    lastModified: Date.now()
                  })
                  resolve(collageFile)
                } else {
                  reject(new Error('Failed to create collage'))
                }
              },
              'image/jpeg',
              0.9
            )
          }
        }
        
        img.onerror = () => {
          reject(new Error(`Failed to load image ${index + 1} for collage`))
        }
        
        img.src = URL.createObjectURL(file)
      })
    })
  },

  // Utility to check if browser supports required features
  checkBrowserSupport() {
    const support = {
      canvas: !!document.createElement('canvas').getContext,
      fileReader: !!window.FileReader,
      objectUrl: !!window.URL && !!window.URL.createObjectURL,
      webp: false
    }

    // Check WebP support
    const canvas = document.createElement('canvas')
    canvas.width = 1
    canvas.height = 1
    support.webp = canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0

    return support
  }
}