// app/api/notifications/read-all/route.js

export async function POST(request) {
  const token = request.headers.get("authorization") || "";
  const res = await fetch("http://localhost:8000/api/notifications/read-all", {
    method: "POST",
    headers: { Authorization: token, Accept: "application/json" },
  });
  const data = await res.json();
  return new Response(JSON.stringify(data), {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}
