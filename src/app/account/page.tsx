'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AccountPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/students');
  }, [router]);

  return null;
}
