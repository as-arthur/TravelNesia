import React from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'

const Layout = () => {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('token') // Hapus token
    navigate('/login') // Arahkan ke halaman login
  }

  const isLoggedIn = !!localStorage.getItem('token')

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header with optional logout */}
      <div className="bg-blue-500 text-white p-4 flex justify-between items-center">
        <Header />
        {isLoggedIn && (
          <button
            onClick={handleLogout}
            className="bg-white text-blue-500 px-4 py-2 rounded hover:bg-gray-100 transition-colors"
          >
            Logout
          </button>
        )}
      </div>

      <main className="flex-grow">
        <Outlet />
      </main>

      <Footer />
    </div>
  )
}

export default Layout