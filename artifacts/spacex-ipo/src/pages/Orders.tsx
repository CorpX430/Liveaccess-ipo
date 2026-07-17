import React, { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { SideNav } from "@/components/SideNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { 
  useGetDepositAddresses, 
  useCreateDeposit 
} from "@workspace/api-client-react";
import { toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion";
import { Bitcoin, Copy, CheckCircle2, QrCode } from "lucide-react";
import { SiEthereum, SiDogecoin } from "react-icons/si";

type Step = 1 | 2 | 3;
type Coin = 'BTC' | 'ETH' | 'DOGE';

export default function Orders() {
  const [location, setLocation] = useLocation();
  const userRaw = localStorage.getItem("spcx_user");
  const user = userRaw ? JSON.parse(userRaw) : null;

  useEffect(() => {
    if (!user) setLocation("/signin");
  }, [user, setLocation]);

  const [step, setStep] = useState<Step>(1);
  const [method, setMethod] = useState<'crypto' | 'bank'>('crypto');
  const [selectedCoin, setSelectedCoin] = useState<Coin | null>(null);
  const [amount, setAmount] = useState("");
  const [copied, setCopied] = useState(false);

  const { data: addresses } = useGetDepositAddresses();
  const createDeposit = useCreateDeposit();

  const handleNextStep1 = () => {
    if (method === 'crypto') setStep(2);
  };

  const handleCreateDeposit = () => {
    if (!selectedCoin || !amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast.error("Please enter a valid amount and select a coin.");
      return;
    }

    createDeposit.mutate(
      { data: { email: user.email, method: 'crypto', amount: Number(amount), coin: selectedCoin } },
      {
        onSuccess: () => setStep(3),
        onError: (err) => toast.error(err?.message || "Failed to create deposit.")
      }
    );
  };

  const currentAddress = addresses?.find(a => a.coin === selectedCoin)?.address || "Loading...";

  const copyToClipboard = () => {
    navigator.clipboard.writeText(currentAddress);
    setCopied(true);
    toast.success("Address copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  if (!user) return null;

  return (
    <div className="min-h-[100dvh] bg-[#050a0f] text-white">
      <header className="h-16 border-b border-white/10 bg-[#050a0f]/80 backdrop-blur-md flex items-center px-4 sticky top-0 z-40">
        <SideNav />
        <span className="ml-4 font-display tracking-widest font-bold text-lg uppercase">Fund Account</span>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-3xl">
        {/* Progress Tracker */}
        <div className="flex items-center justify-between mb-12 max-w-md mx-auto relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[1px] bg-white/10 z-0" />
          {[1, 2, 3].map((s) => (
            <div key={s} className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full border-2 font-display text-sm font-bold bg-[#050a0f] transition-colors ${step >= s ? 'border-white text-white' : 'border-white/20 text-white/20'}`}>
              {s < step ? <CheckCircle2 className="w-5 h-5 text-white" /> : s}
            </div>
          ))}
        </div>

        <div className="relative min-h-[400px]">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-display font-bold uppercase tracking-widest mb-2">Select Method</h2>
                  <p className="text-white/50 text-sm">Choose how you want to fund your account.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div 
                    onClick={() => setMethod('crypto')}
                    className={`border p-6 cursor-pointer transition-colors flex flex-col items-center justify-center gap-4 text-center ${method === 'crypto' ? 'border-white bg-white/5' : 'border-white/10 hover:border-white/30 hover:bg-white/5'}`}
                  >
                    <Bitcoin className="w-12 h-12 text-white/80" />
                    <div>
                      <div className="font-display font-bold uppercase tracking-wider text-lg">Cryptocurrency</div>
                      <div className="text-xs text-white/50 mt-1">Instant settlement</div>
                    </div>
                  </div>
                  
                  <div className="border border-white/5 bg-white/5 p-6 opacity-50 flex flex-col items-center justify-center gap-4 text-center cursor-not-allowed">
                    <div className="w-12 h-12 border-2 border-white/20 rounded-full flex items-center justify-center text-white/50 font-bold">$</div>
                    <div>
                      <div className="font-display font-bold uppercase tracking-wider text-lg text-white/50">Bank Transfer</div>
                      <div className="text-xs text-[#1a8a4a] mt-1 font-medium">Coming Soon</div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-8">
                  <Button onClick={handleNextStep1} size="lg">Continue</Button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-display font-bold uppercase tracking-widest mb-2">Deposit Crypto</h2>
                  <p className="text-white/50 text-sm">Select asset and enter deposit amount in USD value.</p>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  {(['BTC', 'ETH', 'DOGE'] as const).map(c => (
                    <div 
                      key={c}
                      onClick={() => setSelectedCoin(c)}
                      className={`border p-4 cursor-pointer transition-colors flex flex-col items-center gap-3 ${selectedCoin === c ? 'border-white bg-white/5' : 'border-white/10 hover:border-white/30'}`}
                    >
                      {c === 'BTC' && <Bitcoin className="w-8 h-8" />}
                      {c === 'ETH' && <SiEthereum className="w-8 h-8" />}
                      {c === 'DOGE' && <SiDogecoin className="w-8 h-8" />}
                      <div className="font-display font-bold tracking-widest">{c}</div>
                    </div>
                  ))}
                </div>

                {selectedCoin && (
                  <div className="space-y-6 pt-4 animate-in fade-in slide-in-from-bottom-4">
                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-widest font-display text-white/70">Amount (USD Value)</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 font-display">$</span>
                        <Input 
                          type="number" 
                          placeholder="0.00" 
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          className="pl-8 text-xl font-display h-14 border-white/20 bg-black/20"
                        />
                      </div>
                    </div>

                    <Card className="border-white/20 bg-black/40">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-1 overflow-hidden">
                            <div className="text-xs uppercase tracking-widest font-display text-white/50">Deposit Address</div>
                            <div className="font-mono text-sm break-all text-white/90 selection:bg-primary/50">
                              {currentAddress}
                            </div>
                          </div>
                          <div className="flex flex-col gap-2 shrink-0">
                            <Button variant="outline" size="icon" onClick={copyToClipboard} className="h-10 w-10 shrink-0">
                              {copied ? <CheckCircle2 className="w-4 h-4 text-[#1a8a4a]" /> : <Copy className="w-4 h-4" />}
                            </Button>
                          </div>
                        </div>
                        <div className="mt-6 p-4 border border-[#1a8a4a]/30 bg-[#1a8a4a]/10 flex gap-3 items-start">
                          <QrCode className="w-5 h-5 text-[#1a8a4a] shrink-0 mt-0.5" />
                          <p className="text-xs text-[#1a8a4a] leading-relaxed">
                            Send exactly the designated amount of {selectedCoin} to this address. The deposit will be credited after 3 network confirmations.
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <div className="flex justify-between pt-4">
                      <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
                      <Button 
                        size="lg" 
                        onClick={handleCreateDeposit}
                        disabled={createDeposit.isPending || !amount}
                      >
                        {createDeposit.isPending ? "Confirming..." : "I Have Sent Funds"}
                      </Button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-6 pt-12"
              >
                <div className="w-24 h-24 rounded-full border-2 border-[#1a8a4a] mx-auto flex items-center justify-center bg-[#1a8a4a]/10 mb-8">
                  <CheckCircle2 className="w-12 h-12 text-[#1a8a4a]" />
                </div>
                <h2 className="text-4xl font-display font-bold uppercase tracking-widest">Deposit Initiated</h2>
                <p className="text-white/60 text-lg max-w-md mx-auto leading-relaxed">
                  Your deposit of <span className="text-white font-medium">${Number(amount).toLocaleString()}</span> via {selectedCoin} is pending network confirmation.
                </p>
                <div className="pt-8">
                  <Button size="lg" onClick={() => setLocation("/dashboard")}>Return to Dashboard</Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
