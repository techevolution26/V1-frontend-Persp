// components/Header.jsx
"use client";

import { useEffect, useState } from "react";
import { LightBulbIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

export default function Header() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  // State for search term
  const [searchTerm, setSearchTerm] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/search?query=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm("");
    }
  };
  // Fetching the logged-in user on mount
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
      .then((data) => setUser(data))
      .catch(() => setUser(null));
  }, []);

  return (
    <header className="flex items-center p-4 bg-white">
      <h1 className="flex items-center text-xl font-bold group mr-8">
        <span className="transition-all duration-300 group-hover:text-gray-700 mr-[-0.15rem]">Percepti</span>
        <LightBulbIcon className="h-6 w-6 text-amber-500 transition-all duration-500 group-hover:rotate-12 group-hover:text-yellow-500" />
        <span className="transition-all duration-300 group-hover:text-gray-700 ml-[-0.15rem]">n App</span>
      </h1>

      <div className="flex-1" />

      {/*Daily Quote Section*/}
      <div className="flex-1 flex justify-center">
        {/* ... Quotes will be rendered here ... */}
      </div>

      {/* {/*searchbar} */}
      <div className="flex items-center ml-8">
        <form onSubmit={handleSubmit} className="relative w-48">
          <div className="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none">
            <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search…"
            className="block w-full border rounded-full pl-8 py-1 px-2 text-sm focus:outline-none focus:ring focus:ring-indigo-300" /* Smaller padding and text */
          />
        </form>
      </div>
    </header>
  );
}
