// app/components/NotificationsPanel.jsx
"use client";

import { useContext, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import useCurrentUser from "../hooks/useCurrentUser";
import { EchoContext } from "../contexts/EchoContext";
import { Spinner } from "./Spinner";
import { TrashIcon, BookmarkIcon } from "@heroicons/react/24/outline";

export default function NotificationsPanel() {
  const echo = useContext(EchoContext);
  const { user: me, loading: meLoading } = useCurrentUser();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newIds, setNewIds] = useState([]);          // track newly arrived
  const [menuOpenFor, setMenuOpenFor] = useState(null);

  //Fetch existing notifications
  useEffect(() => {
    if (meLoading || !me) return;
    setLoading(true);
    fetch("/api/notifications", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((r) => r.json())
      .then((payload) => setNotes(payload.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [me, meLoading]);

  //Subscribe for real‑time and flag new IDs
  useEffect(() => {
    if (!echo || !me) return;
    const channel = echo.private(`App.Models.User.${me.id}`);
    channel.notification((notification) => {
      setNotes((prev) => [notification, ...prev]);

      // mark as “new” for a moment
      setNewIds((ids) => [notification.id, ...ids]);
      setTimeout(() => {
        setNewIds((ids) => ids.filter((i) => i !== notification.id));
      }, 2000);
    });
    return () => {
      echo.leaveChannel(`private-App.Models.User.${me.id}`);
    };
  }, [echo, me]);

  // Mark all as read
  const markAllRead = async () => {
    await fetch("/api/notifications/read-all", {
      method: "POST",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    setNotes((prev) =>
      prev.map((n) => ({ ...n, read_at: new Date().toISOString() }))
    );
  };

  // Delete single notification
  const deleteOne = useCallback(async (id) => {
    await fetch(`/api/notifications/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    setNotes((prev) => prev.filter((n) => n.id !== id));
  }, []);

  //“Save” action placeholder
  const saveOne = useCallback((id) => {
    alert(`Saved notification ${id}!`);
    setMenuOpenFor(null);
  }, []);

  if (meLoading || loading) return <Spinner />;

  return (
    <div className="space-y-2">
      <button
        onClick={markAllRead}
        disabled={notes.length === 0}
        className="text-sm text-blue-500 underline mb-2 disabled:opacity-50"
      >
        Mark all as read
      </button>

      {notes.length === 0 ? (
        <p className="text-gray-500">No new notifications</p>
      ) : (
        <ul className="space-y-1 max-h-64 overflow-auto">
          {notes.map((n) => {
            const { id, read_at, data = {} } = n;
            const {
              type = "perception",
              topic = "General",
              body = "",
              perception_id,
            } = data;

            const isUnread = !read_at;
            const isNew = newIds.includes(id);

            // base style
            let base = `
              relative flex items-start gap-2 p-2 rounded
              ${type === "daily" ? "bg-yellow-50 border-yellow-200"
                : "bg-indigo-50 border-indigo-200"}
              ${isUnread ? "font-semibold" : "text-gray-700"}
            `;

            // if brand‑new & unread, override with red+shake
            if (isNew && isUnread) {
              base += " bg-red-100 border-red-300 animate-shake";
            }

            const icon = type === "daily" ? "☀️" : "🔥";

            return (
              <li key={id} className={base}>
                <span className="shrink-0">{icon}</span>
                <div className="flex-1">
                  {type === "perception" && perception_id ? (
                    <Link
                      href={`/perceptions/${perception_id}`}
                      className="hover:underline"
                    >
                      <strong>New in {topic}:</strong> {body}
                    </Link>
                  ) : (
                    <div>
                      <strong>Daily Motivation in {topic}:</strong>{" "}
                      <em>{body}</em>
                    </div>
                  )}
                </div>

                <button
                  onClick={() =>
                    setMenuOpenFor(menuOpenFor === id ? null : id)
                  }
                  className="p-1 hover:bg-gray-200 rounded-full"
                  title="Options"
                >
                  ⋮
                </button>

                {menuOpenFor === id && (
                  <div className="absolute right-2 top-8 w-32 bg-white border border-gray-200 rounded shadow-md z-10">
                    <button
                      onClick={() => {
                        deleteOne(id);
                        setMenuOpenFor(null);
                      }}
                      className="w-full flex items-center gap-1 px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      <TrashIcon className="h-4 w-4" /> Delete
                    </button>
                    <button
                      onClick={() => saveOne(id)}
                      className="w-full flex items-center gap-1 px-4 py-2 text-sm hover:bg-gray-100"
                    >
                      <BookmarkIcon className="h-4 w-4" /> Save
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
