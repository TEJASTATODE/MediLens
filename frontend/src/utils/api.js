import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Use a request interceptor to get the NEWEST token every time a call is made
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      // Remove quotes if they exist
      const cleanToken = token.replace(/"/g, "");
      config.headers.Authorization = `Bearer ${cleanToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;