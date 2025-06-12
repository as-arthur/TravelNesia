import React from 'react'
import TestimonialCard from '../components/cards/TestimonialCard'
import { testimonials } from '../data/dummyData'

const ReviewsPage = () => {
  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="relative min-h-96 bg-gradient-to-br from-purple-900 via-purple-800 to-purple-700">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop')"
          }}
        ></div>
        
        <div className="relative z-10 container mx-auto px-6 py-20 text-center text-white">
          <h1 className="text-5xl lg:text-6xl font-bold mb-6 animate-fade-in">
            Reviews
          </h1>
          <p className="text-xl opacity-90">
            Dengarkan cerita dari para wisatawan yang telah merasakan keajaiban Indonesia
          </p>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Apa Yang Pengguna Katakan?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Pengalaman nyata dari pengguna TravelNesia yang telah menjelajahi keindahan Indonesia
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {testimonials.map((testimonial) => (
              <TestimonialCard
                key={testimonial.id}
                testimonial={testimonial}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Dipercaya Ribuan Wisatawan
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">50K+</div>
              <p className="text-gray-600">Pengguna Aktif</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">4.9</div>
              <p className="text-gray-600">Rating Aplikasi</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">1000+</div>
              <p className="text-gray-600">Destinasi</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">15K+</div>
              <p className="text-gray-600">Review Positif</p>
            </div>
          </div>
        </div>
      </section>

      {/* Write Review Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-gray-800 mb-6">
              Bagikan Pengalaman Anda
            </h2>
            <p className="text-gray-600 mb-8">
              Ceritakan petualangan Anda dan bantu wisatawan lain menemukan destinasi impian mereka
            </p>
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors">
              Tulis Review
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default ReviewsPage