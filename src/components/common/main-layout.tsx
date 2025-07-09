'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  SidebarProvider,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Header } from '@/components/common/header';
import { AppSidebar } from './app-sidebar';

const protectedRoutes = ['/students', '/register', '/attendance'];

export function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('auth_token');
      const authenticated = !!token;
      setIsAuthenticated(authenticated);

      const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
      
      if (!authenticated && isProtectedRoute) {
        router.replace('/');
      }
    };

    checkAuth();
    const handleStorageChange = () => checkAuth();
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [pathname, router]);

  if (isAuthenticated === null) {
    return null; // Don't render anything until auth state is determined
  }

  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  if (!isAuthenticated && isProtectedRoute) {
      // While redirecting, it's best to show nothing to avoid flashing content.
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
