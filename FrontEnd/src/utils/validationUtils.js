export const validationUtils = {
  // Email validation
  isValidEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  },

  // Required field validation
  isRequired: (value) => {
    return value !== null && value !== undefined && value.toString().trim() !== ''
  },

  // Min length validation
  minLength: (value, min) => {
    return value && value.toString().length >= min
  },

  // Max length validation
  maxLength: (value, max) => {
    return !value || value.toString().length <= max
  },

  // Rating validation
  isValidRating: (rating) => {
    const num = parseFloat(rating)
    return !isNaN(num) && num >= 1 && num <= 5
  },

  // URL validation
  isValidUrl: (url) => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  },

  // Phone number validation (Indonesia)
  isValidPhoneNumber: (phone) => {
    const phoneRegex = /^(\+62|62|0)[0-9]{9,13}$/
    return phoneRegex.test(phone.replace(/\s|-/g, ''))
  },

  // Password strength validation
  isStrongPassword: (password) => {
    return password.length >= 8 && 
           /[A-Z]/.test(password) && 
           /[a-z]/.test(password) && 
           /[0-9]/.test(password)
  },

  // Form validation helper
  validateForm: (data, rules) => {
    const errors = {}
    
    Object.keys(rules).forEach(field => {
      const rule = rules[field]
      const value = data[field]
      
      if (rule.required && !validationUtils.isRequired(value)) {
        errors[field] = rule.requiredMessage || `${field} is required`
        return
      }
      
      if (rule.email && value && !validationUtils.isValidEmail(value)) {
        errors[field] = rule.emailMessage || 'Invalid email format'
        return
      }
      
      if (rule.minLength && value && !validationUtils.minLength(value, rule.minLength)) {
        errors[field] = rule.minLengthMessage || `Minimum ${rule.minLength} characters required`
        return
      }
      
      if (rule.maxLength && value && !validationUtils.maxLength(value, rule.maxLength)) {
        errors[field] = rule.maxLengthMessage || `Maximum ${rule.maxLength} characters allowed`
        return
      }
      
      if (rule.custom && value) {
        const customResult = rule.custom(value)
        if (customResult !== true) {
          errors[field] = customResult || 'Invalid value'
        }
      }
    })
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    }
  }
}