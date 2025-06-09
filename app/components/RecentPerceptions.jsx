"use client";

import { useState, useEffect } from "react";
import PerceptionCard from "./PerceptionCard";
import EditPerceptionModal from "./EditPerceptionModal";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import useLikeToggle from "../hooks/useLikeToggle";
import { motion, AnimatePresence } from "framer-motion";

export default function RecentPerceptions({ userId }) {
  const [list, setList] = useState([]);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [page, setPage] = useState(1);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const toggleLike = useLikeToggle();
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/users/${userId}/perceptions`, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(`Status ${res.status}`);
        setList(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [userId, token]);

  const handleLikeUpdate = (id, liked, likes_count) => {
    setList((curr) =>
      curr.map((p) => (p.id === id ? { ...p, liked_by_user: liked, likes_count } : p))
    );
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const res = await fetch(`/api/perceptions/${deleteTarget.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      setList((curr) => curr.filter((p) => p.id !== deleteTarget.id));
    } else {
      alert("Failed to delete");
    }
    setDeleteTarget(null);
  };

  const itemsPerPage = 10;
  const visible = list.slice(0, page * itemsPerPage);
  const hasMore = visible.length < list.length;

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl h-48 bg-gray-100 animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return <p className="text-red-500 text-center py-6">Error: {error}</p>;
  }

  if (list.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 italic">
        No perceptions yet. Be the first to share!
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col items-center">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl w-full">
          <AnimatePresence>
            {visible.map((p) => (
              <motion.div
                key={p.id}
                layout
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="group relative"
              >
                <PerceptionCard
                  perception={p}
                  onLike={() =>
                    toggleLike(p, (id, liked, likes_count) =>
                      handleLikeUpdate(id, liked, likes_count)
                    )
                  }
                  onComment={() => (window.location.href = `/perceptions/${p.id}`)}
                  onEdit={() => setEditTarget(p)}
                  onDelete={() => setDeleteTarget(p)}
                  showOwnerActions={true}

                  className="border border-gray-100 hover:border-indigo-100 shadow-md hover:shadow-lg transition-all duration-300"
                />
                <div className="absolute inset-0 rounded-xl pointer-events-none bg-gradient-to-br from-white/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {hasMore && (
          <button
            onClick={() => setPage((p) => p + 1)}
            className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700"
          >
            Load More
          </button>
        )}
      </div>

      {editTarget && (
        <EditPerceptionModal
          perception={editTarget}
          onClose={() => setEditTarget(null)}
          onSave={(updated) => {
            setList((curr) => curr.map((x) => (x.id === updated.id ? updated : x)));
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
    </>
  );
}
