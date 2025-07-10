
'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Header } from '@/components/common/header';
import { AppSidebar } from './app-sidebar';
import { LanguageSwitcher } from './language-switcher';

const protectedRoutes = ['/students', '/register', '/attendance', '/account'];

export function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('auth_token');
      setIsAuthenticated(!!token);
    };

    checkAuth();
    const handleStorageChange = () => checkAuth();
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  useEffect(() => {
    if (isAuthenticated === null) {
      return; // Wait until authentication status is determined
    }

    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

    // Not logged in and trying to access a protected page -> redirect
    if (!isAuthenticated && isProtectedRoute) {
      router.replace('/');
    }

    // Logged in and trying to access login page -> redirect
    if (isAuthenticated && pathname === '/') {
      router.replace('/students');
    }
  }, [isAuthenticated, pathname, router]);


  if (isAuthenticated === null) {
    return null; // Render nothing until auth state is known to prevent layout flashing
  }

  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  
  // Return null while redirecting to prevent rendering the old page content
  if ((!isAuthenticated && isProtectedRoute) || (isAuthenticated && pathname === '/')) {
    return null;
  }

  // Unauthenticated layout (Login page)
  if (!isAuthenticated) {
    return (
      <div className="relative flex min-h-screen flex-col">
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center justify-end">
            <LanguageSwitcher />
          </div>
        </header>
        <main className="flex flex-1 items-center justify-center p-4">
          {children}
        </main>
      </div>
    );
  }

  // Authenticated layout
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header />
        <main className="flex-1 overflow-y-auto bg-muted/30 pt-14 sm:pt-0">
            {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
