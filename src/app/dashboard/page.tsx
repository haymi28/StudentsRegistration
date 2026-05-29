import { requirePermission } from '@/lib/auth';
import { getClasses } from '@/lib/data';
import { getTranslator } from '@/lib/i18n';
import { MainLayout } from '@/components/common/main-layout';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Class, User } from '@prisma/client';
import { Users, School } from 'lucide-react';
import Image from 'next/image';
import { DashboardChart } from '@/components/dashboard-chart';

type ClassWithDetails = Class & { manager: User | null; _count: { students: number } };

export default async function DashboardPage() {
  await requirePermission('view_dashboard');
  const t = await getTranslator();
  
  const classes = await getClasses() as ClassWithDetails[];

  const totalStudents = classes.reduce((acc, curr) => acc + curr._count.students, 0);
  const totalClasses = classes.length;

  const chartData = classes.map(c => ({
    name: c.name,
    students: c._count.students,
  }));

  return (
    <MainLayout isAuthenticated={true}>
      <div className="container py-8">
        <div className="space-y-8">
          <Card>
            <CardContent className="flex flex-col md:flex-row items-center gap-6 pt-6">
                <Image 
                src="/image/logo.jpg" 
                alt={t('dashboard.welcome.churchName')} 
                width={120} 
                height={120}
                className="shadow-lg rounded-full"
                priority
                />
                <div className="text-center md:text-left">
                <h1 className="text-2xl font-bold font-headline">{t('dashboard.welcome.title')}</h1>
                <p className="text-muted-foreground mt-1">{t('dashboard.welcome.churchName')}</p>
                <p className="text-sm text-muted-foreground">{t('dashboard.welcome.systemName')}</p>
                </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('dashboard.totalStudents')}</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalStudents}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('dashboard.totalClasses')}</CardTitle>
                <School className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalClasses}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t('dashboard.chartTitle')}</CardTitle>
              <CardDescription>{t('dashboard.chartDescription')}</CardDescription>
            </CardHeader>
            <CardContent className="h-[350px] w-full pl-2">
              <DashboardChart data={chartData} />
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
