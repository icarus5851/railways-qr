// src/services/api.js
import axios from 'axios';
// ADD THIS LINE
import { API_BASE_URL } from '../config';

// The apiClient will now automatically use the correct URL
// for development or production.
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// We need to export the apiClient so other files can use it.
export default apiClient;

// Your API functions
export const getComponents = () => apiClient.get('/components');
export const getComponentById = (id) => apiClient.get(`/components/${id}`);
export const createComponent = (data) => apiClient.post('/components/add', data);
export const deleteComponent = (id) => apiClient.delete(`/components/delete/${id}`);