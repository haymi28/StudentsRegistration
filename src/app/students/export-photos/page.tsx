
import { getServerSession } from '@/lib/auth';
import { getStudents } from '@/lib/data';
import { redirect } from 'next/navigation';
import { ExportPhotosClient } from '@/components/export-photos-client';
import { Student, Class } from '@prisma/client';
import { MainLayout } from '@/components/common/main-layout';

type StudentWithClass = Student & { class: Class | null };

export default async function ExportPhotosPage() {
    const session = await getServerSession();
    if (!session) {
        redirect('/');
    }

    const permissions = session.user.role.permissions as Record<string, boolean>;
    if (!permissions.export_students) {
            redirect('/students');
    }

    // Backend internally handles scoping based on session
    const students = await getStudents() as StudentWithClass[];
    const studentsWithPhotos = students.filter(s => s.photo);

    return (
        <MainLayout isAuthenticated={!!session}>
            <div className="container py-8">
               <ExportPhotosClient students={studentsWithPhotos} />
            </div>
        </MainLayout>
    );
}
