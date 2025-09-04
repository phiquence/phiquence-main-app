
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';

export function AuthButtons() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  if (loading) {
    return <div className="h-10 w-24 rounded-md animate-pulse bg-muted" />;
  }

  if (user) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="ghost" onClick={() => router.push('/app')}>Dashboard</Button>
        <Button onClick={logout} className="bg-accent hover:bg-accent/90 text-accent-foreground">Logout</Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="ghost" asChild>
        <Link href="/login">Login</Link>
      </Button>
      <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
        <Link href="/signup">Sign Up</Link>
      </Button>
    </div>
  );
}
