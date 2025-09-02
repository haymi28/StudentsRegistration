
'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogOut, User, UserPlus, Users, Upload, Download, Shield, Home, ShieldCheck } from 'lucide-react';
import { Logo } from './logo';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { useEffect, useState } from 'react';
import { signOut } from '@/lib/auth';
import { Role } from '@prisma/client';
import { useLocale } from '@/contexts/locale-provider';

interface UserSession {
    id: string;
    role: Role;
}

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [userSession, setUserSession] = useState<UserSession | null>(null);
  const { t } = useLocale();
  
  useEffect(() => {
    const roleString = localStorage.getItem('user_role');
    const userId = localStorage.getItem('userId');
    if (roleString && userId) {
      try {
        const role = JSON.parse(roleString);
        setUserSession({ id: userId, role });
      } catch (error) {
        console.error("Failed to parse user role from localStorage", error);
      }
    }
  }, []);

  const handleLogout = async () => {
    await signOut();
    router.push('/');
    router.refresh();
  };

  const navLinks = [
    { href: '/students', label: t('nav.students'), icon: Users },
    { href: '/register', label: t('nav.newStudent'), icon: UserPlus },
    { href: '/classes', label: t('nav.class'), icon: Home, roles: ['Super Admin'] },
    { href: '/users', label: t('nav.users'), icon: Shield, roles: ['Super Admin'] },
    { href: '/roles', label: t('nav.role'), icon: ShieldCheck, roles: ['Super Admin'] },
  ];

  const adminLinks = [
    { href: '/students/import', label: t('nav.import'), icon: Upload, roles: ['Super Admin'] },
    { href: '/students/export', label: t('nav.export'), icon: Download, roles: ['Super Admin'] },
  ];
  
  const userRoleName = userSession?.role?.name;
  const visibleNavLinks = navLinks.filter(link => !link.roles || (userRoleName && link.roles.includes(userRoleName)));
  const visibleAdminLinks = adminLinks.filter(link => !link.roles || (userRoleName && link.roles.includes(userRoleName)));


  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="flex flex-row items-center justify-between group-data-[state=collapsed]:justify-center">
        <Logo className="group-data-[state=collapsed]:hidden" />
        <SidebarTrigger className="hidden md:flex" />
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {visibleNavLinks.map((link) => (
            <SidebarMenuItem key={link.href}>
              <SidebarMenuButton asChild isActive={pathname.startsWith(link.href)} tooltip={link.label}>
                  <Link href={link.href}>
                      <link.icon className="h-5 w-5" />
                      <span>{link.label}</span>
                  </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
          {visibleAdminLinks.length > 0 && userRoleName === 'Super Admin' && (
            <>
              <SidebarSeparator />
              {visibleAdminLinks.map((link) => (
                <SidebarMenuItem key={link.href}>
                  <SidebarMenuButton asChild isActive={pathname.startsWith(link.href)} tooltip={link.label}>
                      <Link href={link.href}>
                          <link.icon className="h-5 w-5" />
                          <span>{link.label}</span>
                      </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </>
          )}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === '/account'} tooltip={t('nav.account')}>
              <Link href="/account">
                <User className="h-5 w-5" />
                <span>{t('nav.account')}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
              <SidebarMenuButton onClick={handleLogout} tooltip={t('nav.logout')}>
                  <LogOut className="h-5 w-5" />
                  <span>{t('nav.logout')}</span>
              </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
