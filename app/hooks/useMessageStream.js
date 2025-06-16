// app/hooks/useMessageStream.js
import { useEffect } from "react";
import "pusher-js";

let echoInstance = null;
if (typeof window !== "undefined") {
  // Ensuring pusher-js is loaded globally for Echo
  if (!window.Pusher) {
    window.Pusher = require("pusher-js");
  }
}

if (typeof window !== "undefined" && !echoInstance) {
  (async () => {
    const { default: Echo } = await import("laravel-echo");
    const Pusher = (await import("pusher-js")).default;
    window.Pusher = Pusher;

    const pusherKey =
      process.env.NEXT_PUBLIC_PUSHER_KEY || window.NEXT_PUBLIC_PUSHER_KEY;
    if (!pusherKey) {
      throw new Error(
        "Pusher key is missing. Please set NEXT_PUBLIC_PUSHER_KEY in your environment variables."
      );
    }

    echoInstance = new Echo({
      broadcaster: "pusher",
      key: pusherKey,
      wsHost: process.env.NEXT_PUBLIC_PUSHER_WS_HOST || "127.0.0.1",
      wsPort: process.env.NEXT_PUBLIC_PUSHER_WS_PORT
        ? parseInt(process.env.NEXT_PUBLIC_PUSHER_WS_PORT)
        : 6001, // your websockets port
      wssPort: process.env.NEXT_PUBLIC_PUSHER_WSS_PORT
        ? parseInt(process.env.NEXT_PUBLIC_PUSHER_WSS_PORT)
        : 6001,
      forceTLS: window.location.protocol === "https:",
      encrypted: window.location.protocol === "https:",
      disableStats: true,
      cluster:
        process.env.NEXT_PUBLIC_PUSHER_CLUSTER ||
        window.NEXT_PUBLIC_PUSHER_CLUSTER ||
        "mt1",
      // Ensuring this endpoint exists on my  backend Next.js API route || proxy to my Laravel backend
      authEndpoint:
        process.env.NEXT_PUBLIC_PUSHER_AUTH_ENDPOINT ||
        "http://localhost:8000/broadcasting/auth",

      //backend at this endpoint is running and allows CORS from frontend origin??
      auth: {
        headers: {
          withCredentials: true,
          // Echo will automatically send the socket_id/channel_name in the JSON body
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "X-CSRF-TOKEN":
            window.Laravel && window.Laravel.csrfToken
              ? window.Laravel.csrfToken
              : "",
        },
      },
      enabledTransports: ["ws", "wss"], // allow both ws and wss
    });
  })();
}

export function useMessageStream(peerId, onNewMessage) {
  useEffect(() => {
    if (!peerId) return;
    const channel = echoInstance.private(`conversations.${peerId}`);
    channel.listen("NewMessage", ({ message }) => {
      onNewMessage(message);
    });
    return () => {
      channel.stopListening("NewMessage");
    };
  }, [peerId, onNewMessage]);
}

export { echoInstance };
