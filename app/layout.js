//app/layout.js
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
import { AnimatePresence } from "framer-motion";
import useTopics from "./hooks/useTopics";

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const [showForm, setShowForm] = useState(false);
  const [showTopics, setShowTopics] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const { topics, loading } = useTopics(token);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      const currentY = window.scrollY;
      const diff = currentY - lastScrollY;

      if (!ticking && Math.abs(diff) > 10) {
        window.requestAnimationFrame(() => {
          setShowTopics(diff < 0); // show if scrolling up
          setLastScrollY(currentY);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-white">
        <aside className="w-16 fixed left-0 top-0 h-full bg-white border-r flex flex-col items-center py-4 space-y-6 z-50">
          <Sidebar onNewClick={() => setShowForm(true)} />
        </aside>

        <div className="pl-16 flex flex-col min-h-screen w-full">
          <header className="px-6 py-4 border-b bg-white z-30 sticky top-0">
            <Header />
          </header>

          <TopicsCarousel topics={topics} visible={showTopics && !loading} />

          <main className="flex-grow">{children}</main>
        </div>

        <AnimatePresence>
          {showForm && (
            <div
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
              onClick={() => setShowForm(false)}
            >
              <div
                className="bg-white rounded-lg p-6 w-full max-w-lg"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className="float-right text-gray-500"
                  onClick={() => setShowForm(false)}
                >
                  ✕
                </button>
                <h2 className="text-xl font-bold mb-4">New Perception</h2>
                <NewPerceptionForm
                  topics={topics}
                  onSuccess={() => setShowForm(false)}
                  token={token}
                />
              </div>
            </div>
          )}
        </AnimatePresence>

        {pathname === "/login" && <LoginModal />}
        {pathname === "/register" && <RegisterModal />}
      </body>
    </html>
  );
}
