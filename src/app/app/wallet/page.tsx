
'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import QRCode from 'qrcode.react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, AlertTriangle, Copy } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function WalletPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [depositAddress, setDepositAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const getDepositAddress = async () => {
    setIsLoading(true);
    setError('');
    try {
      if (!user) throw new Error("Please log in to see your address.");

      const token = await user.getIdToken();
      const response = await fetch('/api/wallet/deposit-address', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();
      if (!result.ok) throw new Error(result.error);

      setDepositAddress(result.address);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(depositAddress);
    toast({ title: "Address Copied!", description: "The deposit address has been copied to your clipboard." });
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight font-headline">My Wallet</h1>
        <p className="text-muted-foreground">Generate your unique address to deposit funds.</p>
      </header>

      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Deposit USDT (BEP20)</CardTitle>
          <CardDescription>
            Click the button below to view your personal deposit address.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          {!depositAddress ? (
            <Button onClick={getDepositAddress} disabled={isLoading} size="lg">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                'Show My Deposit Address'
              )}
            </Button>
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

          {error && (
            <Alert variant="destructive" className="mt-4 text-left">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
