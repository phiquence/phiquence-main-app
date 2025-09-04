
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { addAffiliate } from "@/services/affiliate.service";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { doc, serverTimestamp, setDoc, runTransaction, getDoc } from "firebase/firestore";

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  referralId: z.string().optional(),
});

type SignupFormValues = z.infer<typeof formSchema>;

export function SignupForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const refId = searchParams.get('ref');

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      referralId: refId || "",
    },
  });

  useEffect(() => {
    if (refId) {
      form.setValue('referralId', refId);
    }
  }, [refId, form]);

  const onSubmit = async (values: SignupFormValues) => {
    setIsLoading(true);
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;
      
      if (user) {
        // Update user profile with name
        await updateProfile(user, {
            displayName: values.name
        });

        // Use a transaction to ensure atomicity
        await runTransaction(db, async (transaction) => {
            const userRef = doc(db, 'users', user.uid);
            let sponsorPath: string[] = [];
            let sponsorLevel = 0; // Initialize to 0

            if (values.referralId) {
                const sponsorRef = doc(db, 'users', values.referralId);
                const sponsorDoc = await transaction.get(sponsorRef);
                if (sponsorDoc.exists()) {
                    const sponsorData = sponsorDoc.data();
                    // Ensure referral path exists and is an array before spreading
                    const existingPath = sponsorData.referral?.path;
                    if (Array.isArray(existingPath)) {
                       sponsorPath = [...existingPath, values.referralId];
                    } else {
                       sponsorPath = [values.referralId];
                    }
                    sponsorLevel = (sponsorData.referral?.level || 0) + 1;
                } else {
                    console.warn(`Sponsor with ID ${values.referralId} not found.`);
                }
            }

            // Create user document in Firestore
            transaction.set(userRef, {
                uid: user.uid,
                email: values.email,
                name: values.name,
                createdAt: serverTimestamp(),
                rank: 'Beginner',
                balances: { usdt: 0, bnb: 0, phi: 0, reward: 0, commission: 0, trading: 0 },
                wallets: { usdt_bep20: '', bnb: '', phi: '' },
                kyc: { status: 'pending', files: [] },
                referral: { sponsorId: values.referralId || null, path: sponsorPath, level: sponsorLevel },
                teamStats: { directs: 0, total: 0, dailyIncome: 0 }
            });
        });
      }

      router.push("/app");
    } catch (error: any) {
      let errorMessage = "An unknown error occurred.";
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "This email address is already in use by another account.";
      } else {
        errorMessage = error.message;
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertTitle>Signup Failed</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="name@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="referralId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Referral ID</FormLabel>
              <FormControl>
                <Input placeholder="Optional" {...field} />
              </FormControl>
              <FormDescription>
                If someone referred you, enter their ID here.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create Account
        </Button>
      </form>
    </Form>
  );
}
