"use client";
import { useEffect, useState } from "react";
import NewPerceptionForm from "../components/NewPerceptionForm";

export default function PerceptionsPage() {
  const [topics, setTopics] = useState([]);
  const [perceptions, setPerceptions] = useState([]);
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    async function fetchData() {
      const res1 = await fetch("/api/topics", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const topicData = await res1.json();
      setTopics(topicData);

      // try {
      //   const res2 = await fetch("/api/perceptions", {
      //     headers: { Authorization: `Bearer ${token}` },
      //   });

      //   if (!res2.ok) {
      //     const text = await res2.text('json'); // safer than assuming it's JSON  //Later i'll remove 'json' just debugging
      //     console.error("API error response:", text);
      //     throw new Error(`Error fetching perceptions: ${res2.status}`);
      //   }

      //   const perData = await res2.json();
      //   setPerceptions(perData);
      // } catch (err) {
      //   console.error("Fetch error:", err);
      // }

      const res2 = await fetch("/api/perceptions", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const perData = await res2.json();
      setPerceptions(perData);
    }

    fetchData();
  }, []);

  const addPerception = (p) => setPerceptions([p, ...perceptions]);

  return (
    <main className="p-6">
      <h1 className="text-xl font-bold mb-4">Perceptions</h1>
      <NewPerceptionForm topics={topics} onSuccess={addPerception} />

      <ul className="mt-6 space-y-4">
        {perceptions.map((p) => (
          <li key={p.id} className="border p-4 rounded">
            <p>{p.body}</p>
            <small>Topic: {p.topic?.name}</small>
          </li>
        ))}
      </ul>
    </main>
  );
}
