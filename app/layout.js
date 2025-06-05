"use client";
import "./globals.css";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import TopicsCarousel from "./components/TopicsCarousel";
import NewPerceptionForm from "./components/NewPerceptionForm";
import LoginModal from "./components/LoginModal";
import RegisterModal from "./components/RegisterModal";
import { motion, AnimatePresence } from "framer-motion";

export default function RootLayout({ children }) {
  const [showForm, setShowForm] = useState(false);
  const [topics, setTopics] = useState([]);
  const [showTopics, setShowTopics] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const pathname = usePathname();

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    fetch("/api/topics", {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    })
      .then((r) => {
        if (!r.ok) throw new Error(`Topics fetch failed: ${r.status}`);
        return r.json();
      })
      .then(setTopics)
      .catch(console.error);
  }, [token]);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const diff = currentScrollY - lastScrollY;

      if (!ticking && Math.abs(diff) > 10) {
        window.requestAnimationFrame(() => {
          setShowTopics(diff < 0); // scroll up
          lastScrollY = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNewClick = () => setShowForm(true);
  const handleFormClose = () => setShowForm(false);
  const handleFormSuccess = () => setShowForm(false);

  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-white">
        {/* Sidebar fixed if needed */}
        <aside className="w-16 fixed left-0 top-0 h-full bg-white border-r flex flex-col items-center py-4 space-y-6 z-50">
          <Sidebar onNewClick={handleNewClick} />
        </aside>

        <div className="pl-16 flex flex-col min-h-screen w-full">
          <header className="px-6 py-4 border-b bg-white z-30 sticky top-0">
            <Header />
          </header>

          {/* Animate with Framer Motion */}
          <TopicsCarousel topics={topics} visible={showTopics} />

          <main className="flex-grow">{children}</main>
        </div>

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

        {pathname === "/login" && <LoginModal />}
        {pathname === "/register" && <RegisterModal />}
      </body>
    </html>
  );
}
