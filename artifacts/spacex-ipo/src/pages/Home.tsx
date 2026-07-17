import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { Rocket, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useCreateInvestor, useGetInvestorCount } from "@workspace/api-client-react";
import { toast } from "sonner";

export default function Home() {
  const [, setLocation] = useLocation();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");

  const createInvestor = useCreateInvestor();
  const { data: countData } = useGetInvestorCount();

  const handleRequestAccess = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email) {
      toast.error("Please fill out all fields.");
      return;
    }
    createInvestor.mutate(
      { data: { fullName, email } },
      {
        onSuccess: () => {
          setLocation(`/access-pending?email=${encodeURIComponent(email)}`);
        },
        onError: (err) => {
          toast.error(err?.message || "Failed to submit request.");
        },
      }
    );
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-[#050a0f] text-white">
      {/* Header */}
      <header className="fixed top-0 w-full border-b border-white/10 bg-[#050a0f]/80 backdrop-blur-md z-50">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Rocket className="w-5 h-5 text-white" />
            <span className="font-display tracking-widest font-bold text-xl uppercase">SPCX Market</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/signin" className="text-sm font-medium hover:text-white/80 transition-colors uppercase tracking-wider font-display">
              Sign In
            </Link>
            <Link href="/signin" className="h-8 px-4 inline-flex items-center justify-center border border-white/20 bg-transparent hover:bg-white/10 text-white font-bold uppercase tracking-widest font-display text-xs">
              Client Portal
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-[100dvh] flex items-end pb-24 pt-32">
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{ 
            backgroundImage: "url('https://images.unsplash.com/photo-1517976487492-5750f3195933?w=1920&q=85')",
            backgroundPosition: "center 30%"
          }}
        />
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#050a0f] via-[#050a0f]/80 to-transparent" />
        
        <div className="container mx-auto px-6 relative z-20 grid lg:grid-cols-2 gap-12 items-end">
          <div className="space-y-6">
            <Badge variant="success" className="bg-[#1a8a4a]/20 text-[#1a8a4a] border border-[#1a8a4a]/30">
              ● PRE-IPO ACCESS ACTIVE
            </Badge>
            <h1 className="text-7xl md:text-9xl font-display font-bold tracking-tight uppercase leading-none">
              SpaceX<br/>
              <span className="text-white/50">IPO</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/70 max-w-lg font-light">
              Retail access to the most anticipated listing of the decade.
            </p>
            {countData && (
              <div className="inline-flex items-center gap-2 border border-white/10 bg-white/5 px-4 py-2">
                <div className="w-2 h-2 rounded-full bg-[#1a8a4a] animate-pulse" />
                <span className="font-display tracking-widest text-sm uppercase text-white/70">
                  {countData.count.toLocaleString()} Investors Registered
                </span>
              </div>
            )}
          </div>

          <div className="lg:justify-self-end w-full max-w-md">
            <div className="border border-white/20 bg-[#050a0f]/60 backdrop-blur-xl p-8 space-y-6">
              <div>
                <h2 className="font-display text-2xl tracking-widest uppercase font-bold mb-2">Request Access</h2>
                <p className="text-sm text-white/50">Secure your position for the upcoming SPCX listing.</p>
              </div>
              <form onSubmit={handleRequestAccess} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest font-display text-white/70">Full Name</label>
                  <Input 
                    placeholder="e.g. John Doe" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="border-white/20 focus-visible:border-white focus-visible:ring-0 rounded-none bg-black/20"
                    disabled={createInvestor.isPending}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest font-display text-white/70">Email Address</label>
                  <Input 
                    type="email" 
                    placeholder="john@example.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border-white/20 focus-visible:border-white focus-visible:ring-0 rounded-none bg-black/20"
                    disabled={createInvestor.isPending}
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full h-12"
                  disabled={createInvestor.isPending}
                >
                  {createInvestor.isPending ? "Submitting..." : "Submit Request"}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Strip */}
      <section className="border-y border-white/10 bg-[#050a0f]">
        <div className="container mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x divide-white/10">
          <div className="md:px-8 first:pl-0 flex flex-col justify-center">
            <div className="text-sm text-white/50 uppercase tracking-widest font-display mb-1">Target Price Range</div>
            <div className="text-3xl font-display font-bold tracking-wider">$95 &ndash; $105</div>
          </div>
          <div className="md:px-8 py-4 md:py-0 flex flex-col justify-center">
            <div className="text-sm text-white/50 uppercase tracking-widest font-display mb-1">Est. Market Cap</div>
            <div className="text-3xl font-display font-bold tracking-wider">$120B</div>
          </div>
          <div className="md:px-8 py-4 md:py-0 flex flex-col justify-center">
            <div className="text-sm text-white/50 uppercase tracking-widest font-display mb-1">Exchange</div>
            <div className="text-3xl font-display font-bold tracking-wider">NASDAQ</div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-display font-bold uppercase tracking-widest mb-4">The Process</h2>
          <p className="text-white/50 max-w-2xl mx-auto">Access to the SPCX listing is carefully managed to ensure fair allocation.</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              step: "01",
              title: "Request Access",
              desc: "Submit your details for preliminary review by our compliance team."
            },
            {
              step: "02",
              title: "Account Approval",
              desc: "Once verified, you will receive an invitation to access the secure client portal."
            },
            {
              step: "03",
              title: "Fund & Allocate",
              desc: "Deposit funds via accepted cryptocurrencies and secure your share allocation."
            }
          ].map((s) => (
            <div key={s.step} className="border border-white/10 p-8 relative overflow-hidden group hover:border-white/30 transition-colors">
              <div className="text-7xl font-display font-bold text-white/5 absolute -top-4 -right-4 group-hover:text-white/10 transition-colors">{s.step}</div>
              <div className="relative z-10">
                <div className="text-sm font-display tracking-widest text-[#005288] mb-4">STEP {s.step}</div>
                <h3 className="text-xl font-bold font-display uppercase tracking-wider mb-2">{s.title}</h3>
                <p className="text-white/60 text-sm leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 border-t border-white/10 bg-[#0a0f16]">
        <div className="container mx-auto px-6 max-w-3xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-display font-bold uppercase tracking-widest">Frequently Asked Questions</h2>
          </div>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-lg font-display uppercase tracking-wider">Who is eligible to participate?</AccordionTrigger>
              <AccordionContent className="text-base">
                Participation is currently available to verified retail and institutional investors. All applicants must pass our internal review process to be approved for the portal.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger className="text-lg font-display uppercase tracking-wider">What funding methods are accepted?</AccordionTrigger>
              <AccordionContent className="text-base">
                For the initial pre-IPO phase, we accept major cryptocurrencies including Bitcoin (BTC), Ethereum (ETH), and Dogecoin (DOGE) to facilitate rapid global settlement.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger className="text-lg font-display uppercase tracking-wider">Is this an official SpaceX offering?</AccordionTrigger>
              <AccordionContent className="text-base">
                SPCX Market operates as an independent liquidity provider sourcing secondary market shares from early employees and early-stage venture funds prior to the official NASDAQ listing.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger className="text-lg font-display uppercase tracking-wider">When will shares become tradable?</AccordionTrigger>
              <AccordionContent className="text-base">
                Allocated shares will be locked until the expiration of the standard IPO lock-up period, after which they can be transferred to your preferred prime broker.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 text-center text-sm text-white/40">
        <div className="container mx-auto px-6 space-y-4">
          <div className="flex items-center justify-center gap-2 text-white/60 mb-6">
            <Rocket className="w-4 h-4" />
            <span className="font-display tracking-widest font-bold uppercase">SPCX Market, Inc.</span>
          </div>
          <p>© 2025 SPCX Market, Inc. All rights reserved.</p>
          <p className="max-w-2xl mx-auto text-xs">
            Investing in private companies and pre-IPO assets involves significant risks, including the potential loss of your entire investment. 
            This is not a solicitation or offer to buy or sell securities. 
          </p>
          <div className="pt-4">
            <a href="mailto:ir@spcxipo.live" className="hover:text-white transition-colors uppercase tracking-widest font-display">ir@spcxipo.live</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
