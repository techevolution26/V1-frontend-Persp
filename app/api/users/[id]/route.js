//app/api/users/[id]/route.js

export async function GET(request, { params }) {
  const { id } = await params;
  const res = await fetch(`${process.env.API_URL || "http://localhost:8000"}/api/users/${id}`, {
    headers: { Accept: "application/json" },
  });

  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { message: text };
  }

  return new Response(JSON.stringify(data), {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}
