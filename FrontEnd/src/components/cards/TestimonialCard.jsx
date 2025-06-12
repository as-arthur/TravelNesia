import React from 'react'
import { Star } from 'lucide-react'

const TestimonialCard = ({ testimonial }) => {
  const StarRating = ({ rating }) => {
    return (
      <div className="flex items-center justify-center space-x-1 mb-4">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
      <div className="text-center">
        {/* User Avatar */}
        <div className="relative mb-4">
          <img
            src={testimonial.avatar}
            alt={testimonial.name}
            className="w-16 h-16 rounded-full mx-auto object-cover"
          />
        </div>

        {/* User Info */}
        <h3 className="font-bold text-lg text-gray-800 mb-1">{testimonial.name}</h3>
        <p className="text-sm text-gray-600 mb-3">{testimonial.location}</p>

        {/* Rating */}
        <StarRating rating={testimonial.rating} />

        {/* Comment */}
        <p className="text-gray-600 text-sm leading-relaxed line-clamp-4">
          "{testimonial.comment}"
        </p>
      </div>
    </div>
  )
}

export default TestimonialCard