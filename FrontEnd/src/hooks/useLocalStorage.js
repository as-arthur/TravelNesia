import { useState, useEffect } from 'react'

// Custom hook untuk manage localStorage dengan React state
export const useLocalStorage = (key, initialValue) => {
  // State untuk store nilai
  const [storedValue, setStoredValue] = useState(() => {
    try {
      // Get item dari localStorage
      const item = window.localStorage.getItem(key)
      // Parse stored json atau return initialValue
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      // Jika error, return initialValue
      console.error(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  // Return wrapped version dari useState's setter function yang persist ke localStorage
  const setValue = (value) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value
      
      // Save state
      setStoredValue(valueToStore)
      
      // Save to localStorage
      if (valueToStore === undefined) {
        window.localStorage.removeItem(key)
      } else {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      // More advanced implementation would handle the error case
      console.error(`Error setting localStorage key "${key}":`, error)
    }
  }

  // Remove item dari localStorage
  const removeValue = () => {
    try {
      setStoredValue(undefined)
      window.localStorage.removeItem(key)
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error)
    }
  }

  return [storedValue, setValue, removeValue]
}

// Hook untuk manage multiple localStorage items
export const useLocalStorageState = (keys = []) => {
  const [state, setState] = useState({})

  useEffect(() => {
    const initialState = {}
    keys.forEach(key => {
      try {
        const item = window.localStorage.getItem(key)
        initialState[key] = item ? JSON.parse(item) : null
      } catch (error) {
        console.error(`Error reading localStorage key "${key}":`, error)
        initialState[key] = null
      }
    })
    setState(initialState)
  }, [])

  const updateValue = (key, value) => {
    try {
      const valueToStore = value instanceof Function ? value(state[key]) : value
      
      setState(prev => ({
        ...prev,
        [key]: valueToStore
      }))

      if (valueToStore === undefined || valueToStore === null) {
        window.localStorage.removeItem(key)
      } else {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error)
    }
  }

  const removeKey = (key) => {
    try {
      setState(prev => {
        const newState = { ...prev }
        delete newState[key]
        return newState
      })
      window.localStorage.removeItem(key)
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error)
    }
  }

  return [state, updateValue, removeKey]
}

// Hook untuk manage user preferences
export const useUserPreferences = () => {
  const [preferences, setPreferences, removePreferences] = useLocalStorage('userPreferences', {
    theme: 'light',
    language: 'id',
    categories: ['alam', 'budaya'],
    budget: 'medium',
    travelStyle: 'family'
  })

  const updatePreference = (key, value) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const resetPreferences = () => {
    removePreferences()
  }

  return [preferences, updatePreference, resetPreferences]
}

// Hook untuk manage search history
export const useSearchHistory = (maxItems = 10) => {
  const [searchHistory, setSearchHistory] = useLocalStorage('searchHistory', [])

  const addSearch = (searchTerm) => {
    if (!searchTerm || searchTerm.trim().length === 0) return

    setSearchHistory(prev => {
      const newHistory = [searchTerm, ...prev.filter(item => item !== searchTerm)]
      return newHistory.slice(0, maxItems)
    })
  }

  const removeSearch = (searchTerm) => {
    setSearchHistory(prev => prev.filter(item => item !== searchTerm))
  }

  const clearHistory = () => {
    setSearchHistory([])
  }

  return [searchHistory, addSearch, removeSearch, clearHistory]
}

// Hook untuk manage recent destinations
export const useRecentDestinations = (maxItems = 5) => {
  const [recentDestinations, setRecentDestinations] = useLocalStorage('recentDestinations', [])

  const addDestination = (destination) => {
    if (!destination || !destination.id) return

    setRecentDestinations(prev => {
      const existingIndex = prev.findIndex(item => item.id === destination.id)
      let newRecents = [...prev]

      if (existingIndex >= 0) {
        // Move to front if already exists
        newRecents.splice(existingIndex, 1)
      }

      newRecents.unshift({
        id: destination.id,
        name: destination.name,
        location: destination.location,
        image: destination.image,
        visitedAt: new Date().toISOString()
      })

      return newRecents.slice(0, maxItems)
    })
  }

  const removeDestination = (destinationId) => {
    setRecentDestinations(prev => prev.filter(item => item.id !== destinationId))
  }

  const clearRecents = () => {
    setRecentDestinations([])
  }

  return [recentDestinations, addDestination, removeDestination, clearRecents]
}

export default useLocalStorage