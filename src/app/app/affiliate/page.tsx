
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { getAffiliateStats, getAffiliateNetwork, getCommissionHistory, AffiliateStats, AffiliateMember, CommissionLog } from '@/services/affiliate.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, AlertTriangle, Users, DollarSign, Award, Copy, Share2, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

function StatCard({ icon: Icon, title, value, footer }: { icon: React.ElementType, title: string, value: string | number, footer: string }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {title}
        </CardTitle>
        <Icon className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">
          {footer}
        </p>
      </CardContent>
    </Card>
  );
}

export default function AffiliatePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<AffiliateStats | null>(null);
  const [network, setNetwork] = useState<AffiliateMember[]>([]);
  const [commissions, setCommissions] = useState<CommissionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [referralLink, setReferralLink] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined' && user) {
        setReferralLink(`${window.location.origin}/signup?ref=${user?.uid}`);
    }
  }, [user]);


  useEffect(() => {
    if (user) {
      const fetchData = async () => {
        try {
          const unsubscribeStats = getAffiliateStats(user.uid, setStats, (e) => { throw e; });
          const unsubscribeNetwork = getAffiliateNetwork(user.uid, setNetwork, (e) => { throw e; });
          const unsubscribeCommissions = getCommissionHistory(user.uid, setCommissions, (e) => { throw e; });
          
          setLoading(false);

          return () => {
            unsubscribeStats();
            unsubscribeNetwork();
            unsubscribeCommissions();
          }

        } catch (err) {
          console.error(err);
          setError("Could not fetch affiliate information.");
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [user]);

  const copyToClipboard = () => {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast({ title: "Copied to clipboard!" });
    setTimeout(() => setCopied(false), 2000);
  };

  const shareLink = () => {
     if(navigator.share && referralLink) {
        navigator.share({
            title: 'Join me on Phiquence!',
            text: `Join me on Phiquence and start your financial growth journey.`,
            url: referralLink
        }).catch(err => console.error("Sharing failed", err));
     } else {
        copyToClipboard();
     }
  }
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };
  
  const formatDate = (timestamp: any) => {
    if (timestamp && typeof timestamp.toDate === 'function') {
        return format(timestamp.toDate(), 'PP');
    }
    return 'N/A';
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="bg-destructive/10 border-destructive">
        <CardHeader className="flex flex-row items-center gap-4">
          <AlertTriangle className="h-8 w-8 text-destructive"/>
          <div>
            <CardTitle className="text-destructive">Error</CardTitle>
            <CardDescription className="text-destructive/80">{error}</CardDescription>
          </div>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Affiliate Center</h1>
        <p className="text-muted-foreground">Track your network, earnings, and growth.</p>
      </header>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard icon={Users} title="Total Referrals" value={stats?.totalReferrals || 0} footer="Your entire network" />
        <StatCard icon={DollarSign} title="Total Commission" value={formatCurrency(stats?.totalCommission || 0)} footer="Earnings from all levels" />
        <StatCard icon={Award} title="Current Rank" value={stats?.rank || 'Beginner'} footer="Unlock more benefits" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Referral Link</CardTitle>
          <CardDescription>Share this link to invite new members to your network.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-2">
            <input type="text" readOnly value={referralLink} className="flex-1 p-2 border rounded-md bg-muted text-muted-foreground"/>
            <div className="flex gap-2">
                <Button onClick={copyToClipboard} variant="outline">
                    {copied ? <Check className="mr-2" /> : <Copy className="mr-2" />}
                    {copied ? 'Copied' : 'Copy'}
                </Button>
                <Button onClick={shareLink}>
                    <Share2 className="mr-2" />
                    Share
                </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <Card>
            <CardHeader>
              <CardTitle>My Network</CardTitle>
              <CardDescription>Members you have directly and indirectly referred.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                   <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Member</TableHead>
                        <TableHead>Level</TableHead>
                        <TableHead>Join Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {network.length > 0 ? (
                        network.map(member => (
                          <TableRow key={member.id}>
                            <TableCell className="font-medium">{member.name}</TableCell>
                            <TableCell>
                               <Badge variant="secondary">Level {member.level}</Badge>
                            </TableCell>
                            <TableCell>{formatDate(member.joinDate)}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center h-24 text-muted-foreground">Your network is empty. Start sharing your link!</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
            </CardContent>
          </Card>
          
           <Card>
            <CardHeader>
              <CardTitle>Commission History</CardTitle>
              <CardDescription>Your recent commission earnings.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Amount</TableHead>
                        <TableHead>From</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {commissions.length > 0 ? (
                        commissions.map(log => (
                          <TableRow key={log.id}>
                            <TableCell className="font-medium text-green-500">{formatCurrency(log.amount)}</TableCell>
                            <TableCell>{log.fromUser}</TableCell>
                            <TableCell>{formatDate(log.date)}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                         <TableRow>
                          <TableCell colSpan={3} className="text-center h-24 text-muted-foreground">No commission history yet.</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
              </div>
            </CardContent>
          </Card>
      </div>

    </div>
  );
}
