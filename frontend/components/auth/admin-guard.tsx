'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { LoadingSpinner } from '@/components/common/loading-spinner';
import { useParams } from 'next/navigation';

interface AdminGuardProps {
  children: React.ReactNode;
}

export function AdminGuard({ children }: AdminGuardProps) {
  const router = useRouter();
  const params = useParams();
  const { user, hasHydrated } = useAuthStore();
  const language = (params?.language as string) || 'en';

  useEffect(() => {
    if (!hasHydrated) return;

    // Check if user is admin
    if (!user || user.role !== 'ADMIN') {
      // Redirect to dashboard if not admin
      router.push(`/${language}/dashboard`);
    }
  }, [user, hasHydrated, router, language]);

  if (!hasHydrated) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // If not admin, don't render children (redirect will happen)
  if (!user || user.role !== 'ADMIN') {
    return null;
  }

  return <>{children}</>;
}

