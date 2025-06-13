// app/contexts/NotificationsContext.jsx
"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import useCurrentUser from "../hooks/useCurrentUser";
import { EchoContext } from "./EchoContext";

const NotificationsContext = createContext({
  unread: 0,
  bump: () => {},
  clear: () => {},
});

export function NotificationsProvider({ children }) {
  const { user, loading, token } = useCurrentUser();
  const echo = useContext(EchoContext);

  const [unread, setUnread] = useState(0);
  const [shaking, setShaking] = useState(false);

  // Fetch initial unread count
  useEffect(() => {
    if (loading || !user) return;
    (async () => {
      try {
        const res = await fetch("/api/notifications", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const body = await res.json();
        setUnread((body.data || []).filter((n) => !n.read_at).length);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [loading, user, token]);

  // Subscribe to new notifications
  useEffect(() => {
    if (!echo || !user) return;
    const channel = echo.private(`App.Models.User.${user.id}`);
    channel.notification(() => {
      setUnread((u) => u + 1);
      setShaking(true);
      setTimeout(() => setShaking(false), 2000);
    });
    return () => echo.leaveChannel(`private-App.Models.User.${user.id}`);
  }, [echo, user]);

  // API to clear unread (e.g. after mark-all-read)
  const clear = useCallback(() => setUnread(0), []);

  return (
    <NotificationsContext.Provider value={{ unread, shaking, clear }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationsContext);
}
