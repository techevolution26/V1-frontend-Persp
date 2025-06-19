export async function POST(req) {
//   const auth = request.headers.get("authorization") || "";

  const body = await req.json();

  const res = await fetch(`${process.env.API_URL || "http://localhost:8000"}/api/register`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();

  return new Response(JSON.stringify(data), {
    status: res.status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
