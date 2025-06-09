// app/components/EditPerceptionModal.jsx
"use client";

import { useRef, useState, useEffect } from "react";

export default function EditPerceptionModal({ perception, onClose, onSave }) {
  const [body, setBody]         = useState(perception.body || "");
  const [media, setMedia]       = useState(null);
  const [preview, setPreview]   = useState(perception.media_url || null);
  const [topicId, setTopicId]   = useState(perception.topic.id);
  const [topics, setTopics]     = useState([]);
  const [loading, setLoading]   = useState(false);
  const fileRef                 = useRef(null);
  const token                   = typeof window !== "undefined"
    ? localStorage.getItem("token")
    : "";

  // fetch topics for the dropdown
  useEffect(() => {
    fetch("/api/topics", {
      headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then(setTopics)
      .catch(console.error);
  }, [token]);

  const handleSave = async () => {
    setLoading(true);

    const form = new FormData();
    form.append("body", body);
    form.append("topic_id", topicId);
    if (media) form.append("media", media);

    const res = await fetch(`/api/perceptions/${perception.id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: form,
    });

    if (!res.ok) {
      const err = await res.text();
      alert("Update failed: " + err);
      setLoading(false);
      return;
    }

    const updated = await res.json();
    onSave(updated);
    // setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-lg max-h-[90vh] overflow-auto relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-black"
          disabled={loading}
        >
          ✕
        </button>
        <h2 className="text-2xl font-semibold mb-4">Edit Perception</h2>

        <div className="space-y-4">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={4}
            className="w-full border rounded-lg p-2"
            disabled={loading}
          />

          <select
            value={topicId}
            onChange={(e) => setTopicId(e.target.value)}
            className="w-full border rounded-lg p-2"
            disabled={loading}
          >
            {topics.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>

          {preview && (
            <div className="mb-2">
              {/\.(mp4|webm|ogg)$/i.test(preview) ? (
                <video
                  src={preview}
                  controls
                  className="w-full rounded max-h-[300px]"
                />
              ) : (
                <img
                  src={preview}
                  alt="media preview"
                  className="w-full rounded max-h-[300px] object-contain"
                />
              )}
            </div>
          )}

          <div className="flex items-center gap-2">
            <input
              type="file"
              accept="image/*,video/*"
              className="hidden"
              ref={fileRef}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) {
                  setMedia(f);
                  setPreview(URL.createObjectURL(f));
                }
              }}
              disabled={loading}
            />
            <button
              onClick={() => fileRef.current.click()}
              className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded"
              disabled={loading}
            >
              Replace Media
            </button>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
