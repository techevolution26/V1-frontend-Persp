export async function GET(request) {
  const auth = request.headers.get('authorization') || '';

  const res = await fetch('http://localhost:8000/api/topics', {
    headers: {
      'Accept': 'application/json',
      'Authorization': auth,
    },
  });

  const data = await res.json();
  
  // Extract the nested array or default to empty array
  const topics = data.topics || [];

  return new Response(JSON.stringify(topics), {
    status: res.status,
    headers: { 'Content-Type': 'application/json' },
  });
}