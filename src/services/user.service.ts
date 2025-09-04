
'use client';

import { User, updateProfile, updatePassword, deleteUser } from 'firebase/auth';
import { doc, getDoc, collection, query, where, orderBy, limit, getDocs, setDoc } from 'firebase/firestore';
import { db, onInit } from '@/lib/firebase';
import type { Transaction } from '@/services/wallet.service';
import type { Stake } from '@/services/staking.service';
import type { AffiliateMember, CommissionLog } from '@/services/affiliate.service';

export interface UserData {
    uid: string;
    email: string;
    name: string;
    phone: string | null;
    kyc: {
        status: 'pending' | 'approved' | 'rejected';
        files: string[];
    };
    balances: {
        usdt: number;
        bnb: number;
        phi: number;
        reward: number;
        commission: number;
        trading: number;
    };
    wallets: {
        usdt_bep20: string;
        bnb: string;
        phi: string;
    };
    referral: {
        sponsorId: string | null;
        path: string[];
        level: number;
    };
    rank: string;
    createdAt: any;
    joinedTradingHub?: boolean;
    isFounder?: boolean;
}

export interface CombinedUserData extends UserData {
    transactions: Transaction[];
    stakes: Stake[];
    network: AffiliateMember[];
    commissions: CommissionLog[];
}


// Function to get a comprehensive snapshot of all user data at once.
// It now waits for Firebase to be initialized before running.
export const getUserData = async (userId: string): Promise<CombinedUserData | null> => {
    return onInit(async () => {
        const userRef = doc(db, "users", userId);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
            console.error("No user document found for ID:", userId);
            // This might happen for a brand new user before their doc is created.
            // Returning null is appropriate.
            return null;
        }

        const baseData = userDoc.data() as UserData;

        // Fetch related collections in parallel for maximum speed
        const [transactionsSnap, stakesSnap, networkSnap, commissionsSnap] = await Promise.all([
            getDocs(query(collection(db, "transactions"), where("userId", "==", userId), orderBy("createdAt", "desc"), limit(50))),
            getDocs(query(collection(db, "stakes"), where("userId", "==", userId), where("status", "==", "active"), orderBy("startAt", "desc"))),
            getDocs(query(collection(db, "affiliateNetworks", userId, "members"), orderBy("joinDate", "desc"))),
            getDocs(query(collection(db, "payouts"), where("toUserId", "==", userId), orderBy("createdAt", "desc"), limit(50)))
        ]);

        const combinedData: CombinedUserData = {
            ...baseData,
            transactions: transactionsSnap.docs.map(d => ({id: d.id, ...d.data()}) as Transaction),
            stakes: stakesSnap.docs.map(d => ({id: d.id, ...d.data()}) as Stake),
            network: networkSnap.docs.map(d => ({id: d.id, ...d.data()}) as AffiliateMember),
            commissions: commissionsSnap.docs.map(d => ({id: d.id, fromUser: d.data().fromUserName, ...d.data()}) as CommissionLog),
        };
        
        return combinedData;
    });
};


// Function to update user's profile information
export const updateUserInfo = async (user: User, name: string, photoURL: string): Promise<void> => {
    try {
        await updateProfile(user, {
            displayName: name,
            photoURL: photoURL,
        });
        // You might also want to update the name in your Firestore 'users' document
        const userRef = doc(db, 'users', user.uid);
        await setDoc(userRef, { name }, { merge: true });

    } catch (error) {
        console.error("Error updating profile:", error);
        throw error;
    }
};

// Function to update user's password
export const updateUserPassword = async (user: User, newPassword: string):Promise<void> => {
    try {
        await updatePassword(user, newPassword);
    } catch (error) {
        console.error("Error updating password:", error);
        // This error often happens if the user's last sign-in is not recent.
        // The user needs to re-authenticate to update their password.
        throw error;
    }
}

// Function to delete a user account
export const deleteUserAccount = async (user: User): Promise<void> => {
    try {
        await deleteUser(user);
    } catch (error) {
        console.error("Error deleting user account:", error);
         // This error also often requires recent re-authentication.
        throw error;
    }
}
