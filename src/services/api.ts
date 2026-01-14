import { useAuthStore } from '@/store/useAuthStore';
import axios from 'axios';

// Create Axios Instance
export const api = axios.create({
  baseURL: '/api', // Use relative path for proxying
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach Token
api.interceptors.request.use(
  (config) => {
    
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);


api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
     
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);
