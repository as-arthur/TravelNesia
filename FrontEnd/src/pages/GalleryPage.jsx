import React, { useState } from 'react'
import { ChevronLeft, ChevronRight, Eye } from 'lucide-react'
import { galleryImages } from '../data/dummyData'

const GalleryPage = () => {
  const [selectedImage, setSelectedImage] = useState(null)

  const openModal = (image) => {
    setSelectedImage(image)
  }

  const closeModal = () => {
    setSelectedImage(null)
  }

  const nextImage = () => {
    const currentIndex = galleryImages.findIndex(img => img.id === selectedImage.id)
    const nextIndex = (currentIndex + 1) % galleryImages.length
    setSelectedImage(galleryImages[nextIndex])
  }

  const prevImage = () => {
    const currentIndex = galleryImages.findIndex(img => img.id === selectedImage.id)
    const prevIndex = currentIndex === 0 ? galleryImages.length - 1 : currentIndex - 1
    setSelectedImage(galleryImages[prevIndex])
  }

  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="relative min-h-96 bg-gradient-to-br from-green-900 via-green-800 to-green-700">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop')"
          }}
        ></div>
        
        <div className="relative z-10 container mx-auto px-6 py-20 text-center text-white">
          <h1 className="text-5xl lg:text-6xl font-bold mb-6 animate-fade-in">
            Galeri Indonesia
          </h1>
        </div>
      </section>

      {/* Gallery Introduction */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Menelusuri Kekayaan Budaya dan Keindahan Alam Nusantara
            </h2>
            <p className="text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Indonesia bukan hanya kaya akan destinasi wisata, tetapi juga sarat dengan nilai-nilai budaya, 
              tradisi, dan kearifan lokal yang unik di setiap daerahnya.
            </p>
          </div>

          {/* Main Gallery Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {galleryImages.map((image) => (
              <div
                key={image.id}
                className="relative group cursor-pointer overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300"
                onClick={() => openModal(image)}
              >
                <img
                  src={image.image}
                  alt={image.title}
                  className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-center text-white">
                    <Eye className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm">View Image</p>
                  </div>
                </div>
                
                {/* Image Info */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4 text-white">
                  <h3 className="font-bold text-lg mb-1">{image.title}</h3>
                  <p className="text-sm opacity-90">{image.location}</p>
                  <div className="flex items-center mt-2">
                    <span className="text-xs bg-yellow-500 px-2 py-1 rounded">Tours 2023</span>
                    <div className="flex items-center ml-2 text-xs">
                      <Eye className="w-3 h-3 mr-1" />
                      <span>4.9</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Indonesia Information Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-800 mb-6">
                Indonesia: Negeri Seribu Pesona Alam
              </h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                Dengan ribuan kepulauan yang dimiliki, Indonesia bukan hanya sekadar tempat berlibur, tetapi juga 
                sebuah rumah bagi keanekaragaman hayati tertinggi di dunia. Jadi, buatlah Anda merencanakan 
                wisata impian Anda.
              </p>

              <div className="space-y-3 mb-8">
                <div className="flex items-start space-x-3">
                  <span className="text-blue-600 font-bold">1.</span>
                  <p className="text-gray-600">Raja Ampat, Papua Barat - Surga bawah laut dengan keanekaragaman hayati tertinggi di dunia.</p>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-blue-600 font-bold">2.</span>
                  <p className="text-gray-600">Gunung Bromo, Jawa Timur - Pemandangan matahari terbit yang memukau dari puncah yang megah.</p>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-blue-600 font-bold">3.</span>
                  <p className="text-gray-600">Danau Toba, Sumatera Utara</p>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-blue-600 font-bold">4.</span>
                  <p className="text-gray-600">Pulau Labuan Bajo, Nusa Tenggara dengan Pulau Samosir di tengahnya.</p>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-blue-600 font-bold">5.</span>
                  <p className="text-gray-600">Rumah bagi komodo raksasa, dwelling laut jernih di pulau eksotik.</p>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-blue-600 font-bold">6.</span>
                  <p className="text-gray-600">Taman Laut Bunaken, Sulawesi Utara</p>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-blue-600 font-bold">7.</span>
                  <p className="text-gray-600">Kombinasi hutan hujan tropis, savana, dan laut yang eksotik.</p>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-blue-600 font-bold">8.</span>
                  <p className="text-gray-600">Kawah Ijen, Jawa Timur</p>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-blue-600 font-bold">9.</span>
                  <p className="text-gray-600">Fenomena api biru dan danau asam berwarna toska yang unik.</p>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-blue-600 font-bold">10.</span>
                  <p className="text-gray-600">Pasir pantai berwarna merah muda dan langka di eksotis.</p>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-blue-600 font-bold">11.</span>
                  <p className="text-gray-600">Taman Nasional Way Kambas, Lampung</p>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-blue-600 font-bold">12.</span>
                  <p className="text-gray-600">Tempat perlindungan gajah dan badak sumatera yang langka.</p>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-blue-600 font-bold">13.</span>
                  <p className="text-gray-600">Pulau Derawan, Kalimantan Timur</p>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-blue-600 font-bold">14.</span>
                  <p className="text-gray-600">Surga dengan air sebening kristal dan penyu hijau yang bertelur.</p>
                </div>
              </div>
            </div>

            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=800&h=600&fit=crop"
                alt="Indonesia Culture"
                className="w-full rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Modal for Image Preview */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-6xl w-full">
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-white hover:text-gray-300 text-2xl z-10"
            >
              ✕
            </button>

            {/* Navigation Buttons */}
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 z-10"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>

            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 z-10"
            >
              <ChevronRight className="w-8 h-8" />
            </button>

            {/* Image */}
            <div className="text-center">
              <img
                src={selectedImage.image}
                alt={selectedImage.title}
                className="max-w-full max-h-[80vh] object-contain mx-auto"
              />
              
              {/* Image Info */}
              <div className="text-white mt-4">
                <h3 className="text-2xl font-bold mb-2">{selectedImage.title}</h3>
                <p className="text-gray-300">{selectedImage.location}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default GalleryPage