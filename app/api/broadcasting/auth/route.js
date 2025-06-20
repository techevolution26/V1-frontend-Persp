// // app/api/broadcasting/auth/route.js
// import { NextResponse } from "next/server";

// const BACKEND = process.env.BACKEND_URL || `${process.env.API_URL}`;

// export async function POST(request) {
//   try {
//     console.log("Received auth request");

//     // Get headers
//     const authHeader = request.headers.get("Authorization") || "";
//     console.log("Auth header:", authHeader ? "Present" : "Missing");

//     // Get request body
//     const body = await request.text();
//     console.log("Request body:", body);

//     // Make request to Laravel
//     // console.log("Forwarding to:", `${BACKEND}/api/broadcasting/auth`);
//     const res = await fetch(`${BACKEND}/api/broadcasting/auth`, {
//       method: "POST",
//       headers: {
//         Authorization: authHeader,
//         "Content-Type": "application/x-www-form-urlencoded",
//         Accept: "application/json",
//       },
//       body: body,
//     });

//     console.log("Laravel response status:", res.status);

//     // Handle non-200 responses
//     if (!res.ok) {
//       const errorBody = await res.text();
//       console.error("Laravel error response:", errorBody);
//       throw new Error(`Laravel responded with ${res.status}`);
//     }

//     const data = await res.json();
//     console.log("Laravel auth response:", data);
//     return NextResponse.json(data);
//   } catch (error) {
//     console.error("Proxy error:", error);
//     return NextResponse.json(
//       { error: error.message || "Internal Server Error" },
//       { status: 500 }
//     );
//   }
// }
