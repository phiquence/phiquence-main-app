
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, DollarSign, Users, Zap, Loader2, AlertTriangle, Star, CheckCircle, BarChart3, TrendingUp, Bell, ShieldAlert, BadgeHelp, Crown, Award, Megaphone } from "lucide-react";
import Link from "next/link";
import { useUserData } from "@/hooks/use-auth";
import { TradingChart } from "@/components/app/trading-chart";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";


function StatCard({ icon: Icon, title, value, footer, valueClassName, isLoading }: { icon: React.ElementType, title: string, value: string | number, footer: string, valueClassName?: string, isLoading: boolean }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
            <>
                <Skeleton className="h-8 w-3/4 mb-2" />
                <Skeleton className="h-3 w-1/2" />
            </>
        ) : (
            <>
                <div className={`text-2xl font-bold ${valueClassName}`}>{value}</div>
                <p className="text-xs text-muted-foreground">
                {footer}
                </p>
            </>
        )}
      </CardContent>
    </Card>
  );
}

function FounderDashboard({ userData, loading, formatCurrency }: { userData: any, loading: boolean, formatCurrency: (amount?: number) => string }) {
    const teamStats = userData?.teamStats || { directs: 0, total: 0, dailyIncome: 0};
    
    return (
         <div className="space-y-8">
            <header className="relative overflow-hidden rounded-xl p-8 bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white shadow-2xl">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 opacity-10">
                    <Crown className="h-48 w-48 text-yellow-400" />
                </div>
                <div className="relative">
                     <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-headline mb-2 text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-500">
                        Founder's Dashboard
                    </h1>
                    <p className="text-base sm:text-lg text-gray-300 max-w-3xl">
                        Welcome, {loading ? <Skeleton className="h-6 w-32 inline-block bg-gray-600" /> : (userData?.name || 'Honored Founder')}! Access your exclusive tools and insights.
                    </p>
                </div>
            </header>
            
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="bg-gray-800 border-gray-700 text-white">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-yellow-400">Daily Founder Reward</CardTitle>
                        <Zap className="h-5 w-5 text-yellow-400" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-bold">1.2%</p>
                        <p className="text-xs text-gray-400">Guaranteed daily reward on your stake.</p>
                    </CardContent>
                </Card>
                 <Card className="bg-gray-800 border-gray-700 text-white">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-yellow-400">Monthly Founder Bonus</CardTitle>
                        <Award className="h-5 w-5 text-yellow-400" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-bold">5-10%</p>
                        <p className="text-xs text-gray-400">Performance-based monthly bonus.</p>
                    </CardContent>
                </Card>
                 <Card className="bg-gray-800 border-gray-700 text-white">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-yellow-400">Total Pending Rewards</CardTitle>
                        <DollarSign className="h-5 w-5 text-yellow-400" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-bold">{formatCurrency(userData?.balances?.reward)}</p>
                        <p className="text-xs text-gray-400">From all sources.</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Real-time Reward Tracking</CardTitle>
                    <CardDescription>Live updates on when and how your rewards are being added.</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="h-[400px] flex items-center justify-center">
                             <Skeleton className="h-full w-full" />
                        </div>
                    ) : (
                        <TradingChart data={[]} />
                    )}
                </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card>
                  <CardHeader>
                      <CardTitle>Team Snapshot</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-3 gap-4 text-center">
                      {loading ? (
                          <>
                            <StatSkeleton />
                            <StatSkeleton />
                            <StatSkeleton />
                          </>
                      ) : (
                        <>
                          <div>
                              <p className="text-2xl font-bold">{teamStats.directs}</p>
                              <p className="text-sm text-muted-foreground">Directs</p>
                          </div>
                           <div>
                              <p className="text-2xl font-bold">{teamStats.total}</p>
                              <p className="text-sm text-muted-foreground">Total Team</p>
                          </div>
                           <div>
                              <p className="text-2xl font-bold text-green-500">{formatCurrency(teamStats.dailyIncome)}</p>
                              <p className="text-sm text-muted-foreground">Today's Income</p>
                          </div>
                        </>
                      )}
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full" asChild>
                        <Link href="/app/affiliate">View Affiliate Center</Link>
                    </Button>
                  </CardFooter>
               </Card>
               
               <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Megaphone className="text-primary"/> Founder Announcements</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Alert>
                            <ShieldAlert className="h-4 w-4" />
                            <AlertTitle>Q4 Roadmap Briefing</AlertTitle>
                            <AlertDescription>
                            An exclusive briefing on the upcoming Q4 roadmap will be held for all Founder members next week.
                            </AlertDescription>
                        </Alert>
                    </CardContent>
                </Card>
            </div>
         </div>
    );
}


