import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'

const LoginPage = () => {
  const [isSignUp, setIsSignUp] = useState(false)
  const [loginData, setLoginData] = useState({ email: '', password: '' })
  const [signUpData, setSignUpData] = useState({ firstName: '', email: '', password: '' })
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    setMessage('')
    setIsLoading(true)

    try {
    const response = await axios.post('http://192.168.238.216:4000/api/auth/login', {
        email: loginData.email,
        password: loginData.password,
      })
      
      setMessage('Login sukses! Mengalihkan...')
      // Store token in localStorage if needed
      localStorage.setItem('token', response.data.token)
      
      // Redirect to home page after successful login
      setTimeout(() => {
        navigate('/')
      }, 1500)
      
    } catch (error) {
      if (error.response && error.response.data.error) {
        setMessage('Error: ' + error.response.data.error)
      } else {
        setMessage('Error saat login. Silakan coba lagi.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignUpSubmit = async (e) => {
    e.preventDefault()
    setMessage('')
    setIsLoading(true)

    try {
      const response = await axios.post('http://192.168.238.216:4000/api/auth/register', {
        Name: signUpData.firstName,
        email: signUpData.email,
        password: signUpData.password,
      })
      
      setMessage('Registrasi berhasil! Silakan login.')
      setIsSignUp(false)
      setSignUpData({ firstName: '', email: '', password: '' })
      
    } catch (error) {
      if (error.response && error.response.data.error) {
        setMessage('Error: ' + error.response.data.error)
      } else {
        setMessage('Error saat registrasi. Silakan coba lagi.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 flex items-center justify-center p-6">
      <div className="flex max-w-6xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Left Side - Welcome Message */}
        <div className="w-full lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="flex items-center space-x-2 mb-8">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xl">T</span>
            </div>
          </div>

          <h1 className="text-4xl lg:text-5xl font-bold text-yellow-500 mb-4">
            Welcome To TravelNesia
          </h1>
          <p className="text-gray-600 text-lg mb-8 leading-relaxed">
            Di balik setiap langkah, tersembunyi keajaiban alam Nusantara. Temukan semuanya bersama Travelnesia.
          </p>
          
          {/* Back to Home Link */}
          <Link 
            to="/" 
            className="text-blue-500 hover:text-blue-600 font-medium inline-flex items-center"
          >
            ← Kembali ke Beranda
          </Link>
        </div>

        {/* Right Side - Form */}
        <div className="w-full lg:w-1/2 bg-white p-8 lg:p-12 flex items-center justify-center">
          <div className="w-full max-w-md">
            {!isSignUp ? (
              /* Login Form */
              <>
                <div className="text-center mb-8">
                  <button 
                    onClick={() => setIsSignUp(true)}
                    className="text-yellow-500 hover:text-yellow-600 font-medium transition-colors"
                  >
                    Sign Up to continue
                  </button>
                </div>

                <form onSubmit={handleLoginSubmit} className="space-y-6">
                  <div>
                    <input
                      type="email"
                      placeholder="Email Address*"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      required
                      autoComplete="username"
                    />
                  </div>

                  <div>
                    <input
                      type="password"
                      placeholder="Password*"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      required
                      autoComplete="current-password"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Signing In...' : 'Sign In'}
                  </button>
                </form>
              </>
            ) : (
              /* Sign Up Form */
              <>
                <div className="text-center mb-8">
                  <button 
                    onClick={() => setIsSignUp(false)}
                    className="text-yellow-500 hover:text-yellow-600 font-medium transition-colors"
                  >
                    Sign In to continue
                  </button>
                </div>

                <form onSubmit={handleSignUpSubmit} className="space-y-6">
                  <div>
                    <input
                      type="text"
                      placeholder="First Name*"
                      value={signUpData.firstName}
                      onChange={(e) => setSignUpData({ ...signUpData, firstName: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      required
                    />
                  </div>

                  <div>
                    <input
                      type="email"
                      placeholder="Email Address*"
                      value={signUpData.email}
                      onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      required
                      autoComplete="username"
                    />
                  </div>

                  <div>
                    <input
                      type="password"
                      placeholder="Password*"
                      value={signUpData.password}
                      onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      required
                      autoComplete="new-password"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Creating Account...' : 'Continue'}
                  </button>
                </form>
              </>
            )}

            {/* Message Display */}
            {message && (
              <div className={`mt-4 p-3 rounded-lg text-center ${
                message.includes('Error') 
                  ? 'bg-red-100 text-red-700' 
                  : 'bg-green-100 text-green-700'
              }`}>
                {message}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage