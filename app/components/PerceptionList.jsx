// components/PerceptionsList.jsx
"use client";

import { useState, useEffect } from "react";
import NewPerceptionForm from "./NewPerceptionForm";
import PerceptionCard from "./PerceptionCard";

export default function PerceptionsList({ topicId }) {
  const [list, setList] = useState([]);
  const [topic, setTopic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  //loading topic metadata (name) and existing perceptions
  useEffect(() => {
    setLoading(true);
    setError(null);

    // fetching topic name
    fetch(`/api/topics/${topicId}`, { headers: { Accept: "application/json" } })
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((t) => setTopic(t))
      .catch((err) => console.error("Error loading topic:", err));

    // fetching perceptions
    const params = new URLSearchParams({ topic_id: topicId });
    fetch(`/api/perceptions?${params}`, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then(setList)
      .catch((err) => {
        console.error("Error loading perceptions:", err);
        setError(err.toString());
      })
      .finally(() => setLoading(false));
  }, [topicId, token]);

  if (loading) return <p>Loading…</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  //EMPTY STATE: showing the inline form
  if (list.length === 0) {
    return (
      <div className="text-center py-8 space-y-4">
        <p className="text-gray-500 text-lg">
          No perceptions yet in <strong>{topic?.name}</strong>
        </p>

        {/*
           Passing a single‐item topics array so the form dropdown is
           prefilled with our current topic.
        */}
        {topic && (
          <NewPerceptionForm
            topics={[{ id: topic.id, name: topic.name }]}
            onSuccess={(newP) => {
              // prepending the newly created perception to the list
              setList([newP, ...list]);
            }}
          />
        )}
      </div>
    );
  }

  //Otherwise render cards
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
