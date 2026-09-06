import axios from 'axios';

// ==========================================
// CENTRAL API CLIENT
// ==========================================

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/',
  headers: {
    'Content-Type': 'application/json',
  },
});

// ==========================================
// JWT REQUEST INTERCEPTOR
// ==========================================

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ==========================================
// RESPONSE INTERCEPTOR
// ==========================================

api.interceptors.response.use(
  (response) => response,

  (error) => {
    if (error.response) {
      console.error(
        `API Error ${error.response.status}:`,
        error.response.data
      );
    } else if (error.request) {
      console.error('API Error: No response from server');
    } else {
      console.error('API Error:', error.message);
    }

    return Promise.reject(error);
  }
);

export default api;