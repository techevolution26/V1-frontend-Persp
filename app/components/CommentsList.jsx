"use client";
import { useEffect, useState } from "react";

export default function CommentsList({ perceptionId }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/perceptions/${perceptionId}/comments`, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const data = await res.json();
        setComments(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [perceptionId, token]);

  if (loading) return <p>Loading comments…</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;
  if (comments.length === 0) return <p>No comments yet.</p>;

  return (
    <ul className="space-y-2">
      {comments.map((c) => (
        <li key={c.id} className="border-l-2 pl-3 py-2">
          <p className="text-sm font-semibold">{c.user.name}</p>
          <p>{c.body}</p>
          <small className="text-gray-500">
            {new Date(c.created_at).toLocaleString()}
          </small>
        </li>
      ))}
    </ul>
  );
}
