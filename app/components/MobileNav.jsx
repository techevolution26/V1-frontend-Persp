"use client";

import { useEffect, useRef, useState } from "react";
import {
  PlusIcon,
  BellIcon,
  HomeIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";
import { useRouter, usePathname } from "next/navigation";
import useCurrentUser from "../hooks/useCurrentUser";

export default function MobileNav({
  onNewClick = () => {},
  onBellClick = () => {},
  forceVisible = false,
}) {
  const { user, loading } = useCurrentUser();
  const router = useRouter();
  const pathname = usePathname(); // <-- used to hide profile on messages
  const go = (path) => router.push(path);

  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(true);
  const [showHandle, setShowHandle] = useState(false);
  const lastY = useRef(0);
  const ticking = useRef(false);
  const hideTimer = useRef(null);

  useEffect(() => {
    setMounted(true);
    lastY.current = typeof window !== "undefined" ? window.scrollY || 0 : 0;

    const onFocusIn = (ev) => {
      const tag = ev.target && ev.target.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || ev.target?.isContentEditable) {
        setVisible(false);
        setShowHandle(true);
      }
    };
    const onFocusOut = () => setShowHandle(true);

    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      window.requestAnimationFrame(() => {
        const y = window.scrollY || 0;
        const diff = y - lastY.current;
        if (diff > 10) {
          if (!forceVisible) {
            setVisible(false);
            setShowHandle(true);
          }
        } else if (diff < -10) {
          setVisible(true);
          setShowHandle(false);
        }
        lastY.current = y;
        ticking.current = false;
      });
    };

    window.addEventListener("focusin", onFocusIn);
    window.addEventListener("focusout", onFocusOut);
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("focusin", onFocusIn);
      window.removeEventListener("focusout", onFocusOut);
      window.removeEventListener("scroll", onScroll);
      clearTimeout(hideTimer.current);
    };
  }, [forceVisible]);

  useEffect(() => {
    if (forceVisible) {
      setVisible(true);
      setShowHandle(false);
    }
  }, [forceVisible]);

  if (!mounted) return null;

  const flashVisible = (duration = 2500) => {
    if (forceVisible) return;
    if (!user) return;
    setVisible(true);
    setShowHandle(false);
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      setVisible(false);
      setShowHandle(true);
    }, duration);
  };

  const handleNew = (e) => {
    flashVisible(3000);
    if (user) onNewClick(e);
  };
  const handleBell = (e) => {
    flashVisible(2600);
    if (user) onBellClick(e);
  };

  const handleReveal = () => {
    setVisible(true);
    setShowHandle(false);
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      setVisible(false);
      setShowHandle(true);
    }, 4000);
  };

  // hide profile button when on messages route to avoid overlap/conflict
  const hideProfileOnMessages = pathname?.startsWith("/messages");

  return (
    <>
      {showHandle && !visible && (
        <button
          aria-label="Open navigation"
          onClick={handleReveal}
          className="lg:hidden fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40
                     w-10 h-10 rounded-full bg-white/95 shadow-sm border border-gray-200
                     flex items-center justify-center text-gray-700"
          style={{ backdropFilter: "saturate(1.2) blur(6px)" }}
        >
          <div className="w-3 h-3 rounded-full bg-gray-700" />
        </button>
      )}

      <nav
        aria-hidden={visible ? "false" : "true"}
        role="navigation"
        className={`lg:hidden fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50
                    bg-white/90 backdrop-blur-sm shadow-lg rounded-full px-3 py-2 flex items-center gap-3
                    border border-gray-200 transition-all duration-300 ease-out
                    ${visible ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-6 pointer-events-none"}`}
      >
        <button onClick={handleNew} className="p-2.5 rounded-full hover:bg-gray-100 transition touch-manipulation" title="New Perception" aria-label="Create New">
          <PlusIcon className="h-5 w-5 text-gray-700" />
        </button>

        <button onClick={handleBell} className="p-2 rounded-full hover:bg-gray-100 transition" title="Notifications" aria-label="Notifications">
          <BellIcon className="h-5 w-5 text-gray-700" />
        </button>

        <button onClick={() => go("/messages")} className="p-2 rounded-full hover:bg-gray-100 transition" title="Messages" aria-label="Messages">
          <ChatBubbleLeftRightIcon className="h-5 w-5 text-gray-700" />
        </button>

        <button onClick={() => go("/")} className="p-2 rounded-full hover:bg-gray-100 transition" title="Home" aria-label="Home">
          <HomeIcon className="h-5 w-5 text-gray-700" />
        </button>
      </nav>

      {/* Profile/Profile-CTA button: visible up to lg breakpoint unless on messages route */}
      {!hideProfileOnMessages && (
        <div className="lg:hidden fixed bottom-4 right-4 z-50">
          {loading ? (
            <div className="h-11 w-11 rounded-full bg-gray-200 animate-pulse shadow-md border border-gray-100" />
          ) : user ? (
            <button onClick={() => go(`/users/${user.id}`)} title="Profile" aria-label="Open profile" className="h-11 w-11 rounded-full overflow-hidden shadow-md border-2 border-white focus:outline-none focus:ring-2 focus:ring-indigo-300">
              <img src={user.avatar_url || "/default-avatar.png"} alt={user.name} className="h-full w-full object-cover" />
            </button>
          ) : (
            <button onClick={() => go("/login")} title="Sign in" aria-label="Sign in / create account" className="h-11 px-4 rounded-full bg-indigo-600 text-white font-semibold shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-300">
              Sign in
            </button>
          )}
        </div>
      )}
    </>
  );
}
