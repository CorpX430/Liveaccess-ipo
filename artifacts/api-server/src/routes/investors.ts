import { Router } from "express";
import { db, investorsTable } from "@workspace/db";
import { count } from "drizzle-orm";
import { z } from "zod";
import nodemailer from "nodemailer";

const router = Router();

const InvestorInputSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
});

// Build transporter lazily — only if env vars are present
function getTransporter() {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!user || !pass) return null;
  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
}

async function notifyAdmin(fullName: string, email: string, investorId: number) {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn("[email] SMTP_USER / SMTP_PASS not configured — skipping admin notification");
    return;
  }
  try {
    await transporter.sendMail({
      from: `"SPCX Market" <${process.env.SMTP_USER}>`,
      to: "steslacorp@gmail.com",
      subject: "🚀 New IPO Access Request — SPCX Market",
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#050a0f;color:#fff;padding:32px;border-radius:8px;">
          <div style="border-bottom:1px solid rgba(255,255,255,0.1);padding-bottom:20px;margin-bottom:20px;">
            <h1 style="margin:0;font-size:24px;letter-spacing:2px;color:#fff;">SPCX MARKET</h1>
            <p style="margin:4px 0 0;color:rgba(255,255,255,0.5);font-size:12px;letter-spacing:1px;">ADMIN NOTIFICATION</p>
          </div>
          <h2 style="color:#1a8a4a;font-size:18px;margin:0 0 16px;">New IPO Access Request</h2>
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:8px 0;color:rgba(255,255,255,0.5);font-size:12px;letter-spacing:1px;">INVESTOR</td><td style="padding:8px 0;color:#fff;font-weight:bold;">${fullName}</td></tr>
            <tr><td style="padding:8px 0;color:rgba(255,255,255,0.5);font-size:12px;letter-spacing:1px;">EMAIL</td><td style="padding:8px 0;color:#fff;">${email}</td></tr>
            <tr><td style="padding:8px 0;color:rgba(255,255,255,0.5);font-size:12px;letter-spacing:1px;">INVESTOR ID</td><td style="padding:8px 0;color:#fff;font-family:monospace;">#${investorId}</td></tr>
            <tr><td style="padding:8px 0;color:rgba(255,255,255,0.5);font-size:12px;letter-spacing:1px;">TIME</td><td style="padding:8px 0;color:#fff;">${new Date().toUTCString()}</td></tr>
          </table>
          <div style="margin-top:28px;padding:16px;background:rgba(26,138,74,0.1);border:1px solid rgba(26,138,74,0.3);border-radius:4px;">
            <p style="margin:0;color:#1a8a4a;font-size:13px;">Action required: Log in to the Admin Panel to approve or reject this request.</p>
          </div>
        </div>
      `,
    });
    console.info(`[email] Admin notification sent for investor #${investorId}`);
  } catch (err) {
    console.error("[email] Failed to send admin notification:", err);
  }
}

// POST /api/investors — sign up for investor access
router.post("/investors", async (req, res): Promise<void> => {
  const parsed = InvestorInputSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input. Full name and valid email are required." });
    return;
  }

  const { fullName, email } = parsed.data;

  try {
    const [investor] = await db
      .insert(investorsTable)
      .values({ fullName: fullName.trim(), email: email.toLowerCase().trim() })
      .returning();

    // Fire-and-forget admin notification
    notifyAdmin(investor.fullName, investor.email, investor.id).catch(() => {});

    res.status(201).json({
      id: investor.id,
      fullName: investor.fullName,
      email: investor.email,
      status: investor.status,
      createdAt: investor.createdAt.toISOString(),
    });
  } catch (err: any) {
    if (err?.code === "23505") {
      res.status(409).json({ error: "This email is already registered." });
      return;
    }
    req.log.error({ err }, "Failed to create investor");
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});

// GET /api/investors/count — get total registered investor count
router.get("/investors/count", async (req, res): Promise<void> => {
  try {
    const [result] = await db.select({ count: count() }).from(investorsTable);
    res.json({ count: Number(result.count) });
  } catch (err) {
    req.log.error({ err }, "Failed to get investor count");
    res.status(500).json({ error: "Something went wrong." });
  }
});

export default router;
