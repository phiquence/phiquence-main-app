
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import QRCode from 'qrcode.react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, AlertTriangle, Copy, Wallet, UploadCloud, ArrowDownLeft, ArrowUpRight, Cpu } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { submitDepositRequest, getDepositAddress } from '@/services/wallet.service';
import { useUserData } from '@/hooks/use-auth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Web3Deposit } from '@/components/app/web3-deposit';

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
  const [depositAddress, setDepositAddress] = useState<string | null>(null);
  const [isAddressLoading, setIsAddressLoading] = useState(true);

  useEffect(() => {
    const fetchAddress = async () => {
      if (user) {
        try {
          setIsAddressLoading(true);
          const token = await user.getIdToken();
          const data = await getDepositAddress(token);
          setDepositAddress(data.address);
        } catch (error: any) {
          toast({
            title: "Could not fetch deposit address",
            description: error.message || "Please try again later.",
            variant: "destructive"
          });
        } finally {
          setIsAddressLoading(false);
        }
      }
    };
    fetchAddress();
  }, [user, toast]);


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
        <p className="text-muted-foreground">Manage your funds and view your transaction history.</p>
      </header>

      <Tabs defaultValue="deposit" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="deposit"><ArrowDownLeft className="mr-2 h-4 w-4" />Deposit</TabsTrigger>
            <TabsTrigger value="withdraw" disabled><ArrowUpRight className="mr-2 h-4 w-4" />Withdraw (Soon)</TabsTrigger>
        </TabsList>
        <TabsContent value="deposit">
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Wallet /> Option 1: Manual Deposit</CardTitle>
                        <CardDescription>
                            Use this QR code or address to deposit USDT (BEP20 Network) from any exchange or wallet.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="text-center">
                    {isAddressLoading ? (
                        <div className="flex flex-col items-center justify-center space-y-4 pt-4 h-[350px]">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <p className="text-muted-foreground">Generating your unique address...</p>
                        </div>
                    ) : !depositAddress ? (
                        <Alert variant="destructive"><AlertTriangle className="h-4 w-4" /><AlertTitle>Address Not Found</AlertTitle><AlertDescription>Your deposit address could not be generated. Please contact support.</AlertDescription></Alert>
                    ) : (
                        <div className="space-y-6 pt-4 animate-in fade-in-50">
                        <div className="p-4 bg-background rounded-lg flex justify-center border">
                            <QRCode value={depositAddress} size={180} bgColor="hsl(var(--background))" fgColor="hsl(var(--foreground))" />
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
                            <UploadCloud className="h-4 w-4" />
                            <AlertTitle>After Sending, Submit Manually</AlertTitle>
                            <AlertDescription>
                                Once your transaction is confirmed on the blockchain, please submit a manual deposit request below so our team can verify it.
                            </AlertDescription>
                        </Alert>
                        </div>
                    )}
                    </CardContent>
                </Card>
                 <div className="space-y-8">
                    <Card>
                        <CardHeader>
                           <CardTitle className="flex items-center gap-2"><Cpu /> Option 2: Web3 Direct Deposit</CardTitle>
                            <CardDescription>
                                Connect your MetaMask or other Web3 wallet to deposit funds directly.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                           <Web3Deposit />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><UploadCloud /> Submit Manual Deposit Request</CardTitle>
                            <CardDescription>
                                Use this form if you used Option 1 or if your Web3 deposit isn't reflected automatically.
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
                                        Submit Request for Review
                                    </Button>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                 </div>
             </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

    