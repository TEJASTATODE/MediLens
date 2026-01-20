import axios from 'axios';

// This logic detects if the app is running on your laptop or on Vercel
const getBaseURL = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  // Fallback to Render if the environment variable isn't found
  return window.location.hostname === 'localhost' 
    ? 'http://localhost:5000/api' 
    : 'https://medilens-1.onrender.com/api';
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// LOG THE URL: This will tell us the truth in the browser console
console.log("🚀 MediLens API is connecting to:", api.defaults.baseURL);

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      // Remove quotes if they exist (common with JSON.stringify/parse)
      const cleanToken = token.replace(/"/g, "");
      config.headers.Authorization = `Bearer ${cleanToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Unauthorized! Clearing token...");
      localStorage.removeItem("token");
    }
    console.error('API Error details:', error.response ? error.response.data : error.message);
    return Promise.reject(error);
  }
);

export default api;