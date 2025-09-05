
'use client';

import { useState, useEffect, Suspense } from 'react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Copy, Loader2, Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import TeamSummary from '@/components/app/TeamSummary';

function AffiliateDashboard() {
  const [referralLink, setReferralLink] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (currentUser) {
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
        const link = `${siteUrl}/signup?ref=${currentUser.uid}`;
        setReferralLink(link);
      } else {
        setReferralLink('');
      }
    });
    return () => unsubscribe();
  }, []);

  const copyLink = () => {
    if (referralLink) {
      navigator.clipboard.writeText(referralLink);
      toast({
        title: "Referral Link Copied!",
        description: "The link has been copied to your clipboard.",
      });
    }
  };
  
  if (loading) {
    return (
        <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    )
  }

  if (!user) {
    return <p>Please log in to see your affiliate dashboard.</p>;
  }

  return (
    <div className="space-y-8">
       <header>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Affiliate Center</h1>
        <p className="text-muted-foreground">Track your network, earnings, and share your link.</p>
      </header>

      <TeamSummary />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Share2 /> Your Referral Link</CardTitle>
          <CardDescription>Share this link with your friends to build your team and earn commissions.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-2">
            <Input 
              type="text" 
              value={referralLink} 
              readOnly 
              className="flex-grow text-base"
            />
            <Button onClick={copyLink} className="w-full sm:w-auto">
              <Copy className="mr-2 h-4 w-4" />
              Copy Link
            </Button>
          </div>
        </CardContent>
      </Card>
      
    </div>
  );
}


export default function AffiliatePage() {
    return (
        <Suspense fallback={<Loader2 className="h-8 w-8 animate-spin text-primary" />}>
            <AffiliateDashboard />
        </Suspense>
    )
}
