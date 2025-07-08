'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Logo } from './logo';
import { Skeleton } from '@/components/ui/skeleton';
import { LanguageSwitcher } from './language-switcher';
import { SidebarTrigger } from '../ui/sidebar';

export function Header() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('auth_token');
      setIsAuthenticated(!!token);
    };

    checkAuth();
    
    window.addEventListener('storage', checkAuth);
    
    return () => {
      window.removeEventListener('storage', checkAuth)
    }
  }, [pathname]);

  if (isAuthenticated === null) {
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Logo />
          <Skeleton className="h-8 w-24" />
        </div>
      </header>
    );
  }

  if (!isAuthenticated) {
     return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center">
                <Logo />
                <div className="flex flex-1 items-center justify-end space-x-2">
                    <LanguageSwitcher />
                </div>
            </div>
        </header>
    );
  }

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-background px-4 sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
        <SidebarTrigger className="sm:hidden" />
        <div className="flex w-full items-center justify-end">
            <LanguageSwitcher />
        </div>
    </header>
  );
}
