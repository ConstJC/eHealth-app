'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { tokenStorage } from '@/lib/auth';

/**
 * Hook to initialize auth state from localStorage on app load
 * This ensures the auth store is synced with localStorage before route guards run
 */
export function useAuthInit() {
  const { setUser, setHasHydrated, hasHydrated } = useAuthStore();

  useEffect(() => {
    // Only run once on mount
    if (hasHydrated) return;

    if (typeof window !== 'undefined') {
      // Get auth data from localStorage
      const accessToken = tokenStorage.getAccessToken();
      const user = tokenStorage.getUser();

      // If we have both user and token, sync to store
      if (user && accessToken) {
        setUser(user);
      }

      // Mark as hydrated
      setHasHydrated(true);
    }
  }, [hasHydrated, setUser, setHasHydrated]);
}

