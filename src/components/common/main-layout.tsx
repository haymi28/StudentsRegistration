'use client';

import { usePathname } from 'next/navigation';
import { useSession, SessionProvider } from 'next-auth/react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Header } from '@/components/common/header';
import { AppSidebar } from './app-sidebar';
import { LanguageSwitcher } from './language-switcher';
import { LocaleProvider } from '@/contexts/locale-provider';

function Layout({ children }: { children: React.ReactNode }) {
  const { status } = useSession();

  if (status === 'loading') {
    return <div className="flex h-screen w-full items-center justify-center">Loading...</div>;
  }
  
  if (status === 'unauthenticated') {
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

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <LocaleProvider>
        <Layout>{children}</Layout>
      </LocaleProvider>
    </SessionProvider>
  );
}
