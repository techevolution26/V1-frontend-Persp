'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const [form, setForm]       = useState({
    name: '', email: '', password: '', password_confirmation: ''
  })
  const [error, setError]     = useState(null)
  const [loading, setLoading] = useState(false)
  const router                = useRouter()

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(form)
      })

      const data = await res.json()
      if (!res.ok) {

        document.cookie = `token=${data.token}; path=/; max-age=3600;` // Set token in cookies
        // Display first validation error
        const firstError = Object.values(data.errors || {})[0][0]
        throw new Error(firstError || data.message)
      }

      // Save token & redirect to topics
      localStorage.setItem('token', data.token)
      router.push('/topics')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Register</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="name"                  placeholder="Name"                  onChange={handleChange} required className="block w-full border px-3 py-2 rounded"/>
        <input name="email" type="email"    placeholder="Email"                 onChange={handleChange} required className="block w-full border px-3 py-2 rounded"/>
        <input name="password" type="password" placeholder="Password"            onChange={handleChange} required className="block w-full border px-3 py-2 rounded"/>
        <input name="password_confirmation" type="password" placeholder="Confirm Password" onChange={handleChange} required className="block w-full border px-3 py-2 rounded"/>
        {error && <p className="text-red-500">{error}</p>}
        <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded">
          {loading ? 'Registering…' : 'Register'}
        </button>
      </form>
    </main>
  )
}
