
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useUserData } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Copy, Loader2 } from 'lucide-react';
import TeamSummary from '@/components/app/TeamSummary';
import { Skeleton } from '@/components/ui/skeleton';

function AffiliateContent() {
  const { user, loading: authLoading } = useAuth();
  const { userData, loading: userDataLoading } = useUserData();
  const [referralLink, setReferralLink] = useState('');
  
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : '');

  useEffect(() => {
    if (user?.uid && siteUrl) {
      const link = `${siteUrl}/signup?ref=${user.uid}`;
      setReferralLink(link);
    }
  }, [user, siteUrl]);

  const copyLink = () => {
    if (referralLink) {
      navigator.clipboard.writeText(referralLink);
      alert("Referral link copied to clipboard!");
    }
  };

  const isLoading = authLoading || userDataLoading;

  if (isLoading) {
    return <div className="flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }
  
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Affiliate Center</h1>
        <p className="text-muted-foreground">Track your team's growth and your commission earnings.</p>
      </header>

      <TeamSummary />

      <Card>
        <CardHeader>
          <CardTitle>Your Unique Referral Link</CardTitle>
          <CardDescription>Share this link with your friends to build your team and earn commissions.</CardDescription>
        </CardHeader>
        <CardContent>
          {referralLink ? (
            <div className="flex gap-2">
              <Input 
                type="text" 
                value={referralLink} 
                readOnly 
              />
              <Button onClick={copyLink} size="icon">
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          ) : (
             <div className="flex gap-2">
                <Skeleton className="h-10 flex-1" />
                <Skeleton className="h-10 w-10" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Placeholder for future tables */}
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
                <CardHeader>
                    <CardTitle>My Network</CardTitle>
                    <CardDescription>Members who have joined using your link.</CardDescription>
                </CardHeader>
                <CardContent>
                   <p className="text-center text-muted-foreground py-8">Your network list will appear here soon.</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Commission History</CardTitle>
                     <CardDescription>Recent commissions you have earned.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-center text-muted-foreground py-8">Your commission history will appear here soon.</p>
                </CardContent>
            </Card>
        </div>

    </div>
  );
}


export default function AffiliatePage() {
    return (
        <Suspense fallback={<Loader2 className="h-8 w-8 animate-spin mx-auto" />}>
            <AffiliateContent />
        </Suspense>
    )
}
