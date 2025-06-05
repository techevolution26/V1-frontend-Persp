"use client";

import { useEffect, useState } from "react";
import { LightBulbIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

export default function Header() {
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch("/api/user", {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Not authenticated");
        return res.json();
      })
      .then(setUser)
      .catch(() => setUser(null));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setLoading(true);
    router.push(`/search?query=${encodeURIComponent(searchTerm.trim())}`);
    setSearchTerm("");
    setTimeout(() => setLoading(false), 1000);
  };

  if (!mounted) return null;

  return (
    <header className="flex items-center justify-between px-6 py-3 bg-gradient-to-b from-white to-gray-100 
                     shadow-[inset_0_-1px_2px_rgba(0,0,0,0.05)] border-b border-gray-200 min-h-[4rem]">
      {/* Logo */}
      <div className="flex items-center text-xl font-bold group">
        <div className="px-3 py-1 rounded-full bg-white shadow-inner border border-gray-200 flex items-center">
          <span className="text-gray-800 group-hover:text-gray-600 transition-all">Percepti</span>
          <LightBulbIcon className="h-5 w-5 text-amber-500 group-hover:rotate-12 transition-all duration-300 -mx-0.5" />
          <span className="text-gray-800 group-hover:text-gray-600 transition-all">n App</span>
        </div>
      </div>

      {/* Search */}
      <div className="ml-6">
        <form onSubmit={handleSubmit} className="relative w-48">
          <div className="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none">
            {loading ? (
              <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
            )}
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={loading}
            placeholder={loading ? "Searching..." : "Search…"}
            className="block w-full rounded-full bg-white pl-8 py-1.5 px-3 text-sm text-gray-800
                       shadow-inner border border-gray-300 focus:outline-none focus:ring-2
                       focus:ring-indigo-300 disabled:opacity-60"
          />
        </form>
      </div>
    </header>
  );
}
