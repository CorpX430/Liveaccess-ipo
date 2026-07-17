import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSignIn } from "@workspace/api-client-react";
import { toast } from "sonner";

export default function SignIn() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const signIn = useSignIn();

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email.");
      return;
    }

    signIn.mutate(
      { data: { email } },
      {
        onSuccess: (data) => {
          if (data.status === 'approved') {
            localStorage.setItem('spcx_user', JSON.stringify({ email: data.email, fullName: data.fullName }));
            setLocation("/dashboard");
          } else if (data.status === 'pending') {
            setLocation(`/access-pending?email=${encodeURIComponent(email)}`);
          } else if (data.status === 'rejected') {
            toast.error("Your access request was not approved.");
          }
        },
        onError: (err) => {
          toast.error(err?.message || "Sign in failed.");
        }
      }
    );
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center relative bg-[#050a0f]">
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center opacity-40 mix-blend-screen"
        style={{ 
          backgroundImage: "url('https://images.unsplash.com/photo-1446776709462-d6b525b9c0b4?w=1920&q=85')" 
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#050a0f] via-[#050a0f]/80 to-[#050a0f]/40 z-0" />

      <div className="relative z-10 w-full max-w-md p-8 border border-white/20 bg-[#050a0f]/60 backdrop-blur-xl">
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2 text-white">
            <Rocket className="w-6 h-6" />
            <span className="font-display tracking-widest font-bold text-2xl uppercase">SPCX Market</span>
          </div>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold uppercase tracking-widest mb-2 text-center">Client Portal</h1>
          <p className="text-white/50 text-sm text-center">Enter your registered email to access your dashboard.</p>
        </div>

        <form onSubmit={handleSignIn} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest font-display text-white/70">Email Address</label>
            <Input 
              type="email" 
              placeholder="Enter your email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border-white/20 focus-visible:border-white focus-visible:ring-0 rounded-none bg-black/40 h-14"
              disabled={signIn.isPending}
            />
          </div>
          <Button 
            type="submit" 
            className="w-full h-14 text-lg"
            disabled={signIn.isPending}
          >
            {signIn.isPending ? "Authenticating..." : "Enter Portal"}
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/10 text-center">
          <p className="text-xs text-white/40 uppercase tracking-widest font-display">
            Not registered? <Link href="/" className="text-white hover:underline ml-1">Request Access</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
