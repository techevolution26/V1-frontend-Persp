"use client";
import { useEffect, useState } from "react";
import PerceptionCard from "./components/PerceptionCard";
import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const [topics, setTopics] = useState([]);
  const [perceptions, setPerceptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }

    async function load() {
      const t = await fetch("/api/topics", {
        headers: { Authorization: `Bearer ${token}` },
      }).then((r) => r.json());
      setTopics(t);

      const res2 = await fetch("/api/perceptions", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res2.status === 401) {
        router.push("/login");
        return;
      }

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
  }, [token, router]);

  if (loading)
    return <p className="text-center py-12 text-gray-500">Loading…</p>;

  const byTopic = topics
    .map((topic) => ({
      ...topic,
      items: perceptions.filter((p) => p.topic?.id === topic.id).slice(0, 3),
    }))
    .filter((group) => group.items.length > 0);

  const handleLike = async (p) => {
    const method = p.liked ? "DELETE" : "POST";
    const res = await fetch(`/api/perceptions/${p.id}/like`, {
      method,
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return;

    const { liked, likes_count } = await res.json();
    setPerceptions((list) =>
      list.map((x) => (x.id === p.id ? { ...x, liked, likes_count } : x))
    );
  };

  return (
    <main className="p-4 sm:p-6 space-y-12 max-w-7xl mx-auto">
      {byTopic.map((group) => (
        <section key={group.id}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              {group.name}
            </h2>
            {group.items.length >= 3 && (
              <Link href={`/topics/${group.id}`}>
                <button className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-full text-sm transition-all duration-200 shadow-md hover:scale-105">
                  See More
                  <ArrowRightIcon className="w-4 h-4" />
                </button>
              </Link>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {group.items.map((p) => (
              <div
                key={p.id}
                className="transition-transform transform hover:scale-[1.015]"
              >
                <PerceptionCard perception={p} onLike={() => handleLike(p)} />
              </div>
            ))}
          </div>
        </section>
      ))}

      {byTopic.length === 0 && (
        <p className="text-center text-gray-500 text-sm mt-12">
          No perceptions available yet. Check back soon!
        </p>
      )}
    </main>
  );
}
