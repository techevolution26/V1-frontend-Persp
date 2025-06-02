"use client";
import "./globals.css";
import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import TopicsCarousel from "./components/TopicsCarousel";
import NewPerceptionForm from "./components/NewPerceptionForm";

const metadata = {
  title: "Perception App",
  description: "Share and browse perceptions by topic",
};

export default function RootLayout({ children }) {
  const [showForm, setShowForm] = useState(false);
  const [topics, setTopics] = useState([]);
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // Fetching topics passing them into the form
 
useEffect(() => {
  fetch("/api/topics", {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
  })
    .then((r) => {
      if (!r.ok) throw new Error(`Topics fetch failed: ${r.status}`);
      return r.json();
    })
    .then((topicsArray) => {
      setTopics(topicsArray);
    })
    .catch(console.error);
}, [token]);

  const handleNewClick = () => setShowForm(true);
  const handleFormSuccess = (newPerception) => {
    setShowForm(false);
    // Optionally I can broadcast this newPerception via context or events
  };
  const handleFormClose = () => setShowForm(false);
  return (
    <html lang="en">
      <body className="flex h-screen overflow-hidden">
        {/* Sidebar on the left */}
        <aside className="w-16 bg-white border-r flex flex-col items-center py-4 space-y-6">
          <Sidebar onNewClick={handleNewClick} />
        </aside>

        {/* Main content area */}
        <div className="flex-1 flex flex-col overflow-auto">
          {/* Top header */}
          <header className="flex items-center justify-between px-6 py-4 border-b">
            <Header />
          </header>

          {/* Topics carousel */}
          <div className="px-6 py-4 border-b">
            <TopicsCarousel />
          </div>

          {/* Page-specific content */}
          <main className="flex-1 overflow-auto p-6 bg-gray-50">
            {children}
          </main>
        </div>
        {/* Modal Overlay for New perception form */}
        {showForm && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={handleFormClose}
          >
            <div
              className="bg-white rounded-lg p-6 w-full max-w-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="float-right text-gray-500"
                onClick={handleFormClose}
              >
                ✕
              </button>
              <h2 className="text-xl font-bold mb-4">New Perception</h2>
              <NewPerceptionForm
                topics={topics}
                onSuccess={handleFormSuccess}
                token={token}
              />
            </div>
          </div>
        )}
      </body>
    </html>
  );
}
