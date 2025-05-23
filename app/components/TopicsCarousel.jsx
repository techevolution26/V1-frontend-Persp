"use client";

import { useEffect, useState } from "react";

/**
 * TopicsCarousel
 * Props:
 *   - onSelect(topic)   // optional callback when a topic is clicked
 */
export default function TopicsCarousel({ onSelect }) {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/api/topics", {
      headers: { Accept: "application/json" },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Status ${res.status}`);
        return res.json();
      })
      .then((data) => setTopics(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading topics…</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  return (
    <div className="flex space-x-4 overflow-x-auto py-2">
      {topics.map((topic) => (
        <button
          key={topic.id}
          onClick={() => onSelect?.(topic)}
          className="flex-shrink-0 flex flex-col items-center justify-center w-20 h-20 rounded-full bg-gray-200 hover:bg-gray-300"
          title={topic.name}
        >
          {/*icon URL: */}
          {/* <img src={topic.icon_url} alt={topic.name} className="w-12 h-12 rounded-full mb-1" /> */}
          {/* Otherwise, show initials */}
          <span className="text-sm font-medium text-gray-700">
            {topic.name}
          </span>
        </button>
      ))}
    </div>
  );
}
