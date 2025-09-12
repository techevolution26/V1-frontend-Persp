//app/page.js
"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import PerceptionCard from "./components/PerceptionCard";
import EditPerceptionModal from "./components/EditPerceptionModal";
import ConfirmDeleteModal from "./components/ConfirmDeleteModal";
import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-xl border border-gray-200 p-4 bg-white shadow-sm space-y-4">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 bg-gray-200 rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-1/2 bg-gray-200 rounded" />
          <div className="h-2 w-1/3 bg-gray-200 rounded" />
        </div>
      </div>
      <div className="h-3 w-full bg-gray-200 rounded" />
      <div className="h-3 w-5/6 bg-gray-200 rounded" />
      <div className="h-32 w-full bg-gray-100 rounded" />
      <div className="flex space-x-4 mt-3">
        <div className="h-4 w-10 bg-gray-200 rounded" />
        <div className="h-4 w-10 bg-gray-200 rounded" />
      </div>
    </div>
  );
}

export default function HomePage() {
  const router = useRouter();
  const [topics, setTopics] = useState([]);
  const [perceptions, setPerceptions] = useState([]);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
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

  const handleEdit = (perception) => {
    setEditTarget(perception);
  };

  const handleDelete = (perception) => {
    setDeleteTarget(perception);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const res = await fetch(`/api/perceptions/${deleteTarget.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      setPerceptions((curr) => curr.filter((p) => p.id !== deleteTarget.id));
    } else {
      alert("Failed to delete perception.");
    }
    setDeleteTarget(null);
  };

  if (loading) {
    return (
      <main className="p-4 sm:p-6 space-y-12 max-w-7xl mx-auto">
        {Array.from({ length: 2 }).map((_, idx) => (
          <section key={idx}>
            <div className="h-5 w-1/3 bg-gray-300 rounded mb-6 animate-pulse" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          </section>
        ))}
      </main>
    );
  }

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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-0 sm:px-0 md:px-0 lg:px-0">
            {group.items.map((p) => (
              <div
                key={p.id}
                className="transition-transform transform hover:scale-[1.015]"
              >
                <PerceptionCard
                  perception={p}
                  onLike={() => handleLike(p)}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
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

      {editTarget && (
        <EditPerceptionModal
          perception={editTarget}
          onClose={() => setEditTarget(null)}
          onSave={(updated) => {
            setPerceptions((curr) =>
              curr.map((x) => (x.id === updated.id ? updated : x))
            );
            setEditTarget(null);
          }}
        />
      )}

      {deleteTarget && (
        <ConfirmDeleteModal
          onCancel={() => setDeleteTarget(null)}
          onConfirm={confirmDelete}
        />
      )}
    </main>
  );
}
