import { Router } from "express";

const router = Router();

const BASE_PRICE = 147.62;
const MASSIVE_API_KEY = "wUwn9KED79e29Pd9H4EDt5Wac8VpX8Ch";

// Cache Massive.com response for 60 seconds to avoid hammering the API
let massiveCache: { price: number; ts: number } | null = null;

async function fetchMassivePrice(): Promise<number | null> {
  if (massiveCache && Date.now() - massiveCache.ts < 60_000) {
    return massiveCache.price;
  }
  try {
    // Try primary Massive.com endpoint
    const res = await fetch(
      `https://api.massive.com/v1/quote?symbol=AAPL&apikey=${MASSIVE_API_KEY}`,
      { signal: AbortSignal.timeout(5000) }
    );
    if (res.ok) {
      const data = await res.json() as Record<string, unknown>;
      // Map real stock movement proportionally to SPCX base price
      const realPrice = (data?.price ?? data?.c ?? data?.last ?? null) as number | null;
      if (typeof realPrice === "number" && realPrice > 0) {
        // Use % change from real stock to give realistic movement to SPCX
        const pct = (realPrice - (massiveCache?.price ?? realPrice)) / realPrice;
        const newPrice = Math.round((BASE_PRICE + pct * BASE_PRICE) * 100) / 100;
        massiveCache = { price: newPrice, ts: Date.now() };
        return newPrice;
      }
    }
  } catch {
    // silent — fall through to deterministic noise
  }
  return null;
}

// Deterministic noise fallback
function deterministicPrice(): { price: number; change: number; changePct: number } {
  const seed = Math.floor(Date.now() / 30000);
  const rng = (s: number) => { const x = Math.sin(s) * 10000; return x - Math.floor(x); };
  const noise = (rng(seed) - 0.5) * 4;
  const price = Math.round((BASE_PRICE + noise) * 100) / 100;
  const change = Math.round(noise * 100) / 100;
  const changePct = Math.round((change / BASE_PRICE) * 10000) / 100;
  return { price, change, changePct };
}

// GET /api/stock/quote
router.get("/stock/quote", async (_req, res): Promise<void> => {
  const massivePrice = await fetchMassivePrice();
  const { price: fallbackPrice, change, changePct } = deterministicPrice();
  const price = massivePrice ?? fallbackPrice;

  const seed = Math.floor(Date.now() / 30000);
  const rng = (s: number) => { const x = Math.sin(s) * 10000; return x - Math.floor(x); };

  res.json({
    symbol: "SPCX",
    price,
    change: massivePrice ? Math.round((price - BASE_PRICE) * 100) / 100 : change,
    changePct: massivePrice ? Math.round(((price - BASE_PRICE) / BASE_PRICE) * 10000) / 100 : changePct,
    volume: 25_693_000 + Math.floor(rng(seed + 1) * 500000),
    marketCap: 1_920_000_000_000,
    bid: Math.round((price - 0.01) * 100) / 100,
    ask: Math.round((price + 0.09) * 100) / 100,
    dayLow: Math.round((price - (rng(seed + 2) * 5 + 1)) * 100) / 100,
    dayHigh: Math.round((price + (rng(seed + 3) * 8 + 3)) * 100) / 100,
    week52High: 178.45,
    week52Low: 135.00,
    peRatio: null,
    avgVolume: 25_690_000,
    sharesOut: "13.00B",
  });
});

// GET /api/stock/history?period=
router.get("/stock/history", (req, res): void => {
  const period = (req.query.period as string) || "1D";

  const configs: Record<string, { points: number; stepMs: number; startPrice: number }> = {
    "1D":  { points: 78,  stepMs: 5 * 60 * 1000,              startPrice: BASE_PRICE * 0.98 },
    "1W":  { points: 35,  stepMs: 4 * 60 * 60 * 1000,         startPrice: BASE_PRICE * 0.94 },
    "1M":  { points: 30,  stepMs: 24 * 60 * 60 * 1000,        startPrice: BASE_PRICE * 0.89 },
    "3M":  { points: 45,  stepMs: 2 * 24 * 60 * 60 * 1000,    startPrice: BASE_PRICE * 0.82 },
    "1Y":  { points: 52,  stepMs: 7 * 24 * 60 * 60 * 1000,    startPrice: BASE_PRICE * 0.65 },
    "5Y":  { points: 60,  stepMs: 30 * 24 * 60 * 60 * 1000,   startPrice: BASE_PRICE * 0.30 },
  };

  const cfg = configs[period] ?? configs["1D"];
  const { points, stepMs, startPrice } = cfg;
  const now = Date.now();
  const data: { time: string; price: number }[] = [];

  let price = startPrice * 0.9 + Math.random() * startPrice * 0.2;
  for (let i = 0; i < points; i++) {
    const ts = now - (points - i) * stepMs;
    const progressToEnd = i / points;
    const targetPrice = startPrice + (BASE_PRICE - startPrice) * progressToEnd;
    const volatility = BASE_PRICE * 0.004;
    price = price + (targetPrice - price) * 0.1 + (Math.random() - 0.5) * volatility;
    price = Math.max(price, BASE_PRICE * 0.25);

    const t = new Date(ts);
    let timeStr: string;
    if (period === "1D") {
      timeStr = t.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
    } else if (period === "1W" || period === "1M") {
      timeStr = t.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } else {
      timeStr = t.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
    }

    data.push({ time: timeStr, price: Math.round(price * 100) / 100 });
  }

  res.json({ period, data });
});

export default router;
