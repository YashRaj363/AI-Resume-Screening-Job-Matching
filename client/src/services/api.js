import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000, // 120 seconds for ML analysis
});

// Request interceptor — attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// ── Auth APIs ──
export const loginAPI = (data) => api.post("/auth/login", data);
export const registerAPI = (data) => api.post("/auth/register", data);

// ── Resume APIs ──
export const uploadResumesAPI = (formData) =>
  api.post("/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 120000,
  });

export const getResultsAPI = () => api.get("/results");
export const getResultByIdAPI = (id) => api.get(`/results/${id}`);
export const getHistoryAPI = () => api.get("/history");

export const deleteResumeAPI = (resultId, candidateId) =>
  api.delete(`/resume/${resultId}/${candidateId}`);

export const replaceResumeAPI = (resultId, candidateId, formData) =>
  api.put(`/resume/${resultId}/${candidateId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 120000,
  });

export default api;
