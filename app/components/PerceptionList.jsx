"use client";
import { useEffect, useState } from "react";

export default function PerceptionsList({ topicId }) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(
          `http://localhost:8000/api/topics/${topicId}/perceptions`,
          {
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const data = await res.json();
        setList(data);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [topicId, token]);

  if (loading) return <p>Loading perceptions…</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;
  if (list.length === 0) return <p>No perceptions in this topic.</p>;

  return (
    <ul className="space-y-4">
      {list.map((p) => (
        <li key={p.id} className="border p-4 rounded-lg">
          <div className="flex items-center mb-2">
            <div className="h-8 w-8 rounded-full bg-gray-300 mr-2" />
            <span className="font-medium">{p.user.name}</span>
            <span className="ml-auto text-sm text-gray-500">⋮</span>
          </div>
          <p className="mb-2">{p.body}</p>
          <div className="flex space-x-4 text-sm text-gray-600">
            <button>❤ {p.likes_count}</button>
            <button>💬 {p.comments_count}</button>
          </div>
        </li>
      ))}
    </ul>
  );
}
