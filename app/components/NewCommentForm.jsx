// components/NewCommentForm.jsx
"use client";
import { useState, useRef } from "react";

export default function NewCommentForm({ perceptionId, onAdd }) {
  const [body, setBody] = useState("");
  const [mediaFile, setMedia] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const form = new FormData();
    form.append("body", body);
    if (mediaFile) form.append("media", mediaFile);

    const res = await fetch(`/api/perceptions/${perceptionId}/comments`, {
      method: "POST",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      body: form,
    });

    const data = await res.json();
    if (!res.ok) {
      alert(data.message || "Failed");
    } else {
      onAdd(data);
      setBody("");
      setMedia(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
    setLoading(false);
  };

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setMedia(e.target.files[0]);
    }
  };

  return (
    <div className="bg-gradient-to-br from-white to-indigo-50 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] overflow-hidden border border-indigo-100 mb-6">
      <div className="p-1 bg-gradient-to-r from-yellow-400 to-purple-400"></div>

      <form onSubmit={handleSubmit} className="p-5">
        <div className="mb-4">
          <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1 ml-1">
            Share your Perception
          </label>
          <textarea
            id="comment"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="What's your insights or perspectives about it..."
            required
            className="w-full bg-white border border-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 focus:outline-none transition-all min-h-[120px] shadow-sm"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => fileInputRef.current.click()}
              className="flex items-center gap-2 text-sm bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {mediaFile ? mediaFile.name : "Add media"}
            </button>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*,video/*"
              onChange={handleFileChange}
              className="hidden"
            />

            {mediaFile && (
              <button
                type="button"
                onClick={() => {
                  setMedia(null);
                  fileInputRef.current.value = "";
                }}
                className="ml-2 text-red-500 hover:text-red-700 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-yellow-500 hover:from-indigo-600 hover:to-purple-600 text-white text-sm font-medium rounded-xl px-4 py-2 transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed min-w-[120px]"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Posting...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Share Perception
              </>
            )}
          </button>
        </div>

        {mediaFile && (
          <div className="mt-4 p-3 bg-indigo-50 rounded-xl border border-indigo-100">
            <p className="text-sm font-medium text-indigo-700 flex items-center gap-2 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
              Media ready: {mediaFile.name}
            </p>
          </div>
        )}
      </form>
    </div>
  );
}