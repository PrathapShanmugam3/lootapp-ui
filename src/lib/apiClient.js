import axios from 'axios';

const getBaseUrl = () => {
  if (typeof window !== "undefined") return "";
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
};

const axiosInstance = axios.create({
  withCredentials: true, // send/receive the httpOnly session cookie
});

async function request(path, { method = "GET", body, ...rest } = {}) {
  const API_URL = getBaseUrl();
  try {
    const res = await axiosInstance({
      url: `${API_URL}${path}`,
      method,
      data: body,
      ...rest,
    });
    return res.data;
  } catch (error) {
    if (error.response) {
      const message = error.response.data?.message || `Request failed with status ${error.response.status}`;
      throw Object.assign(new Error(message), { 
        status: error.response.status, 
        data: error.response.data 
      });
    }
    throw error;
  }
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: "POST", body }),
  put: (path, body) => request(path, { method: "PUT", body }),
  del: (path) => request(path, { method: "DELETE" }),
};
