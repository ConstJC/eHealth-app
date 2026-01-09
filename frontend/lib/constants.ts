// API Base URL - defaults to backend on port 4081 with v1 prefix
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4081/api/v1';

export const AUTH_STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER: 'user',
} as const;

export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  VERIFY_EMAIL: '/verify-email',
} as const;

export const USER_ROLES = {
  ADMIN: 'ADMIN',
  USER: 'USER',
  DOCTOR: 'DOCTOR',
  NURSE: 'NURSE',
  RECEPTIONIST: 'RECEPTIONIST',
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

