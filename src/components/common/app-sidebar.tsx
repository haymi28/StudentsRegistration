
'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogOut, User, UserPlus, Users, Upload, Download, Shield, Home, ShieldCheck, Settings, ChevronDown } from 'lucide-react';
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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useEffect, useState } from 'react';
import { signOut, getServerSession } from '@/lib/auth';
import { Role } from '@prisma/client';
import { useLocale } from '@/contexts/locale-provider';
import { cn } from '@/lib/utils';

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

  const mainLinks = [
    { href: '/students', label: t('nav.students'), icon: Users, permission: 'view_students' },
    { href: '/register', label: t('nav.newStudent'), icon: UserPlus, permission: 'manage_class_students' },
  ];

  const settingsLinks = [
      { href: '/classes', label: t('nav.classManagement'), icon: Home, permission: 'manage_classes' },
      { href: '/users', label: t('nav.userManagement'), icon: Shield, permission: 'manage_users' },
      { href: '/roles', label: t('nav.roleManagement'), icon: ShieldCheck, permission: 'manage_roles' },
  ];

  const adminLinks = [
    { href: '/students/import', label: t('nav.import'), icon: Upload, permission: 'import_students' },
    { href: '/students/export', label: t('nav.export'), icon: Download, permission: 'export_students' },
  ];
  
  const visibleMainLinks = mainLinks.filter(link => permissions[link.permission]);
  const visibleSettingsLinks = settingsLinks.filter(link => permissions[link.permission]);
  const visibleAdminLinks = adminLinks.filter(link => permissions[link.permission]);
  
  const isSettingsActive = settingsLinks.some(link => pathname.startsWith(link.href));


  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="flex flex-row items-center justify-between group-data-[state=collapsed]:justify-center">
        <Logo className="group-data-[state=collapsed]:hidden" />
        <SidebarTrigger className="hidden md:flex" />
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {visibleMainLinks.map((link) => (
            <SidebarMenuItem key={link.href}>
              <SidebarMenuButton asChild isActive={pathname.startsWith(link.href)} tooltip={link.label}>
                  <Link href={link.href}>
                      <link.icon className="h-5 w-5" />
                      <span>{link.label}</span>
                  </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
          
          {visibleSettingsLinks.length > 0 && (
              <Accordion type="single" collapsible defaultValue={isSettingsActive ? "settings" : undefined} className="w-full">
                  <AccordionItem value="settings" className="border-none">
                      <AccordionTrigger className={cn(
                          "flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-none ring-sidebar-ring transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 [&[data-state=open]>svg:last-child]:rotate-180",
                          isSettingsActive && "bg-sidebar-accent text-sidebar-accent-foreground",
                          "group-data-[state=collapsed]:h-8 group-data-[state=collapsed]:w-8 group-data-[state=collapsed]:p-2"
                          )}>
                          <Settings className="h-5 w-5 shrink-0" />
                          <span className="group-data-[state=collapsed]:hidden flex-grow text-left">{t('nav.settings')}</span>
                          <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200 group-data-[state=collapsed]:hidden" />
                      </AccordionTrigger>
                      <AccordionContent className="p-0 pl-4 group-data-[state=collapsed]:hidden">
                          <SidebarMenu className="mt-2">
                             {visibleSettingsLinks.map((link) => (
                                <SidebarMenuItem key={link.href}>
                                <SidebarMenuButton asChild isActive={pathname.startsWith(link.href)} tooltip={link.label} size="sm">
                                    <Link href={link.href}>
                                        <link.icon className="h-4 w-4" />
                                        <span>{link.label}</span>
                                    </Link>
                                </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                          </SidebarMenu>
                      </AccordionContent>
                  </AccordionItem>
              </Accordion>
          )}

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
