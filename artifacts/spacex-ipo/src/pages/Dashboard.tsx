import React, { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { SideNav } from "@/components/SideNav";
import { useTheme } from "@/contexts/ThemeContext";
import { Bell, ArrowUpRight, ArrowDownRight } from "lucide-react";
import {
  useGetStockQuote,
  useGetStockHistory,
  useGetHoldings,
  getGetStockQuoteQueryKey,
  getGetStockHistoryQueryKey,
  getGetHoldingsQueryKey
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

const PERIODS = ["Live", "1D", "1W", "1M", "3M", "1Y", "5Y"] as const;
type Period = typeof PERIODS[number];
type ApiPeriod = "1D" | "1W" | "1M" | "3M" | "1Y" | "5Y";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const userRaw = localStorage.getItem("spcx_user");
  const user = userRaw ? JSON.parse(userRaw) : null;
  const { isDark } = useTheme();
  const [period, setPeriod] = useState<Period>("1D");

  useEffect(() => {
    if (!user) setLocation("/signin");
  }, [user, setLocation]);

  const apiPeriod: ApiPeriod = period === "Live" ? "1D" : period;

  const { data: quote } = useGetStockQuote({
    query: { refetchInterval: 30000, queryKey: getGetStockQuoteQueryKey() }
  });
  const { data: history } = useGetStockHistory({ period: apiPeriod }, {
    query: { refetchInterval: 30000, queryKey: getGetStockHistoryQueryKey({ period: apiPeriod }) }
  });
  const { data: holdings } = useGetHoldings({ email: user?.email || "" }, {
    query: { enabled: !!user?.email, queryKey: getGetHoldingsQueryKey({ email: user?.email || "" }) }
  });

  if (!user) return null;

  const isUp = (quote?.change ?? 0) >= 0;
  const green = isDark ? "#1a8a4a" : "#15803d";
  const red = "#ef4444";
  const chartColor = isUp ? green : red;

  const bg = isDark ? "bg-[#050a0f]" : "bg-[#f5f7fa]";
  const headerBg = isDark ? "bg-[#050a0f]/80 border-white/10" : "bg-white/80 border-black/10";
  const cardBg = isDark ? "bg-[#0a0f16] border-white/8" : "bg-white border-black/8";
  const statBg = isDark ? "bg-[#0d1520] border-white/5" : "bg-[#f0f4f8] border-black/5";
  const textMuted = isDark ? "text-white/40" : "text-black/40";
  const textMain = isDark ? "text-white" : "text-black";
  const textSub = isDark ? "text-white/60" : "text-black/60";
  const divider = isDark ? "border-white/8" : "border-black/8";
  const periodActive = isDark ? "bg-white text-black font-bold" : "bg-black text-white font-bold";
  const periodInactive = isDark ? "text-white/50 hover:text-white hover:bg-white/5" : "text-black/50 hover:text-black hover:bg-black/5";

  const statItems = [
    { label: "24h Vol",      value: quote ? `${(quote.volume / 1_000_000).toFixed(2)}M` : "—" },
    { label: "Mkt Cap",      value: quote ? `$${(quote.marketCap / 1_000_000_000_000).toFixed(2)}T` : "—" },
    { label: "Bid",          value: quote ? `$${quote.bid?.toFixed(2)}` : "—" },
    { label: "Ask",          value: quote ? `$${quote.ask?.toFixed(2)}` : "—" },
    { label: "Day Range",    value: quote ? `$${quote.dayLow?.toFixed(2)} – $${quote.dayHigh?.toFixed(2)}` : "—" },
    { label: "52W High",     value: quote ? `$${quote.week52High}` : "—" },
    { label: "52W Low",      value: quote ? `$${quote.week52Low}` : "—" },
    { label: "P/E Ratio",    value: "—" },
    { label: "Avg Vol (30D)",value: quote ? `${(quote.avgVolume / 1_000_000).toFixed(2)}M` : "—" },
    { label: "Shares Out",   value: quote?.sharesOut ?? "—" },
  ];

  const holdingShares = Number(holdings?.shares ?? 0);
  const holdingValue = holdingShares * (quote?.price ?? 0);
  const avgCost = holdings?.avgCost ? Number(holdings.avgCost) : 0;

  return (
    <div className={`min-h-[100dvh] ${bg} ${textMain}`}>
      {/* Header */}
      <header className={`h-16 border-b ${headerBg} backdrop-blur-md flex items-center justify-between px-4 sticky top-0 z-40`}>
        <div className="flex items-center gap-4">
          <SideNav />
          <span className={`font-display tracking-widest font-bold text-lg uppercase hidden sm:inline-block ${textMuted}`}>Client Portal</span>
        </div>
        <div className="flex items-center gap-3">
          <button className={`relative p-2 transition-colors rounded-full ${isDark ? "hover:bg-white/5" : "hover:bg-black/5"}`}>
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#1a8a4a] rounded-full border border-current" />
          </button>
          <div className={`w-8 h-8 ${isDark ? "bg-white/10" : "bg-black/10"} flex items-center justify-center text-sm font-display font-bold`}>
            {user.fullName.charAt(0).toUpperCase()}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-4xl space-y-6">

        {/* Stock Header */}
        <div className="space-y-1 pt-2">
          <div className="flex items-baseline gap-3">
            <h1 className="text-4xl md:text-5xl font-display font-bold uppercase tracking-tight">SpaceX</h1>
          </div>
          <p className={`text-xs tracking-widest uppercase font-display ${textMuted}`}>SPCX &nbsp;·&nbsp; NASDAQ &nbsp;·&nbsp; USD</p>

          {quote && (
            <div className="pt-2 space-y-1">
              <div className="text-5xl md:text-6xl font-display font-bold tracking-tight">
                ${quote.price.toFixed(2)}
              </div>
              <div className={`flex items-center gap-1 font-display text-base tracking-wide ${isUp ? `text-[${green}]` : "text-red-500"}`}
                   style={{ color: isUp ? green : red }}>
                {isUp ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                <span style={{ color: isUp ? green : red }}>
                  ${Math.abs(quote.change).toFixed(2)} ({quote.changePct > 0 ? "+" : ""}{quote.changePct.toFixed(2)}%)
                </span>
                <span className={`ml-2 ${textMuted}`}>Today</span>
              </div>
            </div>
          )}
        </div>

        {/* Chart */}
        <div className={`border ${cardBg}`}>
          {/* Period selector */}
          <div className={`flex gap-1 px-4 pt-4 pb-2 border-b ${divider} overflow-x-auto scrollbar-hide`}>
            {PERIODS.map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1 text-xs font-display tracking-widest uppercase transition-colors whitespace-nowrap ${period === p ? periodActive : periodInactive}`}
              >
                {p}
              </button>
            ))}
          </div>

          <div className="h-[240px] w-full p-4">
            {history && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={history.data} margin={{ top: 4, right: 4, left: 4, bottom: 4 }}>
                  <defs>
                    <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={chartColor} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" hide />
                  <YAxis domain={["auto", "auto"]} hide />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? "#050a0f" : "#fff",
                      borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
                      borderRadius: 0,
                      padding: "10px 14px",
                    }}
                    itemStyle={{ color: isDark ? "#fff" : "#000", fontWeight: "bold" }}
                    labelStyle={{ color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)", marginBottom: 4, fontSize: 11 }}
                    formatter={(v: number) => [`$${v.toFixed(2)}`, "Price"]}
                    labelFormatter={(l) => l}
                  />
                  <Area
                    type="monotone"
                    dataKey="price"
                    stroke={chartColor}
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#chartFill)"
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Key Market Stats */}
        <div>
          <h3 className={`text-xs uppercase tracking-widest font-display ${textMuted} mb-3`}>Key Market Stats</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            {statItems.map((s) => (
              <div key={s.label} className={`border ${statBg} p-3`}>
                <div className={`text-[10px] uppercase tracking-widest font-display ${textMuted} mb-1`}>{s.label}</div>
                <div className={`font-display font-bold text-sm ${textMain}`}>{s.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Your Holdings */}
        <div className={`border ${cardBg} p-6`}>
          <h3 className={`text-xs uppercase tracking-widest font-display ${textMuted} mb-4`}>Your Holdings</h3>
          <div className="flex items-end justify-between">
            <div>
              <div className={`text-4xl font-display font-bold tracking-tight ${textMain}`}>
                {holdingShares.toLocaleString()}
              </div>
              <div className={`text-sm ${textSub} mt-1`}>Shares</div>
              {avgCost > 0 && (
                <div className={`text-xs ${textMuted} mt-1`}>Avg Cost ${avgCost.toFixed(2)}</div>
              )}
            </div>
            <div className="text-right">
              <div className={`text-2xl font-display font-bold ${textMain}`}>
                ${holdingValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className={`text-xs ${textMuted} mt-1`}>Market Value</div>
            </div>
          </div>
          <div className={`mt-6 pt-4 border-t ${divider}`}>
            <Button className="w-full h-12" onClick={() => setLocation("/orders")}>
              Fund Account
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