function RegularDashboard({ userData, loading, error, formatCurrency }: { userData: any, loading: boolean, error: string | null, formatCurrency: (amount?: number) => string }) {
  const balances = userData?.balances || { usdt: 0, bnb: 0, phi: 0, reward: 0, commission: 0, trading: 0 };
  const teamStats = userData?.teamStats || { directs: 0, total: 0, dailyIncome: 0};
  
  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">Dashboard</h1>
           <div className="text-muted-foreground">Welcome back, {loading ? <Skeleton className="h-4 w-24 inline-block" /> : (userData?.name || 'User')}!</div>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" asChild>
                <Link href="/app/wallet">Deposit</Link>
           </Button>
           <Button className="bg-accent hover:bg-accent/90 text-accent-foreground" asChild>
                <Link href="/app/staking">Stake Now</Link>
           </Button>
        </div>
      </header>
      
      {error ? (
         <Card className="bg-destructive/10 border-destructive">
            <CardHeader className="flex flex-row items-center gap-4">
                <AlertTriangle className="h-8 w-8 text-destructive"/>
                <div>
                    <CardTitle className="text-destructive">Error</CardTitle>
                    <CardDescription className="text-destructive/80">{error}</CardDescription>
                </div>
            </CardHeader>
        </Card>
      ) : (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                <StatCard 
                    icon={DollarSign}
                    title="USDT Balance"
                    value={formatCurrency(balances.usdt)}
                    footer="Main wallet"
                    isLoading={loading}
                />
                 <StatCard 
                    icon={Zap}
                    title="PHI Balance"
                    value={balances.phi?.toLocaleString() || 0}
                    footer="Native token"
                    isLoading={loading}
                />
                 <StatCard 
                    icon={DollarSign}
                    title="BNB Balance"
                    value={balances.bnb?.toLocaleString() || 0}
                    footer="Gas & Fees"
                    isLoading={loading}
                />
                 <StatCard 
                    icon={TrendingUp}
                    title="Trading Balance"
                    value={formatCurrency(balances.trading)}
                    footer="Hub funds"
                    isLoading={loading}
                    valueClassName="text-primary"
                />
                 <StatCard 
                    icon={DollarSign}
                    title="Pending Rewards"
                    value={formatCurrency(balances.reward)}
                    footer="From staking & commissions"
                    isLoading={loading}
                />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Today's Rewards</CardTitle>
                    <CardDescription>7-day and 30-day reward chart</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="h-[400px] flex items-center justify-center">
                             <Skeleton className="h-full w-full" />
                        </div>
                    ) : (
                        <TradingChart data={[]} />
                    )}
                </CardContent>
            </Card>
        </>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
           <Card>
              <CardHeader>
                  <CardTitle>Team Snapshot</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-3 gap-4 text-center">
                  {loading ? (
                      <>
                        <StatSkeleton />
                        <StatSkeleton />
                        <StatSkeleton />
                      </>
                  ) : (
                    <>
                      <div>
                          <p className="text-2xl font-bold">{teamStats.directs}</p>
                          <p className="text-sm text-muted-foreground">Directs</p>
                      </div>
                       <div>
                          <p className="text-2xl font-bold">{teamStats.total}</p>
                          <p className="text-sm text-muted-foreground">Total Team</p>
                      </div>
                       <div>
                          <p className="text-2xl font-bold text-green-500">{formatCurrency(teamStats.dailyIncome)}</p>
                          <p className="text-sm text-muted-foreground">Today's Income</p>
                      </div>
                    </>
                  )}
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" asChild>
                    <Link href="/app/affiliate">View Affiliate Center</Link>
                </Button>
              </CardFooter>
           </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Bell /> Notices</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Alert>
                        <ShieldAlert className="h-4 w-4" />
                        <AlertTitle>Scheduled Maintenance</AlertTitle>
                        <AlertDescription>
                        The platform will be down for scheduled maintenance on Friday. Staking rewards will not be affected.
                        </AlertDescription>
                    </Alert>
                </CardContent>
            </Card>

        </div>

        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Join Trading Hub</CardTitle>
                    <CardDescription>Get a free $5 credit to start trading when you join.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="mb-4">Experience the thrill of the market and test your skills in our simulated trading environment.</p>
                    <Button asChild className="w-full">
                        <Link href="/app/trading-hub">Join Trading Hub</Link>
                    </Button>
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>AI Support</CardTitle>
                    <CardDescription>Have a question? Get instant answers from our AI assistant.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="mb-4">Navigate to our support page to ask questions about your account, staking, or any other features.</p>
                     <Button asChild>
                       <Link href="/app/support" className="inline-flex items-center gap-2">
                          <BadgeHelp className="h-4 w-4"/>
                          Go to Support
                       </Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}


export default function DashboardPage() {
  const { userData, loading, error } = useUserData();

  const formatCurrency = (amount: number = 0) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };
  
  if (loading) {
    return (
        <div className="flex items-center justify-center p-8">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
    );
  }
  
  if (userData?.isFounder) {
    return <FounderDashboard userData={userData} loading={loading} formatCurrency={formatCurrency} />;
  }
  
  return <RegularDashboard userData={userData} loading={loading} error={error} formatCurrency={formatCurrency} />;
}

const StatSkeleton = () => (
    <div>
        <Skeleton className="h-8 w-1/2 mx-auto mb-2" />
        <Skeleton className="h-4 w-3/4 mx-auto" />
    </div>
);
