import { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div data-auth-layout className="relative flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8 overflow-hidden bg-white">
      {/* Premium Medical Background */}
      <div className="absolute inset-0 z-0">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-overlay"
          style={{ backgroundImage: 'url(\"/medical-bg.png\")' }}
        />
        <div className="absolute inset-0 bg-linear-to-br from-blue-50/80 via-white/40 to-indigo-50/80" />
        
        {/* Animated Decorative Blobs */}
        <div className="absolute top-0 -left-4 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 -right-4 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl animate-pulse delay-700" />
      </div>
      
      {/* Content Container */}
      <div className="relative w-full max-w-md z-10">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000 ease-out">
          {children}
        </div>
      </div>
    </div>
  );
}
