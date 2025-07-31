'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { UserPlus, Users, Upload, Download } from 'lucide-react';
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
} from '@/components/ui/sidebar';

export function AppSidebar() {
  const pathname = usePathname();
  const { t } = useLocale();

  const navLinks = [
    { href: '/students', label: t('nav.students'), icon: Users },
    { href: '/register', label: t('nav.newStudent'), icon: UserPlus },
  ];

  const adminLinks = [
    { href: '/students/import', label: t('nav.import'), icon: Upload },
    { href: '/students/export', label: t('nav.export'), icon: Download },
  ];

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
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
