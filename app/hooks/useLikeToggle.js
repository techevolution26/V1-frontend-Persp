// hooks/useLikeToggle.js
import { useCallback } from 'react'

export default function useLikeToggle() {
  return useCallback(
    async function toggleLike(perception, updateFn) {
      const token = typeof window !== 'undefined' && localStorage.getItem('token')
      const method = perception.liked_by_user ? 'DELETE' : 'POST'
      const res = await fetch(`/api/perceptions/${perception.id}/like`, {
        method,
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error('Toggle like failed')
      // assume server responds with `{ liked: boolean, likes_count: number }`
      const json = await res.json()
      updateFn(perception.id, json.liked, json.likes_count)
    },
    []
  )
}
