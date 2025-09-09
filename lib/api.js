// lib/api.js
export const apiFetch = (path, options) =>
  fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, options).then((res) =>
    res.json().then((data) => {
      if (!res.ok) throw data;
      return data;
    })
  );
