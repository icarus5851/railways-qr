// src/services/api.js
import axios from 'axios';

// Create an instance of axios.
const apiClient = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- NEW: Add a request interceptor ---
// This function will run before every single request is sent.
apiClient.interceptors.request.use(
  (config) => {
    // Get the token from localStorage
    const token = localStorage.getItem('authToken');
    
    // If the token exists, add it to the Authorization header
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    // Do something with request error
    return Promise.reject(error);
  }
);

// Your API functions remain exactly the same.
export const getComponents = () => apiClient.get('/components');
export const getComponentById = (id) => apiClient.get(`/components/${id}`);
export const createComponent = (data) => apiClient.post('/components/add', data);
export const deleteComponent = (id) => apiClient.delete(`/components/delete/${id}`);