// app/api/perceptions/[id]/route.js

export async function GET(request, { params }) {
  const { id } = await params;

  const token = request.headers.get("authorization") || "";

  const res = await fetch(`${process.env.API_URL}/api/perceptions/${id}`, {
    headers: {
      Accept: "application/json",
      Authorization: token,
    },
  });

  const data = await res.json();
  return new Response(JSON.stringify(data), {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function PUT(request, { params }) {
  const { id } = await params;
  const token = request.headers.get("authorization") || "";
  const form = await request.formData();

  // forwarding the raw FormData (NOT setting Content-Type!)
  const res = await fetch(`${process.env.API_URL}/api/perceptions/${id}`, {
    method: "PUT",
    headers: { Authorization: token },
    body: form,
  });

  // parsing whatever Laravel backend returns
  const data = await res.json();
  return new Response(JSON.stringify(data), {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function DELETE(request, { params }) {
  const { id } = await params;
  const token = request.headers.get("authorization") || "";
  const res = await fetch(`${process.env.API_URL}/api/perceptions/${id}`, {
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
