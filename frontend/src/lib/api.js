// frontend/src/lib/api.js
import axios from "axios";

// backend base URL
const RAW = (import.meta.env.VITE_API_URL || "http://localhost:5000").trim();
const baseURL = RAW.replace(/\/+$/, ""); // remove trailing slash

export const api = axios.create({
  baseURL: baseURL + "/api",
  timeout: 10000,
});

// Safely get token
function getToken() {
  try {
    return localStorage.getItem("token");
  } catch {
    return null;
  }
}

/* ---------------------- Request Interceptor ---------------------- */
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers = {
        ...(config.headers || {}),
        Authorization: `Bearer ${token}`,
      };
    }
    return config;
  },
  (err) => Promise.reject(err)
);

/* ---------------------- Response Interceptor --------------------- */
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
    return Promise.reject(err);
  }
);

export default api;
