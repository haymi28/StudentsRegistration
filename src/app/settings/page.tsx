
'use client';

import { MainLayout } from '@/components/common/main-layout';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useLocale } from '@/contexts/locale-provider';
import { getServerSession } from '@/lib/auth';
import { Home, Shield, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function SettingsPage() {
  const { t } = useLocale();
  const [session, setSession] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const sessionData = await getServerSession();
      if (!sessionData) {
        redirect('/');
        return;
      }
      setIsAuthenticated(true);
      setSession(sessionData);

      const permissions = sessionData.user.role.permissions as Record<string, boolean> || {};
      const canViewSettings = permissions.manage_classes || permissions.manage_users || permissions.manage_roles;

      if (!canViewSettings) {
        redirect('/students');
      }
    };
    checkAuth();
  }, []);

  const permissions = session?.user?.role?.permissions as Record<string, boolean> || {};
  
  const settingsCards = [
    { 
      href: '/classes', 
      label: t('nav.classManagement'), 
      description: t('classes.description'), 
      icon: Home, 
      permission: 'manage_classes' 
    },
    { 
      href: '/users', 
      label: t('nav.userManagement'), 
      description: t('users.description'), 
      icon: Shield, 
      permission: 'manage_users' 
    },
    { 
      href: '/roles', 
      label: t('nav.roleManagement'), 
      description: t('roles.description'), 
      icon: ShieldCheck, 
      permission: 'manage_roles' 
    },
  ];

  const visibleCards = settingsCards.filter(card => permissions[card.permission]);

  return (
    <MainLayout isAuthenticated={isAuthenticated}>
        <div className="container py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold font-headline">{t('nav.settings')}</h1>
                <p className="text-muted-foreground">{t('settings.pageDescription')}</p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {visibleCards.map((card) => (
                    <Link href={card.href} key={card.href}>
                        <Card className="h-full hover:bg-muted/50 transition-colors">
                            <CardHeader>
                                <div className="flex items-center gap-4">
                                    <card.icon className="h-8 w-8 text-primary" />
                                    <div>
                                        <CardTitle>{card.label}</CardTitle>
                                        <CardDescription className="mt-1">{card.description}</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    </MainLayout>
  );
}
