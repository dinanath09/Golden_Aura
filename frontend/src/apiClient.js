// frontend/src/apiClient.js
import axios from "axios";

const api = axios.create({
  // For local: http://localhost:5000
  // For production: use VITE_API_URL env on Vercel
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
  withCredentials: true, // keep if you use cookies / auth
});

export default api;
