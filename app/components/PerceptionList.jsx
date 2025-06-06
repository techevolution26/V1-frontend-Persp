"use client";

import { useState, useEffect } from "react";
import NewPerceptionForm from "./NewPerceptionForm";
import PerceptionCard from "./PerceptionCard";
import UseLikeToggle from "../hooks/useLikeToggle";

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-xl border border-gray-200 p-4 bg-white shadow-sm space-y-4">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 bg-gray-200 rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-1/2 bg-gray-200 rounded" />
          <div className="h-2 w-1/3 bg-gray-200 rounded" />
        </div>
      </div>
      <div className="h-3 w-full bg-gray-200 rounded" />
      <div className="h-3 w-5/6 bg-gray-200 rounded" />
      <div className="h-32 w-full bg-gray-100 rounded" />
      <div className="flex space-x-4 mt-3">
        <div className="h-4 w-10 bg-gray-200 rounded" />
        <div className="h-4 w-10 bg-gray-200 rounded" />
      </div>
    </div>
  );
}

export default function PerceptionsList({ topic }) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const toggleLike = UseLikeToggle();

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    if (!topic?.id) return;

    setLoading(true);
    setError(null);

    const params = new URLSearchParams({ topic_id: topic.id });
    fetch(`/api/perceptions?${params}`, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((r) => r.ok ? r.json() : Promise.reject(r.status))
      .then(setList)
      .catch((err) => {
        console.error("Error loading perceptions:", err);
        setError(typeof err === "string" ? err : "Failed to load perceptions.");
      })
      .finally(() => setLoading(false));
  }, [topic?.id, token]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (error) return <p className="text-red-500">Error: {error}</p>;

  if (list.length === 0) {
    return (
      <div className="text-center py-10 space-y-6">
        <p className="text-gray-500 text-lg">
          No perceptions yet in <strong>{topic.name}</strong>
        </p>
        <p className="text-sm text-gray-400">Be the first to contribute a thought.</p>
        <NewPerceptionForm
          topics={[{ id: topic.id, name: topic.name }]}
          onSuccess={(newP) => setList([newP, ...list])}
        />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
      {list.map((p) => (
        <PerceptionCard
          key={p.id}
          perception={p}
          onLike={() =>
            toggleLike(p, (id, liked, likes_count) => {
              setList((curr) =>
                curr.map((x) =>
                  x.id === id ? { ...x, liked_by_user: liked, likes_count } : x
                )
              );
            })
          }
          className="h-full"
        />
      ))}
    </div>
  );
}
