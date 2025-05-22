// app/api/perceptions/route.js
export async function GET(request) {
  const auth = request.headers.get("authorization") || "";
  const res = await fetch("http://localhost:8000/api/perceptions", {
    headers: {
      Accept: "application/json",
      Authorization: auth,
    },
  });

  const text = await res.text();
  try {
    const data = JSON.parse(text);
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Invalid JSON from Laravel:", text);
    return new Response(
      JSON.stringify({ error: "Invalid JSON from backend" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
  // const data = await res.json();
  // return new Response(JSON.stringify(data), {
  //   status: res.status,
  //   headers: { "Content-Type": "application/json" },
  // });
}
