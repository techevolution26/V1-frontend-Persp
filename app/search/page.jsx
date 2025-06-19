// app/search/page.jsx
"use client";
export const dynamic = "force-dynamic";

import { Suspense } from "react";
import SearchPageWithParams from "./SearchContent";

export default function SearchPage() {
  return (
    <Suspense fallback={<p className="p-6">Loading search UI…</p>}>
      <SearchPageWithParams />
    </Suspense>
  );
}
