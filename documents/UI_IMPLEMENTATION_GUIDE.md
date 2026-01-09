# 🎨 UI Implementation Guide - Quick Reference

**For Developers**  
**Created:** January 9, 2026

---

## 🚀 Quick Setup (30 minutes)

### 1. Install shadcn/ui

```bash
cd apps/frontend
npx shadcn-ui@latest init
```

**Configuration:**
- Style: New York (or Default)
- Base color: Slate
- CSS variables: Yes
- Tailwind CSS: Yes

### 2. Install Essential Components

```bash
# Core components
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add label
npx shadcn-ui@latest add card
npx shadcn-ui@latest add table
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add select
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add avatar
npx shadcn-ui@latest add skeleton
npx shadcn-ui@latest add form
npx shadcn-ui@latest add textarea
npx shadcn-ui@latest add checkbox
npx shadcn-ui@latest add radio-group
npx shadcn-ui@latest add switch
npx shadcn-ui@latest add separator
npx shadcn-ui@latest add alert
npx shadcn-ui@latest add progress
npx shadcn-ui@latest add calendar
npx shadcn-ui@latest add popover
```

### 3. Install Additional Dependencies

```bash
npm install lucide-react
npm install @hookform/resolvers
npm install date-fns
npm install clsx tailwind-merge
```

### 4. Update Tailwind Config

```typescript
// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Healthcare color palette
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6', // Main brand
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
        },
        danger: {
          50: '#fef2f2',
          100: '#fee2e2',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          500: '#f59e0b',
          600: '#d97706',
        },
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
```

---

## 📦 Component Examples

### 1. Patient Card Component

```typescript
// components/features/patients/patient-card.tsx
'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreVertical, User } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface PatientCardProps {
  patient: {
    id: string;
    patientId: string;
    firstName: string;
    lastName: string;
    photoUrl?: string;
    dateOfBirth: Date;
    gender: string;
    status: 'ACTIVE' | 'INACTIVE';
    lastVisit?: Date;
  };
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  onNewVisit?: (id: string) => void;
}

export function PatientCard({ patient, onView, onEdit, onNewVisit }: PatientCardProps) {
  const age = new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear();
  const initials = `${patient.firstName[0]}${patient.lastName[0]}`;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1">
            <Avatar className="h-12 w-12">
              <AvatarImage src={patient.photoUrl} alt={`${patient.firstName} ${patient.lastName}`} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg truncate">
                {patient.firstName} {patient.lastName}
              </h3>
              <p className="text-sm text-muted-foreground font-mono">
                {patient.patientId}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-muted-foreground">
                  {age} yrs • {patient.gender}
                </span>
                <Badge 
                  variant={patient.status === 'ACTIVE' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {patient.status}
                </Badge>
              </div>
              {patient.lastVisit && (
                <p className="text-xs text-muted-foreground mt-1">
                  Last visit: {new Date(patient.lastVisit).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView?.(patient.id)}>
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit?.(patient.id)}>
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onNewVisit?.(patient.id)}>
                New Visit
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}
```

### 2. Vital Signs Display

