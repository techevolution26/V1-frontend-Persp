'use client'
import { useState } from 'react'

export default function NewPerceptionForm({ topics, onSuccess }) {
  const [body, setBody] = useState('')
  const [topicId, setTopicId] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/perceptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ body, topic_id: topicId }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to post')

      onSuccess(data)
      setBody('')
      setTopicId('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded">
      <select
        value={topicId}
        onChange={e => setTopicId(e.target.value)}
        required
        className="block w-full p-2 border"
      >
        <option value="">Select a topic</option>
        {topics.map(t => (
          <option key={t.id} value={t.id}>{t.name}</option>
        ))}
      </select>

      <textarea
        value={body}
        onChange={e => setBody(e.target.value)}
        placeholder="Share your perception…"
        required
        className="w-full p-2 border"
      />

      {error && <p className="text-red-500">{error}</p>}

      <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded">
        {loading ? 'Posting…' : 'Post'}
      </button>
    </form>
  )
}
