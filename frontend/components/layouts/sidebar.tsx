'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { MENU_ITEMS, SETTINGS_ITEM } from '@/config/menu';
import { Activity, ChevronLeft, ChevronRight } from 'lucide-react';

interface SidebarProps {
  open: boolean;
  onToggle: () => void;
}

export function Sidebar({ open, onToggle }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        'glass relative h-full transition-all duration-300 ease-in-out border-r border-slate-200/60 z-20 flex flex-col shadow-xl',
        open ? 'w-64' : 'w-16'
      )}
    >
      {/* Brand */}
      <div className="h-20 flex items-center justify-center border-b border-slate-200/60 shrink-0 bg-white/60 px-4">
        <div className={cn("flex items-center gap-3 transition-all duration-200", open ? "opacity-100" : "opacity-100")}>
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-2xl text-white shadow-lg ring-2 ring-blue-100">
            <Activity className="h-7 w-7" />
          </div>
          {open && (
            <div className="flex flex-col">
              <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent leading-tight">
                eHealth
              </span>
              <span className="text-xs text-slate-500 font-medium">EMR System</span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-2 space-y-2 overflow-y-auto">
        <p className={cn("text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 px-3", !open && "text-center sr-only")}>
          Menu
        </p>
        
        {MENU_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center rounded-xl transition-all duration-200 group relative",
                !open ? "justify-center p-3" : "gap-3.5 py-3.5 px-4",
                isActive 
                  ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25" 
                  : "text-slate-700 hover:bg-slate-100 hover:text-slate-900 hover:shadow-sm"
              )}
            >
              <item.icon className={cn("h-5 w-5 shrink-0 transition-transform", !open && "mx-auto", isActive && "scale-110")} />
              
              {open && (
                <span className="font-semibold text-sm">{item.label}</span>
              )}
            </Link>
          );
        })}

        <div className="my-5 border-t border-slate-200/70" />

        <Link
          href={SETTINGS_ITEM.href}
          className={cn(
            "flex items-center rounded-xl transition-all duration-200 group relative",
            !open ? "justify-center p-3" : "gap-3.5 py-3.5 px-4",
            pathname.startsWith(SETTINGS_ITEM.href)
              ? "bg-slate-100 text-slate-900 font-semibold shadow-sm" 
              : "text-slate-700 hover:bg-slate-100 hover:text-slate-900 hover:shadow-sm"
          )}
        >
          <SETTINGS_ITEM.icon className={cn("h-5 w-5 shrink-0", !open && "mx-auto")} />
          {open && <span className="font-semibold text-sm">{SETTINGS_ITEM.label}</span>}
        </Link>
      </nav>
    </aside>
  );
}
