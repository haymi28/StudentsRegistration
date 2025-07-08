'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  Sidebar,
  SidebarProvider,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { Header } from '@/components/common/header';
import { Logo } from './logo';
import { useLocale } from '@/contexts/locale-provider';
import { LogOut, UserPlus, Users } from 'lucide-react';
import Link from 'next/link';

export function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const { t } = useLocale();

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('auth_token');
      setIsAuthenticated(!!token);
    };

    checkAuth();
    window.addEventListener('storage', checkAuth);
    return () => {
      window.removeEventListener('storage', checkAuth);
    };
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('username');
    window.dispatchEvent(new Event('storage'));
    router.push('/');
  };

  const navLinks = [
    { href: '/students', label: t('nav.students'), icon: Users },
    { href: '/register', label: t('nav.newStudent'), icon: UserPlus },
  ];
  
  if (isAuthenticated === null) {
    // Return null or a loader to prevent hydration mismatch while we check auth status.
    return null;
  }

  if (!isAuthenticated) {
    return (
      <div className="relative flex min-h-screen flex-col">
        <Header />
        <main className="flex flex-1 items-center justify-center p-4">
            {children}
        </main>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <Logo />
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navLinks.map((link) => (
              <SidebarMenuItem key={link.href}>
                <SidebarMenuButton asChild isActive={pathname.startsWith(link.href)} tooltip={link.label}>
                    <Link href={link.href}>
                        <link.icon className="h-5 w-5" />
                        <span>{link.label}</span>
                    </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton onClick={handleLogout} tooltip={t('nav.logout')}>
                    <LogOut className="h-5 w-5" />
                    <span>{t('nav.logout')}</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <Header />
        <main className="flex-1 overflow-auto bg-muted/30">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
