//app/api/users/[id]/following/route.js
export async function GET(request, { params }) {
  const { id } = await params;

  const res = await fetch(`http://localhost:8000/api/users/${id}/following`, {
    headers: { Accept: "application/json" },
  });

  const data = await res.json();
  return new Response(JSON.stringify(data), {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}
