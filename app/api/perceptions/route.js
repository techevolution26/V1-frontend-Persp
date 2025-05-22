// export async function POST(request) {
//     const {body, topic_id} = await request.json();
//     const auth = request.headers.get('Authorization') || ''

//     const res = await fetch('http://localhost:8000/api/perceptions', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json',
//             'Authorization': auth
//         },
//         body: JSON.stringify({
//             body,
//             topic_id
//         })
//     })

//     const data = await res.json()
//     return new Response(JSON.stringify(data), {
//         status: res.status,
//         headers: {'Content-Type': 'application/json'}
//     })
// }

// app/api/perceptions/route.js
export async function POST(req) {
  const token = req.headers.get('authorization') || '';
  const body = await req.json();

  const response = await fetch('http://localhost:8000/api/perceptions', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: token, // should be "Bearer YOUR_TOKEN"
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  return new Response(JSON.stringify(data), {
    status: response.status,
    headers: { 'Content-Type': 'application/json' },
  });
}
