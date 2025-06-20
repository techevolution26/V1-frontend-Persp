// app/api/users/[id]/topics/route.js
export async function GET(request, { params }) {
  const { id } = await params;
  // no auth needed to view what topics a user follows,
  const token = request.headers.get("authorization") || "";
  const res = await fetch(`${process.env.API_URL}/api/users/${id}/topics`, {
    headers: { Accept: "application/json", Authorization: token },
  });
  const data = await res.json();
  return new Response(JSON.stringify(data), {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}
