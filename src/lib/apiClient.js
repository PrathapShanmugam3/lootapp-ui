const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

async function request(path, { method = "GET", body, ...rest } = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    credentials: "include", // send/receive the httpOnly session cookie
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    ...rest,
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const message = data?.message || `Request failed with status ${res.status}`;
    throw Object.assign(new Error(message), { status: res.status, data });
  }
  return data;
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: "POST", body }),
  put: (path, body) => request(path, { method: "PUT", body }),
  del: (path) => request(path, { method: "DELETE" }),
};
