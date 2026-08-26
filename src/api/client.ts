import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { getToken, clearToken } from '../auth/tokenStorage';

export const FORCED_LOGOUT_EVENT = 'auth:forced-logout';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getToken();
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      clearToken();
      window.dispatchEvent(new Event(FORCED_LOGOUT_EVENT));
    }
    return Promise.reject(error);
  }
);

export default apiClient;
