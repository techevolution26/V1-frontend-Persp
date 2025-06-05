// app/components/RecentPerceptions.jsx

"use client";

import { useState, useEffect } from "react";
import PerceptionCard from "./PerceptionCard";
import useLikeToggle from "../hooks/useLikeToggle";

export default function RecentPerceptions({ userId }) {
  const [list, setList] = useState([]);
  const [page, setPage] = useState(1);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const toggleLike = useLikeToggle();

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

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

  function handleLikeUpdate(pid, liked, likes_count) {
    setList((curr) =>
      curr.map((p) =>
        p.id === pid ? { ...p, liked_by_user: liked, likes_count } : p
      )
    );
  }

  const itemsPerPage = 10;
  const visible = list.slice(0, page * itemsPerPage);
  const hasMore = visible.length < list.length;

  if (loading) return <p>Loading recent perceptions…</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;
  if (list.length === 0) return <p>No perceptions yet.</p>;

  return (
    <div className="flex flex-col items-center">
      <div className="w-full max-w-2xl space-y-6">
        {visible.map((p) => (
          <div
            key={p.id}
            className="group relative transition-all duration-300 hover:scale-[1.02]"
          >
            <PerceptionCard
              perception={p}
              onLike={() => toggleLike(p, handleLikeUpdate)}
              className="border border-gray-100 hover:border-indigo-100 shadow-md hover:shadow-lg transition-all duration-300"
            />
            <div className="absolute inset-0 rounded-xl pointer-events-none bg-gradient-to-br from-white/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </div>
        ))}

        {hasMore && (
          <div className="flex justify-center">
            <button
              onClick={() => setPage((prev) => prev + 1)}
              className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
            >
              Load More
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
