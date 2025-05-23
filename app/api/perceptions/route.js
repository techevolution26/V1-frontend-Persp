// app/api/perceptions/route.js

export async function POST(req) {
  const token = req.headers.get("authorization") || "";
  const body = await req.json();

  const response = await fetch("http://localhost:8000/api/perceptions", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: token, //  "Bearer TOKEN"
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  return new Response(JSON.stringify(data), {
    status: response.status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function GET(request) {
  const token = request.headers.get("authorization") || "";

  // Forwarding GET to my Laravel-backend
  const res = await fetch("http://localhost:8000/api/perceptions", {
    headers: {
      Accept: "application/json",
      Authorization: token,
    },
  });

  const text = await res.text();

  //If empty or not ok, returning an empty array || propagate error
  if (!res.ok) {
    console.error("Perceptions proxy error:", res.status, text);
    return new Response(JSON.stringify([]), {
      status: res.status,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Otherwise parse JSON || empty array
  let data = [];
  try {
    data = text ? JSON.parse(text) : [];
  } catch (e) {
    console.error("Failed to parse JSON from backend:", text);
  }

  // Proxy back
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
