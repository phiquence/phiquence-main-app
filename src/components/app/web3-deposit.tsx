
"use client";

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Loader2, Wallet } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { submitDepositRequest } from '@/services/wallet.service';

const ERC20_ABI = [
    "function transfer(address to, uint256 amount) returns (bool)",
    "function decimals() view returns (uint8)"
]; 

const motherWallets = {
    USDT: process.env.NEXT_PUBLIC_MOTHER_WALLET_USDT_BEP20,
    BNB: process.env.NEXT_PUBLIC_MOTHER_WALLET_BNB_BEP20,
    PHI: process.env.NEXT_PUBLIC_MOTHER_WALLET_PHI_BEP20,
};

const tokenContracts = {
    USDT: process.env.NEXT_PUBLIC_USDT_CONTRACT_ADDRESS,
    PHI: process.env.NEXT_PUBLIC_PHI_CONTRACT_ADDRESS,
};

declare global {
    interface Window {
        ethereum?: any;
    }
}

export function Web3Deposit() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
    const [account, setAccount] = useState<string | null>(null);
    const [amount, setAmount] = useState<string>('0');
    const [currency, setCurrency] = useState<'USDT' | 'BNB' | 'PHI'>('USDT');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const connectWallet = async () => {
        setError(null);
        if (typeof window.ethereum === 'undefined') {
            setError("MetaMask or a Web3 wallet is not installed. Please install it to continue.");
            // On mobile, users can be redirected to the app store.
            const ua = navigator.userAgent;
            if (/android/i.test(ua)) {
                 window.open('https://play.google.com/store/apps/details?id=io.metamask', '_blank');
            } else if (/iPad|iPhone|iPod/.test(ua)) {
                window.open('https://apps.apple.com/us/app/metamask-blockchain-wallet/id1438144202', '_blank');
            }
            return;
        }

        setIsLoading(true);
        try {
            const web3Provider = new ethers.providers.Web3Provider(window.ethereum, "any");
            
            // Request account access
            await web3Provider.send("eth_requestAccounts", []);
            
            const signer = web3Provider.getSigner();
            const address = await signer.getAddress();
            
            setProvider(web3Provider);
            setAccount(address);

            toast({ title: "Wallet Connected", description: `Connected: ${address.substring(0, 6)}...${address.substring(address.length - 4)}` });

        } catch (err: any) {
            console.error(err);
            const message = err.message || "Failed to connect wallet. Please try again.";
            setError(message);
            toast({ title: "Connection Failed", description: message, variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };
    
    useEffect(() => {
        const handleAccountsChanged = (accounts: string[]) => {
            if (accounts.length > 0) {
                setAccount(accounts[0]);
            } else {
                disconnectWallet();
            }
        };

        if (window.ethereum) {
            window.ethereum.on("accountsChanged", handleAccountsChanged);
        }

        return () => {
            if (window.ethereum) {
                window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
            }
        };
    }, []);


    const disconnectWallet = () => {
        setProvider(null);
        setAccount(null);
        toast({ title: "Wallet Disconnected" });
    }

    const handleDeposit = async () => {
        if (!provider || !user) {
            setError("Please connect your wallet first.");
            return;
        }
        const signer = provider.getSigner();
        setError(null);
        setIsLoading(true);

        const motherWallet = motherWallets[currency];
        if (!motherWallet || motherWallet.includes('YOUR_')) {
            setError(`The destination wallet for ${currency} is not configured correctly. Please contact support.`);
            setIsLoading(false);
            return;
        }

        try {
            let tx;

            if (currency === 'BNB') {
                const value = ethers.utils.parseEther(amount);
                tx = await signer.sendTransaction({ to: motherWallet, value });
            } else {
                const tokenAddress = tokenContracts[currency];
                if (!tokenAddress || tokenAddress.includes('YOUR_')) throw new Error(`Contract address for ${currency} is not configured.`);
                
                const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
                const decimals = await tokenContract.decimals();
                const value = ethers.utils.parseUnits(amount, decimals);

                tx = await tokenContract.transfer(motherWallet, value);
            }
            
            toast({ title: "Transaction Sent", description: "Waiting for blockchain confirmation..." });
            const receipt = await tx.wait();
            
            if (receipt.transactionHash) {
                const token = await user.getIdToken();
                // This submits the request for admin review
                await submitDepositRequest(token, parseFloat(amount), currency, receipt.transactionHash);
                
                toast({
                    title: "Deposit Successful!",
                    description: `${amount} ${currency} request submitted. It will be reviewed shortly.`
                });
            }

        } catch (err: any) {
            console.error(err);
            const errorMessage = err.reason || err.data?.message || err.message || "Transaction failed.";
            setError(errorMessage);
            toast({ title: "Transaction Failed", description: errorMessage, variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    if (!account) {
        return (
            <div className="flex flex-col items-center justify-center space-y-4 p-4 border-2 border-dashed rounded-lg">
                <Wallet className="h-10 w-10 text-muted-foreground"/>
                <p className="text-center text-muted-foreground">Connect your Web3 wallet to make a direct deposit.</p>
                <Button onClick={connectWallet} disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Connect Wallet
                </Button>
                 {error && <p className="text-sm text-destructive text-center">{error}</p>}
            </div>
        );
    }

    return (
        <div className="space-y-4">
             <Alert>
                <Wallet className="h-4 w-4"/>
                <AlertTitle>Wallet Connected!</AlertTitle>
                <AlertDescription className="truncate text-xs flex justify-between items-center">
                   <span>{account}</span>
                   <Button variant="link" size="sm" onClick={disconnectWallet} className="h-auto p-0 text-xs">Disconnect</Button>
                </AlertDescription>
            </Alert>
            <div className="space-y-2">
                <Label>Currency</Label>
                <Select value={currency} onValueChange={(value) => setCurrency(value as any)}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="USDT">USDT (BEP-20)</SelectItem>
                        <SelectItem value="BNB">BNB</SelectItem>
                        <SelectItem value="PHI">PHI (BEP-20)</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <Label htmlFor="amount">Amount to Deposit</Label>
                <Input
                    id="amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="e.g., 100"
                />
            </div>
            <Button onClick={handleDeposit} disabled={isLoading || parseFloat(amount) <= 0} className="w-full">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : `Deposit ${amount} ${currency}`}
            </Button>
            {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
    );
}

    