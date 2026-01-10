import {
  LayoutDashboard,
  Users,
  FileText,
  Pill,
  Receipt,
  BarChart3,
  Settings,
  User,
  Menu as MenuIcon,
  Shield,
  Activity,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

/**
 * Maps icon string names from backend to React icon components
 */
export const menuIconMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  Dashboard: LayoutDashboard,
  Users,
  FileText,
  Pill,
  Prescription: Pill,
  Receipt,
  Billing: Receipt,
  BarChart3,
  Reports: BarChart3,
  Settings,
  Setting: Settings,
  User,
  Profile: User,
  Menu: MenuIcon,
  Shield,
  Roles: Shield,
  Activity,
  // Add more mappings as needed
};

/**
 * Get icon component from icon name string
 * @param iconName - Icon name from backend (e.g., "LayoutDashboard")
 * @param fallback - Fallback icon component (default: Activity)
 * @returns React icon component
 */
export function getMenuIcon(
  iconName: string | null | undefined,
  fallback: LucideIcon = Activity
): LucideIcon {
  if (!iconName) return fallback;
  return menuIconMap[iconName] || fallback;
}

