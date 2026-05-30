
'use client';

import { usePathname } from 'next/navigation';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Header } from '@/components/common/header';
import { AppSidebar } from './app-sidebar';
import { PublicHeader } from './public-header';
import { useEffect, useState } from 'react';
import { getServerSession } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export function MainLayout({ 
    children,
    isAuthenticated,
}: { 
    children: React.ReactNode,
    isAuthenticated: boolean,
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    if (isAuthenticated && pathname !== '/account') {
      getServerSession().then(session => {
        if (session?.user.requiresPasswordChange) {
          setShouldRedirect(true);
        }
      });
    }
  }, [isAuthenticated, pathname]);

  useEffect(() => {
    if (shouldRedirect) {
      router.push('/account');
    }
  }, [shouldRedirect, router]);

  if (!isAuthenticated) {
     return (
        <div className="relative min-h-screen">
            <PublicHeader />
            {children}
        </div>
    );
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
