// app/components/ConversationSidebar.jsx
"use client";
import { useState, useEffect } from "react";
import Image from "next/image";

export default function ConversationSidebar({
  conversations,
  selectedPeer,
  onSelect,
  className = "",
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
    <aside className={`w-80 bg-white flex flex-col h-full overflow-hidden ${className}`}>
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-xl font-bold text-indigo-600 mb-4">Messages</h1>
        <div className="relative">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search users…"
            className="w-full bg-gray-100 rounded-lg px-4 py-2.5 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            aria-label="Search users"
          />
          <svg
            className="absolute left-3 top-2.5 h-4 w-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Search results */}
        {loading && (
          <div className="p-4 text-center">
            <p className="text-sm text-gray-500 animate-pulse">Searching users...</p>
          </div>
        )}

        {results.length > 0 && (
          <div className="px-4 py-3 border-b border-gray-100">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Search Results</h3>
            <ul className="space-y-2">
              {results.map((u) => (
                <li key={u.id}>
                  <button
                    onClick={() => onSelect(u.id)}
                    className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  >
                    <div className="relative flex-shrink-0">
                      <Image
                        src={u.avatar_url || "/default-avatar.png"}
                        width={40}
                        height={40}
                        className="rounded-full object-cover border-2 border-white shadow-sm"
                        alt={u.name}
                      />
                    </div>
                    <div className="text-left overflow-hidden">
                      <div className="font-medium text-gray-900 truncate">{u.name}</div>
                      {u.profession && (
                        <div className="text-xs text-gray-500 truncate">{u.profession}</div>
                      )}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Conversations */}
        <div className="px-4 py-3">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Conversations</h3>
          <ul className="space-y-1">
            {conversations.map((u) => (
              <li key={u.id}>
                <button
                  onClick={() => onSelect(u.id)}
                  className={`flex items-center gap-3 w-full p-3 rounded-xl transition-all duration-200 ${u.id === selectedPeer
                      ? "bg-indigo-50 border border-indigo-100 shadow-sm"
                      : "hover:bg-gray-50"
                    }`}
                >
                  <div className="relative flex-shrink-0">
                    <Image
                      src={u.avatar_url || "/default-avatar.png"}
                      width={48}
                      height={48}
                      className="rounded-full object-cover border-2 border-white shadow"
                      alt={u.name}
                    />
                    {u.unread > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow">
                        {u.unread}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex justify-between items-baseline">
                      <div className="font-semibold text-gray-900 truncate">{u.name}</div>
                      {u.lastMessage && (
                        <span className="text-xs text-gray-400 whitespace-nowrap">
                          {new Date(u.lastMessage).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                    {u.lastMessagePreview && (
                      <div className="text-sm text-gray-500 truncate mt-0.5">{u.lastMessagePreview}</div>
                    )}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </aside>
  );
}
