
'use client';

import { User, updateProfile, updatePassword, deleteUser } from 'firebase/auth';
import { doc, getDoc, collection, query, where, orderBy, limit, getDocs, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
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

// Get user data with a real-time listener.
export const getUserData = (
    userId: string,
    callback: (data: UserData | null) => void,
    onError: (error: Error) => void
): (() => void) => {
    const userRef = doc(db, "users", userId);
    
    const unsubscribe = onSnapshot(userRef, 
        (docSnap) => {
            if (docSnap.exists()) {
                callback(docSnap.data() as UserData);
            } else {
                console.error("No user document found for ID:", userId);
                callback(null); // Explicitly send null if no document
            }
        }, 
        (error) => {
            console.error("Error fetching user data:", error);
            onError(error);
        }
    );

    return unsubscribe;
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
