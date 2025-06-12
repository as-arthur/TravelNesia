import React from 'react'
import { Loader2, MapPin, Compass } from 'lucide-react'

const LoadingSpinner = ({ 
  size = 'md', 
  message = 'Loading...', 
  type = 'default',
  className = '' 
}) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8', 
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  }

  const getIcon = () => {
    switch (type) {
      case 'ml':
        return <Compass className={`${sizes[size]} animate-spin text-blue-500`} />
      case 'location':
        return <MapPin className={`${sizes[size]} animate-bounce text-green-500`} />
      default:
        return <Loader2 className={`${sizes[size]} animate-spin text-blue-500`} />
    }
  }

  const getContainer = () => {
    if (size === 'sm') {
      return (
        <div className={`inline-flex items-center space-x-2 ${className}`}>
          {getIcon()}
          {message && <span className="text-sm text-gray-600">{message}</span>}
        </div>
      )
    }

    return (
      <div className={`flex flex-col items-center justify-center space-y-3 ${className}`}>
        {getIcon()}
        {message && (
          <div className="text-center">
            <p className="text-gray-600 font-medium">{message}</p>
            {type === 'ml' && (
              <p className="text-sm text-gray-500 mt-1">
                Loading dari ML Dataset...
              </p>
            )}
          </div>
        )}
      </div>
    )
  }

  return getContainer()
}

// Preset loading spinners
export const MLLoadingSpinner = ({ message = 'Loading ML Recommendations...' }) => (
  <LoadingSpinner type="ml" size="lg" message={message} />
)

export const LocationLoadingSpinner = ({ message = 'Getting your location...' }) => (
  <LoadingSpinner type="location" size="md" message={message} />
)

export const SmallLoadingSpinner = ({ message }) => (
  <LoadingSpinner size="sm" message={message} />
)

export default LoadingSpinner
