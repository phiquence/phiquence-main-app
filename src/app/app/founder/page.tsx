
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { getUserData, UserData } from '@/services/user.service';
import { becomeFounder } from '@/services/founder.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle, Crown, Star, Zap, CheckCircle, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useUserData } from '@/hooks/use-auth';

const FOUNDER_COST = 5000;

export default function FounderPage() {
  const { user } = useAuth();
  const { userData, loading, error } = useUserData();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleBecomeFounder = async () => {
    if (!user) return;
    setIsProcessing(true);
    try {
        const token = await user.getIdToken();
        const result = await becomeFounder(token);
        toast({
            title: "Congratulations, Founder!",
            description: result.message,
        });
    } catch(e: any) {
        toast({
            title: "Becoming Founder Failed",
            description: e.message || "An unexpected error occurred.",
            variant: "destructive",
        });
    } finally {
        setIsProcessing(false);
    }
  };

  const formatCurrency = (amount: number = 0) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  const isFounder = userData?.isFounder || false;
  const usdtBalance = userData?.balances?.usdt || 0;
  const canAfford = usdtBalance >= FOUNDER_COST;

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
          <AlertTriangle className="h-8 w-8 text-destructive" />
          <div>
            <CardTitle className="text-destructive">Error</CardTitle>
            <CardDescription className="text-destructive/80">{error}</CardDescription>
          </div>
        </CardHeader>
      </Card>
    );
  }
  
  if (isFounder) {
    return (
        <div className="flex flex-col items-center justify-center text-center space-y-6 p-8 rounded-xl bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
            <Crown className="h-24 w-24 text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]"/>
            <h1 className="text-4xl font-bold tracking-tight font-headline text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-500">Welcome, Honored Founder!</h1>
            <p className="text-lg text-gray-300 max-w-2xl">
                You are one of the core pillars of the Phiquence ecosystem. Your contribution and vision are building the future of finance. Thank you for your trust and leadership.
            </p>
            <Button asChild className="bg-yellow-400 hover:bg-yellow-500 text-black">
                <Link href="/app">Go to Dashboard</Link>
            </Button>
        </div>
    )
  }

  return (
    <div className="space-y-8">
       <div className="relative overflow-hidden rounded-xl p-8 bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white shadow-2xl">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 opacity-10">
                <Crown className="h-48 w-48 text-yellow-400" />
            </div>
            <div className="relative">
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-headline mb-4">
                    Join the <span className="text-yellow-400">Founder's Club</span>
                </h1>
                <p className="text-base sm:text-lg text-gray-300 max-w-3xl">
                    Become a pillar of the Phiquence community and unlock exclusive benefits by becoming a Founder Member. This is a one-time opportunity to secure your legacy.
                </p>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <BenefitCard icon={Star} title="Priority Access" description="Get early access to new features, staking packages, and investment opportunities before anyone else." />
            <BenefitCard icon={Zap} title="Increased Rewards" description="Receive exclusive airdrops and a permanent boost on specific commission types." />
            <BenefitCard icon={ShieldCheck} title="Governance & Voting" description="Play a key role in the future of Phiquence by voting on major platform decisions." />
        </div>
        
        <Card className="bg-gray-900/50 border-gray-700 text-white">
            <CardHeader className="text-center">
                <CardTitle className="text-2xl sm:text-3xl">Secure Your Founder Status</CardTitle>
                <CardDescription className="text-gray-400">A one-time contribution of 5,000 USDT.</CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
                <div className="p-6 rounded-lg bg-gray-800 border border-gray-700">
                    <p className="text-gray-400">Your Current USDT Balance</p>
                    <p className={`text-3xl sm:text-4xl font-bold ${canAfford ? 'text-green-400' : 'text-red-400'}`}>
                        {formatCurrency(usdtBalance)}
                    </p>
                </div>
                 {!canAfford && (
                    <Alert variant="destructive" className="bg-red-900/50 border-red-700 text-white">
                        <AlertTriangle className="h-4 w-4 text-red-400" />
                        <AlertTitle className="text-red-400">Insufficient Balance</AlertTitle>
                        <AlertDescription>
                            You need {formatCurrency(FOUNDER_COST - usdtBalance)} more USDT to become a founder.
                           <Link href="/app/wallet" className="font-bold underline ml-2">Deposit Now</Link>
                        </AlertDescription>
                    </Alert>
                )}
            </CardContent>
            <CardFooter>
                 <AlertDialog>
                    <AlertDialogTrigger asChild>
                       <Button 
                            className="w-full h-12 sm:h-14 text-lg sm:text-xl font-bold bg-gradient-to-r from-yellow-400 to-amber-500 text-black shadow-lg hover:shadow-yellow-400/30 transition-shadow duration-300" 
                            disabled={!canAfford || isProcessing}
                        >
                            {isProcessing ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : <Crown className="mr-2" />}
                            Become a Founder for {formatCurrency(FOUNDER_COST)}
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Your Founder Membership</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will deduct {formatCurrency(FOUNDER_COST)} USDT from your balance. This action is permanent and cannot be undone. Are you sure you want to proceed?
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleBecomeFounder} disabled={isProcessing}>
                            {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Confirm & Become Founder
                        </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </CardFooter>
        </Card>
    </div>
  );
}


const BenefitCard = ({ icon: Icon, title, description }: { icon: React.ElementType, title: string, description: string }) => (
    <Card className="bg-gray-800 border-gray-700 text-white p-6 text-center hover:border-yellow-400/50 hover:bg-gray-700/50 transition-all">
        <div className="flex justify-center mb-4">
            <div className="p-4 bg-gray-700 rounded-full">
                <Icon className="h-8 w-8 text-yellow-400" />
            </div>
        </div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-gray-400 text-sm">{description}</p>
    </Card>
)
