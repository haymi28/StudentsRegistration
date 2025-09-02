
'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, useMemo } from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Header } from '@/components/common/header';
import { AppSidebar } from './app-sidebar';
import { useLocale } from '@/contexts/locale-provider';


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
  const { t } = useLocale();

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

  const navTranslations = {
    students: t('nav.students'),
    newStudent: t('nav.newStudent'),
    classManagement: t('nav.classManagement'),
    userManagement: t('nav.userManagement'),
    roleManagement: t('nav.roleManagement'),
    import: t('nav.import'),
    export: t('nav.export'),
    account: t('nav.account'),
    logout: t('nav.logout'),
    language: t('nav.language')
  }

  if (!isClient) {
    return null;
  }
  
  const isPublicPage = allPublicRoutes.includes(pathname);

  if (!isAuthenticated && isPublicPage) {
    return <>{children}</>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
      <SidebarProvider>
        <AppSidebar navTranslations={navTranslations} />
        <SidebarInset>
          <Header />
          <main className="flex-1 overflow-y-auto bg-muted/30 pt-14 sm:pt-0">
              {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
  );
}
