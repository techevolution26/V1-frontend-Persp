// app/api/search/route.js

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query") || "";

  // Forwarding to Laravel backend
  const res = await fetch(
    `${process.env.API_URL}/api/search?query=${encodeURIComponent(query)}`,
    {
      headers: {
        Accept: "application/json",
        //checking here done
      },
    }
  );

  const text = await res.text();
  let json;
  try {
    json = text ? JSON.parse(text) : [];
  } catch {
    return new Response(
      JSON.stringify({ message: "Invalid backend response" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  return new Response(JSON.stringify(json), {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}
