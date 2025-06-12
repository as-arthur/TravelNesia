import React, { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

const Modal = ({ 
  isOpen, 
  onClose, 
  children, 
  title,
  size = 'lg', // 'sm', 'md', 'lg', 'xl', 'full'
  showCloseButton = true,
  closeOnBackdrop = true,
  closeOnEscape = true,
  className = '',
  overlayClassName = '',
  preventBodyScroll = true
}) => {
  const modalRef = useRef(null)
  const previousActiveElement = useRef(null)

  // Close modal on Escape key
  useEffect(() => {
    if (!closeOnEscape) return

    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose, closeOnEscape])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (!preventBodyScroll) return

    if (isOpen) {
      // Store current scroll position
      const scrollY = window.scrollY
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY}px`
      document.body.style.width = '100%'
    } else {
      // Restore scroll position
      const scrollY = document.body.style.top
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1)
      }
    }

    return () => {
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
    }
  }, [isOpen, preventBodyScroll])

  // Focus management
  useEffect(() => {
    if (isOpen) {
      // Store the previously focused element
      previousActiveElement.current = document.activeElement
      
      // Focus the modal
      if (modalRef.current) {
        modalRef.current.focus()
      }
    } else {
      // Restore focus to previously focused element
      if (previousActiveElement.current && previousActiveElement.current.focus) {
        previousActiveElement.current.focus()
      }
    }
  }, [isOpen])

  // Focus trap within modal
  useEffect(() => {
    if (!isOpen) return

    const modal = modalRef.current
    if (!modal) return

    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    const handleTabKey = (e) => {
      if (e.key !== 'Tab') return

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement?.focus()
          e.preventDefault()
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement?.focus()
          e.preventDefault()
        }
      }
    }

    modal.addEventListener('keydown', handleTabKey)
    return () => modal.removeEventListener('keydown', handleTabKey)
  }, [isOpen])

  if (!isOpen) return null

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md', 
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4 h-full max-h-full'
  }

  const handleBackdropClick = (e) => {
    if (closeOnBackdrop && e.target === e.currentTarget) {
      onClose()
    }
  }

  const handleModalClick = (e) => {
    // Prevent clicks inside modal from bubbling to backdrop
    e.stopPropagation()
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300 ${overlayClassName}`}
        onClick={handleBackdropClick}
        aria-hidden="true"
      />
      
      {/* Modal Container */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div 
          ref={modalRef}
          className={`
            relative w-full ${sizeClasses[size]} 
            bg-white rounded-lg shadow-xl transform transition-all duration-300
            focus:outline-none
            ${size === 'full' ? 'h-full flex flex-col' : ''}
            ${className}
          `}
          onClick={handleModalClick}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? 'modal-title' : undefined}
          tabIndex={-1}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <div className={`flex items-center justify-between p-6 ${size === 'full' ? 'flex-shrink-0' : ''} ${title ? 'pb-4' : 'pb-2'}`}>
              {title && (
                <h3 id="modal-title" className="text-lg font-semibold text-gray-900 pr-8">
                  {title}
                </h3>
              )}
              
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                  aria-label="Close modal"
                >
                  <X className="w-6 h-6" />
                </button>
              )}
            </div>
          )}
          
          {/* Content */}
          <div className={`
            ${(title || showCloseButton) ? 'px-6 pb-6' : 'p-6'} 
            ${size === 'full' ? 'flex-1 overflow-y-auto' : ''}
          `}>
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

// Predefined modal variants for common use cases
export const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = 'Konfirmasi',
  message = 'Apakah Anda yakin?',
  confirmText = 'Ya',
  cancelText = 'Batal',
  confirmStyle = 'danger' // 'danger', 'primary', 'success'
}) => {
  const confirmButtonClass = {
    danger: 'bg-red-500 hover:bg-red-600 text-white',
    primary: 'bg-blue-500 hover:bg-blue-600 text-white', 
    success: 'bg-green-500 hover:bg-green-600 text-white'
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" title={title}>
      <div className="text-gray-700 mb-6">
        {message}
      </div>
      <div className="flex justify-end space-x-3">
        <button
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          {cancelText}
        </button>
        <button
          onClick={() => {
            onConfirm()
            onClose()
          }}
          className={`px-4 py-2 rounded-lg transition-colors ${confirmButtonClass[confirmStyle]}`}
        >
          {confirmText}
        </button>
      </div>
    </Modal>
  )
}

// Loading modal variant
export const LoadingModal = ({ 
  isOpen, 
  message = 'Loading...',
  showSpinner = true 
}) => {
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={() => {}} 
      size="sm" 
      showCloseButton={false}
      closeOnBackdrop={false}
      closeOnEscape={false}
    >
      <div className="text-center py-8">
        {showSpinner && (
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        )}
        <p className="text-gray-700">{message}</p>
      </div>
    </Modal>
  )
}

export default Modal