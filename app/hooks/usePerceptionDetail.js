// hooks/usePerceptionDetail.js
import { useState, useEffect, useCallback } from "react";

export function usePerceptionDetail(id) {
  const [perception, setPerception] = useState(null);
  const [comments, setComments] = useState([]);
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const normalize = useCallback(
    (list = []) =>
      list.map((c) => ({ ...c, replies: normalize(c.replies || []) })),
    []
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token") || "";
      const headers = { Authorization: `Bearer ${token}` };

      const [uRes, pRes, cRes] = await Promise.all([
        fetch("/api/user", { headers }),
        fetch(`/api/perceptions/${id}`, { headers }),
        fetch(`/api/perceptions/${id}/comments`, { headers }),
      ]);

      if (!uRes.ok || !pRes.ok || !cRes.ok)
        throw new Error("Failed to load perception or comments");

      const [u, p, c] = await Promise.all([
        uRes.json(),
        pRes.json(),
        cRes.json(),
      ]);

      setMe(u);
      setPerception(p);
      setComments(normalize(c));
    } catch (err) {
      console.error("Load error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id, normalize]);

  useEffect(() => {
    if (id) load();
  }, [id, load]);

  return {
    me,
    perception,
    comments,
    loading,
    error,
    reload: load,
    setPerception,
    setComments,
  };
}
