'use client';

import { StudentList } from '@/components/student-list';

export default function StudentsPage() {
  return (
    <div className="container py-8 flex flex-col items-center">
      <StudentList />
    </div>
  );
}
