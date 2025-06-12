// src/components/ui/Toast.jsx
import React, { useEffect } from 'react'
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react'

const Toast = ({ 
  type = 'success', 
  message, 
  isVisible, 
  onClose,
  duration = 5000,
  position = 'top-right'
}) => {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(onClose, duration)
      return () => clearTimeout(timer)
    }
  }, [isVisible, duration, onClose])

  if (!isVisible) return null

  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle,
    info: Info
  }

  const colors = {
    success: 'bg-green-500 border-green-600',
    error: 'bg-red-500 border-red-600',
    warning: 'bg-yellow-500 border-yellow-600',
    info: 'bg-blue-500 border-blue-600'
  }

  const positions = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2'
  }

  const Icon = icons[type]

  return (
    <div className={`fixed ${positions[position]} z-50 animate-slide-down`}>
      <div className={`${colors[type]} text-white px-6 py-4 rounded-lg shadow-lg border flex items-center space-x-3 max-w-md`}>
        <Icon className="w-5 h-5 flex-shrink-0" />
        <span className="flex-1">{message}</span>
        <button onClick={onClose} className="text-white hover:text-gray-200 ml-2">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

// Toast Hook
export const useToast = () => {
  const [toast, setToast] = React.useState({
    isVisible: false,
    type: 'success',
    message: ''
  })

  const showToast = (type, message, duration = 5000) => {
    setToast({
      isVisible: true,
      type,
      message
    })
  }

  const hideToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }))
  }

  const ToastComponent = () => (
    <Toast
      {...toast}
      onClose={hideToast}
    />
  )

  return {
    ...paginationData,
    goToPage,
    nextPage,
    previousPage,
    reset
  }
}
