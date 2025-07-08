'use client';

import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  SidebarProvider,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Header } from '@/components/common/header';
import { AppSidebar } from './app-sidebar';

export function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('auth_token');
      setIsAuthenticated(!!token);
    };

    checkAuth();
    window.addEventListener('storage', checkAuth);
    return () => {
      window.removeEventListener('storage', checkAuth);
    };
  }, [pathname]);

  if (isAuthenticated === null) {
    // Return null or a loader to prevent hydration mismatch while we check auth status.
    return null;
  }

  if (!isAuthenticated) {
    return (
      <div className="relative flex min-h-screen flex-col">
        <Header />
        <main className="flex flex-1 items-center justify-center p-4">
            {children}
        </main>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header />
        <main className="flex-1 overflow-auto bg-muted/30">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
