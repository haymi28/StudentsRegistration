import Link from 'next/link';
import { cn } from '@/lib/utils';
import Image from 'next/image';

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("flex items-center gap-2", className)} aria-label="Back to homepage">
      <div className="p-1 bg-primary-foreground rounded-lg flex items-center justify-center">
        <Image 
            src="https://debregelila.org/wp-content/uploads/2024/09/Debre-Gelila-Logo-1.png" 
            alt="Debre Gelila Logo" 
            width={32} 
            height={32}
            data-ai-hint="church logo"
        />
      </div>
      <span className="hidden sm:inline-block text-xl font-bold text-primary-foreground tracking-tight group-data-[state=collapsed]:hidden">
        የተማሪዎች መመዝገቢያ ቅጽ
      </span>
    </Link>
  );
}
