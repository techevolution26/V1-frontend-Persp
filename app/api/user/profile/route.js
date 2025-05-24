// app/api/user/profile/route.js

export async function POST(request) {
  const token = request.headers.get("authorization") || "";
  const form = await request.formData();

  const res = await fetch("http://localhost:8000/api/user/profile", {
    method: "POST",
    headers: { Authorization: token },
    body: form,
  });
  const data = await res.json();
  return new Response(JSON.stringify(data), {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}
