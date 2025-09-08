import Link from 'next/link';
import { cn } from '@/lib/utils';
import Image from 'next/image';

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("flex items-center gap-2", className)} aria-label="Back to homepage">
      <span className="hidden sm:inline-block text-xl font-bold text-primary-foreground tracking-tight group-data-[state=collapsed]:hidden">
        የተማሪዎች መመዝገቢያ ቅጽ
      </span>
    </Link>
  );
}
