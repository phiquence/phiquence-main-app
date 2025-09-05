
import { Hono } from 'hono';
import { handle } from 'hono/vercel';
import { NextApiRequest } from 'next';
import * as admin from 'firebase-admin';
import { config } from 'dotenv';
import { ethers } from 'ethers';
import * as crypto from 'crypto';


// Load environment variables from .env file
config();

// --- Firebase Admin SDK Singleton Initialization ---
if (admin.apps.length === 0) {
    try {
        const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
        if (serviceAccountKey) {
            console.log("Initializing Firebase Admin with Service Account Key...");
            const serviceAccount = JSON.parse(serviceAccountKey);
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
                databaseURL: `https://phiquence-ndim2-default-rtdb.asia-southeast1.firebasedatabase.app`,
            });
        } else {
             console.log("Initializing Firebase Admin with Application Default Credentials...");
             admin.initializeApp({
                projectId: 'phiquence-ndim2',
                storageBucket: 'phiquence-ndim2.appspot.com',
             });
             console.warn("FIREBASE_SERVICE_ACCOUNT_KEY not found. Using Application Default Credentials.");
        }
    } catch (e) {
        console.error('CRITICAL: Failed to initialize Firebase Admin SDK:', e);
    }
}

const db = admin.firestore();
const auth = admin.auth();


const app = new Hono().basePath('/api');

// --- Auth Middleware ---
// Verifies the user's token for every API request.
const authMiddleware = async (c: any, next: any) => {
  try {
      const authHeader = c.req.header('Authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return c.json({ ok: false, error: 'unauthorized' }, 401);
      }
      const token = authHeader.split('Bearer ')[1];
      const decodedToken = await auth.verifyIdToken(token);
      c.set('uid', decodedToken.uid);
      c.set('claims', decodedToken);
      await next();
  } catch (error) {
     console.error("Auth middleware error:", error);
     return c.json({ ok: false, error: 'unauthorized', details: (error as Error).message }, 401);
  }
};


// Unprotected webhook route
app.post('/wallet/webhook', async (c) => {
    try {
        const signature = c.req.header('x-alchemy-signature');
        const webhookSecret = process.env.ALCHEMY_WEBHOOK_SECRET;

        if (!webhookSecret) {
            console.error("ALCHEMY_WEBHOOK_SECRET is not set.");
            return c.json({ ok: false, error: "webhook_misconfigured" }, 500);
        }
        
        const body = await c.req.text(); // Read body as raw text
        
        // Verify the webhook signature for security
        const hmac = crypto.createHmac('sha256', webhookSecret);
        hmac.update(body, 'utf-8');
        const digest = hmac.digest('hex');

        if (signature !== digest) {
            return c.json({ ok: false, error: 'invalid_signature' }, 401);
        }
        
        const webhookData = JSON.parse(body);
        const activity = webhookData?.event?.data?.block?.activities?.[0];

        if (!activity || activity.category !== 'token') {
            return c.json({ ok: true, message: "Not a token transaction or no activity." });
        }

        const txHash = activity.hash;
        const toAddress = activity.toAddress;
        const fromAddress = activity.fromAddress;
        const rawValue = activity.rawContract.rawValue;
        const decimals = parseInt(activity.rawContract.decimal, 16);
        const tokenAddress = activity.rawContract.address;
        
        const amount = parseFloat(ethers.utils.formatUnits(rawValue, decimals));

        const txQuery = await db.collection("transactions").where("ref", "==", txHash).get();
        if (!txQuery.empty) {
            return c.json({ ok: false, error: "transaction_already_processed" }, 400);
        }
        
        let currency: 'USDT' | 'BNB' | 'PHI' | null = null;
        if (tokenAddress.toLowerCase() === process.env.NEXT_PUBLIC_USDT_CONTRACT_ADDRESS?.toLowerCase()) {
            currency = 'USDT';
        } else if (tokenAddress.toLowerCase() === process.env.NEXT_PUBLIC_PHI_CONTRACT_ADDRESS?.toLowerCase()) {
            currency = 'PHI';
        }
        // BNB is native, so it would have a different category, but we'll handle generic tokens.

        if (!currency) {
            return c.json({ ok: true, message: "Unsupported token." });
        }
        
        // Find user by their registered wallet address
        const userQuery = await db.collection("users").where(`wallets.${currency.toLowerCase()}_bep20`, "==", fromAddress).limit(1).get();

        if (userQuery.empty) {
            // If no user is found by wallet, maybe check the memo/note field in a real implementation
            return c.json({ ok: false, error: "user_not_found" }, 404);
        }

        const userDoc = userQuery.docs[0];
        const userId = userDoc.id;
        const userRef = db.doc(`users/${userId}`);

        await db.runTransaction(async (tx) => {
             // 1. Update user balance
            tx.update(userRef, {
                [`balances.${currency!.toLowerCase()}`]: admin.firestore.FieldValue.increment(amount)
            });

            // 2. Log the confirmed transaction
            const transactionRef = db.collection("transactions").doc();
            tx.set(transactionRef, {
                userId: userId,
                type: 'deposit',
                currency: currency,
                amount: amount,
                status: 'confirmed',
                ref: txHash,
                meta: {
                    network: 'BEP-20',
                    txHash: txHash,
                    fromAddress: fromAddress
                },
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
            });
        });
        
        return c.json({ ok: true, message: `Processed deposit for user ${userId}` });
    } catch (e: any) {
        console.error("Webhook processing failed:", e);
        return c.json({ ok: false, error: e.message || "An unexpected error occurred." }, 500);
    }
});


