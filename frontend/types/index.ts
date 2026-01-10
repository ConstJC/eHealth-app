export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isEmailVerified: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  accessToken: string;
  // refreshToken is no longer in response - it's in httpOnly cookie
}

export interface ApiError {
  message: string;
  statusCode?: number;
  error?: string;
}

// Re-export patient types
export * from './patient.types';

