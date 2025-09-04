
'use client';

import { db } from "@/lib/firebase";


export interface Stake {
    id: string;
    userId: string;
    amount: number;
    tier: 'Harmony' | 'Proportion' | 'Divine' | 'Infinity';
    dailyPct: number; // e.g., 0.005 for 0.5%
    autoCompound: boolean;
    status: 'active' | 'completed' | 'cancelled';
    termDays: number;
    startAt: any;
    lastAccruedAt: any;
    totalAccrued: number;
}

// This function now calls our backend API endpoint
export const openStake = async (token: string, amount: number, tier: string, autoCompound: boolean): Promise<{ stakeId: string, dailyPct: number }> => {
    const response = await fetch('/api/staking/open', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ amount, tier, autoCompound })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Failed to open stake.');
    }
    
    return data;
};
