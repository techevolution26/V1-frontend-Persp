// app/api/users/[id]/route.js

export async function GET(request, { params }) {
  // unwraping dynamic segment
  const { id } = await params;

  const res = await fetch(`http://localhost:8000/api/users/${id}`, {
    headers: { Accept: "application/json" },
  });

  // forward status/text back to the client
  const text = await res.text();
  const contentType = res.headers.get("content-type") || "application/json";

  return new Response(text, {
    status: res.status,
    headers: { "Content-Type": contentType },
  });
}
