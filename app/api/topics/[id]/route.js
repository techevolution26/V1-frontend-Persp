// app/api/topics/[id]/route.js

export async function GET(request, { params }) {
  const token = request.headers.get("authorization") || "";

  // Forward to your my backend:
  const res = await fetch(`http://localhost:8000/api/topics/${params.id}`, {
    headers: { Accept: "application/json", Authorization: token },
  });

  return new Response(await res.text(), {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}
