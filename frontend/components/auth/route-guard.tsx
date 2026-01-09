'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { ROUTES } from '@/lib/constants';
import { LoadingSpinner } from '@/components/common/loading-spinner';
import { tokenStorage } from '@/lib/auth';

interface RouteGuardProps {
  children: React.ReactNode;
}

export function RouteGuard({ children }: RouteGuardProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading, hasHydrated, setUser, setHasHydrated } = useAuthStore();
  const [isMounted, setIsMounted] = useState(false);

  // Initialize on mount
  useEffect(() => {
    setIsMounted(true);
    
    // If store hasn't hydrated yet, manually check localStorage and sync
    if (!hasHydrated && typeof window !== 'undefined') {
      const accessToken = tokenStorage.getAccessToken();
      const user = tokenStorage.getUser();
      
      if (user && accessToken) {
        // We have auth data, sync it to the store
        setUser(user);
      }
      
      // Mark as hydrated
      setHasHydrated(true);
    }
  }, [hasHydrated, setUser, setHasHydrated]);

  useEffect(() => {
    // Only redirect after component has mounted and store has hydrated
    if (isMounted && hasHydrated && !isLoading && !isAuthenticated) {
      router.push(ROUTES.LOGIN);
    }
  }, [isAuthenticated, isLoading, hasHydrated, isMounted, router]);

  // Show loading while initializing
  if (!isMounted || !hasHydrated || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // If not authenticated after hydration, return null (redirect will happen)
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

