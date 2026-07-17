import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { UserCircle, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useGetInvestorCount } from "@workspace/api-client-react";
import { toast } from "sonner";

export default function Home() {
  const [, setLocation] = useLocation();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { data: countData } = useGetInvestorCount();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      toast.error("Please fill out all fields.");
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    try {
      const base = import.meta.env.BASE_URL.replace(/\/$/, "");
      const res = await fetch(`${base}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Registration failed.");
        return;
      }
      setLocation(`/access-pending?email=${encodeURIComponent(email)}`);
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-[#050a0f] text-white">
      {/* ── Header ── */}
      <header className="fixed top-0 w-full border-b border-white/10 bg-[#050a0f]/80 backdrop-blur-md z-50">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          {/* Left: logo + name */}
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="PROJECTX logo" className="h-7 w-auto" />
            <span className="font-display font-bold uppercase tracking-widest text-base leading-none">
              <span className="text-white">PROJECTX MARKET</span>
              <span className="text-white/40 text-xs font-normal normal-case tracking-wider">, inc</span>
            </span>
          </div>
          {/* Right: sign-in + get started */}
          <div className="flex items-center gap-3">
            <Link href="/signin" className="flex items-center gap-1.5 text-sm font-medium text-white/70 hover:text-white transition-colors uppercase tracking-widest font-display">
              <UserCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Sign In</span>
            </Link>
            <Link href="/signin"
              className="h-8 px-4 inline-flex items-center justify-center bg-white text-[#050a0f] font-bold uppercase tracking-widest font-display text-xs hover:bg-white/90 transition-colors">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative min-h-[100dvh] flex items-end pb-24 pt-32">
        {/* Dragon background */}
        <div
          className="absolute inset-0 z-0 bg-cover"
          style={{
            backgroundImage: "url('/dragon.webp')",
            backgroundPosition: "right center",
            backgroundSize: "cover",
          }}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#050a0f] via-[#050a0f]/70 to-transparent" />
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-[#050a0f] via-[#050a0f]/50 to-transparent" />

        <div className="container mx-auto px-6 relative z-20 grid lg:grid-cols-2 gap-12 items-end">
          {/* Left: hero copy */}
          <div className="space-y-5">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#1a8a4a] animate-pulse" />
              <span className="text-[10px] font-display tracking-[4px] uppercase text-white/50">
                PRE-IPO ACCESS ACTIVE
              </span>
            </div>
            <h1 className="text-6xl md:text-8xl font-display font-black tracking-tight uppercase leading-none">
              INVESTOR<br/>
              <span className="text-white/50">RELATIONS</span>
            </h1>
            <p className="text-base md:text-lg text-white/50 font-medium tracking-widest font-display">
              Now Trading · PRJX
            </p>
            {countData && (
              <div className="inline-flex items-center gap-2 border border-white/10 bg-white/5 px-4 py-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#1a8a4a] animate-pulse" />
                <span className="font-display tracking-widest text-xs uppercase text-white/60">
                  {countData.count.toLocaleString()} Investors Registered
                </span>
              </div>
            )}
          </div>

          {/* Right: registration card */}
          <div className="lg:justify-self-end w-full max-w-md">
            <div className="border border-white/20 bg-[#050a0f]/70 backdrop-blur-xl p-8 space-y-5">
              <div>
                <h2 className="font-display text-xl tracking-widest uppercase font-bold mb-1">Request Access</h2>
                <p className="text-xs text-white/40 uppercase tracking-wider">Secure your position for the PRJX listing</p>
              </div>
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest font-display text-white/50">Full Name</label>
                  <Input
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="border-white/20 focus-visible:border-white focus-visible:ring-0 rounded-none bg-black/30 h-11"
                    disabled={loading}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest font-display text-white/50">Email Address</label>
                  <Input
                    type="email"
                    placeholder="john@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border-white/20 focus-visible:border-white focus-visible:ring-0 rounded-none bg-black/30 h-11"
                    disabled={loading}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest font-display text-white/50">Password</label>
                  <Input
                    type="password"
                    placeholder="Min. 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border-white/20 focus-visible:border-white focus-visible:ring-0 rounded-none bg-black/30 h-11"
                    disabled={loading}
                  />
                </div>
                <Button type="submit" className="w-full h-11 font-display tracking-widest uppercase" disabled={loading}>
                  {loading ? "Submitting..." : "Request Access"}
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </form>
              <p className="text-[10px] text-white/30 text-center font-display tracking-wider uppercase pt-2 border-t border-white/10">
                Already registered?{" "}
                <Link href="/signin" className="text-white/60 hover:text-white transition-colors">Sign In</Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Strip ── */}
      <section className="border-y border-white/10 bg-[#050a0f]">
        <div className="container mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x divide-white/10">
          {[
            { label: "Target Price Range", value: "$95 – $105" },
            { label: "Est. Market Cap",    value: "$120B" },
            { label: "Exchange",           value: "NASDAQ" },
          ].map((s) => (
            <div key={s.label} className="md:px-8 first:pl-0 py-4 md:py-0 flex flex-col justify-center">
              <div className="text-[10px] text-white/40 uppercase tracking-[3px] font-display mb-1">{s.label}</div>
              <div className="text-3xl font-display font-bold tracking-wider">{s.value}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-24 container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-display font-bold uppercase tracking-widest mb-4">The Process</h2>
          <p className="text-white/40 max-w-2xl mx-auto text-sm">Access to the PRJX listing is carefully managed to ensure fair allocation.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { step: "01", title: "Request Access", desc: "Register with your details. A verification email will be sent to confirm your address." },
            { step: "02", title: "Account Approval", desc: "Once verified and approved, you'll receive access to the secure investor portal." },
            { step: "03", title: "Fund & Allocate", desc: "Deposit via accepted cryptocurrencies and secure your share allocation before listing." },
          ].map((s) => (
            <div key={s.step} className="border border-white/10 p-8 relative overflow-hidden group hover:border-white/30 transition-colors">
              <div className="text-7xl font-display font-bold text-white/5 absolute -top-4 -right-4 group-hover:text-white/10 transition-colors">{s.step}</div>
              <div className="relative z-10">
                <div className="text-[10px] font-display tracking-[3px] text-[#005288] mb-4">STEP {s.step}</div>
                <h3 className="text-lg font-bold font-display uppercase tracking-wider mb-2">{s.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-24 border-t border-white/10 bg-[#0a0f16]">
        <div className="container mx-auto px-6 max-w-3xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-display font-bold uppercase tracking-widest">Frequently Asked Questions</h2>
          </div>
          <Accordion type="single" collapsible className="w-full">
            {[
              { q: "Who is eligible to participate?", a: "Participation is available to verified retail and institutional investors. All applicants must pass our internal review process." },
              { q: "What funding methods are accepted?", a: "We accept major cryptocurrencies including Bitcoin (BTC), Ethereum (ETH), and Dogecoin (DOGE) for rapid global settlement." },
              { q: "Is this an official SpaceX offering?", a: "PROJECTX MARKET operates as an independent liquidity provider sourcing secondary market shares from early employees and early-stage venture funds prior to the official NASDAQ listing." },
              { q: "When will shares become tradable?", a: "Allocated shares will be locked until expiration of the standard IPO lock-up period, after which they can be transferred to your preferred prime broker." },
            ].map((item, i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger className="text-base font-display uppercase tracking-wider">{item.q}</AccordionTrigger>
                <AccordionContent className="text-sm text-white/60 leading-relaxed">{item.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/10 py-12 text-center text-sm text-white/40">
        <div className="container mx-auto px-6 space-y-4">
          <div className="flex items-center justify-center gap-3 text-white/60 mb-6">
            <img src="/logo.png" alt="logo" className="h-5 w-auto opacity-60" />
            <span className="font-display tracking-widest font-bold uppercase text-sm">
              PROJECTX MARKET<span className="text-white/30 text-xs font-normal">, inc</span>
            </span>
          </div>
          <p>© 2025 PROJECTX MARKET, INC. All rights reserved.</p>
          <p className="max-w-2xl mx-auto text-xs">
            Investing in private companies and pre-IPO assets involves significant risks, including the potential loss of your entire investment.
            This is not a solicitation or offer to buy or sell securities.
          </p>
          <div className="pt-4">
            <a href="mailto:ir@spcxipo.live" className="hover:text-white transition-colors uppercase tracking-widest font-display text-xs">ir@spcxipo.live</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
