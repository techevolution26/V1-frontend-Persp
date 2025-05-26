"use client";

import { useState } from "react";

export default function NewPerceptionForm({ topics, onSuccess }) {
  const [body, setBody] = useState("");
  const [topicId, setTopicId] = useState(topics[0]?.id || "");
  const [mediaPreview, setMediaPreview] = useState(null);
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaType, setMediaType] = useState(null); // "image" or "video"
  const [loading, setLoading] = useState(false);

  const handleMediaChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    //file type
    const type = file.type.startsWith("video/") ? "video" : "image";
    setMediaType(type);
    setMediaFile(file);

    // Creating preview URL
    setMediaPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!body || !topicId) return;

    setLoading(true);
    const form = new FormData();
    form.append("body", body);
    form.append("topic_id", topicId);
    if (mediaFile) form.append("media", mediaFile);

    const token = localStorage.getItem("token");
    const res = await fetch("/api/perceptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });

    if (!res.ok) {
      const text = await res.text();
      alert("Error: " + text);
      setLoading(false);
      return;
    }

    const data = await res.json();
    onSuccess(data);

    // reseting form
    setBody("");
    setMediaFile(null);
    setMediaPreview(null);
    setMediaType(null);
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 border p-4 rounded">
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="What's on your mind?"
        rows={3}
        className="w-full border p-2"
        required
      />

      <select
        value={topicId}
        onChange={(e) => setTopicId(e.target.value)}
        className="border p-2"
        required
      >
        {topics.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name}
          </option>
        ))}
      </select>

      {/* Preview */}
      {mediaPreview && mediaType === "image" && (
        <img
          src={mediaPreview}
          alt="preview"
          className="max-h-40 object-contain mb-2"
        />
      )}
      {mediaPreview && mediaType === "video" && (
        <video
          src={mediaPreview}
          controls
          className="max-h-40 object-contain mb-2"
        />
      )}

      <div className="flex items-center space-x-4">
        <label className="cursor-pointer text-gray-600 hover:text-gray-900">
          Attach media
          <input
            type="file"
            accept="image/*,video/*"
            className="hidden"
            onChange={handleMediaChange}
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {loading ? "Posting…" : "Post"}
        </button>
      </div>
    </form>
  );
}
