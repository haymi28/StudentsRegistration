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
  const [authStatus, setAuthStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');

  useEffect(() => {
    const checkAuthAndRedirect = () => {
      const token = localStorage.getItem('auth_token');
      const isAuthenticated = !!token;

      const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
      const isAuthPage = pathname === '/' || pathname === '/login';

      if (isAuthenticated) {
        setAuthStatus('authenticated');
        if (isAuthPage) {
          router.replace('/students');
        }
      } else {
        setAuthStatus('unauthenticated');
        if (isProtectedRoute) {
          router.replace('/');
        }
      }
    };
    
    checkAuthAndRedirect();

    const handleStorageChange = () => {
      // Re-run the check when storage changes (e.g., login/logout in another tab)
      // This will cause a re-render and the effect will run again.
      setAuthStatus('loading'); 
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [pathname, router]);


  if (authStatus === 'loading') {
    // Show a loading state or a blank screen to avoid layout flashing
    return null;
  }
  
  const isAuthPage = pathname === '/' || pathname === '/login';

  // Unauthenticated layout (Login page)
  if (authStatus === 'unauthenticated' && isAuthPage) {
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
  if (authStatus === 'authenticated' && !isAuthPage) {
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

  // This handles cases where the user is on a page that doesn't match their auth state
  // and the redirect is in flight.
  return null;
}
