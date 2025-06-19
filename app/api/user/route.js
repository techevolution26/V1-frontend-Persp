// app/api/user/route.js
export async function GET(request) {
  const token = request.headers.get("authorization") || "";
  const res = await fetch(`${(process.env.API_URL || "http://localhost:8000")}/api/user`, {
    headers: {
      Accept: "application/json",
      Authorization: token,
    },
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
