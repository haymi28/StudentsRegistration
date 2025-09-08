
import { getServerSession } from '@/lib/auth';
import { getStudents } from '@/lib/data';
import { redirect } from 'next/navigation';
import { ExportStudentClient } from '@/components/export-student-client';
import { Student, Role, Class } from '@prisma/client';
import { MainLayout } from '@/components/common/main-layout';

type StudentWithClass = Student & { class: Class | null };

export default async function ExportStudentsPage() {
    const session = await getServerSession();
    if (!session) {
        redirect('/');
    }

    const permissions = session.user.role.permissions as Record<string, boolean>;
    if (!permissions.export_students) {
            redirect('/students');
    }

    const students = await getStudents(session.user.id, session.user.role as Role) as StudentWithClass[];

    return (
        <MainLayout isAuthenticated={!!session}>
            <div className="container py-8">
            <ExportStudentClient students={students} />
            </div>
        </MainLayout>
    );
}
