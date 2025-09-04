import Link from 'next/link';
import { CircleDollarSign } from 'lucide-react';

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2" aria-label="Phiquence Home">
        <CircleDollarSign className="h-8 w-8 text-primary" />
        <span className="text-2xl font-bold tracking-tighter text-foreground">
            PHIQUENCE
        </span>
    </Link>
  );
}
