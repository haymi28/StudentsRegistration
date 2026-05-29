import { requirePermission } from '@/lib/auth';
import { getStudents } from '@/lib/data';
import { ExportPhotosClient } from '@/components/export-photos-client';
import { Student, Class } from '@prisma/client';
import { MainLayout } from '@/components/common/main-layout';

type StudentWithClass = Student & { class: Class | null };

export default async function ExportPhotosPage() {
    await requirePermission('export_students_photos');

    // Backend internally handles scoping based on session
    const students = await getStudents() as StudentWithClass[];
    const studentsWithPhotos = students.filter(s => s.photo);

    return (
        <MainLayout isAuthenticated={true}>
            <div className="container py-8">
               <ExportPhotosClient students={studentsWithPhotos} />
            </div>
        </MainLayout>
    );
}
