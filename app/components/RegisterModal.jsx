'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  LightBulbIcon,
  UserIcon,
  EnvelopeIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline'

export default function RegisterModal() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: ''
  })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [shouldRender, setShouldRender] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})
  const [showToast, setShowToast] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    setShouldRender(true)
    const showTimer = setTimeout(() => setIsVisible(true), 10)
    return () => clearTimeout(showTimer)
  }, [])

  const validateFields = () => {
    const errs = {}
    if (!form.email.includes('@')) errs.email = 'Invalid email format'
    if (form.password !== form.password_confirmation)
      errs.password_confirmation = 'Passwords do not match'
    return errs
  }

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(() => {
      setShouldRender(false)
      router.push('/')
    }, 300)
  }

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    setError(null)
    setFieldErrors({})
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const errs = validateFields()
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs)
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (!res.ok) {
        const firstError = Object.values(data.errors || {})[0]?.[0]
        throw new Error(firstError || data.message || 'Registration failed')
      }

      localStorage.setItem('token', data.token)
      setShowToast(true)

      setTimeout(() => {
        setShowToast(false)
        router.push('/topics')
      }, 3000)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!mounted || !shouldRender) return null

  return (
    <>
      {showToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-[60] transition-opacity duration-500">
          {/* <div><LightBulbIcon className="h-5 w-5 text-amber-500 group-hover:rotate-12 transition-all duration-300 -mx-0.5" /></div> */}
          Account created successfully!
        </div>
      )}

      <div
        role="dialog"
        aria-modal="true"
        className={`fixed inset-0 z-50 flex items-start justify-center p-4 transition-opacity duration-300 overflow-y-auto ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      >
        <div className="absolute inset-0 bg-black bg-opacity-70 backdrop-blur-sm" onClick={handleClose}></div>

        <div className={`relative w-full max-w-md bg-gradient-to-br from-indigo-50 to-white rounded-2xl shadow-xl my-8 transform transition-transform duration-300 ${isVisible ? 'scale-100' : 'scale-95'}`}>
          <div className="h-2 bg-gradient-to-r from-purple-500 to-pink-600"></div>

          <div className="p-6 sm:p-8">
            <button onClick={handleClose} aria-label="Close registration modal" className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="text-center mb-6 group">
              <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-amber-500 flex items-center justify-center mb-3 shadow-lg">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-600 to-amber-500 flex items-center justify-center p-2">
                  <LightBulbIcon className="h-8 w-8 text-white" />
                </div>
              </div>

              <h1 className="text-2xl font-bold text-gray-800">Join Our Community</h1>
              <p className="text-gray-500 text-sm mt-1">Create your account to get started</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative">
                <UserIcon className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
                <input name="name" type="text" required onChange={handleChange}
                  className="peer w-full border px-10 pt-5 pb-1.5 rounded bg-white placeholder-transparent focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  placeholder="Full Name" />
                <label htmlFor="name" className="absolute left-10 top-2.5 text-gray-500 text-sm transition-all peer-placeholder-shown:top-2.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-2.5 peer-focus:text-sm peer-focus:text-indigo-500">Full Name</label>
              </div>

              <div className="relative">
                <EnvelopeIcon className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
                <input name="email" type="email" required onChange={handleChange}
                  className={`peer w-full border px-10 pt-5 pb-1.5 rounded bg-white placeholder-transparent focus:outline-none focus:ring-2 ${fieldErrors.email ? 'border-red-500 focus:ring-red-400' : 'focus:ring-indigo-400'}`}
                  placeholder="Email" />
                <label htmlFor="email" className="absolute left-10 top-2.5 text-gray-500 text-sm transition-all peer-placeholder-shown:top-2.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-2.5 peer-focus:text-sm peer-focus:text-indigo-500">Email</label>
                {fieldErrors.email && <p className="text-red-600 text-xs mt-1">{fieldErrors.email}</p>}
              </div>

              <div className="relative">
                <LockClosedIcon className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
                <input name="password" type="password" required onChange={handleChange}
                  className="peer w-full border px-10 pt-5 pb-1.5 rounded bg-white placeholder-transparent focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  placeholder="Password" />
                <label htmlFor="password" className="absolute left-10 top-2.5 text-gray-500 text-sm transition-all peer-placeholder-shown:top-2.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-2.5 peer-focus:text-sm peer-focus:text-indigo-500">Password</label>
              </div>

              <div className="relative">
                <LockClosedIcon className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
                <input name="password_confirmation" type="password" required onChange={handleChange}
                  className={`peer w-full border px-10 pt-5 pb-1.5 rounded bg-white placeholder-transparent focus:outline-none focus:ring-2 ${fieldErrors.password_confirmation ? 'border-red-500 focus:ring-red-400' : 'focus:ring-indigo-400'}`}
                  placeholder="Confirm Password" />
                <label htmlFor="password_confirmation" className="absolute left-10 top-2.5 text-gray-500 text-sm transition-all peer-placeholder-shown:top-2.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-2.5 peer-focus:text-sm peer-focus:text-indigo-500">Confirm Password</label>
                {fieldErrors.password_confirmation && <p className="text-red-600 text-xs mt-1">{fieldErrors.password_confirmation}</p>}
              </div>

              {error && <div className="text-red-600 text-sm">{error}</div>}

              <button type="submit" disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium py-2 px-4 rounded-lg shadow hover:shadow-md transition-all duration-300 disabled:opacity-70">
                {loading ? 'Creating account…' : 'Create Account'}
              </button>
            </form>

            <div className="text-center mt-4 text-sm">
              <p className="text-gray-600">
                Already have an account? <a href="/login" className="text-indigo-600 hover:text-indigo-500">Sign in</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
