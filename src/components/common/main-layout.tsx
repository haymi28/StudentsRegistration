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
      // Check for a session token or any other auth indicator
      const token = localStorage.getItem('auth_token');
      setIsAuthenticated(!!token);
    };

    checkAuth();

    // Listen for storage changes to react to login/logout from other tabs
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

    if (!isAuthenticated && isProtectedRoute) {
      router.replace('/');
    }

    if (isAuthenticated && (pathname === '/' || pathname === '/login')) {
      router.replace('/students');
    }
  }, [isAuthenticated, pathname, router]);


  if (isAuthenticated === null) {
    // Show a loading state or a blank screen to avoid layout flashing
    return null;
  }

  const isAuthPage = pathname === '/' || pathname === '/login';

  // Unauthenticated layout (Login page)
  if (!isAuthenticated && isAuthPage) {
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
  if (isAuthenticated && !isAuthPage) {
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

  return null;
}
