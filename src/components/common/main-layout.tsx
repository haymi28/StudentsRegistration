
'use client';

import { usePathname } from 'next/navigation';
import { useState, useEffect, useMemo } from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Header } from '@/components/common/header';
import { AppSidebar } from './app-sidebar';
import { PublicHeader } from './public-header';
import { useLocale } from '@/contexts/locale-provider';


export function MainLayout({ 
    children,
}: { 
    children: React.ReactNode,
}) {
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const { isLoaded } = useLocale();
  
  const publicRoutes = useMemo(() => ['/'], []);

  useEffect(() => {
    setIsClient(true);
    const sessionToken = document.cookie.includes('session=');
    setIsAuthenticated(sessionToken);
  }, [pathname]); // Re-check on path change
  
  if (!isClient || !isLoaded) {
    return null;
  }
  
  const isPublicPage = publicRoutes.includes(pathname);

  if (!isAuthenticated && isPublicPage) {
    return (
        <div className="relative min-h-screen">
            <PublicHeader />
            {children}
        </div>
    );
  }

  if (!isAuthenticated && !isPublicPage) {
    // This will prevent flashing the layout for users who are being redirected
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
