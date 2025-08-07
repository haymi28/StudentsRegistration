'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { UserPlus, Users, Upload, Download, LogOut, UserCircle } from 'lucide-react';
import { useLocale } from '@/contexts/locale-provider';
import { Logo } from './logo';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarSeparator,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/auth-provider';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';

export function AppSidebar() {
  const pathname = usePathname();
  const { t } = useLocale();
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  }

  const navLinks = [
    { href: '/students', label: t('nav.students'), icon: Users },
    { href: '/register', label: t('nav.newStudent'), icon: UserPlus },
  ];

  const adminLinks = [
    { href: '/students/import', label: t('nav.import'), icon: Upload },
    { href: '/students/export', label: t('nav.export'), icon: Download },
  ];
  
  if (!user) {
    return null; // Don't render sidebar if not logged in
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="flex flex-row items-center justify-between group-data-[state=collapsed]:justify-center">
        <Logo className="group-data-[state=collapsed]:hidden" />
        <SidebarTrigger className="hidden md:flex" />
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
          <SidebarSeparator />
          {adminLinks.map((link) => (
            <SidebarMenuItem key={link.href}>
              <SidebarMenuButton asChild isActive={pathname.startsWith(link.href)} tooltip={link.label}>
                  <Link href={link.href}>
                      <link.icon className="h-5 w-5" />
                      <span>{link.label}</span>
                  </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
          {user.role === 'super_admin' && (
             <>
              <SidebarSeparator />
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname.startsWith('/account')} tooltip={t('nav.account')}>
                    <Link href="/account">
                        <UserCircle className="h-5 w-5" />
                        <span>{t('nav.account')}</span>
                    </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </>
          )}
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
          <div className="flex items-center gap-3 p-2 group-data-[state=collapsed]:justify-center">
            <Avatar className="size-8">
              <AvatarFallback>{user?.displayName?.charAt(0) || user?.username?.charAt(0) || 'A'}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col group-data-[state=collapsed]:hidden">
              <p className="text-sm font-medium text-sidebar-foreground">{user?.displayName || user?.username}</p>
              <p className="text-xs text-sidebar-foreground/70">{user.role.replace('_', ' ')}</p>
            </div>
          </div>
        </SidebarFooter>
    </Sidebar>
  );
}
