// src/components/ui/Rating.jsx
import React from 'react'
import { Star } from 'lucide-react'

const Rating = ({ 
  value = 0, 
  onChange = null, 
  readonly = false, 
  size = 'md',
  className = '' 
}) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }
  
  const starSize = sizes[size]
  
  const handleStarClick = (rating) => {
    if (!readonly && onChange) {
      onChange(rating)
    }
  }
  
  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => handleStarClick(star)}
          disabled={readonly}
          className={`${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} transition-transform`}
        >
          <Star
            className={`${starSize} ${
              star <= value
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            }`}
          />
        </button>
      ))}
    </div>
  )
}

export default Rating