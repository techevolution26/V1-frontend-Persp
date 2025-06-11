// app/topics/page.jsx
"use client";

import { useEffect, useState } from "react";
import useCurrentUser from "../hooks/useCurrentUser"; // your hook
import { Spinner } from "../components/Spinner";

export default function TopicsPage() {
  const { user: me, loading: meLoading } = useCurrentUser();
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all topics +, if logged in, which ones the user follows
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        // fetch all topics
        const topicsRes = await fetch("/api/topics", {
          headers: { Accept: "application/json" },
        });
        if (!topicsRes.ok) {
          const err = await topicsRes.json();
          throw new Error(err.message || `${topicsRes.status}`);
        }
        const topicsData = await topicsRes.json();

        let followedIds = [];
        //if user is logged in, fetch the topics they follow
        if (me) {
          const folRes = await fetch(`/api/users/${me.id}/topics`, {
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });
          if (folRes.ok) {
            const fol = await folRes.json();
            // assume this returns an array of topic objects
            followedIds = fol.map((t) => t.id);
          }
        }

        if (!cancelled) {
          // merge into state
          setTopics(
            topicsData.map((t) => ({
              ...t,
              followed: followedIds.includes(t.id),
            }))
          );
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [me]);

  async function handleToggleFollow(id, currentlyFollowed) {
    const method = currentlyFollowed ? "DELETE" : "POST";
    const res = await fetch(`/api/topics/${id}/follow`, {
      method,
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        Accept: "application/json",
      },
    });
    if (!res.ok) {
      alert("Failed to update follow status");
      return;
    }
    setTopics((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, followed: !currentlyFollowed } : t
      )
    );
  }

  if (loading || meLoading) {
    return (
      <div className="p-4 max-w-3xl mx-auto">
        <Spinner />
        <p className="mt-2 text-gray-600">Loading topics…</p>
      </div>
    );
  }
  if (error) {
    return (
      <p className="text-red-500 p-4 max-w-3xl mx-auto">{error}</p>
    );
  }

  return (
    <main className="p-4 max-w-3xl mx-auto space-y-3">
      <h1 className="text-2xl font-bold mb-4">Choose Topics to Follow</h1>
      <ul className="space-y-3">
        {topics.map((t) => (
          <li
            key={t.id}
            className="border p-4 rounded-md flex justify-between items-center"
          >
            <div className="flex items-center gap-3">
              {t.image_url ? (
                <img
                  src={t.image_url}
                  alt={t.name}
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-600">
                  {t.name[0]}
                </div>
              )}
              <div>
                <strong className="block">{t.name}</strong>
                <small className="text-gray-600">{t.description}</small>
              </div>
            </div>

            <button
              onClick={() => handleToggleFollow(t.id, t.followed)}
              className={`px-4 py-1.5 text-sm rounded-full shadow ${t.followed
                ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                : "bg-indigo-600 text-white hover:bg-indigo-700"
                }`}
            >
              {t.followed ? "Following" : "Follow"}
            </button>
          </li>
        ))}
      </ul>
    </main>
  );
}
