// components/ProfileEditor.jsx

"use client";
import { useState, useRef, useEffect } from "react";

export default function ProfileEditor({ initialUser }) {
  const inputFile = useRef();
  const [user, setUser] = useState(initialUser);
  const [editing, setEditing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [loading, setLoading] = useState(false);

  //  uploadAvatar helper
  const uploadAvatar = async (file) => {
    setLoading(true);
    const form = new FormData();
    form.append("avatar", file);

    try {
      const res = await fetch("/api/user/profile", {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: form,
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Upload failed: ${res.status}`);
      }
      const updated = await res.json();
      setUser(updated);
    } catch (err) {
      console.error("Avatar upload error:", err);
      alert("Upload failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetching currently logged-in user’s ID
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch("/api/user", {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((me) => setCurrentUserId(me.id))
      .catch(() => setCurrentUserId(null));
  }, []);

  // Determining ownership
  const isOwnProfile = currentUserId === initialUser.id;

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);

    const form = new FormData(e.target);

    try {
      const res = await fetch("/api/user/profile", {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: form,
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Save failed: ${res.status}`);
      }
      const updated = await res.json();
      setUser(updated);
      setEditing(false);
    } catch (err) {
      console.error("Profile save error:", err);
      alert("Save failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="border p-6 rounded-lg flex space-x-6">
      <form onSubmit={handleSave} className="flex-1 space-y-4">
        <div className="relative">
          <img
            src={user.avatar_url || "/default-avatar.png"}
            alt="avatar"
            className="h-24 w-24 rounded-full object-cover"
          />

          {/* Loading overlay */}
          {loading && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-full">
              <span className="text-gray-700">Uploading…</span>
            </div>
          )}

          {/* only show edit-icon if they own  profile */}
          {isOwnProfile && !editing && !loading && (
            <button
              type="button"
              onClick={() => inputFile.current.click()}
              className="absolute bottom-0 right-0 bg-white p-1 rounded-full"
            >
              ✎
            </button>
          )}
        </div>

        {/* hidden file input included in the form */}
        <input
          type="file"
          name="avatar"
          accept="image/*"
          className="hidden"
          ref={inputFile}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              // preview immediately
              setUser((u) => ({ ...u, avatar_url: URL.createObjectURL(file) }));

              // auto-uploading
              uploadAvatar(file);
            }
          }}
        />

        {editing ? (
          <>
            <input
              type="text"
              name="profession"
              defaultValue={user.profession}
              placeholder="User-name or Profession"
              className="w-full border p-2"
            />

            <textarea
              name="bio"
              defaultValue={user.bio}
              placeholder="Bio"
              rows={3}
              className="w-full border p-2"
            />

            <div className="flex space-x-2">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                {loading ? "Saving…" : "Save Profile"}
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="text-gray-600 px-4 py-2"
              >
                Cancel
              </button>
            </div>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-bold">{user.name}</h1>
            {user.profession && (
              <p className="italic text-gray-700">{user.profession}</p>
            )}
            {user.bio && <p className="mt-2 text-gray-600">{user.bio}</p>}

            {/* only the owner can enter edit mode */}
            {isOwnProfile && !loading && (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="mt-4 text-blue-600"
              >
                Edit Profile
              </button>
            )}
          </>
        )}
      </form>
    </section>
  );
}
