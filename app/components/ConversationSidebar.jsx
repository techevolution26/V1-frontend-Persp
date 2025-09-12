"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { XMarkIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";

export default function ConversationSidebar({
  conversations,
  selectedPeer,
  onSelect,
  className = "",
  isOpen = false,
  onClose = () => { },
  onOpen = () => { }, // parent can provide open handler
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const inputRef = useRef(null);

  // Debounce search
  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }
    setLoading(true);
    const id = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search-users?q=${encodeURIComponent(query)}`);
        if (res.ok) setResults(await res.json());
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(id);
  }, [query]);

  // Focus search input when overlay opens
  useEffect(() => {
    if (isOpen) {
      const t = setTimeout(() => inputRef.current?.focus(), 80);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  // Track focus of inputs/textarea globally so floating open button can hide when keyboard is up
  useEffect(() => {
    const onFocusIn = (e) => {
      const tag = e.target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || e.target?.isContentEditable) {
        setInputFocused(true);
      }
    };
    const onFocusOut = () => {
      // small delay because mobile keyboards sometimes blur briefly
      setTimeout(() => setInputFocused(false), 120);
    };
    window.addEventListener("focusin", onFocusIn);
    window.addEventListener("focusout", onFocusOut);
    return () => {
      window.removeEventListener("focusin", onFocusIn);
      window.removeEventListener("focusout", onFocusOut);
    };
  }, []);

  const base = (
    <div className={`w-80 bg-white flex flex-col h-full overflow-hidden ${className}`}>
      <div className="p-4 border-b border-gray-200 flex items-center gap-3">
        <h1 className="text-xl font-bold text-indigo-600 flex-1">Messages</h1>

        <button
          onClick={onClose}
          aria-label="Close sidebar"
          className="ml-2 p-1 rounded-md hover:bg-gray-100 lg:hidden inline-flex"
        >
          <XMarkIcon className="h-5 w-5 text-gray-600" />
        </button>
      </div>

      <div className="p-4 border-b">
        <div className="relative">
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search users…"
            className="w-full bg-gray-100 rounded-lg px-4 py-2.5 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            aria-label="Search users"
            aria-expanded={Boolean(query || results.length)}
          />
          {query && (
            <button
              onClick={() => {
                setQuery("");
                setResults([]);
                inputRef.current?.focus();
              }}
              aria-label="Clear search"
              className="absolute right-2 top-2.5 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          )}
          <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
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
    </div>
  );

  // Overlay when open on small screens
  if (isOpen) {
    return (
      <div className="lg:hidden fixed inset-0 z-40">
        <div className="absolute inset-0 bg-black/40" onClick={onClose} />
        <div className="absolute left-0 top-0 bottom-0 w-[84%] max-w-xs shadow-xl bg-white">
          {base}
        </div>
      </div>
    );
  }

  // When closed on small screens, show a floating button to open the sidebar (visible below lg)
  // Hide that floating button if:
  //  - a conversation is already selected (selectedPeer)
  //  - an input is focused (keyboard up)
  const showOpenButton = !selectedPeer && !inputFocused;

  return (
    <>
      {showOpenButton && (
        <button
          aria-label="Open conversations"
          onClick={onOpen}
          className="lg:hidden fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-40
                     bg-white/95 shadow-lg rounded-full p-3 border border-gray-200 flex items-center justify-center
                     focus:outline-none focus:ring-2 focus:ring-indigo-300"
          title="Open messages"
        >
          <MagnifyingGlassIcon className="h-6 w-6 text-gray-700" />
        </button>
      )}

      <aside className="hidden lg:flex lg:flex-col">{base}</aside>
    </>
  );
}
