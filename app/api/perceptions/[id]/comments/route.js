export async function GET(request, { params }) {
  const { id } = await params;
  const token = request.headers.get("authorization") || "";

  const res = await fetch(
    `http://localhost:8000/api/perceptions/${id}/comments`,
    { headers: { Accept: "application/json", Authorization: token } }
  );
  const comments = await res.json();
  return new Response(JSON.stringify(comments), {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function POST(request, { params }) {
  const { id } = await params;
  const token = request.headers.get("authorization") || "";
  const body = await request.json();

  const res = await fetch(
    `http://localhost:8000/api/perceptions/${id}/comments`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: token,
      },
      body: JSON.stringify(body),
    }
  );
  const comment = await res.json();
  return new Response(JSON.stringify(comment), {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}
