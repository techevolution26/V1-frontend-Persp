// components/ProfileEditor.jsx
"use client";
import { useState, useRef, useEffect } from "react";

export default function ProfileEditor({ initialUser }) {
  const inputFile = useRef();
  const [user, setUser] = useState(initialUser);
  const [editing, setEditing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [loading, setLoading] = useState(false);

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

  // Determine ownership
  const isOwnProfile = currentUserId === initialUser.id;

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Build FormData (this form includes avatar, profession, bio)
    const form = new FormData(e.target);
    if (inputFile.current.files[0]) {
      form.append("avatar", inputFile.current.files[0]);
    }

    const token = localStorage.getItem("token");
    const res = await fetch("/api/user/profile", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });
    const updated = await res.json();
    setUser(updated);
    setEditing(false);
    setLoading(false);
  };

  return (
    <section className="border p-6 rounded-lg flex space-x-6">
      <form onSubmit={handleSave} className="flex-1 space-y-4">
        <div className="relative">
          <img
            src={
              user.avatar_url ||
              "/default-avatar.png" ||
              "https://via.placeholder.com/100"
            }
            alt="avatar"
            className="h-24 w-24 rounded-full object-cover"
          />

          {/* only show edit-icon if they own the profile */}
          {isOwnProfile && !editing && (
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
              setUser((u) => ({ ...u, avatar_url: URL.createObjectURL(file) }));
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
              <p className="text-gray-700-italic italic">{user.profession}</p>
            )}
            {user.bio && (
              <p className="mt-2 text-gray-600-italic ">{user.bio}</p>
            )}

            {/* only the owner can enter edit mode */}
            {isOwnProfile && (
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
