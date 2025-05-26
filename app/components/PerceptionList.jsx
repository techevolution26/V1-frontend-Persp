// components/PerceptionsList.jsx
"use client";

import { useState, useEffect } from "react";
import PerceptionCard from "./PerceptionCard";

export default function PerceptionsList({ topicId }) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    async function fetchPerceptions() {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({ topic_id: topicId });
      try {
        const res = await fetch(`/api/perceptions?${params}`, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error(`Status ${res.status}`);
        }

        const data = await res.json();
        setList(data);
      } catch (err) {
        console.error("Error loading perceptions:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchPerceptions();
  }, [topicId, token]);

  if (loading) return <p>Loading perceptions…</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;
  if (list.length === 0) return <p>No perceptions yet in this topic.</p>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {list.map((p) => (
        <PerceptionCard
          key={p.id}
          perception={p}
          onLike={async (id) => {
            await fetch(`/api/perceptions/${id}/like`, {
              method: "POST",
              headers: { Authorization: `Bearer ${token}` },
            });
            // optimistically update UI
            setList((curr) =>
              curr.map((x) =>
                x.id === id ? { ...x, likes_count: x.likes_count + 1 } : x
              )
            );
          }}
        />
      ))}
    </div>
  );
}
