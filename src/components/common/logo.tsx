import Link from 'next/link';
import { BookCopy } from 'lucide-react';

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2" aria-label="Back to homepage">
      <div className="p-2 bg-primary rounded-lg">
        <BookCopy className="h-6 w-6 text-primary-foreground" />
      </div>
      <span className="hidden sm:inline-block text-xl font-bold text-primary tracking-tight">
        የተማሪዎች መመዝገቢያ ቅጽ
      </span>
    </Link>
  );
}
