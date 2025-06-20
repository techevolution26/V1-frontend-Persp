// app/api/topics/[id]/route.js

export async function GET(request, { params }) {
  const token = request.headers.get("authorization") || "";
  const { id } = await params;

  // Forward to your my backend:
  const res = await fetch(`${process.env.API_URL}/api/topics/${id}`, {
    headers: { Accept: "application/json", Authorization: token },
  });

  return new Response(await res.text(), {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}
