import { Router } from "express";
import { db, investorsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { z } from "zod";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import crypto from "crypto";

const router = Router();

// ── helpers ────────────────────────────────────────────────────────────────

function getJwtSecret() {
  return process.env.JWT_SECRET || "spcx-dev-secret-change-in-production";
}

function signToken(payload: { id: number; email: string; fullName: string }) {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: "7d" });
}

function getTransporter() {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!user || !pass) return null;
  return nodemailer.createTransport({ service: "gmail", auth: { user, pass } });
}

function getAppBase() {
  const domain = process.env.REPLIT_DEV_DOMAIN;
  return domain ? `https://${domain}` : "http://localhost:3000";
}

const emailStyles = `
  font-family:'Helvetica Neue',Arial,sans-serif;max-width:600px;margin:0 auto;
  background:#050a0f;color:#fff;padding:40px;border:1px solid rgba(255,255,255,0.08);
`;

async function sendVerificationEmail(email: string, fullName: string, token: string) {
  const t = getTransporter();
  if (!t) { console.warn("[email] SMTP not configured — skipping verification email"); return; }
  const link = `${getAppBase()}/verify-email?token=${token}`;
  await t.sendMail({
    from: `"PROJECTX MARKET" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Verify your PROJECTX MARKET email",
    html: `
      <div style="${emailStyles}">
        <p style="letter-spacing:3px;font-size:11px;color:rgba(255,255,255,0.4);margin-bottom:8px;">PROJECTX MARKET, INC.</p>
        <h1 style="font-size:22px;margin:0 0 24px;letter-spacing:2px;">EMAIL VERIFICATION</h1>
        <p style="color:rgba(255,255,255,0.7);">Hi ${fullName}, please verify your email to complete your registration.</p>
        <a href="${link}" style="display:inline-block;margin:24px 0;padding:14px 32px;background:#fff;color:#050a0f;font-weight:bold;letter-spacing:2px;text-decoration:none;font-size:13px;">VERIFY EMAIL</a>
        <p style="color:rgba(255,255,255,0.4);font-size:12px;">This link expires in 24 hours. If you did not register, ignore this email.</p>
        <p style="color:rgba(255,255,255,0.3);font-size:11px;margin-top:32px;border-top:1px solid rgba(255,255,255,0.08);padding-top:16px;">© 2025 PROJECTX MARKET, INC.</p>
      </div>`,
  }).catch((e) => console.error("[email] Verification send failed:", e));
}

async function sendPasswordResetEmail(email: string, fullName: string, token: string) {
  const t = getTransporter();
  if (!t) { console.warn("[email] SMTP not configured — skipping reset email"); return; }
  const link = `${getAppBase()}/reset-password?token=${token}`;
  await t.sendMail({
    from: `"PROJECTX MARKET" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Reset your PROJECTX MARKET password",
    html: `
      <div style="${emailStyles}">
        <p style="letter-spacing:3px;font-size:11px;color:rgba(255,255,255,0.4);margin-bottom:8px;">PROJECTX MARKET, INC.</p>
        <h1 style="font-size:22px;margin:0 0 24px;letter-spacing:2px;">PASSWORD RESET</h1>
        <p style="color:rgba(255,255,255,0.7);">Hi ${fullName}, click below to reset your password. This link expires in 1 hour.</p>
        <a href="${link}" style="display:inline-block;margin:24px 0;padding:14px 32px;background:#fff;color:#050a0f;font-weight:bold;letter-spacing:2px;text-decoration:none;font-size:13px;">RESET PASSWORD</a>
        <p style="color:rgba(255,255,255,0.4);font-size:12px;">If you did not request a reset, you can safely ignore this email.</p>
        <p style="color:rgba(255,255,255,0.3);font-size:11px;margin-top:32px;border-top:1px solid rgba(255,255,255,0.08);padding-top:16px;">© 2025 PROJECTX MARKET, INC.</p>
      </div>`,
  }).catch((e) => console.error("[email] Reset send failed:", e));
}

// ── schemas ────────────────────────────────────────────────────────────────

const RegisterSchema = z.object({
  fullName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const ForgotSchema = z.object({ email: z.string().email() });

const ResetSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8),
});

const LegacySignInSchema = z.object({ email: z.string().email() });

