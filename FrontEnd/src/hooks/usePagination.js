import { useState, useMemo } from 'react'

// Custom hook untuk handle pagination logic
export const usePagination = ({
  data = [],
  itemsPerPage = 10,
  initialPage = 1
}) => {
  const [currentPage, setCurrentPage] = useState(initialPage)

  // Calculate pagination values
  const pagination = useMemo(() => {
    const totalItems = data.length
    const totalPages = Math.ceil(totalItems / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const currentItems = data.slice(startIndex, endIndex)
    
    const hasNextPage = currentPage < totalPages
    const hasPrevPage = currentPage > 1
    
    return {
      currentPage,
      totalPages,
      totalItems,
      itemsPerPage,
      startIndex,
      endIndex,
      currentItems,
      hasNextPage,
      hasPrevPage,
      isFirstPage: currentPage === 1,
      isLastPage: currentPage === totalPages,
      startItem: startIndex + 1,
      endItem: Math.min(endIndex, totalItems)
    }
  }, [data, currentPage, itemsPerPage])

  // Navigation functions
  const goToPage = (page) => {
    const pageNumber = Math.max(1, Math.min(page, pagination.totalPages))
    setCurrentPage(pageNumber)
  }

  const nextPage = () => {
    if (pagination.hasNextPage) {
      setCurrentPage(prev => prev + 1)
    }
  }

  const prevPage = () => {
    if (pagination.hasPrevPage) {
      setCurrentPage(prev => prev - 1)
    }
  }

  const firstPage = () => {
    setCurrentPage(1)
  }

  const lastPage = () => {
    setCurrentPage(pagination.totalPages)
  }

  const reset = () => {
    setCurrentPage(initialPage)
  }

  return {
    ...pagination,
    goToPage,
    nextPage,
    prevPage,
    firstPage,
    lastPage,
    reset,
    setPage: setCurrentPage
  }
}

// Hook untuk server-side pagination
export const useServerPagination = ({
  fetchFunction,
  itemsPerPage = 10,
  initialPage = 1,
  dependencies = []
}) => {
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [data, setData] = useState([])
  const [totalItems, setTotalItems] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const hasNextPage = currentPage < totalPages
  const hasPrevPage = currentPage > 1

  const fetchData = async (page = currentPage) => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetchFunction({
        page,
        limit: itemsPerPage,
        offset: (page - 1) * itemsPerPage
      })

      if (response.success) {
        setData(response.data || [])
        setTotalItems(response.total || response.pagination?.total || 0)
        setCurrentPage(page)
      } else {
        throw new Error(response.message || 'Failed to fetch data')
      }
    } catch (err) {
      console.error('Pagination fetch error:', err)
      setError(err.message)
      setData([])
    } finally {
      setIsLoading(false)
    }
  }

  // Navigation functions
  const goToPage = (page) => {
    const pageNumber = Math.max(1, Math.min(page, totalPages))
    fetchData(pageNumber)
  }

  const nextPage = () => {
    if (hasNextPage) {
      fetchData(currentPage + 1)
    }
  }

  const prevPage = () => {
    if (hasPrevPage) {
      fetchData(currentPage - 1)
    }
  }

  const refresh = () => {
    fetchData(currentPage)
  }

  const reset = () => {
    fetchData(initialPage)
  }

  // Auto-fetch when dependencies change
  useState(() => {
    fetchData(initialPage)
  }, dependencies)

  return {
    // Data
    data,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    hasNextPage,
    hasPrevPage,
    isLoading,
    error,
    
    // Actions
    goToPage,
    nextPage,
    prevPage,
    refresh,
    reset,
    fetchData,
    
    // Computed
    isFirstPage: currentPage === 1,
    isLastPage: currentPage === totalPages,
    startItem: ((currentPage - 1) * itemsPerPage) + 1,
    endItem: Math.min(currentPage * itemsPerPage, totalItems)
  }
}

// Hook untuk infinite scroll pagination
export const useInfinitePagination = ({
  fetchFunction,
  itemsPerPage = 10,
  dependencies = []
}) => {
  const [data, setData] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const loadMore = async () => {
    if (isLoading || !hasMore) return

    try {
      setIsLoading(true)
      setError(null)

      const response = await fetchFunction({
        page: currentPage,
        limit: itemsPerPage,
        offset: (currentPage - 1) * itemsPerPage
      })

      if (response.success) {
        const newData = response.data || []
        
        setData(prev => [...prev, ...newData])
        setCurrentPage(prev => prev + 1)
        setHasMore(newData.length === itemsPerPage)
      } else {
        throw new Error(response.message || 'Failed to fetch data')
      }
    } catch (err) {
      console.error('Infinite pagination error:', err)
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const reset = () => {
    setData([])
    setCurrentPage(1)
    setHasMore(true)
    setError(null)
  }

  const refresh = () => {
    reset()
    loadMore()
  }

  // Auto-load first page when dependencies change
  useState(() => {
    reset()
    loadMore()
  }, dependencies)

  return {
    data,
    hasMore,
    isLoading,
    error,
    loadMore,
    reset,
    refresh,
    currentPage,
    totalLoaded: data.length
  }
}

// Utility function untuk generate page numbers
export const generatePageNumbers = (currentPage, totalPages, maxVisible = 5) => {
  const pages = []
  const half = Math.floor(maxVisible / 2)
  
  let start = Math.max(1, currentPage - half)
  let end = Math.min(totalPages, start + maxVisible - 1)
  
  // Adjust start if we're near the end
  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1)
  }
  
  // Add first page and ellipsis if needed
  if (start > 1) {
    pages.push(1)
    if (start > 2) {
      pages.push('...')
    }
  }
  
  // Add page numbers
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  // Add last page and ellipsis if needed
  if (end < totalPages) {
    if (end < totalPages - 1) {
      pages.push('...')
    }
    pages.push(totalPages)
  }
  
  return pages
}

export default usePagination