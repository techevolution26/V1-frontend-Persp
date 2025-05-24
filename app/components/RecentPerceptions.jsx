"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function RecentPerceptions({ userId }) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  //   useEffect(() => {
  //     fetch(`/api/users/${userId}/perceptions`)
  //       .then((r) => r.json())
  //       .then(setList);
  //   }, [userId]);

  //   if (list.length === 0) {
  //     return <p className="text-gray-500">No Perceptions Yet.</p>;
  //   }

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/users/${userId}/perceptions`, {
          headers: { Accept: "application/json" },
        });
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const data = await res.json();
        // ensure we only ever set an array
        setList(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [userId]);

  if (loading) return <p>Loading…</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;
  if (!Array.isArray(list) || list.length === 0) {
    return <p className="text-gray-500">No perceptions yet.</p>;
  }

  // taking up to 5 items
  const items = list.slice(0, 5);

  return (
    <ul className="space-y-4">
      {items.map((p) => (
        <li key={p.id} className="border p-4 rounded-lg">
          <p className="font-medium">{p.body}</p>
          <p className="text-sm text-gray-500">
            {new Date(p.created_at).toLocaleDateString()}
          </p>
          <Link
            href={`/perceptions/${p.id}`}
            className="text-blue-600 text-sm hover:underline"
          >
            View details →
          </Link>
        </li>
      ))}
    </ul>
  );
}
