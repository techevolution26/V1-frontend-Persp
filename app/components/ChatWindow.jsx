// app/components/ChatWindow.jsx
"use client";
import { useEffect, useRef, useState, Fragment } from "react";
// import { MenuIcon } from "@heroicons/react/24/outline";

function formatDateHeader(date) {
  const d = new Date(date);
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}

export default function ChatWindow({
  peerId,
  messagesPages,
  fetchNextPage,
  hasNextPage,
  isLoading,
  onOpenSidebar,
  children,
}) {
  const endRef = useRef(null);
  const scrollRef = useRef(null);
  const [peer, setPeer] = useState(null);

  // Fetch peer metadata (client-only)
  useEffect(() => {
    if (!peerId) return;
    let canceled = false;
    fetch(`/api/users/${peerId}`, { headers: { Accept: "application/json" } })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (!canceled) setPeer(data); })
      .catch(() => { });
    return () => { canceled = true; };
  }, [peerId]);

  // Auto-scroll behaviour:
  // - if user is near bottom (within threshold), auto scroll to bottom on new messages
  // - when older messages are loaded (hasNextPage fetch), don't jump to bottom
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    // determine if user is near bottom before content change
    const distanceFromBottom = el.scrollHeight - (el.scrollTop + el.clientHeight);
    const nearBottom = distanceFromBottom < 200;

    // small timeout to let DOM mount
    setTimeout(() => {
      if (nearBottom) {
        endRef.current?.scrollIntoView({ behavior: "smooth" });
      }
      // otherwise do nothing (preserve user's scroll position)
    }, 40);
  }, [messagesPages]);

  if (isLoading) return (
    <div className="flex-1 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
    </div>
  );

  // Flatten messages for grouping by day
  const flat = [];
  (messagesPages?.pages || []).forEach((pg) => {
    if (Array.isArray(pg.data)) flat.push(...pg.data);
  });

  // group messages by date
  const groups = [];
  flat.forEach((m) => {
    const day = new Date(m.created_at).toDateString();
    const lastGroup = groups[groups.length - 1];
    if (!lastGroup || lastGroup.day !== day) {
      groups.push({ day, messages: [m] });
    } else {
      lastGroup.messages.push(m);
    }
  });

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 bg-gradient-to-b from-white to-gray-50">
      {/* Chat header */}
      <div className="flex items-center px-4 py-3 border-b border-gray-200 bg-white sticky top-0 z-10 shadow-sm">
        {/* sidebar toggle for small screens */}
        <button
          onClick={onOpenSidebar}
          className="mr-3 p-1 rounded-md hover:bg-gray-100 md:hidden"
          aria-label="Open conversations"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
          </svg>

          {/* <MenuIcon className="h-6 w-6 text-gray-700" /> */}
        </button>

        {peer ? (
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={peer.avatar_url || "/default-avatar.png"}
                alt={peer.name}
                className="h-10 w-10 rounded-full object-cover border-2 border-white shadow"
              />
              <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white" />
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
              <div className="h-4 bg-gray-200 rounded w-24" />
              <div className="h-3 bg-gray-200 rounded w-16" />
            </div>
          </div>
        )}
      </div>

      {/* Message list */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 min-h-0"
        onScroll={({ currentTarget }) => {
          if (hasNextPage && currentTarget.scrollTop < 40) {
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

        {groups.map((g) => (
          <Fragment key={g.day}>
            <div className="flex items-center justify-center">
              <div className="px-3 py-1 bg-gray-200 text-xs text-gray-700 rounded-full">
                {formatDateHeader(g.messages[0].created_at)}
              </div>
            </div>

            {g.messages.map((msg) => {
              const isMe = msg.from_user_id !== Number(peerId);
              const timestamp = new Date(msg.created_at);
              return (
                <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] sm:max-w-[70%] rounded-2xl px-4 py-2 shadow-sm relative break-words ${isMe
                      ? "bg-indigo-500 text-white rounded-br-none"
                      : "bg-gray-100 text-gray-800 rounded-bl-none"
                      } ${msg.sending ? "opacity-70 italic" : ""}`}
                  >
                    <div>{msg.body}</div>

                    <div className={`text-xs mt-1 ${isMe ? "text-indigo-100" : "text-gray-500"}`}>
                      {timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>

                    {isMe && (
                      <div className="absolute -bottom-3 right-0 text-xs text-gray-400">
                        {msg.sending ? "Sending..." : msg.delivered ? "Delivered" : ""}
                      </div>
                    )}

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

        <div ref={endRef} className="h-6" />
      </div>

      {/* Input area */}
      <div className="border-t border-gray-200 bg-white px-4 py-3 sticky bottom-0 z-10">
        {children}
      </div>
    </div>
  );
}
