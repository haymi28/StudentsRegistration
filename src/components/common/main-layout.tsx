'use client';

import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Header } from '@/components/common/header';
import { AppSidebar } from './app-sidebar';
import { LanguageSwitcher } from './language-switcher';

export function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { status } = useSession();

  const isAuthPage = pathname === '/';

  if (status === 'loading') {
    return <div className="flex h-screen w-full items-center justify-center">Loading...</div>;
  }

  if (status === 'unauthenticated' && !isAuthPage) {
    // This case should be handled by middleware, but as a fallback
    return <div className="flex h-screen w-full items-center justify-center">Redirecting to login...</div>;
  }
  
  if (status === 'authenticated' && isAuthPage) {
     return <div className="flex h-screen w-full items-center justify-center">Redirecting to dashboard...</div>;
  }


  if (isAuthPage) {
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
