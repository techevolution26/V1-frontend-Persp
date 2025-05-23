"use client";

import { useEffect, useState } from "react";

export default function TopicsPage() {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("No token found. Please log in.");
      setLoading(false);
      return;
    }

    fetch("/api/topics", {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "omit",
    })
      .then((res) =>
        res.json().then((data) => {
          if (!res.ok)
            throw new Error(data.message || "Failed to fetch topics");
          return data;
        })
      )
      .then((data) => setTopics(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading topics…</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold mb-4">Topics</h1>
      <ul className="space-y-2">
        {topics.map((t) => (
          <li key={t.id} className="border p-3 rounded">
            <strong>{t.name}</strong>
            <br />
            <small>{t.description}</small>
          </li>
        ))}
      </ul>
    </main>
  );
}
