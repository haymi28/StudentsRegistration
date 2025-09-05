
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
import { signOut, getServerSession } from '@/lib/auth';
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
    const fetchSession = async () => {
      const session = await getServerSession();
      if (session) {
        setUserSession(session.user);
      }
    }
    fetchSession();
  }, []);

  const handleLogout = async () => {
    await signOut();
    router.push('/');
    router.refresh();
  };

  const permissions = userSession?.role?.permissions as Record<string, boolean> || {};

  const navLinks = [
    { href: '/students', label: t('nav.students'), icon: Users, permission: 'view_students' },
    { href: '/register', label: t('nav.newStudent'), icon: UserPlus, permission: 'manage_class_students' },
    { href: '/classes', label: t('nav.class'), icon: Home, permission: 'manage_classes' },
    { href: '/users', label: t('nav.users'), icon: Shield, permission: 'manage_users' },
    { href: '/roles', label: t('nav.role'), icon: ShieldCheck, permission: 'manage_roles' },
  ];

  const adminLinks = [
    { href: '/students/import', label: t('nav.import'), icon: Upload, permission: 'import_students' },
    { href: '/students/export', label: t('nav.export'), icon: Download, permission: 'export_students' },
  ];
  
  const visibleNavLinks = navLinks.filter(link => permissions[link.permission]);
  const visibleAdminLinks = adminLinks.filter(link => permissions[link.permission]);

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
          {visibleAdminLinks.length > 0 && (
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
