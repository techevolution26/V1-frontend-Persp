// app/api/topics/[id]/follow/route.js
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function POST(request, { params }) {
  const { id } = await params;
  const token = request.headers.get("authorization") || "";
  const res = await fetch(`${API_BASE}/api/topics/${id}/follow`, {
    method: "POST",
    headers: { Authorization: token, Accept: "application/json" },
  });
  const data = await res.json();
  return new Response(JSON.stringify(data), {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function DELETE(request, { params }) {
  const { id } = await params;
  const token = request.headers.get("authorization") || "";
  const res = await fetch(`${API_BASE}/api/topics/${id}/follow`, {
    method: "DELETE",
    headers: { Authorization: token, Accept: "application/json" },
  });
  const data = await res.json();
  return new Response(JSON.stringify(data), {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}
