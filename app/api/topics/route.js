export async function GET(request) {
  const auth = request.headers.get("authorization") || "";

  // const baseUrl = process.env.API_URL ;
  const res = await fetch(`${process.env.API_URL}/api/topics`, {
    headers: {
      Accept: "application/json",
      Authorization: auth,
    },
  });

  const data = await res.json();

  // Extract the nested array or default to empty array
  const topics = data.topics || [];

  return new Response(JSON.stringify(topics), {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}
