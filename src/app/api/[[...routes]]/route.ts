import { Hono } from 'hono';
import { handle } from 'hono/vercel';
// Assuming 'db' is your initialized Firebase Admin SDK Firestore instance
import { db } from '@/lib/firebase/server'; 

// NOTE: This is a simplified representation of your file.
// You should merge the corrected part into your existing file.

const app = new Hono().basePath('/api');

// ... other routes

// CORRECTED WALLET DEPOSIT ADDRESS ROUTE
app.get('/wallet/deposit-address', async (c) => {
  try {
    // --- FIX STARTS HERE ---
    // The build error "No overload matches this call" happens because TypeScript 
    // doesn't know the type of `uid` coming from `c.get('uid')`.
    // For `c.get()` to be type-safe, you need a middleware to set the value 
    // and a typed Hono instance e.g. `new Hono<{ Variables: { uid: string } }>()`.

    // As a direct fix, we can tell TypeScript that `uid` will be a string,
    // but we MUST check if it actually exists before using it.
    const uid = c.get('uid') as string | undefined;

    if (!uid) {
        // This check is crucial. If no middleware sets the 'uid', this prevents a crash.
        return c.json({ ok: false, error: "User not authenticated." }, 401);
    }
    
    // Now TypeScript knows `uid` is a string, so the next line will work.
    const userRef = db.doc(`users/${uid}`);
    // --- FIX ENDS HERE ---
    
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      // The original code returned a 404, which is correct.
      return c.json({ ok: false, error: "User not found." }, 404);
    }

    const userData = userDoc.data();
    // Assuming the field is named depositAddress
    const depositAddress = userData?.depositAddress || 'No address found';

    return c.json({ 
      wallet: depositAddress 
    });

  } catch (error) {
    console.error('Error fetching deposit address:', error);
    return c.json({ error: 'An internal error occurred' }, 500);
  }
});

// ... other routes

export const GET = handle(app);
export const POST = handle(app);

