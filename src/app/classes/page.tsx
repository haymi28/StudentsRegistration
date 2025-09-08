
import { getServerSession } from '@/lib/auth';
import { getClasses } from '@/lib/data';
import { ClassList } from '@/components/class-list';
import { MainLayout } from '@/components/common/main-layout';
import { Class, User } from '@prisma/client';
import { redirect } from 'next/navigation';

type ClassWithDetails = Class & { manager: User | null; _count: { students: number } };

export default async function ClassesPage() {
  const session = await getServerSession();

  if (!session || (session.user.role.permissions as Record<string, boolean>)?.manage_classes !== true) {
    redirect('/students');
  }

  const classes = (await getClasses()) as ClassWithDetails[];

  return (
    <MainLayout isAuthenticated={!!session}>
        <div className="container py-8 flex flex-col items-center">
            <ClassList classes={classes} />
        </div>
    </MainLayout>
  );
}
