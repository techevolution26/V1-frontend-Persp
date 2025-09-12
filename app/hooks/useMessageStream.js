// app/hooks/useMessageStream.js
import { useEffect } from "react";
import Pusher from "pusher-js";
import Echo from "laravel-echo";

let echoInstancePromise = null;

function initEcho() {
  // only initialize once
  if (!echoInstancePromise) {
    echoInstancePromise = (async () => {
      // guard: require NEXT_PUBLIC_PUSHER_KEY at runtime
      if (!process.env.NEXT_PUBLIC_PUSHER_KEY) {
        throw new Error("PUSHER key missing");
      }
      // attach Pusher to window for laravel-echo
      if (typeof window !== "undefined") {
        window.Pusher = Pusher;
      }
      return new Echo({
        broadcaster: "pusher",
        key: process.env.NEXT_PUBLIC_PUSHER_KEY,
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
        forceTLS: true,
      });
    })();
  }
  return echoInstancePromise;
}

/**
 * useMessageStream(peerId, onNewMessage)
 *
 * - tries to listen via Laravel Echo (pusher) if env vars exist
 * - always listens to BroadcastChannel "perception-messages" (if available)
 * - falls back to localStorage "perception_message_event" storage events
 *
 * onNewMessage(message) will be invoked for incoming messages relevant to peerId.
 */
export function useMessageStream(peerId, onNewMessage) {
  useEffect(() => {
    if (!peerId) return;

    let mounted = true;
    let echo = null;
    let channel = null;
    let bc = null;

    // Echo (Pusher) listener: optional and best-effort
    (async () => {
      try {
        if (process.env.NEXT_PUBLIC_PUSHER_KEY) {
          echo = await initEcho();
          if (!mounted || !echo) return;
          try {
            channel = echo.channel(`conversations.${peerId}`);
            channel.listen("NewMessage", ({ message }) => {
              if (!mounted) return;
              try {
                onNewMessage?.(message);
              } catch (err) {
                // swallow handler errors
                console.error("onNewMessage error", err);
              }
            });
          } catch (err) {
            // not fatal — fall back to local broadcast
            console.warn("Echo channel setup failed:", err);
          }
        }
      } catch (err) {
        // Echo init failed — ignore, we'll rely on BroadcastChannel / storage
        // (this often happens in dev when env var missing or Pusher blocked)
        // console.warn("initEcho error", err);
      }
    })();

    // BroadcastChannel listener (frontend only, across tabs)
    try {
      if (typeof BroadcastChannel !== "undefined") {
        bc = new BroadcastChannel("perception-messages");
        bc.onmessage = (ev) => {
          const data = ev?.data;
          if (!data) return;
          if (data.type === "message_created") {
            // only notify if message belongs to this conversation
            // NOTE: server message should contain conversation/peer information.
            if (String(data.peerId) === String(peerId)) {
              onNewMessage?.(data.message);
            }
          }
        };
      }
    } catch (err) {
      // ignore
      bc = null;
    }

    // localStorage fallback for older environments (storage events fire in other tabs)
    const storageHandler = (ev) => {
      try {
        if (!ev?.newValue) return;
        if (ev.key !== "perception_message_event") return;
        const parsed = JSON.parse(ev.newValue);
        if (!parsed || parsed.type !== "message_created") return;
        if (String(parsed.peerId) === String(peerId)) {
          onNewMessage?.(parsed.message);
        }
      } catch (err) {
        // ignore bad parse
      }
    };
    window.addEventListener("storage", storageHandler);

    return () => {
      mounted = false;
      try {
        if (channel && echo) {
          try {
            channel.stopListening("NewMessage");
            // echo.leave(`conversations.${peerId}`) // optional
          } catch (err) {}
        }
      } catch (err) {}
      try {
        if (bc) {
          bc.close();
        }
      } catch (err) {}
      window.removeEventListener("storage", storageHandler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [peerId, onNewMessage]);
}
