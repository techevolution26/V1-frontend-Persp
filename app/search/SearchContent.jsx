// app/search/SearchContent.jsx
"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import PerceptionCard from "../components/PerceptionCard";
import Link from "next/link";

export default function SearchPageWithParams() {
  const searchParams = useSearchParams();
  const query = searchParams.get("query") || "";

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }

    let canceled = false;
    setLoading(true);
    setError(null);

    fetch(`/api/search?query=${encodeURIComponent(query)}`, {
      headers: { Accept: "application/json" },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Status ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (!canceled) setResults(data);
      })
      .catch((e) => {
        if (!canceled) setError(e.message);
      })
      .finally(() => {
        if (!canceled) setLoading(false);
      });

    return () => {
      canceled = true;
    };
  }, [query]);

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <input
          type="text"
          defaultValue={query}
          onChange={(e) => {
            const val = e.target.value;
            const params = new URLSearchParams(window.location.search);
            if (val) params.set("query", val);
            else params.delete("query");
            window.history.replaceState({}, "", `?${params.toString()}`);
          }}
          placeholder="Search perceptions or users…"
          className="w-full border px-4 py-2 rounded"
        />
      </div>

      {loading && <p>Searching…</p>}
      {error && <p className="text-red-500">Error: {error}</p>}

      {!loading && !error && results.length === 0 && query && (
        <p className="text-gray-500">No results found for “{query}”.</p>
      )}

      <ul className="space-y-6">
        {results.map((p) => (
          <li key={p.id}>
            <div className="border rounded-lg p-4">
              <div className="flex items-center mb-2">
                <img
                  src={p.user.avatar_url || "/default-avatar.png"}
                  alt={p.user.name}
                  className="h-8 w-8 rounded-full mr-2"
                />
                <div>
                  <p className="font-medium">{p.user.name}</p>
                  {p.user.profession && (
                    <p className="text-sm text-gray-500">{p.user.profession}</p>
                  )}
                </div>
              </div>
              <p className="mt-2">{p.body}</p>
              <Link
                href={`/perceptions/${p.id}`}
                className="text-blue-600 hover:underline mt-2 block"
              >
                View Perception
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
