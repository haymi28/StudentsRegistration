
'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, useMemo } from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Header } from '@/components/common/header';
import { AppSidebar } from './app-sidebar';
import { PublicHeader } from './public-header';


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
  
  const publicRoutes = useMemo(() => ['/'], []);
  const authRoutes = useMemo(() => ['/login'], []);
  const allPublicRoutes = useMemo(() => [...publicRoutes, ...authRoutes], [publicRoutes, authRoutes]);


  useEffect(() => {
    setIsClient(true);
  }, []);
  
  useEffect(() => {
    if (!isClient) return;

    const isAuthPage = authRoutes.includes(pathname);
    const isProtectedPage = !allPublicRoutes.includes(pathname);

    if (isAuthenticated && isAuthPage) {
        router.replace('/students');
    }

    if (!isAuthenticated && isProtectedPage) {
        router.replace('/');
    }

  }, [pathname, isAuthenticated, router, isClient, allPublicRoutes, authRoutes]);


  if (!isClient) {
    return null;
  }
  
  const isPublicPage = allPublicRoutes.includes(pathname);

  if (!isAuthenticated && isPublicPage) {
    return (
        <div className="relative min-h-screen">
            <PublicHeader />
            {children}
        </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

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
