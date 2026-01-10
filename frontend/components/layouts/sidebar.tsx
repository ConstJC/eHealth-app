'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LogOut,
  Menu,
  X,
  Activity,
  ChevronDown,
  ChevronRight,
  Settings,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/use-auth';
import { useMenuItems } from '@/hooks/use-menu-items';
import { getMenuIcon } from '@/lib/menu-icon-map';
import type { MenuItem } from '@/app/api/menu-items/route';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';

interface SidebarProps {
  open: boolean;
  onToggle: () => void;
}

export function Sidebar({ open, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const params = useParams();
  const { user, logout } = useAuth();
  const { topLevelItems, settingsMenu, isLoading, error } = useMenuItems();
  const [settingsOpen, setSettingsOpen] = useState(false);
  
  // Get language from params or pathname
  const language = (params?.language as string) || pathname?.split('/')[1] || 'en';
  
  // Transform menu items to include language prefix in href
  const transformMenuItem = (item: MenuItem): MenuItem & { href: string } => {
    // Remove leading slash and language prefix if present
    const cleanHref = item.href.startsWith('/') ? item.href.slice(1) : item.href;
    const parts = cleanHref.split('/');
    const hasLanguagePrefix = parts[0] === 'en' || parts[0] === language;
    const pathWithoutLanguage = hasLanguagePrefix ? parts.slice(1).join('/') : cleanHref;
    
    return {
      ...item,
      href: `/${language}/${pathWithoutLanguage}`,
      children: item.children?.map(transformMenuItem),
    };
  };

  // Build navigation with language prefix
  const navigation = topLevelItems
    .filter(item => item.href !== '/settings') // Exclude Settings from top-level (it's handled separately)
    .map(transformMenuItem);

  // Build settings sub-menu with language prefix
  const settingsSubMenu = settingsMenu?.children
    ? settingsMenu.children.map(transformMenuItem)
    : [];

  // Check if we're on a settings page to auto-expand
  useEffect(() => {
    if (pathname?.includes('/settings')) {
      setSettingsOpen(true);
    }
  }, [pathname]);

  // Check if any settings sub-menu item is active
  const isSettingsActive = pathname?.includes('/settings');

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-screen bg-white border-r border-gray-200 transition-all duration-300 ease-in-out lg:relative lg:z-auto',
          open ? 'w-64' : 'w-0 lg:w-16'
        )}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Header */}
          <div className={cn(
            "flex items-center border-b border-gray-200 transition-all shrink-0",
            open ? "justify-between p-4" : "justify-center p-2"
          )}>
            <div className={cn(
              "flex items-center gap-2",
              open ? "flex-1" : "justify-center"
            )}>
              <div className={cn(
                "flex items-center justify-center rounded-lg bg-blue-600 text-white shrink-0",
                open ? "h-10 w-10" : "h-8 w-8"
              )}>
                <Activity className={open ? "h-6 w-6" : "h-5 w-5"} />
              </div>
              {open && (
                <h1 className="text-xl font-bold text-blue-600 whitespace-nowrap">Medical Clinic</h1>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggle}
              className="lg:hidden shrink-0"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>

          {/* Navigation */}
          <nav className={cn(
            "flex-1 py-4 space-y-1 overflow-y-auto overflow-x-hidden",
            open ? "px-2" : "px-1"
          )}>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ) : error ? (
              <div className="px-3 py-2 text-sm text-red-600">
                Failed to load menu items
              </div>
            ) : (
              <>
                {navigation.map((item) => {
                  const Icon = getMenuIcon(item.icon);
                  // Check if current pathname matches the route (with or without trailing slash)
                  const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');

                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      className={cn(
                        'flex items-center rounded-lg transition-colors whitespace-nowrap',
                        open ? 'gap-3 px-3 py-2' : 'justify-center px-2 py-2',
                        isActive
                          ? 'bg-blue-50 text-blue-700 font-medium'
                          : 'text-gray-700 hover:bg-gray-100'
                      )}
                      onClick={() => {
                        // Close mobile sidebar on navigation
                        if (window.innerWidth < 1024) {
                          onToggle();
                        }
                      }}
                      title={!open ? item.label : undefined}
                    >
                      <Icon className="h-5 w-5 shrink-0" />
                      {open && <span className="truncate">{item.label}</span>}
                    </Link>
                  );
                })}
              </>
            )}

            {/* Settings Collapsible Menu */}
            {settingsMenu && !isLoading && (
              <div className="space-y-1">
                {open ? (
                  <>
                    <button
                      onClick={() => setSettingsOpen(!settingsOpen)}
                      className={cn(
                        'flex items-center justify-between w-full rounded-lg transition-colors whitespace-nowrap gap-3 px-3 py-2',
                        isSettingsActive
                          ? 'bg-blue-50 text-blue-700 font-medium'
                          : 'text-gray-700 hover:bg-gray-100'
                      )}
                      title={!open ? settingsMenu.label : undefined}
                    >
                      <div className="flex items-center gap-3">
                        {(() => {
                          const SettingsIcon = getMenuIcon(settingsMenu.icon, Settings);
                          return <SettingsIcon className="h-5 w-5 shrink-0" />;
                        })()}
                        <span className="truncate">{settingsMenu.label}</span>
                      </div>
                      {settingsOpen ? (
                        <ChevronDown className="h-4 w-4 shrink-0" />
                      ) : (
                        <ChevronRight className="h-4 w-4 shrink-0" />
                      )}
                    </button>
                    
                    {/* Settings Sub-menu */}
                    {settingsOpen && settingsSubMenu.length > 0 && (
                      <div className="ml-4 space-y-1 border-l-2 border-gray-200 pl-2">
                        {settingsSubMenu.map((item) => {
                          const Icon = getMenuIcon(item.icon);
                          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');

                          return (
                            <Link
                              key={item.id}
                              href={item.href}
                              className={cn(
                                'flex items-center rounded-lg transition-colors whitespace-nowrap gap-3 px-3 py-2',
                                isActive
                                  ? 'bg-blue-50 text-blue-700 font-medium'
                                  : 'text-gray-700 hover:bg-gray-100'
                              )}
                              onClick={() => {
                                // Close mobile sidebar on navigation
                                if (window.innerWidth < 1024) {
                                  onToggle();
                                }
                              }}
                            >
                              <Icon className="h-4 w-4 shrink-0" />
                              <span className="truncate text-sm">{item.label}</span>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </>
                ) : (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        className={cn(
                          'flex items-center justify-center rounded-lg transition-all duration-200 whitespace-nowrap px-2 py-2 w-full',
                          'hover:scale-105 active:scale-95',
                          isSettingsActive
                            ? 'bg-blue-50 text-blue-700 font-medium shadow-sm'
                            : 'text-gray-700 hover:bg-gray-100'
                        )}
                        title={settingsMenu.label}
                      >
                        {(() => {
                          const SettingsIcon = getMenuIcon(settingsMenu.icon, Settings);
                          return <SettingsIcon className="h-5 w-5 shrink-0" />;
                        })()}
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent 
                      align="start" 
                      mobileFullScreen={true}
                      useFixed={true}
                      className="w-48 p-2"
                    >
                      {/* Menu Items */}
                      <div className="space-y-1 p-1">
                        {settingsSubMenu.map((item, index) => {
                          const Icon = getMenuIcon(item.icon);
                          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');

                          return (
                            <DropdownMenuItem
                              key={item.id}
                              index={index}
                              className={cn(
                                'flex items-center gap-3 cursor-pointer',
                                'group relative',
                                isActive && 'bg-blue-50 text-blue-700 font-medium border-l-2 border-blue-600'
                              )}
                              onClick={() => {
                                // Close mobile sidebar on navigation
                                if (window.innerWidth < 1024) {
                                  onToggle();
                                }
                                // Navigate to the settings page
                                router.push(item.href);
                              }}
                              aria-label={item.label}
                            >
                              <Icon 
                                className={cn(
                                  "h-4 w-4 shrink-0 transition-colors",
                                  isActive 
                                    ? "text-blue-600" 
                                    : "text-gray-500 group-hover:text-blue-600"
                                )} 
                              />
                              <span className="flex-1 font-medium text-sm">{item.label}</span>
                              {isActive && (
                                <div className="h-2 w-2 rounded-full bg-blue-600 shrink-0 animate-pulse" />
                              )}
                            </DropdownMenuItem>
                          );
                        })}
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            )}
          </nav>

          <Separator />

          {/* User section */}
          {open && user && (
            <div className="p-4 border-t border-gray-200 shrink-0">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                  <span className="text-blue-600 font-semibold text-sm shrink-0">
                    {user.firstName[0]}{user.lastName[0]}
                  </span>
                </div>
                <div className="flex-1 min-w-0 overflow-hidden">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
              </div>
            </div>
          )}

          {/* Logout */}
          <div className={cn(
            "border-t border-gray-200 shrink-0",
            open ? "p-4" : "p-2"
          )}>
            <Button
              variant="ghost"
              className={cn(
                'w-full whitespace-nowrap transition-all duration-200 group',
                open 
                  ? 'justify-start text-gray-700 hover:text-red-600 hover:bg-red-50' 
                  : 'justify-center px-0 text-gray-600 hover:text-red-600 hover:bg-red-50'
              )}
              onClick={logout}
              title={!open ? "Logout" : undefined}
            >
              <LogOut className="h-5 w-5 shrink-0 transition-colors text-gray-500 group-hover:text-red-600" />
              {open && (
                <span className="ml-3 truncate font-medium">Logout</span>
              )}
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}

