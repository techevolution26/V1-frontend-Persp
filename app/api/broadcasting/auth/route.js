// app/api/broadcasting/auth/route.js
import { NextResponse } from "next/server";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

export async function POST(request) {
  const token = request.headers.get("authorization") || "";
  // Laravel expecting the raw body: { socket_id, channel_name }
  const body = await request.text();
  const res = await fetch(`${BACKEND}/broadcasting/auth`, {
    method: "POST",
    headers: {
      Authorization: token,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body,
  });
  const data = await res.json();
  return NextResponse.json(data, {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}
