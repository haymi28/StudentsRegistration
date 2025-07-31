'use client';

import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Header } from '@/components/common/header';
import { AppSidebar } from './app-sidebar';
import { LocaleProvider } from '@/contexts/locale-provider';

function Layout({ children }: { children: React.ReactNode }) {
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
      <LocaleProvider>
        <Layout>{children}</Layout>
      </LocaleProvider>
  );
}
