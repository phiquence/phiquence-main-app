
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { getUserData, UserData } from '@/services/user.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, AlertTriangle, ArrowUpRight, ArrowDownLeft, MinusSquare, CircleDollarSign, Copy, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { getTransactions, Transaction } from '@/services/wallet.service';
import { Badge } from '@/components/ui/badge';
import { Web3Deposit } from '@/components/app/web3-deposit';


export default function WalletPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (user) {
      const unsubscribeUser = getUserData(user.uid, (data) => {
        setUserData(data);
        setLoading(false);
      }, (err) => {
        console.error(err);
        setError("Could not fetch user information.");
        setLoading(false);
      });

      const unsubscribeTransactions = getTransactions(user.uid, (transactionsData) => {
        setTransactions(transactionsData);
      }, (err) => {
        console.error(err);
        setError("Could not fetch transaction history.");
      });

      return () => {
        unsubscribeUser();
        unsubscribeTransactions();
      };
    }
  }, [user]);

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

  const getTransactionIcon = (type: string) => {
      switch (type) {
          case 'deposit':
              return <ArrowDownLeft className="h-4 w-4 text-green-500" />;
          case 'withdraw':
              return <ArrowUpRight className="h-4 w-4 text-red-500" />;
          case 'stake_daily':
          case 'reward':
              return <CircleDollarSign className="h-4 w-4 text-yellow-500" />;
          case 'commission':
              return <Users className="h-4 w-4 text-blue-500"/>
          default:
              return <MinusSquare className="h-4 w-4 text-muted-foreground" />;
      }
  }

  const getTransactionColor = (type: string) => {
        switch (type) {
            case 'deposit':
                return 'text-green-500';
            case 'withdraw':
                return 'text-red-500';
            case 'reward':
            case 'stake_daily':
            case 'commission':
                 return 'text-yellow-500';
            default:
                return '';
        }
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
        
        <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle>Transaction History</CardTitle>
                <CardDescription>Your recent deposits and withdrawals.</CardDescription>
            </CardHeader>
            <CardContent>
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
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
