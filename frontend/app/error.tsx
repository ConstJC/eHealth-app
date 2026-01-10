'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md text-center">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-red-100 p-4">
            <AlertCircle className="h-12 w-12 text-red-600" />
          </div>
        </div>
        <h1 className="mb-2 text-2xl font-bold text-gray-900">Something went wrong!</h1>
        <p className="mb-6 text-gray-600">
          We encountered an unexpected error. Please try again or contact support if the problem persists.
        </p>
        {error.message && (
          <div className="mb-6 rounded-md bg-red-50 p-4 text-left">
            <p className="text-sm font-medium text-red-800">Error Details:</p>
            <p className="mt-1 text-sm text-red-700">{error.message}</p>
          </div>
        )}
        <div className="flex gap-4 justify-center">
          <Button
            onClick={reset}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Try Again
          </Button>
          <Button
            onClick={() => {
              const pathname = window.location.pathname;
              const languageMatch = pathname.match(/^\/([^/]+)/);
              const language = languageMatch ? languageMatch[1] : 'en';
              window.location.href = `/${language}/dashboard`;
            }}
            variant="outline"
          >
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}

