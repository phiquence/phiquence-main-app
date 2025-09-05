
'use client';

import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserPlus, DollarSign, Sunrise, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface SummaryData {
    directs: number;
    totalTeam: number;
    totalCommission: number;
    todayCommission: number;
}

function StatCard({ icon: Icon, title, value, isLoading }: { icon: React.ElementType, title: string, value: string | number, isLoading: boolean }) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <Skeleton className="h-8 w-3/4" />
                ) : (
                    <div className="text-2xl font-bold">{value}</div>
                )}
            </CardContent>
        </Card>
    );
}


export default function TeamSummary() {
    const [summary, setSummary] = useState<SummaryData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            if (!currentUser) {
                setLoading(false);
            }
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (!user) return;

        const fetchSummary = async () => {
            setLoading(true);
            setError(null);
            try {
                const token = await user.getIdToken();
                const response = await fetch('/api/affiliate/summary', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to fetch summary');
                }

                const data = await response.json();
                setSummary(data.summary);
            } catch (err: any) {
                setError(err.message);
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchSummary();
    }, [user]);
    
    const formatCurrency = (amount: number = 0) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);


    if (error) {
        return <p className="text-destructive">Error: {error}</p>;
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
                icon={UserPlus}
                title="Direct Members"
                value={summary?.directs ?? 0}
                isLoading={loading}
            />
            <StatCard
                icon={Users}
                title="Total Team"
                value={summary?.totalTeam ?? 0}
                isLoading={loading}
            />
             <StatCard
                icon={Sunrise}
                title="Today's Commission"
                value={formatCurrency(summary?.todayCommission)}
                isLoading={loading}
            />
            <StatCard
                icon={DollarSign}
                title="Total Commission"
                value={formatCurrency(summary?.totalCommission)}
                isLoading={loading}
            />
        </div>
    );
}
