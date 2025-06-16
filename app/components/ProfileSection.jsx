// app/components/ProfileSection.jsx
"use client";

import { useRef, useState } from "react";
import { PencilIcon, XMarkIcon, CheckIcon, CalendarIcon, ChatBubbleLeftIcon } from "@heroicons/react/24/outline";
import useCurrentUser from "../hooks/useCurrentUser";
import FollowButton from "./FollowButton";
import Link from "next/link";

export default function ProfileSection({ user: initialUser }) {
    const inputFile = useRef();
    const { user: me, loading: meLoading } = useCurrentUser();
    const isOwnProfile = me?.id === initialUser.id;

    // Local editable copy of the profile
    const [user, setUser] = useState(initialUser);
    const [editing, setEditing] = useState(false);
    const [loading, setLoading] = useState(false);

    // Upload new avatar
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
            const updated = await res.json();
            if (!res.ok) throw new Error(updated.message || "Upload failed");
            setUser(updated);
        } catch (err) {
            alert("Upload failed: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    // Save bio/profession edits
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
            const updated = await res.json();
            if (!res.ok) throw new Error(updated.message || "Save failed");
            setUser(updated);
            setEditing(false);
        } catch (err) {
            alert("Save failed: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-[auto,1fr,auto] gap-6 items-start">
                {/* Avatar */}
                <div className="relative self-center md:self-start">
                    <div className="relative h-28 w-28">
                        <img
                            src={user.avatar_url || "/default-avatar.png"}
                            alt="avatar"
                            className="h-full w-full rounded-full object-cover border-4 border-white shadow-md"
                        />
                        {loading && (
                            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-white/80">
                                <div className="animate-spin h-6 w-6 border-b-2 border-indigo-600 rounded-full"></div>
                            </div>
                        )}
                        {isOwnProfile && !editing && (
                            <button
                                type="button"
                                onClick={() => inputFile.current.click()}
                                className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-indigo-700"
                            >
                                <PencilIcon className="h-4 w-4" />
                            </button>
                        )}
                        <input
                            ref={inputFile}
                            type="file"
                            name="avatar"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    // Optimistic preview
                                    setUser((u) => ({ ...u, avatar_url: URL.createObjectURL(file) }));
                                    uploadAvatar(file);
                                }
                            }}
                            disabled={loading}
                        />
                    </div>
                </div>

                {/* Profile Info */}
                <form onSubmit={handleSave} className="space-y-4">
                    {editing ? (
                        <>
                            <div className="space-y-4">
                                <div className="relative">
                                    <input
                                        type="text"
                                        name="profession"
                                        defaultValue={user.profession}
                                        placeholder=" "
                                        className="peer block w-full px-4 py-3 border rounded-xl"
                                        disabled={loading}
                                    />
                                    <label className="absolute left-4 top-2 px-1 text-xs text-gray-500 bg-white transition-all
                                    peer-placeholder-shown:top-3 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-sm
                                    peer-focus:top-2 peer-focus:text-indigo-600 peer-focus:text-xs">
                                        Username / Profession
                                    </label>
                                </div>

                                <div className="relative">
                                    <textarea
                                        name="bio"
                                        defaultValue={user.bio}
                                        placeholder=" "
                                        rows={4}
                                        className="peer block w-full px-4 py-3 border rounded-xl"
                                        disabled={loading}
                                    />
                                    <label className="absolute left-4 top-2 px-1 text-xs text-gray-500 bg-white transition-all
                                    peer-placeholder-shown:top-3 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-sm
                                    peer-focus:top-2 peer-focus:text-indigo-600 peer-focus:text-xs">
                                        Your bio
                                    </label>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex items-center gap-2 bg-blue-500 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-700 disabled:opacity-60"
                                >
                                    <CheckIcon className="h-5 w-5" />
                                    {loading ? "Saving..." : "Save Changes"}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setEditing(false)}
                                    className="flex items-center gap-2 text-gray-600 px-4 py-2.5 rounded-xl border hover:bg-red-100"
                                    disabled={loading}
                                >
                                    <XMarkIcon className="h-5 w-5" />
                                    Cancel
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="flex items-center gap-2 flex-wrap">
                                <h1 className="text-2xl font-bold text-gray-800">{user.name}</h1>
                                {!isOwnProfile && <FollowButton profileUserId={user.id} />}
                                {!isOwnProfile && (
                                    <button
                                        onClick={() => router.push(`/messages/${initialUser.id}`)}
                                        className="ml-2 flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 rounded-full hover:bg-green-100"
                                    >
                                        <ChatBubbleLeftIcon className="h-4 w-4" />
                                        Message
                                    </button>
                                )}
                            </div>
                            {user.profession && (
                                <p className="text-indigo-600 italic">{user.profession}</p>
                            )}
                            {user.bio && (
                                <p className="text-gray-800 whitespace-pre-line line-clamp-6">
                                    {user.bio}
                                </p>
                            )}
                            {isOwnProfile && (
                                <button
                                    onClick={() => setEditing(true)}
                                    className="mt-3 inline-flex items-center gap-1.5 text-blue-600 hover:text-indigo-800 px-3 py-1.5 rounded-lg"
                                >
                                    <PencilIcon className="h-4 w-4" />
                                    Edit Profile
                                </button>
                            )}
                        </>
                    )}
                </form>

                {/* Stats */}
                <div className="md:self-center space-y-4 w-full md:w-auto">
                    <div className="flex items-center text-sm text-gray-700">
                        <CalendarIcon className="h-4 w-4 mr-1.5" />
                        <span>Joined {new Date(user.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Link
                            href={`/users/${user.id}`}
                            className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-sm"
                        >
                            {user.perceptions_count} Perceptions
                        </Link>
                        <Link
                            href={`/users/${user.id}/followers`}
                            className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded-full text-sm"
                        >
                            {user.followers_count} Followers
                        </Link>
                        <Link
                            href={`/users/${user.id}/following`}
                            className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm"
                        >
                            {user.following_count} Following
                        </Link>
                        <Link
                            href={`/topics`}
                            className="px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-sm"
                        >
                            {user.topics_count}Topics
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
