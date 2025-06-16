"use client";

import { useEffect, useRef, useState, Fragment } from "react";

export default function ChatWindow({
  messagesPages,
  fetchNextPage,
  hasNextPage,
  isLoading,
  children,
}) {
  const endRef = useRef(null);
  const params = new URLSearchParams(window.location.search);
  const peerId = params.get("peer");
  const [peer, setPeer] = useState(null);
  // fetching peer metadata
  useEffect(() => {
    if (!peerId) return;
    fetch(`/api/users/${peerId}`, {
      headers: { Accept: "application/json" },
    })
      .then((r) => r.json())
      .then(setPeer)
      .catch(console.error);
  }, [peerId]);

  // auto‑scroll on new messages
  useEffect(() => {
    if (endRef.current) endRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messagesPages]);

  if (isLoading) return <p className="p-4">Loading messages…</p>;

  return (
    <div className="flex-1 flex flex-col h-full min-h-0">
      {/* Header (sticky) */}
      <div className="flex items-center px-4 py-2 border-b bg-white sticky top-0 z-10">
        {peer ? (
          <>
            <img
              src={peer.avatar_url || "/default-avatar.png"}
              alt={peer.name}
              className="h-8 w-8 rounded-full mr-2"
            />
            <h2 className="font-medium">{peer.name}</h2>
          </>
        ) : (
          <h2 className="text-gray-500">Loading…</h2>
        )}
      </div>
      {/* Message list */}
      <div
        className="flex-1 overflow-auto px-4 py-2 flex flex-col space-y-2 min-h-0"
        onScroll={({ currentTarget }) => {
          if (
            hasNextPage &&
            currentTarget.scrollTop === 0
          ) {
            fetchNextPage();
          }
        }}
      >
        {messagesPages?.pages.map((page, i) => (
          <Fragment key={i}>
            {Array.isArray(page.data) && page.data.map((msg) => (
              <div
                key={msg.id}
                className={`max-w-xs p-2 rounded break-words ${msg.sending
                  ? "opacity-50 italic"
                  : msg.from_user_id === peer?.id
                    ? "bg-gray-100 self-start"
                    : "bg-indigo-100 self-end"
                  }`}
              >
                {msg.body}
              </div>
            ))}
          </Fragment>
        ))}
        <div ref={endRef} />
      </div>
      {/* Input at the bottom (sticky) */}
      <div className="border-t p-4 bg-white sticky bottom-0 z-10">{children}</div>
    </div>
  );
}
