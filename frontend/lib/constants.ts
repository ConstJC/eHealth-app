// API Base URL - defaults to backend on port 4081 with v1 prefix
// Validate environment variable if in production
let apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4081/api/v1';

if (process.env.NODE_ENV === 'production' && !process.env.NEXT_PUBLIC_API_URL) {
  console.warn('NEXT_PUBLIC_API_URL is not set in production. Using default localhost URL.');
}

export const API_BASE_URL = apiBaseUrl;

export const AUTH_STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER: 'user',
} as const;

// Default language
export const DEFAULT_LANGUAGE = 'en';

// Route helpers that accept language parameter
export const getRoute = (path: string, language: string = DEFAULT_LANGUAGE) => {
  return `/${language}${path}`;
};

export const ROUTES = {
  LOGIN: '/sign-in',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  VERIFY_EMAIL: '/verify-email',
  PATIENTS: '/patients',
} as const;

export const USER_ROLES = {
  ADMIN: 'ADMIN',
  USER: 'USER',
  DOCTOR: 'DOCTOR',
  NURSE: 'NURSE',
  RECEPTIONIST: 'RECEPTIONIST',
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

