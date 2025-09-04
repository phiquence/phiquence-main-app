
'use client';

import { doc, onSnapshot, collection, query, where, getDocs, orderBy, limit, DocumentData, runTransaction, serverTimestamp, getDoc, Transaction, writeBatch, WriteBatch } from "firebase/firestore";
import { db } from "@/lib/firebase";

// Data structures for affiliate information
export interface AffiliateStats {
    userId: string;
    totalReferrals: number;
    totalCommission: number;
    rank: string;
}

export interface AffiliateMember {
    id: string;
    name: string;
    level: number;
    joinDate: any; // Using 'any' for Firebase ServerTimestamp
}

export interface CommissionLog {
    id: string;
    amount: number;
    fromUser: string;
    level: number;
    date: any; // Using 'any' for Firebase ServerTimestamp
}

// Get affiliate stats with a real-time listener
export const getAffiliateStats = (
    userId: string,
    callback: (stats: AffiliateStats) => void,
    onError: (error: Error) => void
): (() => void) => {
    const statsRef = doc(db, "affiliateStats", userId);

    const unsubscribe = onSnapshot(statsRef, (docSnap) => {
        if (docSnap.exists()) {
            callback(docSnap.data() as AffiliateStats);
        } else {
            // If no stats doc, return default/initial state
            callback({
                userId,
                totalReferrals: 0,
                totalCommission: 0,
                rank: 'Beginner',
            });
        }
    }, (error) => {
        console.error("Error fetching affiliate stats:", error);
        onError(error);
    });

    return unsubscribe;
};

// Get the user's network with a real-time listener
// This assumes a "flat" collection of network members for a given user.
export const getAffiliateNetwork = (
    userId: string,
    callback: (members: AffiliateMember[]) => void,
    onError: (error: Error) => void
): (() => void) => {
    const networkQuery = query(
        collection(db, "affiliateNetworks", userId, "members"),
        orderBy("joinDate", "desc")
    );
    
    const unsubscribe = onSnapshot(networkQuery, (querySnapshot) => {
        const members = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AffiliateMember));
        callback(members);
    }, (error) => {
        console.error("Error fetching affiliate network:", error);
        onError(error);
    });

    return unsubscribe;
};

// Get commission history with a real-time listener
export const getCommissionHistory = (
    userId: string,
    callback: (logs: CommissionLog[]) => void,
    onError: (error: Error) => void
): (() => void) => {
    const commissionsQuery = query(
        collection(db, "payouts"),
        where("toUserId", "==", userId),
        orderBy("createdAt", "desc"),
        limit(50) // Get latest 50 logs
    );

    const unsubscribe = onSnapshot(commissionsQuery, (querySnapshot) => {
        const logs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CommissionLog));
        callback(logs);
    }, (error) => {
        console.error("Error fetching commission history:", error);
        onError(error);
    });
    
    return unsubscribe;
};

// This function will now call our backend API instead of firestore directly
export const addAffiliate = async (token: string, referralId: string, newUserName: string): Promise<void> => {
    // This function is now mostly illustrative as the core logic is on the backend.
    // However, we might keep it to call a potential future API endpoint.
    console.log("Referral process initiated for user:", newUserName, "with referrer:", referralId);
    // In a real scenario, you might have an API call here:
    /*
    const response = await fetch('/api/affiliate/add', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ referralId, newUserName })
    });

    const data = await response.json();

    if (!response.ok) {
        console.error(data.error || 'Failed to add affiliate.');
    }
    */
};
