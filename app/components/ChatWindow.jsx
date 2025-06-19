// app/components/ChatWindow.jsx
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

  // Fetch peer metadata
  useEffect(() => {
    if (!peerId) return;
    fetch(`/api/users/${peerId}`, {
      headers: { Accept: "application/json" },
    })
      .then((r) => r.json())
      .then(setPeer)
      .catch(console.error);
  }, [peerId]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (endRef.current) endRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messagesPages]);

  if (isLoading) return (
    <div className="flex-1 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 bg-gradient-to-b from-white to-gray-50">
      {/* Chat header */}
      <div className="flex items-center px-6 py-4 border-b border-gray-200 bg-white sticky top-0 z-10 shadow-sm">
        {peer ? (
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={peer.avatar_url || "/default-avatar.png"}
                alt={peer.name}
                className="h-10 w-10 rounded-full object-cover border-2 border-white shadow"
              />
              <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white"></div>
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">{peer.name}</h2>
              <p className="text-xs text-gray-500">Online</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="bg-gray-200 border-2 border-dashed rounded-full w-10 h-10" />
            <div className="space-y-1">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="h-3 bg-gray-200 rounded w-16"></div>
            </div>
          </div>
        )}
      </div>

      {/* Message list */}
      <div
        className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 min-h-0"
        onScroll={({ currentTarget }) => {
          if (hasNextPage && currentTarget.scrollTop === 0) {
            fetchNextPage();
          }
        }}
      >
        {hasNextPage && (
          <div className="flex justify-center py-2">
            <button
              onClick={fetchNextPage}
              className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
            >
              Load older messages
            </button>
          </div>
        )}

        {messagesPages?.pages.map((page, i) => (
          <Fragment key={i}>
            {Array.isArray(page.data) && page.data.map((msg) => {
              const isMe = msg.from_user_id !== peer?.id;
              const timestamp = new Date(msg.created_at);

              return (
                <div
                  key={msg.id}
                  className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2 shadow-sm relative ${isMe
                        ? "bg-indigo-500 text-white rounded-br-none"
                        : "bg-gray-100 text-gray-800 rounded-bl-none"
                      } ${msg.sending ? "opacity-70" : ""}`}
                  >
                    <div className={`${msg.sending ? "italic" : ""}`}>
                      {msg.body}
                    </div>

                    {/* Timestamp */}
                    <div
                      className={`text-xs mt-1 ${isMe ? "text-indigo-100" : "text-gray-500"
                        }`}
                    >
                      {timestamp.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>

                    {/* Message status indicator */}
                    {isMe && (
                      <div className="absolute -bottom-3 right-0 text-xs text-gray-400">
                        {msg.sending ? "Sending..." : "Delivered"}
                      </div>
                    )}

                    {/* Tail indicator */}
                    <div
                      className={`absolute w-3 h-3 bottom-0 ${isMe
                          ? "-right-3 bg-indigo-500 [clip-path:polygon(0%_0%,100%_100%,0%_100%)]"
                          : "-left-3 bg-gray-100 [clip-path:polygon(100%_0%,0%_100%,100%_100%)]"
                        }`}
                    />
                  </div>
                </div>
              );
            })}
          </Fragment>
        ))}
        <div ref={endRef} className="h-8" />
      </div>

      {/* Input area */}
      <div className="border-t border-gray-200 bg-white px-4 py-3 sticky bottom-0 z-10">
        {children}
      </div>
    </div>
  );
}