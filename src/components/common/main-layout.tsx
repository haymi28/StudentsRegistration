'use client';

import { usePathname } from 'next/navigation';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Header } from '@/components/common/header';
import { AppSidebar } from './app-sidebar';
import { useAuth } from '@/contexts/auth-provider';

export function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, isLoading } = useAuth();
  
  const isLoginPage = pathname === '/login';

  if (isLoading) {
    // You can return a global loading spinner here if you want
    return null;
  }

  if (isLoginPage) {
    return <main>{children}</main>;
  }

  if (!user && !isLoginPage) {
    // This case will be handled by the redirect in the AuthProvider or page-level checks,
    // but as a fallback, we can render null or a loading indicator.
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
