//app/api/perceptions/[id]/comments/route.js

export async function GET(request, { params }) {
  const { id } = await params;
  const token = request.headers.get("authorization") || "";

  // Fetching raw comments (backend) returning them with nested `replies`)

  const res = await fetch(
    `http://localhost:8000/api/perceptions/${id}/comments`,
    {
      headers: {
        Accept: "application/json",
        Authorization: token,
      },
    }
  );
  const rawText = await res.text();
  let comments;
  try {
    comments = JSON.parse(rawText);
  } catch {
    comments = [];
  }

  // Recursive normalization
  function normalize(list) {
    return (list || []).map((c) => ({
      ...c,
      // forcing `replies` to be an array, and normalize deeper levels too
      replies: Array.isArray(c.replies) ? normalize(c.replies) : [],
    }));
  }
  comments = normalize(comments);

  return new Response(JSON.stringify(comments), {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function POST(request, { params }) {
  const { id } = await params;
  const token = request.headers.get("authorization") || "";
  const form = await request.formData();

  const res = await fetch(
    `http://localhost:8000/api/perceptions/${id}/comments`,
    {
      method: "POST",
      headers: { Authorization: token },
      body: form,
    }
  );

  const text = await res.text();
  return new Response(text, {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}
