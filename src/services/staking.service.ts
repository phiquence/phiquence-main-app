
'use client';

import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
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

export const getActiveStakes = (
    userId: string,
    callback: (stakes: Stake[]) => void,
    onError: (error: Error) => void
): (() => void) => {
    const stakesQuery = query(
        collection(db, "stakes"), 
        where("userId", "==", userId),
        where("status", "==", "active"),
        orderBy("startAt", "desc")
    );

    const unsubscribe = onSnapshot(stakesQuery, (querySnapshot) => {
        const stakes = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Stake));
        callback(stakes);
    }, (error) => {
        console.error("Error fetching active stakes:", error);
        onError(error);
    });

    return unsubscribe;
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
