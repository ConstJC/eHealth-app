'use client';

import { LoadingSpinner } from './loading-spinner';

interface LoadingOverlayProps {
  isLoading: boolean;
  children: React.ReactNode;
}

/**
 * Loading overlay that shows a spinner while loading
 * Prevents flash by only showing when actually loading
 */
export function LoadingOverlay({ isLoading, children }: LoadingOverlayProps) {
  if (!isLoading) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      <div className="opacity-50 pointer-events-none">{children}</div>
      <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-50">
        <LoadingSpinner size="lg" />
      </div>
    </div>
  );
}

