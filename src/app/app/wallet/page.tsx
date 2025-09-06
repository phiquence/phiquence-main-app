
'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import QRCode from 'qrcode.react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, AlertTriangle, Copy, Wallet, UploadCloud } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { submitDepositRequest } from '@/services/wallet.service';
import { useUserData } from '@/hooks/use-auth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const depositSchema = z.object({
  amount: z.coerce.number().positive("Amount must be positive."),
  txHash: z.string().min(10, "Please enter a valid transaction hash."),
});
type DepositFormValues = z.infer<typeof depositSchema>;

export default function WalletPage() {
  const { user } = useAuth();
  const { userData, loading: userDataLoading, error: userDataError } = useUserData();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const depositAddress = userData?.wallets?.usdt_bep20;

  const copyToClipboard = () => {
    if(!depositAddress) return;
    navigator.clipboard.writeText(depositAddress);
    toast({ title: "Address Copied!", description: "The deposit address has been copied to your clipboard." });
  };

  const form = useForm<DepositFormValues>({
    resolver: zodResolver(depositSchema),
    defaultValues: { amount: 0, txHash: "" },
  });

  const handleDepositRequest = async (values: DepositFormValues) => {
      if (!user) return;
      setIsLoading(true);
      try {
          const token = await user.getIdToken();
          await submitDepositRequest(token, values.amount, 'USDT', values.txHash);
          toast({
              title: "Request Submitted",
              description: "Your deposit request has been submitted for review. It may take some time to reflect in your balance.",
          });
          form.reset();
      } catch (e: any) {
          toast({
              title: "Submission Failed",
              description: e.message || "An unexpected error occurred.",
              variant: "destructive",
          });
      } finally {
          setIsLoading(false);
      }
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight font-headline">My Wallet</h1>
        <p className="text-muted-foreground">Manage your funds and transactions.</p>
      </header>

      <Tabs defaultValue="deposit" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="deposit">Deposit</TabsTrigger>
            <TabsTrigger value="withdraw" disabled>Withdraw (Coming Soon)</TabsTrigger>
        </TabsList>
        <TabsContent value="deposit">
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Wallet /> Your Deposit Address</CardTitle>
                        <CardDescription>
                            Use this QR code or address to deposit USDT (BEP20 Network).
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="text-center">
                    {userDataLoading ? (
                        <div className="space-y-6 pt-4">
                            <div className="p-4 bg-muted rounded-lg flex justify-center animate-pulse h-[232px] w-[232px] mx-auto"></div>
                            <div className="flex gap-2"><Input readOnly className="text-center text-sm bg-muted animate-pulse" /><Button variant="outline" size="icon" disabled><Copy className="h-4 w-4" /></Button></div>
                        </div>
                    ) : !depositAddress ? (
                        <Alert variant="destructive"><AlertTriangle className="h-4 w-4" /><AlertTitle>Address Not Found</AlertTitle><AlertDescription>Your deposit address is not yet assigned. Please contact support.</AlertDescription></Alert>
                    ) : (
                        <div className="space-y-6 pt-4 animate-in fade-in-50">
                        <div className="p-4 bg-background rounded-lg flex justify-center">
                            <QRCode value={depositAddress} size={200} bgColor="hsl(var(--background))" fgColor="hsl(var(--foreground))" />
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">Send only USDT (BEP20) to this address:</p>
                            <div className="flex gap-2">
                                <Input readOnly value={depositAddress} className="text-center text-sm bg-muted" />
                                <Button variant="outline" size="icon" onClick={copyToClipboard}>
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                        <Alert>
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>Important!</AlertTitle>
                            <AlertDescription>
                                Sending any other asset to this address may result in the permanent loss of your funds.
                            </AlertDescription>
                        </Alert>
                        </div>
                    )}
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><UploadCloud /> Manual Deposit Request</CardTitle>
                        <CardDescription>
                            If your deposit is not automatically reflected, you can submit a manual request here.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(handleDepositRequest)} className="space-y-4">
                                <FormField control={form.control} name="amount" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Amount (USDT)</FormLabel>
                                        <FormControl><Input type="number" placeholder="e.g., 100.00" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                                <FormField control={form.control} name="txHash" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Transaction Hash (TxID)</FormLabel>
                                        <FormControl><Input placeholder="0x..." {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                                <Button type="submit" disabled={isLoading} className="w-full">
                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                                    Submit Request
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
             </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
