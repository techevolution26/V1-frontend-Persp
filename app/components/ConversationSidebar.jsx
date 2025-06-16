// app/components/ConversationSidebar.jsx
"use client";
import { useState, useEffect } from "react";
import Image from "next/image";

export default function ConversationSidebar({
  conversations,
  selectedPeer,
  onSelect,
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // Debounce / query
  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }
    setLoading(true);
    const id = setTimeout(async () => {
      const res = await fetch(`/api/search-users?q=${encodeURIComponent(query)}`);
      if (res.ok) setResults(await res.json());
      setLoading(false);
    }, 300);
    return () => clearTimeout(id);
  }, [query]);

  return (
    <aside className="w-80 border-r p-4 flex flex-col h-full overflow-auto">
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search users…"
        className="mb-3 w-full border rounded px-2 py-1"
        aria-label="Search users"
      />

      {loading && <p className="text-sm text-gray-500">Searching…</p>}
      {results.length > 0 && (
        <ul className="space-y-1 mb-4">
          {results.map((u) => (
            <li key={u.id}>
              <button
                onClick={() => onSelect(u.id)}
                className="flex items-center gap-2 w-full text-left p-1 hover:bg-gray-100 rounded"
              >
                <Image
                  src={u.avatar_url || "/default-avatar.png"}
                  width={24}
                  height={24}
                  className="rounded-full"
                  alt={u.name}
                  style={{ height: "auto" }}
                />
                <div>
                  <div className="font-medium">{u.name}</div>
                  {u.profession && (
                    <div className="text-xs text-gray-500">{u.profession}</div>
                  )}
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}

      <h2 className="text-lg font-semibold mb-2">Conversations</h2>

      <ul className="flex-1 overflow-auto space-y-1">
        {conversations.map((u) => (
          <li key={u.id}>
            <button
              onClick={() => onSelect(u.id)}
              className={`flex items-center gap-2 p-2 rounded w-full text-left ${u.id === selectedPeer ? "bg-indigo-100" : "hover:bg-gray-100"
                }`}
            >
              <Image
                src={u.avatar_url || "/default-avatar.png"}
                width={32}
                height={32}
                className="rounded-full"
                alt={u.name}
                style={{ height: "auto" }}
              />
              <div className="flex-1">
                <div className="font-medium">{u.name}</div>
                {u.unread > 0 && (
                  <span className="text-xs bg-red-500 text-white rounded-full px-2">
                    {u.unread}
                  </span>
                )}
              </div>
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}
