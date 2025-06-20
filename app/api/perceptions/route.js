// app/api/perceptions/route.js

export async function GET(request) {
  const token = request.headers.get("authorization") || "";

  const incoming = new URL(request.url);
  const qs = incoming.searchParams.toString();
  const endpoint = `${process.env.API_URL}/api/perceptions${
    qs ? `?${qs}` : ""
  }`;

  const res = await fetch(endpoint, {
    headers: {
      Accept: "application/json",
      Authorization: token,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("Perceptions proxy error:", res.status, text);
    return new Response(text, {
      status: res.status,
      headers: { "Content-Type": "application/json" },
    });
  }

  const data = await res.json();
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

export async function POST(request) {
  const token = request.headers.get("authorization") || "";
  const form = await request.formData();

  const res = await fetch(`${process.env.API_URL}/api/perceptions`, {
    method: "POST",
    headers: { Authorization: token },
    body: form,
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("Perception POST proxy error:", res.status, text);
    return new Response(text, {
      status: res.status,
      headers: { "Content-Type": "application/json" },
    });
  }

  const data = await res.json();
  return new Response(JSON.stringify(data), {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}
