
"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { doc, onSnapshot, collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import type { UserData } from '@/services/user.service';
import type { Transaction } from '@/services/wallet.service';
import type { Stake } from '@/services/staking.service';
import type { AffiliateMember, CommissionLog } from '@/services/affiliate.service';

// --- Auth Context ---
interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const value = { user, loading, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}


// --- User Data Context ---
// This new UserData type combines all related data into one structure
// to be fetched in a more optimized way.
export interface CombinedUserData extends UserData {
    transactions: Transaction[];
    stakes: Stake[];
    network: AffiliateMember[];
    commissions: CommissionLog[];
}


interface UserDataContextType {
    user: User | null;
    userData: CombinedUserData | null;
    loading: boolean;
    error: string | null;
}

const UserDataContext = createContext<UserDataContextType | undefined>(undefined);

export function UserDataProvider({ children }: { children: React.Node }) {
    const { user } = useAuth();
    const [userData, setUserData] = useState<CombinedUserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!user) {
            setLoading(false);
            setUserData(null);
            return;
        };

        setLoading(true);
        setError(null);

        const userRef = doc(db, "users", user.uid);
        
        // A single, powerful listener on the main user document
        const unsubscribe = onSnapshot(userRef, async (userDoc) => {
            if (!userDoc.exists()) {
                setError("User data not found.");
                setLoading(false);
                return;
            }

            try {
                const baseData = userDoc.data() as UserData;
                
                // Fetch related collections in parallel for maximum speed
                const [transactionsSnap, stakesSnap, networkSnap, commissionsSnap] = await Promise.all([
                    getDocs(query(collection(db, "transactions"), where("userId", "==", user.uid), orderBy("createdAt", "desc"), limit(50))),
                    getDocs(query(collection(db, "stakes"), where("userId", "==", user.uid), where("status", "==", "active"), orderBy("startAt", "desc"))),
                    getDocs(query(collection(db, "affiliateNetworks", user.uid, "members"), orderBy("joinDate", "desc"))),
                    getDocs(query(collection(db, "payouts"), where("toUserId", "==", user.uid), orderBy("createdAt", "desc"), limit(50)))
                ]);

                const combinedData: CombinedUserData = {
                    ...baseData,
                    transactions: transactionsSnap.docs.map(d => ({id: d.id, ...d.data()}) as Transaction),
                    stakes: stakesSnap.docs.map(d => ({id: d.id, ...d.data()}) as Stake),
                    network: networkSnap.docs.map(d => ({id: d.id, ...d.data()}) as AffiliateMember),
                    commissions: commissionsSnap.docs.map(d => ({id: d.id, fromUser: d.data().fromUserName, ...d.data()}) as CommissionLog),
                };

                setUserData(combinedData);
                
            } catch (e: any) {
                console.error("Failed to fetch related user data:", e);
                setError("Could not load all user data. Please refresh.");
            } finally {
                setLoading(false);
            }

        }, (err) => {
            console.error("User data listener error:", err);
            setError("An error occurred while fetching user data.");
            setLoading(false);
        });


        return () => {
            unsubscribe();
        };

    }, [user]);

    const value = {
        user,
        userData,
        loading,
        error
    };

    return <UserDataContext.Provider value={value}>{children}</UserDataContext.Provider>;
}


export function useUserData() {
  const context = useContext(UserDataContext);
  if (context === undefined) {
    throw new Error('useUserData must be used within a UserDataProvider');
  }
  return context;
}
