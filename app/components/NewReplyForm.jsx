// components/NewReplyForm.jsx

"use client";
import { useState } from "react";

export default function NewReplyForm({ parentId, perceptionId, onAdd }) {
  const [body, setBody] = useState("");
  const [mediaFile, setMedia] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const form = new FormData();
    form.append("body", body);
    if (mediaFile) form.append("media", mediaFile);

    const res = await fetch(`/api/comments/${parentId}/replies`, {
      method: "POST",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      body: form,
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      alert(data.message || "Failed to reply");
    } else {
      onAdd(data);
      setBody("");
      setMedia(null);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2 bg-gray-50 p-3 rounded">
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Write your reply…"
        required
        className="w-full border p-2 rounded"
      />
      <input
        type="file"
        accept="image/*,video/*"
        onChange={(e) => setMedia(e.target.files[0])}
      />
      <button
        type="submit"
        disabled={loading}
        className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
      >
        {loading ? "Replying…" : "Reply"}
      </button>
    </form>
  );
}
