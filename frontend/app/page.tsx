'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { tokenStorage } from '@/lib/auth';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, hasHydrated, accessToken, user } = useAuthStore();
  const language = 'en'; // Default language

  useEffect(() => {
    // Wait for store to hydrate
    if (!hasHydrated) {
      return;
    }

    // Check authentication state
    const hasToken = accessToken || tokenStorage.getAccessToken();
    const hasUser = user || tokenStorage.getUser();
    const authenticated = isAuthenticated || (hasToken && hasUser);

    if (authenticated) {
      router.replace(`/${language}/dashboard`);
    } else {
      router.replace(`/${language}/sign-in`);
    }
  }, [hasHydrated, isAuthenticated, accessToken, user, router, language]);

  // Show nothing while redirecting
  return null;
}
