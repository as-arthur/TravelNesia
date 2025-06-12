import React, { useState, useRef } from 'react'
import { Upload, X, Image as ImageIcon } from 'lucide-react'

const ImageUpload = ({ onImageSelect, maxFiles = 5, acceptedTypes = "image/*" }) => {
  const [selectedImages, setSelectedImages] = useState([])
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef(null)

  // Handle file selection
  const handleFiles = (files) => {
    const fileArray = Array.from(files)
    const validFiles = fileArray.filter(file => file.type.startsWith('image/'))
    
    if (validFiles.length + selectedImages.length > maxFiles) {
      alert(`Maksimal ${maxFiles} gambar yang bisa diupload`)
      return
    }

    const newImages = validFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      id: Math.random().toString(36).substr(2, 9)
    }))

    const updatedImages = [...selectedImages, ...newImages]
    setSelectedImages(updatedImages)
    
    // Send to parent component
    if (onImageSelect) {
      onImageSelect(updatedImages)
    }
  }

  // Handle drag events
  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    const files = e.dataTransfer.files
    handleFiles(files)
  }

  const handleInputChange = (e) => {
    const files = e.target.files
    handleFiles(files)
  }

  const removeImage = (id) => {
    const updatedImages = selectedImages.filter(img => img.id !== id)
    setSelectedImages(updatedImages)
    
    if (onImageSelect) {
      onImageSelect(updatedImages)
    }
  }

  const openFileSelector = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="w-full">
      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={openFileSelector}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes}
          onChange={handleInputChange}
          className="hidden"
        />
        
        <div className="cursor-pointer">
          <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-lg font-medium text-gray-700 mb-2">
            Klik atau drag gambar ke sini
          </p>
          <p className="text-sm text-gray-500">
            PNG, JPG, GIF hingga 10MB (Maksimal {maxFiles} gambar)
          </p>
        </div>
      </div>

      {/* Preview Selected Images */}
      {selectedImages.length > 0 && (
        <div className="mt-6">
          <h4 className="text-lg font-medium text-gray-700 mb-3">
            Gambar Terpilih ({selectedImages.length})
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {selectedImages.map((image) => (
              <div key={image.id} className="relative group">
                <img
                  src={image.preview}
                  alt="Preview"
                  className="w-full h-24 object-cover rounded-lg border-2 border-gray-200"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    removeImage(image.id)
                  }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Progress Indicator */}
      <div className="mt-4 text-sm text-gray-500">
        {selectedImages.length} / {maxFiles} gambar dipilih
      </div>
    </div>
  )
}

export default ImageUpload