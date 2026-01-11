'use client';

import { Button } from '@/components/ui/button';
import { Menu, Bell, LogOut, User as UserIcon, ChevronDown } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-gray-200 bg-white">
      <div className="flex h-full items-center justify-between px-4 lg:px-6">
        {/* Left section */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="text-gray-700 hover:text-gray-900 hover:bg-gray-100"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="relative text-gray-700 hover:text-gray-900 hover:bg-gray-100">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
          </Button>

          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 hover:bg-gray-100 px-2">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                    <span className="text-blue-600 font-semibold text-sm">
                      {user.firstName[0]}{user.lastName[0]}
                    </span>
                  </div>
                  <div className="hidden md:flex flex-col items-start justify-center ml-2">
                    <span className="text-sm font-medium text-gray-700 leading-none">
                      {user.email}
                    </span>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-500 hidden md:block" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem className="cursor-pointer">
                  <UserIcon className="mr-2 h-4 w-4" />
                  <span>My Profile</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-red-600 cursor-pointer focus:text-red-600 focus:bg-red-50">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}

