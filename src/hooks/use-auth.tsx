
"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { doc, onSnapshot, collection, query, where, orderBy, limit } from "firebase/firestore";
import type { UserData } from '@/services/user.service';
import type { Transaction } from '@/services/wallet.service';
import type { Stake } from '@/services/staking.service';
import type { AffiliateStats, AffiliateMember, CommissionLog } from '@/services/affiliate.service';

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
interface UserDataContextType {
    user: User | null;
    userData: UserData | null;
    transactions: Transaction[];
    activeStakes: Stake[];
    affiliateStats: AffiliateStats | null;
    affiliateNetwork: AffiliateMember[];
    commissionHistory: CommissionLog[];
    loading: boolean;
    error: string | null;
}

const UserDataContext = createContext<UserDataContextType | undefined>(undefined);

export function UserDataProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [userData, setUserData] = useState<UserData | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [activeStakes, setActiveStakes] = useState<Stake[]>([]);
    const [affiliateStats, setAffiliateStats] = useState<AffiliateStats | null>(null);
    const [affiliateNetwork, setAffiliateNetwork] = useState<AffiliateMember[]>([]);
    const [commissionHistory, setCommissionHistory] = useState<CommissionLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!user) {
            setLoading(false);
            // Clear data on logout
            setUserData(null);
            setTransactions([]);
            setActiveStakes([]);
            setAffiliateStats(null);
            setAffiliateNetwork([]);
            setCommissionHistory([]);
            return;
        };

        setLoading(true);
        const unsubscribes: (() => void)[] = [];
        let errorOccurred = false;

        const onError = (e: Error) => {
            if (!errorOccurred) {
                console.error(e);
                setError("Could not fetch user data. Please refresh.");
                setLoading(false);
                errorOccurred = true;
            }
        };

        // UserData
        unsubscribes.push(onSnapshot(doc(db, "users", user.uid), (doc) => {
            if (doc.exists()) setUserData(doc.data() as UserData);
        }, onError));

        // Transactions
        const tq = query(collection(db, "transactions"), where("userId", "==", user.uid), orderBy("createdAt", "desc"), limit(50));
        unsubscribes.push(onSnapshot(tq, (snap) => {
            setTransactions(snap.docs.map(d => ({id: d.id, ...d.data()}) as Transaction));
        }, onError));

        // Active Stakes
        const sq = query(collection(db, "stakes"), where("userId", "==", user.uid), where("status", "==", "active"), orderBy("startAt", "desc"));
        unsubscribes.push(onSnapshot(sq, (snap) => {
            setActiveStakes(snap.docs.map(d => ({id: d.id, ...d.data()}) as Stake));
        }, onError));

        // Affiliate Stats
        unsubscribes.push(onSnapshot(doc(db, "affiliateStats", user.uid), (doc) => {
            setAffiliateStats(doc.exists() ? doc.data() as AffiliateStats : { userId: user.uid, totalReferrals: 0, totalCommission: 0, rank: 'Beginner' });
        }, onError));

        // Affiliate Network
        const nq = query(collection(db, "affiliateNetworks", user.uid, "members"), orderBy("joinDate", "desc"));
        unsubscribes.push(onSnapshot(nq, (snap) => {
            setAffiliateNetwork(snap.docs.map(d => ({id: d.id, ...d.data()}) as AffiliateMember));
        }, onError));

        // Commission History
        const cq = query(collection(db, "payouts"), where("toUserId", "==", user.uid), orderBy("createdAt", "desc"), limit(50));
        unsubscribes.push(onSnapshot(cq, (snap) => {
            setCommissionHistory(snap.docs.map(d => ({id: d.id, ...d.data()}) as CommissionLog));
        }, onError));

        // Set loading to false once all initial listeners are attached
        // A slight delay to allow for initial data fetch
        const timer = setTimeout(() => {
            if (!errorOccurred) {
                setLoading(false);
            }
        }, 1500);
        unsubscribes.push(() => clearTimeout(timer));

        return () => {
            unsubscribes.forEach(unsub => unsub());
        };

    }, [user]);

    const value = {
        user,
        userData,
        transactions,
        activeStakes,
        affiliateStats,
        affiliateNetwork,
        commissionHistory,
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
