
'use client';

import { onSnapshot, collection, query, where, orderBy, limit, DocumentData, serverTimestamp, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface Transaction {
    id: string;
    userId: string;
    type: 'deposit' | 'withdraw' | 'reward' | 'commission' | 'trade_pl' | 'stake_daily';
    currency: 'USDT' | 'BNB' | 'PHI';
    amount: number;
    status: 'pending' | 'confirmed' | 'failed' | 'reviewing';
    ref: string;
    meta: {
        network?: string;
        txHash?: string;
    };
    createdAt: any;
}


// Function to get real-time updates on a user's transactions
export const getTransactions = (
    userId: string,
    callback: (transactions: Transaction[]) => void,
    onError: (error: Error) => void
): (() => void) => {
    const transactionsQuery = query(
        collection(db, "transactions"), 
        where("userId", "==", userId),
        orderBy("createdAt", "desc"),
        limit(50) // Get latest 50 transactions
    );

    const unsubscribe = onSnapshot(transactionsQuery, (querySnapshot) => {
        const transactions = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
        callback(transactions);
    }, (error) => {
        console.error("Error fetching transactions:", error);
        onError(error);
    });

    return unsubscribe;
}

// This function now only submits a request. The actual balance update will be handled by an admin/backend process.
export const submitDepositRequest = async (token: string, amount: number, currency: 'USDT' | 'BNB' | 'PHI', txHash: string): Promise<{ message: string }> => {
    const response = await fetch('/api/wallet/request-deposit', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ amount, currency, txHash })
    });
    
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Failed to submit deposit request.');
    }
    
    return data;
};

    