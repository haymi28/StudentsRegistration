
import { getStudentById, getClasses } from '@/lib/data';
import { EditStudentClient } from '@/components/edit-student-client';
import { getServerSession } from '@/lib/auth';
import { MainLayout } from '@/components/common/main-layout';
import { getTranslator } from '@/lib/i18n';
import { redirect } from 'next/navigation';

export default async function EditStudentPage({ params }: { params: { id: string }}) {
  const session = await getServerSession();
  if (!session) {
    redirect('/');
  }
  
  const student = await getStudentById(params.id);
  const classes = await getClasses();
  
  if (!student) {
    return (
      <div className="container py-8 text-center">
        <h1 className="text-2xl font-bold">Student Not Found</h1>
        <p className="text-muted-foreground">The student with the given ID could not be found.</p>
      </div>
    );
  }

  return (
    <MainLayout isAuthenticated={!!session}>
        <EditStudentClient student={student} classes={classes} session={session} />
    </MainLayout>
    );
}
