import axios from 'axios';

const api = axios.create({
  baseURL: 'https://medilens-1.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {

    const token = localStorage.getItem("token");
    
    if (token) {

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
      console.warn("Unauthorized! Redirecting to login or clearing storage...");
      
    }
    console.error('API Error:', error.response ? error.response.data : error.message);
    return Promise.reject(error);
  }
);

export default api;