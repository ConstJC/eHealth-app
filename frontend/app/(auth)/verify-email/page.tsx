'use client';

import { Suspense } from 'react';
import { VerifyEmailForm } from '@/components/features/auth/verify-email-form';
import { LoadingSpinner } from '@/components/common/loading-spinner';

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    }>
      <VerifyEmailForm />
    </Suspense>
  );
}

