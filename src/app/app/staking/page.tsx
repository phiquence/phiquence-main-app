
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useUserData } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { openStake } from '@/services/staking.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, AlertTriangle, HeartHandshake, Scale, Zap, InfinityIcon } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { Switch } from '@/components/ui/switch';
import Link from 'next/link';

const stakingPackages = [
  { id: 'Harmony', name: 'Harmony', daily: 0.3, min: 50, max: 499, icon: HeartHandshake },
  { id: 'Proportion', name: 'Proportion', daily: 0.5, min: 500, max: 1999, icon: Scale },
  { id: 'Divine', name: 'Divine', daily: 0.8, min: 2000, max: 4999, icon: Zap },
  { id: 'Infinity', name: 'Infinity', daily: 1.2, min: 5000, max: 10000, icon: InfinityIcon },
];

const stakingFormSchema = z.object({
  amount: z.coerce.number().positive("Amount must be positive."),
  autoCompound: z.boolean().default(true),
});

type StakingFormValues = z.infer<typeof stakingFormSchema>;

export default function StakingPage() {
  const { user, userData, loading, error } = useUserData();
  const { toast } = useToast();
  const [selectedPackage, setSelectedPackage] = useState(stakingPackages[0]);
  const [searchParams, setSearchParams] = useState<URLSearchParams | null>(null);

  useEffect(() => {
    setSearchParams(new URLSearchParams(window.location.search));
  }, []);

  useEffect(() => {
    if (searchParams) {
      const initialPackage = searchParams.get('package');
      if(initialPackage) {
        const pkg = stakingPackages.find(p => p.id.toLowerCase() === initialPackage.toLowerCase());
        if (pkg) {
          setSelectedPackage(pkg);
        }
      }
    }
  }, [searchParams]);

  const form = useForm<StakingFormValues>({
    resolver: zodResolver(stakingFormSchema),
    defaultValues: { amount: selectedPackage.min, autoCompound: true },
  });

  useEffect(() => {
    form.reset({ amount: selectedPackage.min, autoCompound: true });
  }, [selectedPackage, form]);

  const handleStake = async (values: StakingFormValues) => {
    if (!user || !userData) return;
    const usdtBalance = userData.balances?.usdt || 0;

    if (values.amount > usdtBalance) {
      form.setError("amount", { message: "Insufficient USDT balance." });
      return;
    }
    if (values.amount < selectedPackage.min) {
        form.setError("amount", { message: `Minimum stake for this package is ${formatCurrency(selectedPackage.min)}.` });
        return;
    }
    if (selectedPackage.max !== Infinity && values.amount > selectedPackage.max) {
        form.setError("amount", { message: `Maximum stake for this package is ${formatCurrency(selectedPackage.max)}.` });
        return;
    }

    try {
      const token = await user.getIdToken();
      await openStake(token, values.amount, selectedPackage.id, values.autoCompound);
      toast({
        title: "Staking Successful",
        description: `You have successfully staked ${formatCurrency(values.amount)} in the ${selectedPackage.name} package.`,
      });
      form.reset();
    } catch (e: any) {
      console.error(e);
      toast({
        title: "Staking Failed",
        description: e.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  const formatCurrency = (amount: number = 0) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };
  
  const formatDate = (timestamp: any) => {
    if (timestamp && typeof timestamp.toDate === 'function') {
        return format(timestamp.toDate(), 'PP');
    }
    return 'Invalid Date';
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Staking</h1>
        <p className="text-muted-foreground">Grow your assets by staking them in our flexible packages.</p>
      </header>

      {loading ? (
        <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Create a New Stake</CardTitle>
                <CardDescription>Select a package and enter the amount you want to stake.</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={selectedPackage.id} onValueChange={(id) => setSelectedPackage(stakingPackages.find(p => p.id === id)!)} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
                    {stakingPackages.map(pkg => (
                      <TabsTrigger key={pkg.id} value={pkg.id}>{pkg.name}</TabsTrigger>
                    ))}
                  </TabsList>
                  {stakingPackages.map(pkg => (
                    <TabsContent key={pkg.id} value={pkg.id}>
                      <div className="p-6 bg-secondary/50 rounded-lg mt-4">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                              <div className="flex items-center gap-4">
                                  <div className="p-3 bg-primary/10 rounded-full">
                                      <pkg.icon className="h-8 w-8 text-primary" />
                                  </div>
                                  <div>
                                      <h3 className="text-2xl font-bold">{pkg.name}</h3>
                                      <p className="text-muted-foreground">Term: 365 days</p>
                                  </div>
                              </div>
                               <div className="text-center md:text-right">
                                  <p className="text-3xl font-bold text-accent">{pkg.daily}%</p>
                                  <p className="text-sm text-muted-foreground">Daily Reward</p>
                               </div>
                               <div className="text-center md:text-right">
                                  <p className="text-lg font-semibold">{formatCurrency(pkg.min)} - {pkg.max === Infinity ? 'Unlimited' : formatCurrency(pkg.max)}</p>
                                  <p className="text-sm text-muted-foreground">Staking Amount (USDT)</p>
                               </div>
                          </div>
                      </div>
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleStake)} className="space-y-6 mt-6">
                          <FormField
                            control={form.control}
                            name="amount"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Amount to Stake (USDT)</FormLabel>
                                <FormControl>
                                  <Input type="number" placeholder={`e.g., ${pkg.min}`} {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                           <FormField
                            control={form.control}
                            name="autoCompound"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                  <FormLabel className="text-base">
                                    Auto-compounding
                                  </FormLabel>
                                  <FormDescription>
                                    Automatically re-stake your daily rewards to maximize returns.
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          <Button type="submit" size="lg" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" disabled={form.formState.isSubmitting}>
                            {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Stake Now
                          </Button>
                        </form>
                      </Form>
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Your Wallet</CardTitle>
                <CardDescription>Your current available USDT balance for staking.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-primary">{formatCurrency(userData?.balances?.usdt)}</p>
              </CardContent>
              <CardFooter>
                 <Button variant="outline" className="w-full" asChild><Link href="/app/wallet">Manage Wallet</Link></Button>
              </CardFooter>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>My Active Stakes</CardTitle>
                    <CardDescription>Your ongoing staking activities.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Package</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead className="text-right">Accrued</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {userData?.stakes?.length > 0 ? (
                                    userData.stakes.map(stake => (
                                        <TableRow key={stake.id}>
                                            <TableCell className="capitalize font-medium">
                                              {stake.tier}
                                            </TableCell>
                                            <TableCell>{formatCurrency(stake.amount)}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(stake.totalAccrued)}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center text-muted-foreground h-24">You have no active stakes.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

          </div>
        </div>
      )}
    </div>
  );
}
