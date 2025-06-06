"use client";
import { useState, useEffect } from "react";

export default function useTopics() {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cached = localStorage.getItem("topicsCache");
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setTopics(parsed);
        setLoading(false);
      } catch {
        localStorage.removeItem("topicsCache");
      }
    }

    fetch("/api/topics", {
      headers: { Accept: "application/json" },
    })
      .then((res) => res.json())
      .then((data) => {
        setTopics(data);
        localStorage.setItem("topicsCache", JSON.stringify(data));
      })
      .catch((err) => console.error("Failed to fetch topics:", err))
      .finally(() => setLoading(false));
  }, []);

  return { topics, loading };
}
