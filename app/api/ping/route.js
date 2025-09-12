export async function GET(req) {
  return new Response("ok", {
    status: 200,
    headers: { "Content-Type": "text/plain" },
  });
}
