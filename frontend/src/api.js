import axios from 'axios';

// Read main server IP from .env file or default to current browser location hostname
const mainServerIp = import.meta.env.VITE_MAIN_SERVER_IP || window.location.hostname || 'localhost';
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || `http://${mainServerIp}:8005/api`;

const api = axios.create({
  baseURL: apiBaseUrl,
});

// Interceptor to attach the JWT token to every request if it exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
