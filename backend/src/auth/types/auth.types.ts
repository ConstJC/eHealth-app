import { Role } from '@prisma/client';

/**
 * JWT Payload interface for access tokens
 */
export interface JwtPayload {
  sub: string; // user ID
  email: string;
}

/**
 * JWT Payload interface for refresh tokens
 */
export interface JwtRefreshPayload extends JwtPayload {
  token: string; // random token for refresh token validation
}

/**
 * User data returned after successful authentication
 */
export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  isEmailVerified: boolean;
  createdAt: Date;
}

/**
 * User data returned after successful login
 */
export interface LoginUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  isEmailVerified: boolean;
}

/**
 * Authentication tokens response
 */
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

/**
 * Registration response
 */
export interface RegisterResponse {
  message: string;
  user: AuthUser;
}

/**
 * Login response
 */
export interface LoginResponse {
  message: string;
  user: LoginUser;
  accessToken: string;
  refreshToken: string;
}

/**
 * Token refresh response
 */
export interface RefreshTokenResponse {
  message: string;
  accessToken: string;
  refreshToken: string;
}

/**
 * Logout response
 */
export interface LogoutResponse {
  message: string;
}

/**
 * Email verification response
 */
export interface VerifyEmailResponse {
  message: string;
}

/**
 * Password reset request response
 */
export interface RequestPasswordResetResponse {
  message: string;
}

/**
 * Password reset response
 */
export interface ResetPasswordResponse {
  message: string;
}

/**
 * User data for email verification
 */
export interface UserForEmailVerification {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  emailVerificationToken: string | null;
  isEmailVerified: boolean;
}

/**
 * User data for password reset
 */
export interface UserForPasswordReset {
  id: string;
  email: string;
  firstName: string;
  resetPasswordToken: string | null;
  resetPasswordExpires: Date | null;
}

/**
 * Refresh token record from database
 */
export interface RefreshTokenRecord {
  id: string;
  token: string;
  userId: string;
  expiresAt: Date;
  user: {
    id: string;
    email: string;
    deletedAt: Date | null;
    isActive: boolean;
  };
}
