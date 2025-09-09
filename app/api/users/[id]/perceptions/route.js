// GET /api/users/:id/perceptions

export async function GET(request, { params }) {
  const { id } = await params;
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const res = await fetch(`${API_BASE}/api/users/${id}/perceptions`, {
    headers: { Accept: "application/json" },
  });
  const data = await res.json();
  return new Response(JSON.stringify(data), {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}
