
import { onCall, onRequest, HttpsError } from "firebase-functions/v2/https";
import { onUserCreated } from "firebase-functions/v2/auth";
import * as admin from "firebase-admin";
import express, { Request, Response, NextFunction } from "express";

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


app.get("/api/affiliate/summary", authMiddleware, async (req: Request, res: Response) => {
    return res.json({ ok: true, message: "Affiliate summary will be here." });
});

app.post("/api/staking/open", authMiddleware, async (req: Request, res: Response) => {
    return res.json({ ok: true, message: "Stake opened successfully." });
});

export const api = onRequest(
  { region: "asia-southeast1", secrets: ["TATUM_API_KEY", "MOTHER_WALLET_PRIVATE_KEY"] },
  app
);

/**
 * Sends a welcome email when a new user signs up by writing to the 'mail' collection,
 * which is monitored by the "Trigger Email from Firestore" extension.
 */
export const onnewusercreate = onUserCreated({
  region: "asia-southeast1",
}, async (event) => {
  const user = event.data;
  if (!user.email) {
    console.error(`User ${user.uid} has no email.`);
    return;
  }

  const displayName = user.displayName || "Pioneer";
  
  const welcomeEmail = {
      to: user.email,
      template: {
          name: "welcome", // This assumes a template named "welcome" exists in SendGrid or the extension config
          data: {
              name: displayName,
              cta_link: "https://phiquence-ndim2.web.app/login",
          },
      },
  };

  try {
    // Add a new document to the "mail" collection
    await db.collection("mail").add(welcomeEmail);
    console.log(`Welcome email queued for ${user.email}`);
  } catch (error: any) {
    console.error("Error queueing welcome email:", error);
  }
});


/**
 * A callable function for admins to send a bulk email to all users.
 * It iterates through all users and adds an email document for each to the 'mail' collection.
 */
export const sendBulkEmail = onCall({ region: "asia-southeast1" }, async (request) => {
    // 1. Authentication and Authorization
    if (request.auth?.token.role !== "admin") {
        throw new HttpsError("permission-denied", "You must be an admin to send bulk emails.");
    }
    
    // 2. Input Validation
    const { subject, html } = request.data;
    if (!subject || !html) {
        throw new HttpsError("invalid-argument", "The function must be called with 'subject' and 'html' arguments.");
    }

    // 3. Fetch all users
    try {
        const usersSnapshot = await db.collection("users").get();
        const emails: string[] = [];
        usersSnapshot.forEach(doc => {
            const user = doc.data();
            if (user.email) {
                emails.push(user.email);
            }
        });
        
        // 4. Create a batch write to queue all emails
        const batch = db.batch();
        emails.forEach(email => {
            const mailRef = db.collection("mail").doc(); // Create a new doc with a random ID
            batch.set(mailRef, {
                to: [email],
                message: {
                    subject: subject,
                    html: html,
                },
            });
        });

        // 5. Commit the batch
        await batch.commit();
        
        return { success: true, message: `Successfully queued emails for ${emails.length} users.` };

    } catch (error) {
        console.error("Failed to send bulk email:", error);
        throw new HttpsError("internal", "An error occurred while trying to queue the emails.");
    }
});
