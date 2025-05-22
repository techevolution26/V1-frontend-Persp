'use client'

import { useEffect, useState } from 'react'

export default function TopicsPage() {
  const [topics, setTopics]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      setError('No token found. Please log in.')
      setLoading(false)
      return
    }

    fetch('/api/topics', {
      headers: {
        'Accept':        'application/json',
        'Authorization': `Bearer ${token}`
      },
      credentials: 'omit',
    })
      .then(res => res.json().then(data => {
        if (!res.ok) throw new Error(data.message || 'Failed to fetch topics')
        return data
      }))
      .then(data => setTopics(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p>Loading topics…</p>
  if (error)   return <p className="text-red-500">{error}</p>

  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold mb-4">Topics</h1>
      <ul className="space-y-2">
        {topics.map(t => (
          <li key={t.id} className="border p-3 rounded">
            <strong>{t.name}</strong><br/>
            <small>{t.description}</small>
          </li>
        ))}
      </ul>
    </main>
  )
}


// 'use client'
// import { useEffect, useState } from 'react'

// export default function TopicsPage() {
//   const [topics, setTopics]   = useState(null)
//   const [loading, setLoading] = useState(true)
//   const [error, setError]     = useState(null)

//   useEffect(() => {
//     fetch('/api/topics', {
//       headers: { Accept: 'application/json' },
//     })
//       .then(async res => {
//         const text = await res.text()
//         console.log('Raw /api/topics response:', text)
//         return JSON.parse(text)
//       })
//       .then(data => {
//         // For now, just set whatever came back
//         setTopics(data)
//       })
//       .catch(err => {
//         console.error('Failed to fetch topics:', err)
//         setError(err.message)
//       })
//       .finally(() => setLoading(false))
//   }, [])

//   if (loading) return <p>Loading topics…</p>
//   if (error)   return <p className="text-red-500">Error: {error}</p>

//   console.log('Parsed topics:', topics)

//   // Guard: if topics isn’t an array, render a message
//   if (!Array.isArray(topics)) {
//     return <p className="text-red-500">Expected array but got: {JSON.stringify(topics)}</p>
//   }

//   return (
//     <div className="p-6">
//       <h1 className="text-2xl font-bold mb-4">Topics</h1>
//       <ul className="space-y-2">
//         {topics.map(t => (
//           <li key={t.id} className="border p-3 rounded">
//             <strong>{t.name}</strong><br/>
//             <small>{t.description}</small>
//           </li>
//         ))}
//       </ul>
//     </div>
//   )
// }
