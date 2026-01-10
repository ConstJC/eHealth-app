import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import type { RegisterData, AuthResponse } from '@/types';
import { ROUTES } from '@/lib/constants';

export function useAuth() {
  const router = useRouter();
  const { user, isAuthenticated, setUser, setAccessToken, logout, setLoading } = useAuthStore();

  const login = useCallback(
    async (authResponse: AuthResponse): Promise<AuthResponse> => {
      setLoading(true);
      try {
        const { user, accessToken } = authResponse;
        // Note: refreshToken is in httpOnly cookie, not in response

        // Set access token in memory, then user
        setAccessToken(accessToken);
        setUser(user);

        return authResponse;
      } catch (error: unknown) {
        throw (error as { response?: { data?: unknown } }).response?.data || { message: 'Login failed' };
      } finally {
        setLoading(false);
      }
    },
    [setUser, setAccessToken, setLoading]
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
      } catch (error: unknown) {
        throw { message: (error as Error).message || 'Registration failed' };
      } finally {
        setLoading(false);
      }
    },
    [setLoading]
  );

  const logoutUser = useCallback(async () => {
    try {
      // Call logout API to clear server-side tokens
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      // Even if API call fails, continue with client-side logout
      console.error('Logout API call failed:', error);
    } finally {
      // Clear client-side state
      logout();
      // Get current language from pathname or use default
      const pathname = window.location.pathname;
      const languageMatch = pathname.match(/^\/([^/]+)/);
      const language = languageMatch ? languageMatch[1] : 'en';
      // Redirect to sign-in with language prefix
      router.push(`/${language}/sign-in`);
    }
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

