import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function SignIn() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { toast.error("Email and password are required."); return; }
    setLoading(true);
    try {
      const base = import.meta.env.BASE_URL.replace(/\/$/, "");
      const res = await fetch(`${base}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "Sign in failed."); return; }
      if (data.status === "approved") {
        localStorage.setItem("spcx_user", JSON.stringify({ email: data.email, fullName: data.fullName }));
        localStorage.setItem("spcx_token", data.token);
        setLocation("/dashboard");
      } else if (data.status === "pending") {
        setLocation(`/access-pending?email=${encodeURIComponent(email)}`);
      } else {
        toast.error("Your access request was not approved.");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { toast.error("Enter your email address."); return; }
    setLoading(true);
    try {
      const base = import.meta.env.BASE_URL.replace(/\/$/, "");
      await fetch(`${base}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setForgotSent(true);
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center relative bg-[#050a0f]">
      {/* Dragon background */}
      <div
        className="absolute inset-0 z-0 bg-cover"
        style={{
          backgroundImage: "url('/dragon.webp')",
          backgroundPosition: "center center",
          backgroundSize: "cover",
        }}
      />
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-[#050a0f] via-[#050a0f]/75 to-[#050a0f]/50" />

      <div className="relative z-10 w-full max-w-md px-4">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8 gap-2">
          <img src="/logo.png" alt="PROJECTX logo" className="h-10 w-auto mb-1" />
          <span className="font-display font-bold uppercase tracking-[4px] text-sm text-center">
            <span className="text-white">PROJECTX MARKET</span>
            <span className="text-white/40">, inc</span>
          </span>
        </div>

        <div className="border border-white/20 bg-[#050a0f]/70 backdrop-blur-xl p-8 space-y-6">
          {!forgotMode ? (
            <>
              <div className="text-center">
                <h1 className="text-2xl font-display font-bold uppercase tracking-widest mb-1">Investor Portal</h1>
                <p className="text-xs text-white/40 uppercase tracking-wider">Sign in to access your dashboard</p>
              </div>

              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest font-display text-white/50">Email Address</label>
                  <Input
                    type="email"
                    placeholder="john@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border-white/20 focus-visible:border-white focus-visible:ring-0 rounded-none bg-black/40 h-12"
                    disabled={loading}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest font-display text-white/50">Password</label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="border-white/20 focus-visible:border-white focus-visible:ring-0 rounded-none bg-black/40 h-12 pr-10"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => setForgotMode(true)}
                      className="text-[10px] text-white/40 hover:text-white uppercase tracking-widest font-display transition-colors"
                    >
                      Forgot Password?
                    </button>
                  </div>
                </div>
                <Button type="submit" className="w-full h-12 font-display tracking-widest uppercase" disabled={loading}>
                  {loading ? "Authenticating..." : "Sign In"}
                </Button>
              </form>

              <div className="pt-4 border-t border-white/10 text-center">
                <p className="text-[10px] text-white/30 uppercase tracking-widest font-display">
                  Not registered?{" "}
                  <Link href="/" className="text-white/60 hover:text-white transition-colors">Request Access</Link>
                </p>
              </div>
            </>
          ) : forgotSent ? (
            <div className="text-center space-y-4 py-4">
              <div className="w-12 h-12 rounded-full border border-[#1a8a4a]/40 bg-[#1a8a4a]/10 flex items-center justify-center mx-auto">
                <span className="text-[#1a8a4a] text-xl">✓</span>
              </div>
              <h2 className="font-display text-lg uppercase tracking-widest font-bold">Email Sent</h2>
              <p className="text-sm text-white/50">If an account exists for <strong className="text-white/80">{email}</strong>, a reset link has been sent.</p>
              <button
                onClick={() => { setForgotMode(false); setForgotSent(false); }}
                className="text-[10px] text-white/40 hover:text-white uppercase tracking-widest font-display transition-colors"
              >
                ← Back to Sign In
              </button>
            </div>
          ) : (
            <>
              <div className="text-center">
                <h1 className="text-xl font-display font-bold uppercase tracking-widest mb-1">Reset Password</h1>
                <p className="text-xs text-white/40 uppercase tracking-wider">Enter your email to receive a reset link</p>
              </div>
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest font-display text-white/50">Email Address</label>
                  <Input
                    type="email"
                    placeholder="john@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border-white/20 focus-visible:border-white focus-visible:ring-0 rounded-none bg-black/40 h-12"
                    disabled={loading}
                  />
                </div>
                <Button type="submit" className="w-full h-12 font-display tracking-widest uppercase" disabled={loading}>
                  {loading ? "Sending..." : "Send Reset Link"}
                </Button>
              </form>
              <div className="text-center">
                <button
                  onClick={() => setForgotMode(false)}
                  className="text-[10px] text-white/40 hover:text-white uppercase tracking-widest font-display transition-colors"
                >
                  ← Back to Sign In
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
