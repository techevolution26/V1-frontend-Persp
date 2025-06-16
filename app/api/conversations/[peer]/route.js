// app/api/conversations/[peer]/route.js
import { NextResponse } from "next/server";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

export async function GET(request, { params }) {
  const { peer } = await params;
  const token = request.headers.get("authorization") || "";
  const url = new URL(`${BACKEND}/api/conversations/${peer}`);
  url.search = request.nextUrl.search; // preserve ?page=
  const res = await fetch(url.toString(), {
    headers: { Authorization: token, Accept: "application/json" },
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function POST(request, { params }) {
  const { peer } = await params;
  const token = request.headers.get("authorization") || "";
  const body = await request.json();
  const res = await fetch(`${BACKEND}/api/conversations/${peer}`, {
    method: "POST",
    headers: {
      Authorization: token,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

// export async function POST(request, { params }) {
//   const { peer } = params;
//   const token = request.headers.get("authorization") || "";
//   const body = await request.json();
//   const res = await fetch(`http://localhost:8000/api/conversations/${peer}`, {
//     method: "POST",
//     headers: {
//       Authorization: token,
//       "Content-Type": "application/json",
//       Accept: "application/json",
//     },
//     body: JSON.stringify(body),
//   });
//   const data = await res.json();
//   return NextResponse.json(data, { status: res.status });
// }
