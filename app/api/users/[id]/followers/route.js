// app/api/users/[id]/followers/route.js

export async function GET(request, { params }) {
  const token = request.headers.get("authorization") || "";
  const { id } = await params;

  const res = await fetch(`${process.env.API_URL}/api/users/${id}/followers`, {
    headers: {
      Accept: "application/json",
      Authorization: token,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    return new Response(text, {
      status: res.status,
      headers: { "Content-Type": "application/json" },
    });
  }

  const data = await res.json();
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
