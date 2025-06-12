import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const location = useLocation()

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

  const isActive = (path) => location.pathname === path

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/about', label: 'About us' },
    { path: '/gallery', label: 'Gallery' },
    { path: '/reviews', label: 'Reviews' }
  ]

  return (
    <header className="bg-white bg-opacity-90 backdrop-blur-sm fixed w-full z-50 shadow-sm">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">T</span>
            </div>
            <span className="font-bold text-xl text-gray-800">TravelNesia</span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link 
                key={item.path}
                to={item.path}
                className={`${
                  isActive(item.path) 
                    ? 'text-yellow-500 border-b-2 border-yellow-500' 
                    : 'text-gray-700 hover:text-yellow-500'
                } transition-colors duration-200 pb-1`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Sign In Button & Mobile Menu Toggle */}
          <div className="flex items-center space-x-4">
            <Link 
              to="/login"
              className="bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors duration-200"
            >
              Sign in
            </Link>
            <button 
              onClick={toggleMenu}
              className="md:hidden p-2"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t animate-fade-in">
            <nav className="flex flex-col space-y-4 mt-4">
              {navItems.map((item) => (
                <Link 
                  key={item.path}
                  to={item.path}
                  className={`text-left py-2 ${
                    isActive(item.path) 
                      ? 'text-yellow-500 font-medium' 
                      : 'text-gray-700 hover:text-yellow-500'
                  } transition-colors duration-200`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header