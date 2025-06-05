'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LightBulbIcon, EnvelopeIcon, LockClosedIcon } from '@heroicons/react/24/outline'

export default function LoginModal() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Login failed')
      localStorage.setItem('token', data.token)
      router.push('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(() => router.push('/'), 300)
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-modal-title"
      className={`fixed inset-0 z-50 flex items-start justify-center p-4 transition-opacity duration-300 overflow-y-auto ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
    >
      <div className="absolute inset-0 bg-black bg-opacity-70 backdrop-blur-sm" onClick={handleClose}></div>

      <div className={`relative w-full max-w-md bg-gradient-to-br from-indigo-50 to-white rounded-2xl shadow-xl my-8 transform transition-transform duration-300 ${isVisible ? 'scale-100' : 'scale-95'}`}>
        <div className="h-2 bg-gradient-to-r from-indigo-500 to-purple-600"></div>

        <div className="p-6 sm:p-8">
          <button onClick={handleClose} aria-label="Close login modal" className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Header Logo */}
          <div className="text-center mb-6 group">
            <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-amber-500 flex items-center justify-center mb-3 shadow-lg">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-600 to-amber-500 flex items-center justify-center p-2">
                <LightBulbIcon className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-baseline justify-center">
              Percepti
              <span className="relative h-6 w-6 -mx-1">
                <LightBulbIcon className="h-full w-full text-amber-400 drop-shadow-sm" />
              </span>
              n App
            </h1>
            <h2 id="login-modal-title" className="text-xl font-bold text-gray-800 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mt-2">
              Welcome Back
            </h2>
            <p className="text-gray-500 text-sm mt-1">Sign in to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-3">
              {/* Email input with icon */}
              <div>
                <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <div className="relative">
                  <input
                    id="login-email"
                    name="email"
                    type="email"
                    placeholder="you@email.com"
                    onChange={handleChange}
                    required
                    className="block w-full bg-white border border-gray-200 rounded-lg px-3 py-2 pl-10 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 focus:outline-none transition-all"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </div>

              {/* Password input with icon */}
              <div>
                <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <input
                    id="login-password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    onChange={handleChange}
                    required
                    className="block w-full bg-white border border-gray-200 rounded-lg px-3 py-2 pl-10 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 focus:outline-none transition-all"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockClosedIcon className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-indigo-600 border-gray-300 rounded" />
                <label htmlFor="remember-me" className="ml-2 text-gray-700">Remember me</label>
              </div>
              <a href="#" className="text-indigo-600 hover:text-indigo-500">Forgot password?</a>
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 p-2 text-red-700 text-sm flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium py-2 px-4 rounded-lg shadow hover:shadow-md transition-all duration-300 flex items-center justify-center disabled:opacity-70"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in...
                </>
              ) : 'Sign in'}
            </button>
          </form>

          <div className="text-center mt-4 text-sm">
            <p className="text-gray-600">
              Don't have an account? <a href="/register" className="text-indigo-600 hover:text-indigo-500">Sign up</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
