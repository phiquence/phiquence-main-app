
import Link from 'next/link';
import Image from 'next/image';

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2" aria-label="Phiquence Home">
        <Image src="/logo.png" alt="Phiquence Logo" width={32} height={32} />
        <span className="text-2xl font-bold tracking-tighter text-foreground">
            PHIQUENCE
        </span>
    </Link>
  );
}
