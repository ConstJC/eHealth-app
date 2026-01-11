import { 
  Users, 
  Calendar, 
  LayoutDashboard, 
  FileText, 
  Settings, 
  Activity, 
  CreditCard,
  Pill,
  ClipboardList,
  Stethoscope
} from 'lucide-react';

export const MENU_ITEMS = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Patients',
    href: '/patients',
    icon: Users,
  },
  {
    label: 'Visits (Intake)',
    href: '/visits',
    icon: ClipboardList,
  },
  {
    label: 'Consultation',
    href: '/consultation',
    icon: Stethoscope,
  },
  {
    label: 'Prescriptions',
    href: '/prescriptions',
    icon: Pill,
  },
  {
    label: 'Billing',
    href: '/billing',
    icon: CreditCard,
  },
  {
    label: 'Reports',
    href: '/reports',
    icon: FileText,
  },
];

export const SETTINGS_ITEM = {
  label: 'Settings',
  href: '/settings',
  icon: Settings,
};
