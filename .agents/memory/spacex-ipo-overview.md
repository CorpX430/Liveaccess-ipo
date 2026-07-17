---
name: SpaceX IPO App Overview
description: Key decisions, integrations, and quirks for the SPCX Market app.
---

## Stack
- Frontend: React + Vite in `artifacts/spacex-ipo`, routed at `/` (root). Uses wouter, @tanstack/react-query, framer-motion, recharts, sonner, lucide-react.
- Backend: Express 5 API in `artifacts/api-server`. TypeScript, pino logging, esbuild bundled.
- DB: PostgreSQL via Drizzle ORM (`@workspace/db`). Schema: investors, deposits, deposit_addresses, holdings.
- API codegen: OpenAPI → Orval → `@workspace/api-client-react` hooks.

## Auth pattern
- User-side: email-only sign-in; approved status stored in `localStorage` as `spcx_user: { email, fullName }`.
- Admin: anonymous — only protected by license key `StockdevA` checked client-side, stored in `sessionStorage`.

## Theme system
- ThemeContext at `artifacts/spacex-ipo/src/contexts/ThemeContext.tsx`.
- CSS variables for dark/light defined in `index.css` under `html.light-theme {}`.
- Toggle persisted in localStorage key `spcx_theme`.

## Email notifications
- nodemailer installed in api-server. Reads `SMTP_USER` and `SMTP_PASS` env vars (Gmail service).
- Sends to `steslacorp@gmail.com` on every new investor signup.
- Graceful no-op if env vars not set — logs a warning.
- **Why:** User requires real-time admin alerts. Needs Gmail App Password set as `SMTP_PASS` secret to activate.

## APIs integrated
- News: `https://newsapi.org/v2/everything` with key `a08656f1a1e84e0da2d3f9c2d5116b66`. Cached 10 min server-side.
- Stock: Massive.com API (`wUwn9KED79e29Pd9H4EDt5Wac8VpX8Ch`) tried first, falls back to deterministic noise. Cached 60s.
- **Why:** SpaceX is pre-IPO so no real SPCX ticker exists; real APIs can't return it. The Massive.com call uses AAPL as a proxy for movement.

## Admin license key
- Value: `StockdevA`
- Gate is purely client-side (sessionStorage). Renders `<LicenseGate>` until correct key entered.

## Routes
- `/news` — live news feed page (requires sign-in)
- `/admin` — license-gated admin panel (no sign-in needed, just license key)
- All other portal routes redirect to `/signin` if no `spcx_user` in localStorage.
