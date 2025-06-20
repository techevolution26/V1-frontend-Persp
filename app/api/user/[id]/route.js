//app/api/users/[id]/route.js
// This is a Next.js API route that fetches user data from a local API

export async function GET(request, { params }) {
  const { id } = await params;
  const res = await fetch(`${process.env.API_URL}/api/users/${id}`, {
    headers: { Accept: "application/json" },
  });
  const data = await res.json();
  return new Response(JSON.stringify(data), {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}
