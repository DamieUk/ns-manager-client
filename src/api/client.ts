import axios, { type AxiosError } from 'axios';

export const FORCED_LOGOUT_EVENT = 'auth:forced-logout';

// The session is an httpOnly cookie set by the API — the browser attaches it to every request,
// page code never sees it.
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      window.dispatchEvent(new Event(FORCED_LOGOUT_EVENT));
    }
    return Promise.reject(error);
  }
);

export default apiClient;
