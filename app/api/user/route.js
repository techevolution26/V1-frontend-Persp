// app/api/user/route.js

export async function GET(request) {
  const token = request.headers.get("authorization") || "";

  const res = await fetch("http://localhost:8000/api/user", {
    headers: {
      Accept: "application/json",
      Authorization: token,
    },
  });

  const text = await res.text();
  const contentType = res.headers.get("content-type") || "application/json";

  return new Response(text, {
    status: res.status,
    headers: { "Content-Type": contentType },
  });
}