// ── POST /api/auth/register ────────────────────────────────────────────────
router.post("/auth/register", async (req, res): Promise<void> => {
  const parsed = RegisterSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message || "Invalid input." });
    return;
  }
  const { fullName, email, password } = parsed.data;
  try {
    const passwordHash = await bcrypt.hash(password, 12);
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const [investor] = await db
      .insert(investorsTable)
      .values({ fullName: fullName.trim(), email: email.toLowerCase().trim(), passwordHash, verificationToken })
      .returning();

    // send verification email (fire-and-forget)
    sendVerificationEmail(investor.email, investor.fullName, verificationToken).catch(() => {});

    res.status(201).json({ id: investor.id, email: investor.email, status: investor.status });
  } catch (err: any) {
    if (err?.code === "23505") { res.status(409).json({ error: "This email is already registered." }); return; }
    req.log.error({ err }, "Register failed");
    res.status(500).json({ error: "Something went wrong." });
  }
});

// ── POST /api/auth/login ───────────────────────────────────────────────────
router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = LoginSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Email and password are required." }); return; }
  const { email, password } = parsed.data;
  try {
    const [investor] = await db.select().from(investorsTable)
      .where(eq(investorsTable.email, email.toLowerCase().trim())).limit(1);
    if (!investor) { res.status(401).json({ error: "Invalid email or password." }); return; }
    if (!investor.passwordHash) { res.status(401).json({ error: "No password set. Use forgot-password to create one." }); return; }
    const valid = await bcrypt.compare(password, investor.passwordHash);
    if (!valid) { res.status(401).json({ error: "Invalid email or password." }); return; }
    const token = signToken({ id: investor.id, email: investor.email, fullName: investor.fullName });
    res.json({ token, status: investor.status, email: investor.email, fullName: investor.fullName, emailVerified: investor.emailVerified });
  } catch (err) {
    req.log.error({ err }, "Login failed");
    res.status(500).json({ error: "Something went wrong." });
  }
});

// ── GET /api/auth/verify-email?token=xxx ──────────────────────────────────
router.get("/auth/verify-email", async (req, res): Promise<void> => {
  const token = req.query.token as string;
  if (!token) { res.status(400).json({ error: "Token is required." }); return; }
  try {
    const [investor] = await db.select().from(investorsTable)
      .where(eq(investorsTable.verificationToken, token)).limit(1);
    if (!investor) { res.status(404).json({ error: "Invalid or expired token." }); return; }
    await db.update(investorsTable)
      .set({ emailVerified: true, verificationToken: null })
      .where(eq(investorsTable.id, investor.id));
    res.json({ success: true, email: investor.email });
  } catch (err) {
    req.log.error({ err }, "Verify email failed");
    res.status(500).json({ error: "Something went wrong." });
  }
});

// ── POST /api/auth/forgot-password ────────────────────────────────────────
router.post("/auth/forgot-password", async (req, res): Promise<void> => {
  const parsed = ForgotSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Valid email required." }); return; }
  const { email } = parsed.data;
  try {
    const [investor] = await db.select().from(investorsTable)
      .where(eq(investorsTable.email, email.toLowerCase().trim())).limit(1);
    // Always respond OK to avoid user enumeration
    if (!investor) { res.json({ success: true }); return; }
    const resetToken = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await db.update(investorsTable)
      .set({ resetToken, resetTokenExpires: expires })
      .where(eq(investorsTable.id, investor.id));
    sendPasswordResetEmail(investor.email, investor.fullName, resetToken).catch(() => {});
    res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Forgot password failed");
    res.status(500).json({ error: "Something went wrong." });
  }
});

// ── POST /api/auth/reset-password ─────────────────────────────────────────
router.post("/auth/reset-password", async (req, res): Promise<void> => {
  const parsed = ResetSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.issues[0]?.message || "Invalid input." }); return; }
  const { token, password } = parsed.data;
  try {
    const [investor] = await db.select().from(investorsTable)
      .where(eq(investorsTable.resetToken, token)).limit(1);
    if (!investor || !investor.resetTokenExpires || investor.resetTokenExpires < new Date()) {
      res.status(400).json({ error: "Invalid or expired reset link." }); return;
    }
    const passwordHash = await bcrypt.hash(password, 12);
    await db.update(investorsTable)
      .set({ passwordHash, resetToken: null, resetTokenExpires: null })
      .where(eq(investorsTable.id, investor.id));
    res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, "Reset password failed");
    res.status(500).json({ error: "Something went wrong." });
  }
});

// ── POST /api/signin — legacy email-only + password fallback ──────────────
router.post("/signin", async (req, res): Promise<void> => {
  const parsed = LegacySignInSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "A valid email is required." }); return; }
  const { email } = parsed.data;
  try {
    const [investor] = await db.select().from(investorsTable)
      .where(eq(investorsTable.email, email.toLowerCase().trim())).limit(1);
    if (!investor) { res.status(404).json({ error: "No account found with this email." }); return; }
    res.json({ status: investor.status, fullName: investor.fullName, email: investor.email });
  } catch (err) {
    req.log.error({ err }, "Sign in failed");
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});

export default router;
