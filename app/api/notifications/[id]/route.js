// app/api/notifications/[id]/route.js
export async function DELETE(request, { params }) {
  const token = request.headers.get("authorization") || "";
  const { id } = await params;

  // forwarding to Laravel
  const res = await fetch(`${process.env.API_URL}/api/notifications/${id}`, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
      Authorization: token,
    },
  });

  const text = await res.text();
  return new Response(text, {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}

//delete all notifications
