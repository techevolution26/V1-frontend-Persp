// app/hooks/useKeepAwake.js
"use client";
import { useEffect, useRef } from "react";

/**
 * useKeepAwake
 * - pings `url` periodically when the page is visible
 * - pings on window focus & online events
 * - uses exponential backoff on repeated failures
 * - uses navigator.sendBeacon for unload when available
 *
 * Options:
 *  - url: string (health ping endpoint)
 *  - visibleInterval: ms (default 5m)
 *  - hiddenInterval: ms (default 15m)
 *  - maxBackoff: ms (max backoff on failures, default 10m)
 */
export default function useKeepAwake({
  url = "/api/ping",
  visibleInterval = 1000 * 60 * 5, // 5m
  hiddenInterval = 1000 * 60 * 15, // 15m
  maxBackoff = 1000 * 60 * 10, // 10m
} = {}) {
  const aliveRef = useRef(false);
  const timerRef = useRef(null);
  const backoffRef = useRef(0);
  const abortedRef = useRef(false);

  useEffect(() => {
    // no-op on server
    if (typeof window === "undefined") return;

    abortedRef.current = false;

    const ping = async (opts = {}) => {
      try {
        // small lightweight HEAD request recommended, but many servers don't support HEAD — use GET
        const controller = new AbortController();
        const signal = controller.signal;
        const res = await fetch(url, {
          method: "GET",
          cache: "no-store",
          signal,
          headers: { "x-keepalive-tick": "1" },
        });
        if (!res.ok) throw new Error("ping failed: " + res.status);
        // success
        aliveRef.current = true;
        backoffRef.current = 0;
        return true;
      } catch (err) {
        // failure -> increase backoff
        backoffRef.current = Math.min(
          backoffRef.current ? backoffRef.current * 2 : 1000 * 10,
          maxBackoff
        ); // start at 10s then double up
        return false;
      }
    };

    const scheduleNext = async (immediate = false) => {
      clearTimeout(timerRef.current);
      if (abortedRef.current) return;
      const visible =
        !document.hidden && document.visibilityState === "visible";
      const baseInterval = visible ? visibleInterval : hiddenInterval;
      const backoff = backoffRef.current || 0;
      const delay = immediate ? 0 : Math.max(baseInterval, backoff);
      timerRef.current = setTimeout(async () => {
        const ok = await ping();
        // if ping fails we keep backoff; schedule again after backoff or base interval
        scheduleNext(false);
      }, delay);
    };

    // immediate ping on mount
    scheduleNext(true);

    // focus / visibility change / online event handlers
    const onFocus = () => scheduleNext(true);
    const onVisibility = () => {
      // when becoming visible, ping immediately (fast wake)
      if (!document.hidden && document.visibilityState === "visible") {
        scheduleNext(true);
      }
    };
    const onOnline = () => scheduleNext(true);

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("online", onOnline);

    // sendBeacon on unload to signal server (best-effort)
    const onBeforeUnload = () => {
      if (navigator.sendBeacon) {
        try {
          navigator.sendBeacon(url);
        } catch (e) {
          /* ignore */
        }
      }
    };
    window.addEventListener("beforeunload", onBeforeUnload);

    return () => {
      abortedRef.current = true;
      clearTimeout(timerRef.current);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("online", onOnline);
      window.removeEventListener("beforeunload", onBeforeUnload);
    };
  }, [url, visibleInterval, hiddenInterval, maxBackoff]);
}
