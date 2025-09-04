
"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { doc, onSnapshot, collection, query, where, orderBy, limit } from 'firebase/firestore';
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
export interface CombinedUserData extends UserData {
    transactions: Transaction[];
    stakes: Stake[];
    network: AffiliateMember[];
    commissions: CommissionLog[];
}

interface UserDataContextType {
    userData: CombinedUserData | null;
    loading: boolean;
    error: string | null;
}

const UserDataContext = createContext<UserDataContextType | undefined>(undefined);

export function UserDataProvider({ children }: { children: React.ReactNode }) {
    const { user, loading: authLoading } = useAuth();
    const [userData, setUserData] = useState<CombinedUserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refetchCounter, setRefetchCounter] = useState(0);

    const refetch = () => setRefetchCounter(prev => prev + 1);

    useEffect(() => {
        if (authLoading) return;
        if (!user) {
            setLoading(false);
            setUserData(null);
            return;
        }

        setLoading(true);
        setError(null);

        const userRef = doc(db, "users", user.uid);
        const unsubscribeUser = onSnapshot(userRef, 
            (userDoc) => {
                if (!userDoc.exists()) {
                    setError("User data not found for this account.");
                    setUserData(null);
                    setLoading(false);
                    return;
                }
                const baseData = userDoc.data() as UserData;
                
                // Fetch related collections in parallel for maximum speed
                const transactionsQuery = query(collection(db, "transactions"), where("userId", "==", user.uid), orderBy("createdAt", "desc"), limit(50));
                const stakesQuery = query(collection(db, "stakes"), where("userId", "==", user.uid), where("status", "==", "active"), orderBy("startAt", "desc"));
                const networkQuery = query(collection(db, "affiliateNetworks", user.uid, "members"), orderBy("joinDate", "desc"));
                const commissionsQuery = query(collection(db, "payouts"), where("toUserId", "==", user.uid), orderBy("createdAt", "desc"), limit(50));
                
                const unsubTransactions = onSnapshot(transactionsQuery, (snap) => {
                    const transactions = snap.docs.map(d => ({id: d.id, ...d.data()}) as Transaction);
                    setUserData(prev => ({ ...prev, ...baseData, transactions }));
                });

                const unsubStakes = onSnapshot(stakesQuery, (snap) => {
                    const stakes = snap.docs.map(d => ({id: d.id, ...d.data()}) as Stake);
                     setUserData(prev => ({ ...prev, ...baseData, stakes }));
                });

                const unsubNetwork = onSnapshot(networkQuery, (snap) => {
                    const network = snap.docs.map(d => ({id: d.id, ...d.data()}) as AffiliateMember);
                     setUserData(prev => ({ ...prev, ...baseData, network }));
                });

                const unsubCommissions = onSnapshot(commissionsQuery, (snap) => {
                    const commissions = snap.docs.map(d => ({id: d.id, fromUser: d.data().fromUserName, ...d.data()}) as CommissionLog);
                     setUserData(prev => ({ ...prev, ...baseData, commissions }));
                });
                
                setLoading(false);

                return () => {
                    unsubTransactions();
                    unsubStakes();
                    unsubNetwork();
                    unsubCommissions();
                };
            }, 
            (err) => {
                console.error("Failed to fetch user data in provider:", err);
                setError(err.message || "Could not load user data. Please try refreshing the page.");
                setLoading(false);
            }
        );

        return () => {
            unsubscribeUser();
        };

    }, [user, authLoading, refetchCounter]);

    const value = {
        userData,
        loading: authLoading || loading,
        error,
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
