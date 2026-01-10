import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL } from './constants';
import { tokenStorage, AuthTokens } from './auth';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Send cookies (for refresh token)
});

// Request interceptor - Add auth token to requests
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenStorage.getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token using httpOnly cookie (no body needed)
        const response = await axios.post<AuthTokens>(
          `${API_BASE_URL}/auth/refresh`,
          {}, // Empty body - refresh token comes from httpOnly cookie
          {
            withCredentials: true, // Send cookies
          }
        );

        const { accessToken } = response.data;
        // Note: refreshToken is in httpOnly cookie, not in response

        // Update access token in memory storage and Zustand store
        tokenStorage.setAccessToken(accessToken);
        
        // Also update Zustand store if available
        try {
          const { useAuthStore } = await import('@/store/auth-store');
          useAuthStore.getState().setAccessToken(accessToken);
        } catch {
          // Store might not be available in all contexts
        }

        // Update the original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }

        // Retry the original request
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        tokenStorage.clear();
        if (typeof window !== 'undefined') {
          // Get current language from pathname or use default
          const { getLanguageFromPath, getLoginRoute } = await import('./utils/route-helpers');
          const language = getLanguageFromPath(window.location.pathname);
          window.location.href = getLoginRoute(language);
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;

