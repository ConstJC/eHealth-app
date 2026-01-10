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
  const { isAuthenticated, isLoading, hasHydrated, accessToken, user } = useAuthStore();
  const [isMounted, setIsMounted] = useState(false);

  // Initialize on mount - use startTransition to avoid synchronous setState
  useEffect(() => {
    // Use setTimeout to defer state update to next tick
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Only redirect after component has mounted, store has hydrated, and loading is complete
    // Wait for token refresh to complete before checking authentication
    if (!isMounted || !hasHydrated || isLoading) {
      return; // Still initializing, don't redirect yet
    }
    
    // Check both in-memory access token and store's isAuthenticated flag
    const hasToken = accessToken || tokenStorage.getAccessToken();
    
    // Only redirect if we're sure there's no user and no token
    // If there's a user but no token, the refresh might still be in progress
    if (!isAuthenticated && !hasToken && !user) {
      // Check if we're already on an auth page
      const pathname = window.location.pathname;
      const isAuthPage = pathname.includes('/sign-in') || 
                        pathname.includes('/forgot-password') || 
                        pathname.includes('/reset-password') ||
                        pathname.includes('/register');
      
      // Only redirect if not already on an auth page
      if (!isAuthPage) {
        // Get current language from pathname or use default
        const languageMatch = pathname.match(/^\/([^/]+)/);
        const language = languageMatch ? languageMatch[1] : 'en';
        // Redirect to sign-in with language prefix
        router.push(`/${language}/sign-in`);
      }
    }
  }, [isAuthenticated, isLoading, hasHydrated, isMounted, router, accessToken, user]);

  // Show loading while initializing - but minimize flash by showing content as soon as possible
  // Only show spinner if we're actually loading auth state, not just checking
  if (!isMounted) {
    // Very brief delay to prevent flash
    return null;
  }
  
  if (!hasHydrated || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
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

