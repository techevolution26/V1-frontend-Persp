export async function POST(request) {
  const form = await request.formData();
  const res = await fetch(`${process.env.API_URL || "http://localhost:8000"}/api/user/profile`, {
    method: "POST",
    headers: {
      Authorization: request.headers.get("authorization") || "",
    },
    body: form,
  });

  // Reading the raw response‐body as text (so we can detect HTML vs. JSON)
  const text = await res.text();
  let data;
  try {
    // If it’s valid JSON, parse it
    data = text ? JSON.parse(text) : {};
  } catch (err) {
    // Otherwise, package the raw text into message
    data = { message: text };
  }

  return new Response(JSON.stringify(data), {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}
