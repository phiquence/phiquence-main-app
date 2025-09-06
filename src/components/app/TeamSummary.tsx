
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserPlus, DollarSign, Sunrise } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useUserData } from '@/hooks/use-auth';

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
    const { userData, loading, error } = useUserData();

    const formatCurrency = (amount: number = 0) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

    const summary = {
        directs: userData?.teamStats?.directs ?? 0,
        totalTeam: userData?.teamStats?.total ?? 0,
        totalCommission: userData?.balances?.commission ?? 0,
        todayCommission: userData?.teamStats?.dailyIncome ?? 0,
    };

    if (error) {
        return <p className="text-destructive">Error: {error}</p>;
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
                icon={UserPlus}
                title="Direct Members"
                value={summary.directs}
                isLoading={loading}
            />
            <StatCard
                icon={Users}
                title="Total Team"
                value={summary.totalTeam}
                isLoading={loading}
            />
            <StatCard
                icon={Sunrise}
                title="Today's Commission"
                value={formatCurrency(summary.todayCommission)}
                isLoading={loading}
            />
            <StatCard
                icon={DollarSign}
                title="Total Commission"
                value={formatCurrency(summary.totalCommission)}
                isLoading={loading}
            />
        </div>
    );
}
