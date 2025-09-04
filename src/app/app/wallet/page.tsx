
'use client';

import { useUserData } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, AlertTriangle, ArrowUpRight, ArrowDownLeft, MinusSquare, CircleDollarSign, Users } from 'lucide-react';
import { format } from 'date-fns';
import { getTransactionIcon, getTransactionColor } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Web3Deposit } from '@/components/app/web3-deposit';


export default function WalletPage() {
  const { userData, transactions, loading, error } = useUserData();
  
  const formatCurrency = (amount: number = 0) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };
  
  const formatDate = (timestamp: any) => {
    if (timestamp && typeof timestamp.toDate === 'function') {
        return format(timestamp.toDate(), 'PPp');
    }
    return 'Invalid Date';
  }

  const balances = userData?.balances;

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
        <h1 className="text-3xl font-bold tracking-tight font-headline">My Wallet</h1>
        <p className="text-muted-foreground">Manage your funds and view your transaction history.</p>
      </header>

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-sm font-medium">USDT Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{formatCurrency(balances?.usdt)}</p>
            </CardContent>
          </Card>
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-sm font-medium">PHI Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{balances?.phi?.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Reward Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{formatCurrency(balances?.reward)}</p>
            </CardContent>
          </Card>
           <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Commission</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{formatCurrency(balances?.commission)}</p>
            </CardContent>
          </Card>
           <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Trading</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{formatCurrency(balances?.trading)}</p>
            </CardContent>
          </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1">
          <CardHeader>
              <CardTitle>Web3 Deposit</CardTitle>
              <CardDescription>Connect your wallet to deposit funds directly.</CardDescription>
          </CardHeader>
          <CardContent>
              <Web3Deposit />
          </CardContent>
        </Card>
        
        <div className="lg:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle>Transaction History</CardTitle>
                    <CardDescription>Your recent deposits and withdrawals.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {transactions.length > 0 ? (
                                    transactions.map(tx => (
                                        <TableRow key={tx.id}>
                                            <TableCell className="capitalize flex items-center gap-2">
                                                {getTransactionIcon(tx.type)}
                                                {tx.type.replace('_', ' ')}
                                            </TableCell>
                                            <TableCell className={getTransactionColor(tx.type)}>{tx.amount} {tx.currency}</TableCell>
                                             <TableCell className="capitalize">
                                                <Badge variant={tx.status === 'confirmed' ? 'default' : 'secondary'}>{tx.status}</Badge>
                                             </TableCell>
                                            <TableCell>{formatDate(tx.createdAt)}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center text-muted-foreground h-24">No transactions yet.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
