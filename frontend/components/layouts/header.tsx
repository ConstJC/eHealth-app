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
    <header className="sticky top-0 z-30 h-16 border-b border-slate-200/80 bg-white/80 backdrop-blur-md shadow-sm">
      <div className="flex h-full items-center justify-between px-4 lg:px-6">
        {/* Left section */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full ring-2 ring-white"></span>
          </Button>

          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2.5 hover:bg-slate-100 px-3 py-2 h-auto rounded-lg transition-all">
                  <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shrink-0 shadow-md ring-2 ring-blue-100">
                    <span className="text-white font-semibold text-sm">
                      {user.firstName[0]}{user.lastName[0]}
                    </span>
                  </div>
                  <div className="hidden md:flex flex-col items-start justify-center">
                    <span className="text-sm font-medium text-slate-800 leading-tight">
                      {user.firstName} {user.lastName}
                    </span>
                    <span className="text-xs text-slate-600 leading-tight">
                      {user.email}
                    </span>
                  </div>
                  <ChevronDown className="h-4 w-4 text-slate-400 hidden md:block" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 shadow-lg border-slate-200">
                <DropdownMenuLabel className="text-slate-800 font-semibold">My Account</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-slate-200" />
                <DropdownMenuItem className="cursor-pointer hover:bg-slate-100 focus:bg-slate-100">
                  <UserIcon className="mr-2 h-4 w-4 text-slate-600" />
                  <span className="text-slate-800">My Profile</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-slate-200" />
                <DropdownMenuItem 
                  onClick={logout} 
                  className="text-red-600 cursor-pointer hover:bg-red-50 focus:bg-red-50 focus:text-red-600"
                >
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
