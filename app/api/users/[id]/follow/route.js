// app/api/users/[id]/follow/route.js

export async function POST(request, { params }) {
  const token = request.headers.get("authorization") || "";
  const { id } = await params;

  const res = await fetch(`http://localhost:8000/api/users/${id}/follow`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: token,
    },
  });

  const text = await res.text();
  return new Response(text, {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function DELETE(request, { params }) {
  const token = request.headers.get("authorization") || "";
  const { id } = await params;

  const res = await fetch(`http://localhost:8000/api/users/${id}/follow`, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
      Authorization: token,
    },
  });

  const text = await res.text();
  return new Response(text, {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}
