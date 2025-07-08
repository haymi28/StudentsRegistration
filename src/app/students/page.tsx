'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { StudentList } from '@/components/student-list';
import { Skeleton } from '@/components/ui/skeleton';

export default function StudentsPage() {
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      router.replace('/');
    } else {
      setIsCheckingAuth(false);
    }
  }, [router]);

  if (isCheckingAuth) {
    return (
      <div className="container py-8">
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Skeleton className="h-10 w-1/3" />
                <Skeleton className="h-10 w-32" />
            </div>
            <Skeleton className="h-[400px] w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <StudentList />
    </div>
  );
}
