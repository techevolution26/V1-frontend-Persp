// app/components/RecentPerceptions.jsx
"use client";

import { useState, useEffect } from "react";
import PerceptionCard from "./PerceptionCard";
import useLikeToggle from "../hooks/useLikeToggle";
import { motion, AnimatePresence } from "framer-motion";

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

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto" aria-live="polite">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl h-48 bg-gray-100 animate-pulse" />
        ))}
      </div>
    );
  }

  if (error)
    return (
      <p className="text-red-500 text-center py-6" aria-live="assertive">
        Error: {error}
      </p>
    );

  if (list.length === 0)
    return (
      <div className="text-center py-12 text-gray-500 italic">
        No perceptions yet. Be the first to share!
      </div>
    );

  return (
    <div className="flex flex-col items-center">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl w-full">
        <AnimatePresence>
          {visible.map((p) => (
            <motion.div
              key={p.id}
              layout
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="group relative"
            >
              <PerceptionCard
                perception={p}
                onLike={() => toggleLike(p, handleLikeUpdate)}
                className="border border-gray-100 hover:border-indigo-100 shadow-md hover:shadow-lg transition-all duration-300"
              />
              <div className="absolute inset-0 rounded-xl pointer-events-none bg-gradient-to-br from-white/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {hasMore && (
        <div className="flex justify-center">
          <button
            onClick={() => setPage((prev) => prev + 1)}
            className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
}
