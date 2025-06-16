// app/api/search-users/route.js
import { NextResponse } from "next/server";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";
  if (!q) return NextResponse.json([], { status: 200 });

  const res = await fetch(
    `${BACKEND}/api/search-users?query=${encodeURIComponent(q)}`,
    { headers: { Accept: "application/json" } }
  );
  const data = await res.json();
  // Expect backend returns array of { id,name,avatar_url,profession }
  return NextResponse.json(data, { status: res.status });
}
