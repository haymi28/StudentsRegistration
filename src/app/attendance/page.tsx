'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AttendanceTracker } from '@/components/attendance-tracker';
import { Skeleton } from '@/components/ui/skeleton';
import { AttendanceHistory } from '@/components/attendance-history';
import { mockAttendanceRecords, type AttendanceRecord } from '@/lib/mock-data';

export default function AttendancePage() {
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [records, setRecords] = useState<AttendanceRecord[]>(mockAttendanceRecords);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      router.replace('/login');
    } else {
      setIsCheckingAuth(false);
    }
  }, [router]);

  const handleAddAttendance = (newRecord: Omit<AttendanceRecord, 'id'>) => {
    const recordWithId: AttendanceRecord = {
      ...newRecord,
      id: `att-${Date.now()}`,
    };
    setRecords((prevRecords) => [recordWithId, ...prevRecords]);
  };

  if (isCheckingAuth) {
    return (
      <div className="container py-8">
        <div className="space-y-4">
            <Skeleton className="h-10 w-1/3" />
            <Skeleton className="h-96 w-full" />
            <Skeleton className="h-96 w-full mt-8" />
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6 font-headline">Daily Attendance</h1>
      <AttendanceTracker onAttendanceSubmit={handleAddAttendance} />
      <AttendanceHistory records={records} />
    </div>
  );
}
