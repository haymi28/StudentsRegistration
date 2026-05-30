import { requirePermission } from '@/lib/auth';
import { getStudents } from '@/lib/data';
import { ExportStudentClient } from '@/components/export-student-client';
import { Student, Class } from '@prisma/client';
import { MainLayout } from '@/components/common/main-layout';

type StudentWithClass = Student & { class: Class | null };

export default async function ExportStudentsPage() {
    await requirePermission('export_students_text');

    // Backend internally handles scoping based on session
    const students = await getStudents() as StudentWithClass[];

    return (
        <MainLayout isAuthenticated={true}>
            <div className="container py-8">
            <ExportStudentClient students={students} />
            </div>
        </MainLayout>
    );
}
