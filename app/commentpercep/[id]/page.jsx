'use client'
// import CommentsList from '../components/CommentsList'
import NewCommentForm from '../components/NewCommentForm'
import { useState, useEffect } from 'react'

export default function PerceptionDetail({ params }) {
  const { id } = params
  const [perception, setPerception] = useState(null)
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

  useEffect(() => {
    fetch(`/api/perceptions/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(setPerception)
      .catch(console.error)
  }, [id])

  if (!perception) return <p>Loading…</p>

  return (
    <main className="p-6 space-y-6">
      <article className="border p-4 rounded">
        <h2 className="text-xl font-bold">{perception.body}</h2>
        <p className="text-gray-500">
          {perception.user.name} in {perception.topic.name}
        </p>
      </article>

      <section>
        <h3 className="text-lg font-bold mb-2">Comments</h3>
        <CommentsList perceptionId={id} token={token} />
        <NewCommentForm perceptionId={id} token={token}
          onAdd={c => {
            /* you can prepend the new comment to the list, or refetch */}
          }
        />
      </section>
    </main>
  )
}