// All routes below this are protected by auth middleware
app.use('*', authMiddleware);

/**
 * Route: GET /api/wallet/deposit-address
 * Retrieves the user's pre-assigned deposit address.
 */
app.get('/wallet/deposit-address', async (c) => {
    try {
        const uid = c.get('uid');
        const userRef = db.doc(`users/${uid}`);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            return c.json({ ok: false, error: "User not found." }, 404);
        }

        const userData = userDoc.data();
        const depositAddress = userData?.wallets?.usdt_bep20;

        if (!depositAddress) {
            return c.json({ ok: false, error: "Deposit address not assigned. Please contact support." }, 404);
        }

        return c.json({ ok: true, address: depositAddress });
    } catch (e: any) {
        console.error("Failed to get deposit address:", e);
        return c.json({ ok: false, error: e.message || "An unexpected error occurred." }, 500);
    }
});


/**
 * Route: POST /api/wallet/request-deposit
 * Logs a user's deposit request for manual admin verification.
 * This does NOT update the user's balance.
 */
app.post('/wallet/request-deposit', async (c) => {
    try {
        const { amount, currency, txHash } = await c.req.json();
        const uid = c.get('uid');

        if (!amount || !currency || !txHash || typeof amount !== 'number' || amount <= 0) {
            return c.json({ ok: false, error: "Invalid request payload." }, 400);
        }
        
        const transactionRef = db.collection("transactions").doc();
        
        await transactionRef.set({
            userId: uid,
            type: 'deposit',
            currency: currency.toUpperCase(),
            amount: amount,
            status: 'reviewing',
            ref: txHash,
            meta: {
                network: 'BEP-20',
                txHash: txHash,
            },
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        return c.json({ ok: true, message: `Your deposit request for ${amount} ${currency} has been submitted for review.`});
    } catch (e: any) {
        console.error("Deposit request submission failed:", e);
        return c.json({ ok: false, error: e.message || "An unexpected error occurred." }, 500);
    }
});


// --- Trading Hub Routes ---

/**
 * Route: POST /api/trading/join
 * Allows a user to join the trading hub for the first time
 * and receive a free gift credit.
 */
app.post('/trading/join', async (c) => {
    try {
        const uid = c.get('uid');
    
        const settingsDoc = await db.doc("settings/global").get();
        const gift = settingsDoc.data()?.affiliate?.tradingHub?.freeJoinGift || 5;
        const userRef = db.doc(`users/${uid}`);
        
        await db.runTransaction(async (tx) => {
            const userDoc = await tx.get(userRef);
            if (!userDoc.exists) {
                throw new Error("User document not found.");
            }
            const hasJoined = userDoc.data()?.joinedTradingHub || false;
            
            if (hasJoined) {
                // User has already joined, do nothing.
                return;
            }

            tx.update(userRef, {
                joinedTradingHub: true,
                'balances.trading': admin.firestore.FieldValue.increment(gift)
            });
        });
        
        return c.json({ ok: true, message: `Successfully joined and received a $${gift} bonus.` });
    } catch (e: any) {
        console.error("Join trading hub failed:", e);
        return c.json({ ok: false, error: e.message || "Failed to join trading hub." }, 500);
    }
});

/**
 * Route: POST /api/trading/bet
 * Allows a user to place a bet in a trading session.
 */
app.post('/trading/bet', async (c) => {
    try {
        const { sessionId, direction, amount } = await c.req.json();
        const uid = c.get('uid');

        if (!sessionId || !direction || !amount || (direction !== 'rise' && direction !== 'fall') || amount <= 0) {
            return c.json({ ok: false, error: 'invalid_payload' }, 400);
        }

        const userRef = db.doc(`users/${uid}`);
        const sessionRef = db.doc(`tradingSessions/${sessionId}`);
        const betRef = db.collection(`tradingSessions/${sessionId}/bets`).doc(uid);

        await db.runTransaction(async (tx) => {
            const userDoc = await tx.get(userRef);
            const sessionDoc = await tx.get(sessionRef);

            if (!userDoc.exists) throw new Error("user_not_found");
            if (!sessionDoc.exists) throw new Error("session_not_found");

            const userData = userDoc.data()!;
            const sessionData = sessionDoc.data()!;

            if (sessionData.status !== 'open') throw new Error("session_closed");
            if ((userData.balances?.trading || 0) < amount) {
                throw new Error("insufficient_trading_balance");
            }
            
            // Deduct from trading balance
            tx.update(userRef, { 'balances.trading': admin.firestore.FieldValue.increment(-amount) });
            
            // Place the bet (overwrite previous bet in same session)
            tx.set(betRef, {
                userId: uid,
                direction,
                amount,
                placedAt: admin.firestore.FieldValue.serverTimestamp()
            });
        });

        return c.json({ ok: true, message: `Bet of ${amount} on ${direction} placed successfully.` });
    } catch (e: any) {
        console.error("Bet placement failed:", e);
        return c.json({ ok: false, error: e.message || 'bet_placement_failed' }, 500);
    }
});


// --- Staking Routes ---

/**
 * Route: POST /api/staking/open
 * Allows a user to open a new stake, deducting from their balance and
 * distributing spot commissions up the referral chain.
 */
app.post('/staking/open', async (c) => {
    try {
        const { amount, tier, autoCompound = false } = await c.req.json();
        const uid = c.get('uid');

        if (!amount || !tier || typeof amount !== 'number' || amount <= 0) {
            return c.json({ ok: false, error: "invalid_request_payload" }, 400);
        }

        const settingsRef = db.doc("settings/global");
        const userRef = db.doc(`users/${uid}`);

        const stakeId = db.collection("stakes").doc().id;

        await db.runTransaction(async (tx) => {
            const settingsDoc = await tx.get(settingsRef);
            const userDoc = await tx.get(userRef);

            if (!settingsDoc.exists()) throw new Error("Global settings not found.");
            if (!userDoc.exists()) throw new Error("User not found.");

            const settings = settingsDoc.data()!;
            const userData = userDoc.data()!;
            
            const pkg = settings.staking?.packages?.[tier];
            if (!pkg) throw new Error("invalid_tier");
            if (amount < pkg.min || (pkg.max && amount > pkg.max)) {
                throw new Error(`Amount must be between ${pkg.min} and ${pkg.max}.`);
            }
            if ((userData.balances?.usdt || 0) < amount) {
                throw new Error("Insufficient USDT balance.");
            }
            
            // 1. Deduct USDT balance
            tx.update(userRef, { "balances.usdt": admin.firestore.FieldValue.increment(-amount) });

            // 2. Create the stake document
            const stakeData = {
                userId: uid,
                amount,
                tier,
                dailyPct: pkg.dailyPct,
                autoCompound,
                status: 'active',
                termDays: settings.staking?.termDays || 365,
                startAt: admin.firestore.FieldValue.serverTimestamp(),
                lastAccruedAt: admin.firestore.FieldValue.serverTimestamp(),
                totalAccrued: 0,
            };
            tx.set(db.doc(`stakes/${stakeId}`), stakeData);
            
            // 3. Distribute Spot Commissions to upline (up to 5 levels)
            const spotRates = settings.affiliate?.spot?.rates;
            const sponsorPath: string[] = userData.referral?.path || [];

            if (sponsorPath.length > 0 && spotRates) {
                for (let i = 0; i < Math.min(sponsorPath.length, 5); i++) {
                    const sponsorId = sponsorPath[i];
                    const level = i + 1;
                    const rate = spotRates[`l${level}`];
                    
                    if (sponsorId && rate > 0) {
                        const commissionAmount = amount * rate;
                        const sponsorRef = db.doc(`users/${sponsorId}`);
                        
                        tx.update(sponsorRef, {
                            "balances.commission": admin.firestore.FieldValue.increment(commissionAmount)
                        });

                        const payoutRef = db.collection("payouts").doc();
                        tx.set(payoutRef, {
                            toUserId: sponsorId,
                            fromUserId: uid,
                            source: "direct_spot",
                            level: level,
                            amount: commissionAmount,
                            createdAt: admin.firestore.FieldValue.serverTimestamp(),
                            stakeId: stakeId,
                        });
                    }
                }
            }
        });
        
        const settingsData = (await settingsRef.get()).data();
        const dailyPct = settingsData?.staking.packages[tier]?.dailyPct || 0;
        
        return c.json({ ok: true, stakeId, dailyPct });
    } catch (e: any) {
        console.error("Staking failed:", e);
        return c.json({ ok: false, error: e.message || "An unexpected error occurred." }, 500);
    }
});


// --- Founder Routes ---
app.post('/founder/join', async (c) => {
    try {
        const uid = c.get('uid');
        const FOUNDER_COST = 5000;

        const userRef = db.doc(`users/${uid}`);

        await db.runTransaction(async (tx) => {
            const userDoc = await tx.get(userRef);
            if (!userDoc.exists) throw new Error("User not found.");

            const userData = userDoc.data()!;
            if (userData.isFounder) throw new Error("User is already a founder.");
            if ((userData.balances?.usdt || 0) < FOUNDER_COST) {
                throw new Error("Insufficient USDT balance.");
            }

            // 1. Deduct cost from USDT balance
            tx.update(userRef, {
                "balances.usdt": admin.firestore.FieldValue.increment(-FOUNDER_COST),
                isFounder: true
            });

            // 2. Create a transaction log
            const transactionRef = db.collection("transactions").doc();
            tx.set(transactionRef, {
                userId: uid,
                type: 'founder_purchase',
                currency: 'USDT',
                amount: FOUNDER_COST,
                status: 'confirmed',
                ref: `FOUNDER-${uid}`,
                meta: {
                    description: 'Founder Membership Purchase'
                },
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
            });
        });

        return c.json({ ok: true, message: "Congratulations! You are now a Founder Member." });
    } catch (e: any) {
        console.error("Becoming a founder failed:", e);
        return c.json({ ok: false, error: e.message || "An unexpected error occurred." }, 500);
    }
});


// Export the app for Vercel
export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);
