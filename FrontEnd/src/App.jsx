import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import HomePage from './pages/HomePage'
import AboutPage from './pages/AboutPage'
import GalleryPage from './pages/GalleryPage'
import ReviewsPage from './pages/ReviewsPage'
import LoginPage from './pages/LoginPage'
import NotFoundPage from './pages/NotFoundPage'
import PrivateRoute from './components/PrivateRoute'
import MLTestingPanel from './components/MLTestingPanel'

function App() {
  return (
    <div className="App">
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route index element={<HomePage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="gallery" element={<GalleryPage />} />
          <Route path="reviews" element={<ReviewsPage />} />
        </Route>

        {/* Fallback for 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>

      {/* ML Testing Panel - Only in development */}
      {(import.meta.env.DEV || import.meta.env.VITE_SHOW_ML_TESTING === 'true') && (
        <MLTestingPanel />
      )}
    </div>
  )
}

export default App