'use client';

import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  User,
  Users,
  FileText,
  Settings as SettingsIcon,
  Shield,
  Menu,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  adminOnly?: boolean;
}

export function SettingsNavigation() {
  const pathname = usePathname();
  const params = useParams();
  const { user } = useAuthStore();
  const language = (params?.language as string) || 'en';
  const isAdmin = user?.role === 'ADMIN';

  const navItems: NavItem[] = [
    {
      name: 'Profile',
      href: `/${language}/settings/profile`,
      icon: User,
    },
    {
      name: 'Users',
      href: `/${language}/settings/users`,
      icon: Users,
      adminOnly: true,
    },
    {
      name: 'Audit Logs',
      href: `/${language}/settings/audit-logs`,
      icon: FileText,
      adminOnly: true,
    },
    {
      name: 'Menus',
      href: `/${language}/settings/menus`,
      icon: Menu,
      adminOnly: true,
    },
    {
      name: 'System',
      href: `/${language}/settings/system`,
      icon: SettingsIcon,
      adminOnly: true,
    },
  ];

  // Filter nav items based on user role
  const visibleItems = navItems.filter(item => !item.adminOnly || isAdmin);

  return (
    <nav className="space-y-1">
      {visibleItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');

        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-700 hover:bg-gray-100'
            )}
          >
            <Icon className="h-5 w-5" />
            <span>{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}

