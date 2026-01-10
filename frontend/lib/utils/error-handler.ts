/**
 * Error handling utilities
 */

export interface AppError {
  message: string;
  code?: string;
  statusCode?: number;
  originalError?: unknown;
}

/**
 * Extract error message from various error types
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }
  
  return 'An unexpected error occurred';
}

/**
 * Create a standardized error object
 */
export function createAppError(error: unknown, code?: string): AppError {
  return {
    message: getErrorMessage(error),
    code,
    originalError: error,
  };
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.message.includes('network') ||
      error.message.includes('fetch') ||
      error.message.includes('NetworkError') ||
      error.message.includes('Failed to fetch')
    );
  }
  return false;
}

/**
 * Check if error is an authentication error
 */
export function isAuthError(error: unknown): boolean {
  if (error && typeof error === 'object' && 'statusCode' in error) {
    return error.statusCode === 401 || error.statusCode === 403;
  }
  return false;
}

/**
 * Format error for user display
 */
export function formatErrorForUser(error: unknown): string {
  const message = getErrorMessage(error);
  
  // Provide user-friendly messages for common errors
  if (isNetworkError(error)) {
    return 'Network error. Please check your internet connection and try again.';
  }
  
  if (isAuthError(error)) {
    return 'Your session has expired. Please sign in again.';
  }
  
  // Return the original message if it's user-friendly
  if (message && message.length < 200) {
    return message;
  }
  
  return 'An unexpected error occurred. Please try again or contact support.';
}

