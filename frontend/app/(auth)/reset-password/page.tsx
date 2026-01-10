'use client';

import { Suspense } from 'react';
import { ResetPasswordForm } from '@/components/features/auth/reset-password-form';
import { LoadingSpinner } from '@/components/common/loading-spinner';

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}

