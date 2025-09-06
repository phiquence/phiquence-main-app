
import { onCall, onRequest, HttpsError } from "firebase-functions/v2/https";
import { onUserCreated } from "firebase-functions/v2/auth";
import * as admin from "firebase-admin";
import express, { Request, Response, NextFunction } from "express";
import * as sgMail from "@sendgrid/mail";

admin.initializeApp();
const db = admin.firestore();

// Extend the Express Request type
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      uid?: string;
      claims?: admin.auth.DecodedIdToken;
    }
  }
}

const app = express();
app.use(express.json());

const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = (req.headers.authorization || "").replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ ok: false, error: "unauthorized" });
    }
    const decoded = await admin.auth().verifyIdToken(token);
    req.uid = decoded.uid;
    req.claims = decoded;
    return next();
  } catch (e) {
    return res.status(401).json({ ok: false, error: "unauthorized" });
  }
};

app.post("/api/wallet/request-deposit", authMiddleware, async (req: Request, res: Response) => {
    const { amount, currency, txHash } = req.body;
    const uid = req.uid!;

    if (!amount || !currency || !txHash) {
        return res.status(400).json({ ok: false, error: "Invalid request payload." });
    }
    
    try {
        const transactionRef = db.collection("transactions").doc();
        
        await transactionRef.set({
            userId: uid,
            type: 'deposit',
            currency: currency.toUpperCase(),
            amount: parseFloat(amount),
            status: 'reviewing', // Admin needs to verify this
            ref: txHash,
            meta: {
                network: 'BEP-20',
                txHash: txHash,
            },
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        return res.json({ ok: true, message: `Your deposit request for ${amount} ${currency} has been submitted for review.`});
    } catch (e: any) {
        console.error("Deposit request submission failed:", e);
        return res.status(500).json({ ok: false, error: e.message || "An unexpected error occurred." });
    }
});


app.post("/api/staking/open", authMiddleware, async (req: Request, res: Response) => {
    const { amount, tier, autoCompound = false } = req.body;
    const uid = req.uid!;

    if (!amount || !tier || typeof amount !== 'number' || amount <= 0) {
        return res.status(400).json({ ok: false, error: "invalid_request_payload" });
    }

    const settingsRef = db.doc("settings/global");
    const userRef = db.doc(`users/${uid}`);
    const stakeId = db.collection("stakes").doc().id;

    try {
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
            tx.set(db.doc(`stakes/${stakeId}`), {
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
            });
            
            // 3. Distribute Spot Commissions to upline
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
                        tx.update(sponsorRef, { "balances.commission": admin.firestore.FieldValue.increment(commissionAmount) });

                        const payoutRef = db.collection("payouts").doc();
                        tx.set(payoutRef, {
                            toUserId: sponsorId,
                            fromUserId: uid,
                            source: "direct_spot",
                            level,
                            amount: commissionAmount,
                            createdAt: admin.firestore.FieldValue.serverTimestamp(),
                            stakeId: stakeId,
                        });
                    }
                }
            }
        });
        
        return res.json({ ok: true, message: `Stake of ${amount} USDT opened successfully.` });
    } catch (e: any) {
        console.error("Staking failed:", e);
        return res.status(500).json({ ok: false, error: e.message || "An unexpected error occurred." });
    }
});

app.post('/api/founder/join', authMiddleware, async (req: Request, res: Response) => {
    const uid = req.uid!;
    const FOUNDER_COST = 5000;
    const userRef = db.doc(`users/${uid}`);

    try {
        await db.runTransaction(async (tx) => {
            const userDoc = await tx.get(userRef);
            if (!userDoc.exists()) throw new Error("User not found.");

            const userData = userDoc.data()!;
            if (userData.isFounder) throw new Error("User is already a founder.");
            if ((userData.balances?.usdt || 0) < FOUNDER_COST) {
                throw new Error("Insufficient USDT balance.");
            }

            // 1. Deduct cost & update status
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
                meta: { description: 'Founder Membership Purchase' },
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
            });
        });

        return res.json({ ok: true, message: "Congratulations! You are now a Founder Member." });
    } catch (e: any) {
        console.error("Becoming a founder failed:", e);
        return res.status(500).json({ ok: false, error: e.message || "An unexpected error occurred." });
    }
});


export const api = onRequest(
  { region: "asia-southeast1", secrets: ["SENDGRID_API_KEY"] },
  app
);

export const onnewusercreate = onUserCreated({
  region: "asia-southeast1",
  secrets: ["SENDGRID_API_KEY"],
}, async (event) => {
  const user = event.data;
  if (!user.email) {
    console.error(`User ${user.uid} has no email.`);
    return;
  }
  
  // SendGrid API key should be set in environment variables
  const apiKey = process.env.SENDGRID_API_KEY;
  if(!apiKey) {
      console.error("SENDGRID_API_KEY not set.");
      return;
  }
  sgMail.setApiKey(apiKey);

  const displayName = user.displayName || "Pioneer";
  const welcomeEmail = {
    to: user.email,
    from: {
        name: 'Phiquence Team',
        email: 'welcome@phiquence.com' // Ensure this is a verified sender in SendGrid
    },
    templateId: 'd-your-template-id', // Replace with your Dynamic Template ID from SendGrid
    dynamicTemplateData: {
      subject: `Welcome to PHIQUENCE, ${displayName}!`,
      name: displayName,
      cta_link: 'https://phiquence-ndim2.web.app/login' // Your app's login page
    },
  };
  
  try {
    // For now, sending a simple HTML email if template is not set up
    // In production, you would remove this and only use the template
    await sgMail.send({
      ...welcomeEmail,
      // Fallback HTML content if template fails or is not provided
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>Welcome to PHIQUENCE, ${displayName}!</h2>
          <p>We are thrilled to have you on board. You've just taken the first step towards achieving true financial balance and real growth.</p>
          <p>Here are a few things you can do to get started:</p>
          <ul>
            <li>Explore your personalized dashboard.</li>
            <li>Check out our staking packages to grow your assets.</li>
            <li>Find your unique referral link in the affiliate center.</li>
          </ul>
          <p>If you have any questions, our support team is always here to help.</p>
          <a href="${welcomeEmail.dynamicTemplateData.cta_link}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Go to Dashboard</a>
          <br><br>
          <p>Best regards,</p>
          <p>The Phiquence Team</p>
        </div>
      `,
    });
    console.log(`Welcome email sent to ${user.email}`);
  } catch (error) {
    console.error("Error sending welcome email:", error);
    if ((error as any).response) {
      console.error((error as any).response.body)
    }
  }
});
