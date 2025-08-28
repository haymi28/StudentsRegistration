'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Header } from '@/components/common/header';
import { AppSidebar } from './app-sidebar';

// Routes that do not require authentication
const publicRoutes = ['/', '/login'];

export function MainLayout({ 
    children,
    isAuthenticated
}: { 
    children: React.ReactNode,
    isAuthenticated: boolean
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  useEffect(() => {
    if (!isClient) return;

    const isPublicPage = publicRoutes.includes(pathname);

    // If user is authenticated and on a public page, redirect to students page
    if (isAuthenticated && isPublicPage) {
        router.replace('/students');
    }

    // If user is not authenticated and on a protected page, redirect to login
    if (!isAuthenticated && !isPublicPage) {
        router.replace('/');
    }

  }, [pathname, isAuthenticated, router, isClient]);

  if (!isClient) {
    // Render nothing or a loading spinner on the server to avoid hydration mismatches
    return null;
  }
  
  if (!isAuthenticated) {
    // Only render children for unauthenticated users (i.e., the login page)
    return <>{children}</>;
  }

  // Render the full layout for authenticated users
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
