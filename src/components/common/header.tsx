'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Logo } from './logo';
import { LogOut, UserPlus, Menu, X, Users } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { useLocale } from '@/contexts/locale-provider';
import { LanguageSwitcher } from './language-switcher';

export function Header() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useLocale();

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

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('username');
    window.dispatchEvent(new Event("storage"));
    router.push('/');
  };

  const navLinks = [
    { href: '/students', label: t('nav.students'), icon: Users },
    { href: '/register', label: t('nav.newStudent'), icon: UserPlus },
  ];

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

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Logo />
        <div className="flex flex-1 items-center justify-end space-x-2">
          <LanguageSwitcher />
          {isAuthenticated && (
            <>
              <nav className="hidden md:flex items-center space-x-2 lg:space-x-4 text-sm font-medium">
                {navLinks.map((link) => (
                  <Button asChild variant={pathname === link.href ? 'secondary' : 'ghost'} key={link.href}>
                    <Link href={link.href}>
                      <link.icon className="mr-2 h-4 w-4" />
                      {link.label}
                    </Link>
                  </Button>
                ))}
              </nav>
              <div className="hidden md:flex">
                <Button variant="ghost" onClick={handleLogout} aria-label={t('nav.logout')}>
                  <LogOut className="mr-2 h-4 w-4" />
                  {t('nav.logout')}
                </Button>
              </div>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="md:hidden">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right">
                  <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between border-b pb-4">
                      <Logo />
                      <SheetClose asChild>
                        <Button variant="ghost" size="icon"><X className="h-5 w-5"/></Button>
                      </SheetClose>
                    </div>
                    <nav className="flex flex-col gap-4 py-4">
                      {navLinks.map((link) => (
                        <SheetClose asChild key={link.href}>
                          <Link href={link.href}>
                            <Button
                              asChild
                              variant={pathname === link.href ? 'secondary' : 'ghost'}
                              className="w-full justify-start text-base"
                            >
                              <div><link.icon className="mr-2 h-4 w-4" />{link.label}</div>
                            </Button>
                          </Link>
                        </SheetClose>
                      ))}
                    </nav>
                    <div className="mt-auto border-t pt-4">
                      <Button variant="ghost" onClick={handleLogout} className="w-full justify-start text-base">
                        <LogOut className="mr-2 h-4 w-4" /> {t('nav.logout')}
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
