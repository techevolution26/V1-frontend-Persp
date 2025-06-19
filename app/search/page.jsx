// app/search/page.jsx

"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import PerceptionCard from "../components/PerceptionCard";
import Link from "next/link";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("query") || "";

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }

    let canceled = false;
    setLoading(true);
    setError(null);

    fetch(`/api/search?query=${encodeURIComponent(query)}`, {
      headers: { Accept: "application/json" },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Status ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (!canceled) setResults(data);
      })
      .catch((e) => {
        if (!canceled) setError(e.message);
      })
      .finally(() => {
        if (!canceled) setLoading(false);
      });

    // cleaning-up if the component unmounts or query changes
    return () => {
      canceled = true;
    };
  }, [query]);

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <input
          type="text"
          defaultValue={query}
          onChange={(e) => {
            const val = e.target.value;
            // imperatively push a new URL search param so the page URL updates
            // without a full page reload:
            const params = new URLSearchParams(window.location.search);
            if (val) params.set("query", val);
            else params.delete("query");
            window.history.replaceState({}, "", `?${params.toString()}`);
            // we don’t directly set state here—`useSearchParams()` will pick up the new query.
          }}
          placeholder="Search perceptions or users…"
          className="w-full border px-4 py-2 rounded"
        />
      </div>

      {loading && <p>Searching…</p>}
      {error && <p className="text-red-500">Error: {error}</p>}

      {!loading && !error && results.length === 0 && query && (
        <p className="text-gray-500">No results found for “{query}”.</p>
      )}

      <ul className="space-y-6">
        {results.map((p) => (
          <li key={p.id}>
            <div className="border rounded-lg p-4">
              <div className="flex items-center mb-2">
                <img
                  src={p.user.avatar_url || "/default-avatar.png"}
                  alt={p.user.name}
                  className="h-8 w-8 rounded-full mr-2"
                />
                <div>
                  <p className="font-medium">{p.user.name}</p>
                  {p.user.profession && (
                    <p className="text-sm text-gray-500">{p.user.profession}</p>
                  )}
                </div>
              </div>
              <p className="mt-2">{p.body}</p>
              <Link
                href={`/perceptions/${p.id}`}
                className="text-blue-600 hover:underline mt-2 block"
              >
                View Perception
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}


///--Server-component
// import PerceptionCard from "../components/PerceptionCard";
// import Link from "next/link";

// export default async function SearchPage({ searchParams }) {
//   const query = searchParams.query || "";

//   // If you want to debounce or skip fetching until the user types, you can
//   // early-return an empty result when `!query`.
//   if (!query) {
//     return (
//       <main className="p-6 max-w-3xl mx-auto">
//         <p className="text-gray-500">Type something above to search…</p>
//       </main>
//     );
//   }

//   let results = [];
//   try {
//     const res = await fetch(
//       `http://localhost:3000/api/search?query=${encodeURIComponent(query)}`, 
//       { headers: { Accept: "application/json" } }
//     );
//     if (res.ok) {
//       results = await res.json();
//     } else {
//       throw new Error(`Status ${res.status}`);
//     }
//   } catch (e) {
//     // Optionally render an error message
//     return (
//       <main className="p-6 max-w-3xl mx-auto">
//         <p className="text-red-500">Search failed: {e.message}</p>
//       </main>
//     );
//   }

//   return (
//     <main className="p-6 max-w-3xl mx-auto">
//       <div className="mb-6">
//         <h1 className="text-2xl font-bold mb-2">Search: “{query}”</h1>
//       </div>
//       {results.length === 0 ? (
//         <p className="text-gray-500">No results found.</p>
//       ) : (
//         <ul className="space-y-6">
//           {results.map((p) => (
//             <li key={p.id}>
//               <div className="border rounded-lg p-4">
//                 <div className="flex items-center mb-2">
//                   <img
//                     src={p.user.avatar_url || "/default-avatar.png"}
//                     alt={p.user.name}
//                     className="h-8 w-8 rounded-full mr-2"
//                   />
//                   <div>
//                     <p className="font-medium">{p.user.name}</p>
//                     {p.user.profession && (
//                       <p className="text-sm text-gray-500">{p.user.profession}</p>
//                     )}
//                   </div>
//                 </div>
//                 <p className="mt-2">{p.body}</p>
//                 <Link
//                   href={`/perceptions/${p.id}`}
//                   className="text-blue-600 hover:underline mt-2 block"
//                 >
//                   View Perception
//                 </Link>
//               </div>
//             </li>
//           ))}
//         </ul>
//       )}
//     </main>
//   );
// }



// app/search/page.jsx
// "use client";

// import { useSearchParams } from "next/navigation";
// import { useState, useEffect } from "react";
// import PerceptionCard from "../components/PerceptionCard";

// export default function SearchPage() {
//   const searchParams = useSearchParams();
//   const query = searchParams.get("query") || "";
//   const [results, setResults] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     if (!query.trim()) {
//       setResults([]);
//       setLoading(false);
//       return;
//     }

//     async function fetchResults() {
//       setLoading(true);
//       setError(null);

//       // grab token from localStorage (must be logged in)
//       const token = localStorage.getItem("token") || "";

//       try {
//         const res = await fetch(`/api/search?query=${encodeURIComponent(query)}`, {
//           method: "GET",
//           headers: {
//             Accept: "application/json",
//             // pass the Bearer token
//             Authorization: `Bearer ${token}`,
//           },
//         });

//         if (!res.ok) throw new Error(`Status ${res.status}`);
//         const json = await res.json();
//         setResults(json);
//       } catch (e) {
//         console.error("Search error:", e);
//         setError(e.message);
//       } finally {
//         setLoading(false);
//       }
//     }

//     fetchResults();
//   }, [query]);

//   if (loading) return <p className="p-6">Searching…</p>;
//   if (error) return <p className="p-6 text-red-500">Error: {error}</p>;

//   return (
//     <main className="p-6 max-w-3xl mx-auto space-y-6">
//       <h1 className="text-2xl font-bold">Search results for “{query}”</h1>
//       {results.length === 0 ? (
//         <p>No matching perceptions found.</p>
//       ) : (
//         <ul className="space-y-4">
//           {results.map((p) => (
//             <li key={p.id}>
//               <PerceptionCard perception={p} />
//             </li>
//           ))}
//         </ul>
//       )}
//     </main>
//   );
// }
