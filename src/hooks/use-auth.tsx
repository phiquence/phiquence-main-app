
"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { getUserData, CombinedUserData } from '@/services/user.service';


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
    userData: CombinedUserData | null;
    loading: boolean;
    error: string | null;
    refetch: () => void;
}

const UserDataContext = createContext<UserDataContextType | undefined>(undefined);

export function UserDataProvider({ children }: { children: React.ReactNode }) {
    const { user, loading: authLoading } = useAuth();
    const [userData, setUserData] = useState<CombinedUserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchUserData = useCallback(async () => {
        if (!user) {
            setLoading(false);
            setUserData(null);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const data = await getUserData(user.uid);
            if (data) {
                setUserData(data);
            } else {
                 setError("User data not found for this account.");
                 console.error("User data came back as null for UID:", user.uid);
            }
        } catch (e: any) {
            console.error("Failed to fetch user data in provider:", e);
            setError(e.message || "Could not load user data. Please try refreshing the page.");
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (authLoading) {
            return; // Wait until Firebase auth state is resolved
        }
        fetchUserData();
    }, [user, authLoading, fetchUserData]);

    const value = {
        userData,
        loading: authLoading || loading,
        error,
        refetch: fetchUserData,
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
