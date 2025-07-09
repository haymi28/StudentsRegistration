import Link from 'next/link';
import { BookCopy } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("flex items-center gap-2", className)} aria-label="Back to homepage">
      <div className="p-2 bg-primary-foreground rounded-lg">
        <BookCopy className="h-6 w-6 text-primary" />
      </div>
      <span className="hidden sm:inline-block text-xl font-bold text-primary-foreground tracking-tight group-data-[state=collapsed]:hidden">
        የተማሪዎች መመዝገቢያ ቅጽ
      </span>
    </Link>
  );
}
