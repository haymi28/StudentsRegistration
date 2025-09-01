
'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogOut, User, UserPlus, Users, Upload, Download, Shield, Home } from 'lucide-react';
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
import { UserRole } from '@/lib/constants';
import { signOut } from '@/lib/auth';

export function AppSidebar({ navTranslations }: { navTranslations: any }) {
  const pathname = usePathname();
  const router = useRouter();
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  useEffect(() => {
    const role = localStorage.getItem('user_role') as UserRole;
    setUserRole(role);
  }, []);

  const handleLogout = async () => {
    await signOut();
    router.push('/');
    router.refresh();
  };

  const navLinks = [
    { href: '/students', label: navTranslations.students, icon: Users },
    { href: '/register', label: navTranslations.newStudent, icon: UserPlus },
    { href: '/classes', label: navTranslations.classManagement, icon: Home, roles: ['super_admin'] },
    { href: '/users', label: navTranslations.userManagement, icon: Shield, roles: ['super_admin'] },
  ];

  const adminLinks = [
    { href: '/students/import', label: navTranslations.import, icon: Upload, roles: ['super_admin'] },
    { href: '/students/export', label: navTranslations.export, icon: Download, roles: ['super_admin'] },
  ];
  
  const visibleNavLinks = navLinks.filter(link => !link.roles || (userRole && link.roles.includes(userRole)));
  const visibleAdminLinks = adminLinks.filter(link => !link.roles || (userRole && link.roles.includes(userRole)));


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
          {visibleAdminLinks.length > 0 && userRole === 'super_admin' && (
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
            <SidebarMenuButton asChild isActive={pathname === '/account'} tooltip={navTranslations.account}>
              <Link href="/account">
                <User className="h-5 w-5" />
                <span>{navTranslations.account}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
              <SidebarMenuButton onClick={handleLogout} tooltip={navTranslations.logout}>
                  <LogOut className="h-5 w-5" />
                  <span>{navTranslations.logout}</span>
              </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
