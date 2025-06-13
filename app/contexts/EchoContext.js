// app/contexts/EchoContext.js
"use client";
import { createContext, useEffect } from "react";
import Echo from "laravel-echo";
import Pusher from "pusher-js";

export const EchoContext = createContext(null);

export function EchoProvider({ children }) {
  useEffect(() => {
    window.Pusher = Pusher;
    const echo = new Echo({
      broadcaster: "pusher",
      key: process.env.NEXT_PUBLIC_PUSHER_KEY,
      wsHost: window.location.hostname,
      wsPort: 6001,
      forceTLS: false,
      auth: { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } },
    });
    EchoContext._currentValue = echo;
  }, []);
  return <EchoContext.Provider value={EchoContext._currentValue}>{children}</EchoContext.Provider>;
}
