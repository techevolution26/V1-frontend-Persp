//app/components/NewPerceptionForm.jsx

"use client";

import { useState } from "react";
import {
  SparklesIcon,
  PhotoIcon,
  VideoCameraIcon,
  XMarkIcon,
  ArrowUpTrayIcon,
} from "@heroicons/react/24/outline";

export default function NewPerceptionForm({ topics, onSuccess }) {
  const [body, setBody] = useState("");
  const [topicId, setTopicId] = useState(topics[0]?.id || "");
  const [mediaPreview, setMediaPreview] = useState(null);
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaType, setMediaType] = useState(null); // "image" or "video"
  const [loading, setLoading] = useState(false);

  const handleRemoveMedia = () => {
    setMediaFile(null);
    setMediaPreview(null);
    setMediaType(null);
  };

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
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4 bg-white rounded-xl shadow-lg max-h-[90vh] overflow-y-auto">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        <SparklesIcon className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" />
        Share Your Perception
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Body Input */}
        <div className="relative border rounded-lg hover:border-purple-200 transition-colors">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder=" "
            rows={4}
            className="w-full p-3 rounded-lg bg-gray-50 focus:ring-2 focus:ring-purple-500 peer text-sm sm:text-base"
          />
          <label className="absolute left-3 top-2.5 text-gray-400 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-3 peer-focus:-top-2.5 peer-focus:text-sm bg-white px-1">
            Express your Perspective...
          </label>
        </div>

        {/* Media Preview */}
        {mediaPreview && (
          <div className="relative group">
            {mediaType === "image" ? (
              <img
                src={mediaPreview}
                alt="preview"
                className="rounded-lg w-full object-contain max-h-64 sm:max-h-80"
              />
            ) : (
              <video
                src={mediaPreview}
                controls
                className="rounded-lg w-full object-contain max-h-64 sm:max-h-80"
              />
            )}
            <button
              type="button"
              onClick={handleRemoveMedia}
              className="absolute -top-2 -right-2 p-1.5 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <XMarkIcon className="w-5 h-5 text-white" />
            </button>
          </div>
        )}

        {/* Topic Selection Grid */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-500">SELECT TOPIC</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {topics.map((topic) => (
              <button
                key={topic.id}
                type="button"
                onClick={() => setTopicId(topic.id)}
                className={`p-2 sm:p-2.5 rounded-lg border flex items-center justify-center text-sm sm:text-base transition-all
              ${
                topicId === topic.id
                  ? "border-purple-500 bg-purple-50 text-purple-700"
                  : "border-gray-200 hover:border-purple-300"
              }`}
              >
                {topic.name}
              </button>
            ))}
          </div>
        </div>

        {/* Media Upload & Submit */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t pt-4">
          <div className="flex gap-2">
            <label className="cursor-pointer p-2 hover:bg-gray-100 rounded-md transition-colors">
              <PhotoIcon className="w-5 h-5 text-gray-600" />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setMediaType("image");
                    setMediaFile(file);
                    setMediaPreview(URL.createObjectURL(file));
                  }
                }}
              />
            </label>
            <label className="cursor-pointer p-2 hover:bg-gray-100 rounded-md transition-colors">
              <VideoCameraIcon className="w-5 h-5 text-gray-600" />
              <input
                type="file"
                accept="video/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setMediaType("video");
                    setMediaFile(file);
                    setMediaPreview(URL.createObjectURL(file));
                  }
                }}
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg 
                 hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-sm sm:text-base"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Posting...
              </div>
            ) : (
              <>
                <ArrowUpTrayIcon className="w-5 h-5" />
                Post Perception
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
