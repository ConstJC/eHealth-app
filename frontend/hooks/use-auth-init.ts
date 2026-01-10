'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { tokenStorage } from '@/lib/auth';

/**
 * Hook to initialize auth state from localStorage on app load
 * This ensures the auth store is synced with localStorage before route guards run
 * If user exists but no access token, attempts to refresh using refresh token cookie
 */
export function useAuthInit() {
  const { setUser, setAccessToken, setHasHydrated, setLoading, hasHydrated } = useAuthStore();

  useEffect(() => {
    // Only run once on mount
    if (hasHydrated) return;

    const initializeAuth = async () => {
      if (typeof window === 'undefined') {
        // Server-side: mark as hydrated immediately
        setHasHydrated(true);
        return;
      }

      // Get user data from localStorage (tokens are not persisted)
      const user = tokenStorage.getUser();

      if (user) {
        // We have user data, sync to store immediately to prevent flash
        setUser(user);

        // Check if we have an access token in memory
        const existingToken = tokenStorage.getAccessToken();
        
        if (!existingToken) {
          // No access token, try to refresh using refresh token cookie
          // Use Next.js API route to avoid CORS issues
          try {
            setLoading(true);
            const response = await fetch('/api/auth/refresh', {
              method: 'POST',
              credentials: 'include', // Send cookies
              headers: {
                'Content-Type': 'application/json',
              },
            });

            if (!response.ok) {
              throw new Error(`Refresh failed: ${response.status}`);
            }

            const data = await response.json();
            const { accessToken } = data;
            // Store the new access token
            setAccessToken(accessToken);
          } catch (error: unknown) {
            // Refresh failed - check if it's because there's no refresh token or it's invalid
            const message = (error as Error).message || 'Token refresh failed';
            
            // If it's a 401, clear user data
            if (message.includes('401') || message.includes('Unauthorized')) {
              // Unauthorized - refresh token is invalid/expired or doesn't exist
              // Clear user data since refresh token is invalid/expired
              tokenStorage.clear();
              setUser(null);
              console.log('Token refresh failed on init:', message);
            } else {
              // Other error (network, etc.) - don't clear user, just log
              console.warn('Token refresh error on init:', message);
            }
          } finally {
            setLoading(false);
          }
        } else {
          // We have an access token, set it in the store
          setAccessToken(existingToken);
        }
      }

      // Mark as hydrated - do this after setting user to minimize flash
      setHasHydrated(true);
    };

    // Run immediately without delay
    initializeAuth();
  }, [hasHydrated, setUser, setAccessToken, setHasHydrated, setLoading]);
}

