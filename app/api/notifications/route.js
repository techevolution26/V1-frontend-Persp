// app/api/notifications/route.js
export async function GET(request) {
  const token = request.headers.get("authorization") || "";
  const res = await fetch("http://localhost:8000/api/notifications", {
    headers: { Accept: "application/json", Authorization: token },
  });
  const data = await res.json();
  return new Response(JSON.stringify(data), {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}


