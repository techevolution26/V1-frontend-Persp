// app/api/notifications/[id]/read/route.js

export async function POST(request, { params }) {
  const { id } = await params;
  const token = request.headers.get("authorization") || "";
  const res = await fetch(`${process.env.API_URL || "http://localhost:8000"}/api/notifications/${id}/read`, {
    method: "POST",
    headers: { Authorization: token, Accept: "application/json" },
  });
  const data = await res.json();
  return new Response(JSON.stringify(data), {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}
