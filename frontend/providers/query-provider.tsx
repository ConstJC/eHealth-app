'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Healthcare data should be relatively fresh
            staleTime: 2 * 60 * 1000, // 2 minutes
            gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
            
            // Retry failed requests (network issues in hospitals)
            retry: 2,
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
            
            // Refetch on window focus (doctor switches tabs)
            refetchOnWindowFocus: true,
            
            // Don't refetch on mount if data is fresh
            refetchOnMount: false,
            
            // Keep data in background
            refetchOnReconnect: true,
          },
          mutations: {
            // Show errors for failed mutations (critical in healthcare)
            retry: 0,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