```typescript
// components/features/visits/vital-signs-display.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface VitalSign {
  label: string;
  value: string | number | null;
  unit: string;
  status: 'normal' | 'elevated' | 'critical';
  previousValue?: string | number;
  trend?: 'up' | 'down' | 'stable';
}

interface VitalSignsDisplayProps {
  vitals: VitalSign[];
  recordedAt?: Date;
  recordedBy?: string;
}

export function VitalSignsDisplay({ vitals, recordedAt, recordedBy }: VitalSignsDisplayProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal':
        return 'bg-success-100 text-success-700 border-success-300';
      case 'elevated':
        return 'bg-warning-100 text-warning-700 border-warning-300';
      case 'critical':
        return 'bg-danger-100 text-danger-700 border-danger-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-success-600" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-danger-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vital Signs</CardTitle>
        {recordedAt && (
          <p className="text-sm text-muted-foreground">
            Recorded: {new Date(recordedAt).toLocaleString()}
            {recordedBy && ` by ${recordedBy}`}
          </p>
        )}
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {vitals.map((vital, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border-2 ${getStatusColor(vital.status)}`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{vital.label}</span>
                {vital.trend && getTrendIcon(vital.trend)}
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">
                  {vital.value ?? '—'}
                </span>
                <span className="text-sm opacity-75">{vital.unit}</span>
              </div>
              {vital.previousValue && (
                <p className="text-xs mt-1 opacity-75">
                  Previous: {vital.previousValue} {vital.unit}
                </p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
```

### 3. Patient Search Component

```typescript
// components/common/patient-search.tsx
'use client';

import { useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Search, Loader2 } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';
import { useQuery } from '@tanstack/react-query';
import { PatientCard } from '@/components/features/patients/patient-card';

interface PatientSearchProps {
  onSelect?: (patientId: string) => void;
}

export function PatientSearch({ onSelect }: PatientSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);

  const { data: patients, isLoading } = useQuery({
    queryKey: ['patients', 'search', debouncedSearch],
    queryFn: async () => {
      if (!debouncedSearch) return [];
      const response = await fetch(`/api/patients?search=${debouncedSearch}`);
      return response.json();
    },
    enabled: debouncedSearch.length > 0,
  });

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search by name, patient ID, or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {isLoading && (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {patients && patients.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {patients.map((patient: any) => (
            <PatientCard
              key={patient.id}
              patient={patient}
              onView={onSelect}
            />
          ))}
        </div>
      )}

      {debouncedSearch && !isLoading && patients?.length === 0 && (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">No patients found</p>
        </Card>
      )}
    </div>
  );
}
```

### 4. Dashboard Layout

```typescript
// components/layouts/dashboard-layout.tsx
'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/layouts/sidebar';
import { Header } from '@/components/layouts/header';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
```

### 5. Sidebar Component

```typescript
// components/layouts/sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  FileText,
  Pill,
  Receipt,
  BarChart3,
  Settings,
  LogOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface SidebarProps {
  open: boolean;
  onToggle: () => void;
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Patients', href: '/patients', icon: Users },
  { name: 'Visits', href: '/visits', icon: FileText },
  { name: 'Prescriptions', href: '/prescriptions', icon: Pill },
  { name: 'Billing', href: '/billing', icon: Receipt },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar({ open, onToggle }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        'bg-white border-r border-gray-200 transition-all duration-300',
        open ? 'w-64' : 'w-16'
      )}
    >
      <div className="flex flex-col h-full">
        <div className="p-4">
          <div className="flex items-center justify-between">
            {open && <h1 className="text-xl font-bold text-primary-600">eHealth EMR</h1>}
            <Button variant="ghost" size="icon" onClick={onToggle}>
              {/* Menu icon */}
            </Button>
          </div>
        </div>

        <nav className="flex-1 px-2 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                  isActive
                    ? 'bg-primary-50 text-primary-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                )}
              >
                <Icon className="h-5 w-5" />
                {open && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        <Separator />

        <div className="p-4">
          <Button variant="ghost" className="w-full justify-start">
            <LogOut className="h-5 w-5 mr-3" />
            {open && <span>Logout</span>}
          </Button>
        </div>
      </div>
    </aside>
  );
}
```

### 6. Form with Validation

```typescript
// components/forms/patient-form.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const patientSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  dateOfBirth: z.date(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  phone: z.string().regex(/^\+?[\d\s-]+$/, 'Invalid phone number'),
  email: z.string().email().optional().or(z.literal('')),
});

type PatientFormValues = z.infer<typeof patientSchema>;

interface PatientFormProps {
  onSubmit: (data: PatientFormValues) => void;
  defaultValues?: Partial<PatientFormValues>;
}

export function PatientForm({ onSubmit, defaultValues }: PatientFormProps) {
  const form = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema),
    defaultValues,
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name *</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name *</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="dateOfBirth"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date of Birth *</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="gender"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Gender *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="MALE">Male</SelectItem>
                  <SelectItem value="FEMALE">Female</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline">
            Cancel
          </Button>
          <Button type="submit">
            Save Patient
          </Button>
        </div>
      </form>
    </Form>
  );
}
```

---

## 🎨 Utility Functions

### cn() - Class Name Merger

```typescript
// lib/utils.ts
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### useDebounce Hook

```typescript
// hooks/use-debounce.ts
import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
```

---

## 📱 Responsive Patterns

### Mobile-First Grid

```typescript
// 1 column mobile, 2 tablet, 3 desktop
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Cards */}
</div>
```

### Responsive Sidebar

```typescript
// Hidden on mobile, visible on desktop
<aside className="hidden md:block w-64">
  {/* Sidebar content */}
</aside>
```

### Touch-Friendly Buttons

```typescript
// Minimum 44x44px for touch targets
<Button size="lg" className="min-h-[44px] min-w-[44px]">
  {/* Content */}
</Button>
```

---

## ✅ Implementation Checklist

- [ ] shadcn/ui installed and configured
- [ ] Tailwind config updated with design tokens
- [ ] Base components installed
- [ ] Healthcare-specific components created
- [ ] Layout components created
- [ ] Forms with validation working
- [ ] Responsive design tested
- [ ] Accessibility checked
- [ ] Dark mode support (optional)

---

**Ready to build! Follow the examples above and maintain consistency with the design system.** 🚀

