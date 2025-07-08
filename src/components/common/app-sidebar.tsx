'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogOut, UserPlus, Users } from 'lucide-react';
import { useLocale } from '@/contexts/locale-provider';
import { Logo } from './logo';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useLocale();

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

  return (
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
  );
}
