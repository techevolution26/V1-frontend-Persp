// app/api/perceptions/[id]/like/route.js

export async function POST(request, { params }) {
  const { id } = await params;
  const token = request.headers.get("authorization") || "";

  const res = await fetch(`${process.env.API_URL}/api/perceptions/${id}/like`, {
    method: "POST",
    headers: { Authorization: token, Accept: "application/json" },
  });
  const json = await res.json();
  return new Response(JSON.stringify(json), {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function DELETE(request, { params }) {
  const { id } = await params;
  const token = request.headers.get("authorization") || "";

  const res = await fetch(`${process.env.API_URL}/api/perceptions/${id}/like`, {
    method: "DELETE",
    headers: { Authorization: token, Accept: "application/json" },
  });
  const json = await res.json();
  return new Response(JSON.stringify(json), {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}
