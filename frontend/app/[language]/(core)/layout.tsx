'use client';

import { DashboardLayout } from '@/components/layouts/dashboard-layout';
import { RouteGuard } from '@/components/auth/route-guard';
import { useAuthInit } from '@/hooks/use-auth-init';

export default function CoreLayout({ children }: { children: React.ReactNode }) {
  // Initialize auth state from localStorage
  useAuthInit();

  return (
    <RouteGuard>
      <DashboardLayout>{children}</DashboardLayout>
    </RouteGuard>
  );
}

