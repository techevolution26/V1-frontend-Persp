"use client";
import { useState } from "react";

export default function NewCommentForm({ perceptionId, onAdd }) {
  const [body, setBody] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/perceptions/${perceptionId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ body }),
      });
      const comment = await res.json();
      if (!res.ok) throw new Error(comment.message || "Failed to comment");
      onAdd(comment);
      setBody("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Write a comment…"
        required
        className="w-full border p-2"
      />
      {error && <p className="text-red-500">{error}</p>}
      <button
        disabled={loading}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        {loading ? "Posting…" : "Comment"}
      </button>
    </form>
  );
}
