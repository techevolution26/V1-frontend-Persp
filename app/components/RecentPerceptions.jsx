"use client";

import { useState, useEffect } from "react";
import PerceptionCard from "./PerceptionCard";

export default function RecentPerceptions({ userId }) {
  const [list, setList] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/users/${userId}/perceptions`, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const data = await res.json();
        setList(data);
      } catch (err) {
        console.error("Error loading recent perceptions:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [userId, token]);

  if (loading) return <p>Loading recent perceptions…</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;
  if (list.length === 0) return <p>No perceptions yet.</p>;

  // show only the first 5
  const slice = list.slice(0, 5);

  return (
    <div className="space-y-4">
      {slice.map((p) => (
        <PerceptionCard
          key={p.id}
          perception={p}
          onLike={async (id) => {
            await fetch(`/api/perceptions/${id}/like`, {
              method: "POST",
              headers: { Authorization: `Bearer ${token}` },
            });
            // optimistic update
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
