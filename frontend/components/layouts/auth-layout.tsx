import { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div data-auth-layout className="relative flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8 overflow-hidden bg-gray-50">
      {/* Gradient background with pastel colors */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-pink-50 to-yellow-50">
        {/* Abstract organic shapes */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-pink-200/30 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-yellow-200/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      </div>
      <div className="relative w-full max-w-md">{children}</div>
    </div>
  );
}

