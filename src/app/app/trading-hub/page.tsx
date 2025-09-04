
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { getUserData, UserData } from '@/services/user.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, AlertTriangle } from 'lucide-react';
import { TradingChart } from '@/components/app/trading-chart';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { joinTradingHub, placeBet } from '@/services/trading.service';

const betSchema = z.object({
  amount: z.coerce.number().positive("Amount must be positive."),
});

type BetFormValues = z.infer<typeof betSchema>;

// Mock data for UI display until backend is connected
const mockPrice = 1.618;
const mockPriceHistory = Array.from({ length: 60 }, (_, i) => ({
  time: new Date(Date.now() - (60 - i) * 60000).toISOString(),
  price: mockPrice + (Math.random() - 0.5) * 0.1,
}));

export default function TradingHubPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const form = useForm<BetFormValues>({
    resolver: zodResolver(betSchema),
    defaultValues: { amount: 1 },
  });

  useEffect(() => {
    if (user) {
      const unsubscribe = getUserData(user.uid, (data) => {
        setUserData(data);
        setLoading(false);
      }, (err) => {
        console.error(err);
        setError("Could not load user data.");
        setLoading(false);
      });
      return () => unsubscribe();
    }
  }, [user]);
  
  const handleJoin = async () => {
    if (!user) return;
    setIsJoining(true);
    try {
      const token = await user.getIdToken();
      const result = await joinTradingHub(token);
      toast({
        title: "Welcome to the Trading Hub!",
        description: result.message || "A welcome bonus has been added to your trading balance.",
      });
      // The listener on getUserData will update the UI automatically
    } catch (e: any) {
      toast({
        title: "Failed to Join",
        description: e.message || "An unexpected error occurred.",
        variant: 'destructive',
      });
    } finally {
        setIsJoining(false);
    }
  };
  
  const handlePlaceBet = async (values: BetFormValues, direction: 'rise' | 'fall') => {
    if (!user) return;
    const { amount } = values;
    
    // In a real scenario, sessionId would come from the live session data
    const sessionId = "live_session_1"; 
    
    try {
      const token = await user.getIdToken();
      await placeBet(token, sessionId, direction, amount);
      toast({
        title: "Bet Placed!",
        description: `Your ${direction} bet for ${formatCurrency(amount)} has been placed.`,
      });
      form.reset();
    } catch (e: any) {
        toast({
            title: "Bet Failed",
            description: e.message,
            variant: 'destructive',
        });
    }
  };
  
  const formatCurrency = (amount: number = 0) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  if (loading) {
    return <div className="flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
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
  
  if (!(userData as any)?.joinedTradingHub) {
    return (
        <Card className="max-w-lg mx-auto text-center">
            <CardHeader>
                <CardTitle>Join the Trading Hub</CardTitle>
                <CardDescription>Start trading with a free $5 gift credit.</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="mb-4">One-time joining bonus to get you started in the hub. This balance can only be used for trading.</p>
                <Button onClick={handleJoin} disabled={isJoining}>
                    {isJoining && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Join for Free
                </Button>
            </CardContent>
        </Card>
    )
  }

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-bold tracking-tight font-headline">Trading Hub</h1>
            <p className="text-muted-foreground">Live market data for PHI/USD.</p>
        </div>
         <div className="text-right">
            <p className="text-sm text-muted-foreground">Trading Balance</p>
            <p className="text-2xl font-bold">{formatCurrency(userData?.balances?.trading)}</p>
        </div>
      </header>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-xl">PHI/USD</CardTitle>
                    <p className="text-3xl font-bold text-primary">
                        {formatCurrency(mockPrice)}
                    </p>
                </div>
                <div className="text-right">
                    <Badge>Session Ends: 00:45</Badge>
                     <p className="text-sm font-medium text-green-500 mt-1">
                        Manual Signal
                    </p>
                </div>
            </CardHeader>
            <CardContent>
                <TradingChart data={mockPriceHistory} />
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-1">
            <Card>
                <CardHeader>
                    <CardTitle>Place Your Bet</CardTitle>
                    <CardDescription>Will the price Rise or Fall?</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form className="space-y-4 pt-4">
                             <FormField control={form.control} name="amount" render={({field}) => (
                                <FormItem>
                                    <FormLabel>Bet Amount (USD)</FormLabel>
                                    <FormControl><Input type="number" step="any" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <div className="grid grid-cols-2 gap-4">
                                <Button type="button" size="lg" className="bg-green-600 hover:bg-green-700 text-white h-20 text-2xl" onClick={form.handleSubmit(v => handlePlaceBet(v, 'rise'))} disabled={form.formState.isSubmitting}>
                                    {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Rise
                                </Button>
                                <Button type="button" size="lg" className="bg-red-600 hover:bg-red-700 text-white h-20 text-2xl" onClick={form.handleSubmit(v => handlePlaceBet(v, 'fall'))} disabled={form.formState.isSubmitting}>
                                     {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Fall
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
      </div>
      
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
                <CardHeader>
                    <CardTitle>My Open Positions</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                           <TableRow>
                               <TableHead>Direction</TableHead>
                               <TableHead>Amount</TableHead>
                               <TableHead className="text-right">Status</TableHead>
                           </TableRow>
                        </TableHeader>
                        <TableBody>
                            {/* This would be populated from tradingSessions/{sessionId}/bets */}
                            <TableRow>
                                <TableCell colSpan={3} className="text-center h-24 text-muted-foreground">No open positions in this session.</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle>Settled Positions</CardTitle>
                </CardHeader>
                <CardContent>
                   <Table>
                        <TableHeader>
                           <TableRow>
                               <TableHead>Session ID</TableHead>
                               <TableHead>Direction</TableHead>
                               <TableHead>P/L</TableHead>
                           </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow>
                                <TableCell colSpan={3} className="text-center h-24 text-muted-foreground">No settled positions yet.</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>

    </div>
  );
}
