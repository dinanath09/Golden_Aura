// src/lib/api.js
import axios from "axios";

/* ---------------------- Base URL ---------------------- */
// VITE_API_URL can be:
// - http://localhost:5000
// - http://localhost:5000/
// - http://localhost:5000/api
const RAW = (import.meta.env.VITE_API_URL || "http://localhost:5000").trim();

// remove trailing slashes
const trimmed = RAW.replace(/\/+$/, "");

// ensure exactly one `/api`
const baseURL = trimmed.endsWith("/api") ? trimmed : `${trimmed}/api`;

/* ---------------------- Axios Instance ---------------------- */
export const api = axios.create({
  baseURL,
  timeout: 10000,
});

/* ---------------------- Helpers ---------------------- */
const hasWindow = () => typeof window !== "undefined";

/* ---------------------- Token helper ---------------------- */
function getToken() {
  try {
    if (!hasWindow()) return null;

    // main key
    const direct = window.localStorage.getItem("token");
    if (direct) return direct;

    // stored inside user object
    const rawUser = window.localStorage.getItem("user");
    if (rawUser) {
      const user = JSON.parse(rawUser);
      return user?.token || user?.accessToken || null;
    }

    return null;
  } catch {
    return null;
  }
}

/* ---------------------- Request Interceptor ---------------------- */
api.interceptors.request.use(
  (config) => {
    const token = getToken();

    if (token) {
      if (!config.headers) config.headers = {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (err) => Promise.reject(err)
);

/* ---------------------- Response Interceptor --------------------- */
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;

    // Clear invalid token
    if (status === 401 && hasWindow()) {
      try {
        window.localStorage.removeItem("token");
        window.localStorage.removeItem("user");
      } catch {
        // ignore storage errors
      }
    }

    return Promise.reject(err);
  }
);

export default api;
