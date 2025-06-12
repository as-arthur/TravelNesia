import React from 'react'
import { Link } from 'react-router-dom'
import { Phone, Mail, Instagram, Facebook } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-6 py-12">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Contact Information */}
          <div>
            <h3 className="text-yellow-400 font-bold text-lg mb-4">SPEAK TO OUR TEAM</h3>
            <div className="space-y-3">
              <p className="flex items-center space-x-2">
                <Phone className="w-4 h-4" />
                <span>+62 310 5436581</span>
              </p>
              <p className="flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span>tourguide@gmail.com</span>
              </p>
              <p className="text-gray-300">
                Jl. congcat NO 02, Gejayan, Yogyakarta 13546
              </p>
            </div>
            
            {/* Social Media Links */}
            <div className="flex space-x-4 mt-6">
              <a href="mailto:tourguide@gmail.com" className="hover:text-yellow-400 transition-colors">
                <Mail className="w-6 h-6" />
              </a>
              <a href="#" className="hover:text-yellow-400 transition-colors">
                <Instagram className="w-6 h-6" />
              </a>
              <a href="#" className="hover:text-yellow-400 transition-colors">
                <Facebook className="w-6 h-6" />
              </a>
            </div>
          </div>
          
          {/* Navigation Links */}
          <div className="grid grid-cols-2 gap-8">
            <div>
              <ul className="space-y-3">
                <li>
                  <Link to="/" className="hover:text-yellow-400 transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="hover:text-yellow-400 transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link to="/gallery" className="hover:text-yellow-400 transition-colors">
                    Gallery
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <ul className="space-y-3">
                <li>
                  <Link to="/reviews" className="hover:text-yellow-400 transition-colors">
                    Reviews
                  </Link>
                </li>
                <li>
                  <a href="#" className="hover:text-yellow-400 transition-colors">
                    Most Popular
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-yellow-400 transition-colors">
                    Local Culture
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* Bottom Section */}
        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-gray-400">
            <a href="#" className="hover:text-yellow-400 transition-colors">
              Privacy policy
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
