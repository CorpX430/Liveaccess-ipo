---
name: SpaceX IPO App Overview
description: Key decisions, integrations, and quirks for the PROJECTX MARKET app.
---

## Branding
- App name: **PROJECTX MARKET, inc** (public pages). Internal code still uses "spcx" prefix for localStorage keys and CSS.
- Ticker: PRJX
- Logo: `/public/logo.png` (SpaceX wordmark, white)
- Hero background: `/public/dragon.webp` (SpaceX Dragon capsule, used on Home + SignIn + auth pages)

## Stack
- Frontend: React + Vite in `artifacts/spacex-ipo`, routed at `/` (root). Uses wouter, @tanstack/react-query, framer-motion, recharts, sonner, lucide-react.
- Backend: Express 5 API in `artifacts/api-server`. TypeScript, pino logging, esbuild bundled.
- DB: PostgreSQL via Drizzle ORM (`lib/db`). Schema in `lib/db/src/schema/`.
- API codegen: OpenAPI → Orval → `@workspace/api-client-react` hooks (for existing endpoints only).

## Auth system (JWT + email)
- Registration: `POST /api/auth/register` — name + email + password (bcrypt hash, 12 rounds). Sends verification email via nodemailer.
- Login: `POST /api/auth/login` — email + password → JWT (7-day expiry). Stored in `localStorage.spcx_token`.
- Email verification: `GET /api/auth/verify-email?token=xxx` → sets `email_verified=true`. Frontend page at `/verify-email`.
- Forgot password: `POST /api/auth/forgot-password` — sends reset link (1h expiry).
- Reset password: `POST /api/auth/reset-password` — token + new password. Frontend page at `/reset-password`.
- Legacy sign-in: `POST /api/signin` still works (email-only, for backward compat with codegen hook).
- **Why:** JWT kept independent of admin. Admin is still license-key-only (`StockdevA`), no JWT involved.

## DB schema (investors table)
- id, full_name, email, password_hash (nullable), email_verified (bool), verification_token, reset_token, reset_token_expires, status (enum: pending/approved/rejected), created_at
- Other tables: deposits, deposit_addresses, holdings

## Theme system
- ThemeContext at `artifacts/spacex-ipo/src/contexts/ThemeContext.tsx`.
- CSS variables for dark/light defined in `index.css` under `html.light-theme {}`.
- Toggle persisted in localStorage key `spcx_theme`.

## Email (nodemailer)
- Sends to `steslacorp@gmail.com` on new investor signup (admin notification).
- Sends verification email to user on registration.
- Sends password reset email to user on forgot-password.
- Needs `SMTP_USER` + `SMTP_PASS` Replit secrets (Gmail App Password). Graceful no-op if not set.
- Email from name: "PROJECTX MARKET"

## APIs integrated
- News: `https://newsapi.org/v2/everything` with key `a08656f1a1e84e0da2d3f9c2d5116b66`. Cached 10 min server-side.
- Stock: Massive.com API tried first, falls back to deterministic noise. Cached 60s.

## Admin
- `/admin` route — license-key gated client-side. Key: `StockdevA`. SessionStorage persists unlock.
- JWT does NOT affect admin routes.

## localStorage keys
- `spcx_user`: `{ email, fullName }` — set on approved login
- `spcx_token`: JWT string — set on login
- `spcx_theme`: "dark" | "light"
