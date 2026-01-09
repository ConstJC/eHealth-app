import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import apiClient from '@/lib/api-client';
import type { LoginCredentials, RegisterData, AuthResponse } from '@/types';
import { ROUTES } from '@/lib/constants';

export function useAuth() {
  const router = useRouter();
  const { user, isAuthenticated, setUser, setTokens, logout, setLoading } = useAuthStore();

  const login = useCallback(
    async (authResponse: AuthResponse): Promise<AuthResponse> => {
      setLoading(true);
      try {
        const { user, accessToken, refreshToken } = authResponse;

        // Set tokens first, then user, to ensure isAuthenticated is set correctly
        setTokens(accessToken, refreshToken);
        setUser(user);

        return authResponse;
      } catch (error: any) {
        throw error.response?.data || { message: 'Login failed' };
      } finally {
        setLoading(false);
      }
    },
    [setUser, setTokens, setLoading]
  );

  const register = useCallback(
    async (data: RegisterData): Promise<{ message: string }> => {
      setLoading(true);
      try {
        // Call Next.js API route
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Registration failed');
        }

        return await response.json();
      } catch (error: any) {
        throw { message: error.message || 'Registration failed' };
      } finally {
        setLoading(false);
      }
    },
    [setLoading]
  );

  const logoutUser = useCallback(() => {
    logout();
    router.push(ROUTES.LOGIN);
  }, [logout, router]);

  return {
    user,
    isAuthenticated,
    login,
    register,
    logout: logoutUser,
    isLoading: useAuthStore((state) => state.isLoading),
  };
}

