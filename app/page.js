// --- app/page.js ---

"use client";
import { useEffect, useState } from "react";
import PerceptionCard from "./components/PerceptionCard";
import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/24/outline";

export default function HomePage() {
  const [topics, setTopics] = useState([]);
  const [perceptions, setPerceptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    async function load() {
      // loading topics
      const t = await fetch("/api/topics", {
        headers: { Authorization: `Bearer ${token}` },
      }).then((r) => r.json());
      setTopics(t);

      // loading perceptions
      const res2 = await fetch("/api/perceptions", {
        headers: { Authorization: `Bearer ${token}` },
      });

      let perData = [];
      if (res2.ok) {
        const text = await res2.text();
        perData = text ? JSON.parse(text) : [];
      } else {
        console.error("Error fetching perceptions:", res2.status);
      }
      setPerceptions(perData);
      setLoading(false);
    }
    load();
  }, [token]);

  if (loading) return <p>Loading…</p>;

  // grouping by topic showing up to 3 each
  const byTopic = topics
    .map((topic) => ({
      ...topic,
      items: perceptions.filter((p) => p.topic?.id === topic.id).slice(0, 3), // Added optional chaining
    }))
    .filter((group) => group.items.length > 0);

  //

  const handleLike = async (id) => {
    await fetch(`/api/perceptions/${id}/like`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    setPerceptions(
      perceptions.map((p) =>
        p.id === id ? { ...p, likes_count: p.likes_count + 1 } : p
      )
    );
  };

  return (
    <main className="p-6 space-y-12">
      {/* <TopicsCarousel /> */}

      {byTopic.map((group) => (
        <section key={group.id}>
          <h2 className="text-xl font-semibold mb-4">{group.name}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {group.items.map((p) => (
              <PerceptionCard
                key={p.id}
                perception={p}
                onLike={async (id) => {
                  await fetch(`/api/perceptions/${id}/like`, {
                    method: "POST",
                    headers: { Authorization: `Bearer ${token}` },
                  });
                  setPerceptions(
                    perceptions.map((x) =>
                      x.id === id ? { ...x, likes_count: x.likes_count + 1 } : x
                    )
                  );
                }}
              />
            ))}

            {group.items.length >= 3 && (
              <div className="">
                <Link href={`/topics/${group.id}`} passHref>
                  <button className="flex items-center justify-center w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-all duration-200 hover:scale-110">
                    <ArrowRightIcon className="w-6 h-6" />
                  </button>
                </Link>
              </div>
            )}
          </div>
        </section>
      ))}
    </main>
  );
}
