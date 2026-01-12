'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from './sidebar';
import { Header } from './header';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Auto-shrink sidebar on screens <= 1024px
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 1024) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    // Set initial state
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex h-screen bg-white overflow-hidden font-sans">
      {/* Background decoration elements - Subtle blue gradients */}
      <div className="fixed top-[-15%] left-[-10%] w-[35%] h-[35%] rounded-full bg-blue-400/8 blur-[120px] pointer-events-none z-0" />
      <div className="fixed bottom-[-15%] right-[-10%] w-[35%] h-[35%] rounded-full bg-indigo-400/8 blur-[120px] pointer-events-none z-0" />
      <div className="fixed top-[40%] right-[20%] w-[20%] h-[20%] rounded-full bg-sky-400/5 blur-[100px] pointer-events-none z-0" />

      <Sidebar open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="relative flex-1 flex flex-col overflow-hidden transition-all duration-300 z-10">
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 scroll-smooth bg-gradient-to-br from-white via-slate-50/30 to-white">
          <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
