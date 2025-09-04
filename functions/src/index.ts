import * as admin from "firebase-admin";
import express, { Request, Response, NextFunction } from "express";

// v2 ফাংশনের জন্য নতুন ইম্পোর্ট
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { onRequest } from "firebase-functions/v2/https";

// Firebase Admin SDK চালু করা
if (admin.apps.length === 0) {
  admin.initializeApp();
}
const db = admin.firestore();

// --- TypeScript-কে জানানোর জন্য যে আমাদের Request অবজেক্টে uid এবং claims থাকবে ---
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      uid?: string;
      claims?: admin.auth.DecodedIdToken;
    }
  }
}

// ========================================================================
// ## বিভাগ ১: ডেটাবেস Seeder ফাংশন (v2 সিনট্যাক্স)
// ========================================================================

const globalSettings = {
  staking: {
    accrualTime: { hour: 0, minute: 5, tz: "Asia/Dhaka" },
    offDays: { weekly: ["FRI"], calendar: [] },
    packages: {
      Harmony: { min: 50, max: 499, dailyPct: 0.003 },
      Proportion: { min: 500, max: 1999, dailyPct: 0.005 },
      Divine: { min: 2000, max: 4999, dailyPct: 0.008 },
      Infinity: { min: 5000, max: 10000, dailyPct: 0.012 },
    },
    termDays: 365,
    compoundAllowed: true,
  },
  affiliate: {
    spot: {
      levels: 5,
      rates: { l1: 0.10, l2: 0.06, l3: 0.04, l4: 0.02, l5: 0.01 },
    },
    stakeDaily: {
      levels: 5,
      rates: { l1: 0.02, l2: 0.01, l3: 0.005, l4: 0.003, l5: 0.002 },
    },
    tradingHub: {
      freeJoinGift: 5,
      profitSharePct: 0.04,
      lossSharePct: 0.06,
      levels: 6,
      split: { l1: 0.30, l2: 0.20, l3: 0.15, l4: 0.15, l5: 0.10, l6: 0.10 },
    },
  },
  wallet: {
    minDeposit: 10,
    minWithdraw: 20,
    feePct: 0.01,
  },
  admin: {
    signalControl: true,
    autoAlgo: true,
  },
};

export const seedGlobalSettings = onCall({ region: "asia-southeast1" }, async (request) => {
    // v2-তে context এখন request.auth-এর ভেতরে থাকে
    if (request.auth?.token?.role !== "admin") {
      throw new HttpsError(
        "permission-denied",
        "Must be an administrative user to initiate seeding."
      );
    }
    try {
      const settingsRef = db.doc("settings/global");
      await settingsRef.set(globalSettings);
      console.log("Global settings seeded successfully.");
      return { success: true, message: "Global settings have been seeded." };
    } catch (error: any) {
      console.error("Error seeding global settings:", error);
      throw new HttpsError(
        "internal",
        "Could not seed global settings.",
        error.message
      );
    }
  }
);

// ========================================================================
// ## বিভাগ ২: আপনার মূল API (Express App) (v2 সিনট্যাক্স)
// ========================================================================

const app = express();
app.use(express.json());

const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = (req.headers.authorization || "").replace("Bearer ","");
    if (!token) {
        return res.status(401).json({ok:false, error:"unauthorized"});
    }
    const decoded = await admin.auth().verifyIdToken(token);
    req.uid = decoded.uid;
    req.claims = decoded;
    return next();
  } catch(e) {
    return res.status(401).json({ok:false, error:"unauthorized"});
  }
};

app.post("/api/staking/open", authMiddleware, async (req: Request, res: Response) => {
    const { amount, tier, autoCompound=false } = req.body || {};
    const uid = req.uid as string;
    try {
        const setDoc = await db.doc("settings/global").get();
        const pkg = setDoc.get(`staking.packages.${tier}`);
        if(!pkg) return res.status(400).json({ok:false, error:"invalid_tier"});
        if(amount < pkg.min || amount > pkg.max) return res.status(400).json({ok:false, error:"amount_out_of_range"});
        const stake = {
            userId: uid, amount: Number(amount), tier, dailyPct: pkg.dailyPct,
            autoCompound, status: "active", termDays: setDoc.get("staking.termDays") || 365,
            startAt: Date.now(), lastAccruedAt: Date.now(), totalAccrued: 0
        };
        const ref = await db.collection("stakes").add(stake);
        return res.json({ ok:true, stakeId: ref.id, dailyPct: stake.dailyPct });
    } catch (error) {
        console.error("Error opening stake:", error);
        return res.status(500).json({ok: false, error: "internal_server_error"});
    }
});

app.post("/api/trading/join", authMiddleware, async (req: Request, res: Response) => {
    const uid = req.uid as string;
    try {
        const setDoc = await db.doc("settings/global").get();
        const gift = setDoc.get("affiliate.tradingHub.freeJoinGift") || 5;
        const userRef = db.doc(`users/${uid}`);
        await db.runTransaction(async (tx) => {
            const userDoc = await tx.get(userRef);
            const joined = userDoc.get("joinedTradingHub") || false;
            if (!joined) {
                tx.update(userRef, {
                    joinedTradingHub: true,
                    "balances.trading": admin.firestore.FieldValue.increment(gift)
                });
            }
        });
        return res.json({ ok:true });
    } catch (error) {
        console.error("Error joining trading hub:", error);
        return res.status(500).json({ok: false, error: "internal_server_error"});
    }
});

app.post("/api/trading/bet", authMiddleware, async (req: Request, res: Response) => {
    const { sessionId, direction, amount } = req.body || {};
    const uid = req.uid as string;
    if(!["rise","fall"].includes(direction)) return res.status(400).json({ok:false, error:"bad_direction"});
    if(!sessionId || !amount || amount <= 0) return res.status(400).json({ok:false, error:"invalid_payload"});
    const sRef = db.doc(`tradingSessions/${sessionId}`);
    const bRef = sRef.collection("bets").doc();
    try {
        await db.runTransaction(async (tx) => {
            const s = await tx.get(sRef);
            if(!s.exists || s.get("status")!=="open") {
              throw new Error("session_not_open");
            }
            const uRef = db.doc(`users/${uid}`);
            const u = await tx.get(uRef);
            const bal = (u.get("balances")?.trading || 0);
            if(bal < amount) {
              throw new Error("insufficient_trading_balance");
            }
            tx.update(uRef, { "balances.trading": admin.firestore.FieldValue.increment(-amount) });
            tx.set(bRef, {
                userId: uid, direction, amount: Number(amount),
                createdAt: Date.now(), result: "pending"
            });
        });
        return res.json({ ok:true, betId: bRef.id });
    } catch (error: any) {
        console.error("Error placing bet:", error);
        return res.status(400).json({ok: false, error: error.message || "bet_placement_failed"});
    }
});

export const api = onRequest({ region: "asia-southeast1" }, app);