
'use client';

import { getServerSession } from '@/lib/auth';
import { getClasses } from '@/lib/data';
import { useLocale } from '@/contexts/locale-provider';
import { MainLayout } from '@/components/common/main-layout';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Class, User } from '@prisma/client';
import { redirect } from 'next/navigation';
import { Users, School } from 'lucide-react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import Image from 'next/image';
import { useEffect, useState } from 'react';

type ClassWithDetails = Class & { manager: User | null; _count: { students: number } };

export default function DashboardPage() {
  const { t } = useLocale();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [classes, setClasses] = useState<ClassWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const session = await getServerSession();
      if (!session) {
        redirect('/');
      } else {
        setIsAuthenticated(true);
        const fetchedClasses = await getClasses() as ClassWithDetails[];
        setClasses(fetchedClasses);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
        <MainLayout isAuthenticated={true}>
            <div className="flex items-center justify-center h-screen">
                Loading...
            </div>
        </MainLayout>
    )
  }

  const totalStudents = classes.reduce((acc, curr) => acc + curr._count.students, 0);
  const totalClasses = classes.length;

  const chartData = classes.map(c => ({
    name: c.name,
    students: c._count.students,
  }));

  return (
    <MainLayout isAuthenticated={isAuthenticated}>
      <div className="container py-8">
        <div className="space-y-8">
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold font-headline">{t('dashboard.title')}</h1>
            <p className="text-muted-foreground">{t('dashboard.description')}</p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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

          <div className="grid gap-6 lg:grid-cols-5">
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>{t('dashboard.chartTitle')}</CardTitle>
                <CardDescription>{t('dashboard.chartDescription')}</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={chartData}>
                    <XAxis
                      dataKey="name"
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `${value}`}
                    />
                    <Tooltip
                        cursor={{fill: 'hsl(var(--muted))'}}
                        contentStyle={{
                            backgroundColor: 'hsl(var(--background))',
                            borderColor: 'hsl(var(--border))',
                        }}
                    />
                    <Bar dataKey="students" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardContent className="flex flex-col items-center justify-center pt-6">
                 <CardTitle className="text-center mb-4">{t('dashboard.welcome.title')}</CardTitle>
                 <Image 
                    src="https://debregelila.org/wp-content/uploads/2024/09/Sunday-School-Final-Logo-2.png" 
                    alt="Debre Gelila St. Amanuel Cathedral Logo" 
                    width={150} 
                    height={150}
                    className="rounded-full shadow-lg mx-auto"
                />
                <h3 className="text-lg font-semibold mt-4 text-center">{t('dashboard.welcome.churchName')}</h3>
                <p className="text-sm text-muted-foreground mt-2 text-center">{t('dashboard.welcome.systemName')}</p>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </MainLayout>
  );
}
