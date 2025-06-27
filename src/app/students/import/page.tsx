'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { BulkImportForm } from '@/components/bulk-import-form';

export default function BulkImportPage() {
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      router.replace('/login');
    } else {
      setIsCheckingAuth(false);
    }
  }, [router]);

  if (isCheckingAuth) {
    return (
        <div className="container py-8">
            <div className="space-y-4 max-w-4xl mx-auto">
                <Skeleton className="h-10 w-1/3" />
                <Skeleton className="h-12 w-1/4" />
                <Skeleton className="h-[400px] w-full" />
            </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold font-headline">Bulk Student Import</h1>
            <p className="text-muted-foreground">Paste student data in JSON format to register multiple students at once.</p>
        </div>
        <BulkImportForm />
      </div>
    </div>
  );
}
