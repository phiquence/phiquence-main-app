
import { onRequest } from "firebase-functions/v2/https";
import { onUserCreated } from "firebase-functions/v2/auth";
import * as admin from "firebase-admin";
import express, { Request, Response, NextFunction } from "express";
import * as sgMail from "@sendgrid/mail";

admin.initializeApp();

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

export const onnewusercreate = onUserCreated({
  region: "asia-southeast1",
  secrets: ["SENDGRID_API_KEY"],
}, async (event) => {
  const user = event.data;
  if (!user.email) {
    console.error(`User ${user.uid} has no email.`);
    return;
  }
  
  const apiKey = process.env.SENDGRID_API_KEY;
  if(!apiKey) {
      console.error("SENDGRID_API_KEY not set.");
      return;
  }
  sgMail.setApiKey(apiKey);

  const displayName = user.displayName || "Pioneer";
  
  // In a real app, you'd use a template ID from SendGrid
  // const welcomeEmail = {
  //   to: user.email,
  //   from: 'welcome@phiquence.com', // This must be a verified sender
  //   templateId: 'd-your-template-id',
  //   dynamicTemplateData: {
  //     name: displayName,
  //     cta_link: 'https://phiquence-ndim2.web.app/login'
  //   },
  // };

  // For now, sending a rich HTML email directly
  const welcomeEmail = {
    to: user.email,
    from: {
        name: 'The Phiquence Team',
        email: 'welcome@phiquence.com'
    },
    subject: `Welcome to PHIQUENCE, ${displayName}!`,
    html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
            <h2 style="color: #0056b3;">Welcome to PHIQUENCE, ${displayName}!</h2>
            <p>We are thrilled to have you on board. You've just taken the first step towards achieving true financial balance and real growth.</p>
            <p>Your journey into a new era of financial empowerment begins now. Here are a few things you can do to get started:</p>
            <ul style="list-style-type: none; padding: 0;">
              <li style="margin-bottom: 10px;">✅ <strong>Explore Your Dashboard:</strong> Get familiar with your personalized space.</li>
              <li style="margin-bottom: 10px;">📈 <strong>Grow Your Assets:</strong> Check out our staking packages to start earning daily rewards.</li>
              <li style="margin-bottom: 10px;">🤝 <strong>Build Your Team:</strong> Find your unique referral link in the affiliate center and invite others.</li>
            </ul>
            <p>If you have any questions, our AI-powered support and dedicated team are always here to help.</p>
            <a href="https://phiquence-ndim2.web.app/login" style="background-color: #007bff; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 15px;">Go to Your Dashboard</a>
            <br><br>
            <p>Best regards,</p>
            <p><strong>The Phiquence Team</strong></p>
          </div>
        </div>
      `,
  };
  
  try {
    await sgMail.send(welcomeEmail);
    console.log(`Welcome email sent to ${user.email}`);
  } catch (error: any) {
    console.error("Error sending welcome email:", error);
     if (error.response) {
      console.error(error.response.body)
    }
  }
});
