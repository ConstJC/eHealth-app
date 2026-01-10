import { AUTH_STORAGE_KEYS } from './constants';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isEmailVerified: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string; // Optional since refresh token is in httpOnly cookie
}

export interface LoginResponse {
  message: string;
  user: User;
  accessToken: string;
  // refreshToken is no longer in response, it's in httpOnly cookie
}

// In-memory storage for access token (cleared on tab close)
let accessTokenMemory: string | null = null;

// Token storage utilities
export const tokenStorage = {
  getAccessToken: (): string | null => {
    // Return from memory (not localStorage)
    return accessTokenMemory;
  },

  setAccessToken: (token: string): void => {
    // Store in memory only (not localStorage)
    accessTokenMemory = token;
  },

  // Refresh token is now in httpOnly cookie, not accessible via JavaScript
  getRefreshToken: (): string | null => {
    // Refresh token is in httpOnly cookie, not accessible via JavaScript
    return null;
  },

  setRefreshToken: (): void => {
    // Refresh token is set as httpOnly cookie by backend, no need to store here
    // This method is kept for backward compatibility but does nothing
  },

  getUser: (): User | null => {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem(AUTH_STORAGE_KEYS.USER);
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  setUser: (user: User): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(AUTH_STORAGE_KEYS.USER, JSON.stringify(user));
  },

  clear: (): void => {
    // Clear access token from memory
    accessTokenMemory = null;
    // Clear user from localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem(AUTH_STORAGE_KEYS.USER);
    }
    // Note: Refresh token cookie is cleared by backend on logout
  },
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return !!tokenStorage.getAccessToken();
};

// Check if user has specific role
export const hasRole = (user: User | null, role: string): boolean => {
  if (!user) return false;
  return user.role === role;
};

// Check if user is admin
export const isAdmin = (user: User | null): boolean => {
  return hasRole(user, 'ADMIN');
};

