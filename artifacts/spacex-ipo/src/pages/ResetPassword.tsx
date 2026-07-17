import React, { useState } from "react";
import { Link, useSearch, useLocation } from "wouter";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function ResetPassword() {
  const search = useSearch();
  const token = new URLSearchParams(search).get("token") || "";
  const [, setLocation] = useLocation();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || password.length < 8) { toast.error("Password must be at least 8 characters."); return; }
    if (password !== confirm) { toast.error("Passwords do not match."); return; }
    setLoading(true);
    try {
      const base = import.meta.env.BASE_URL.replace(/\/$/, "");
      const res = await fetch(`${base}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "Reset failed."); return; }
      setDone(true);
      setTimeout(() => setLocation("/signin"), 3000);
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-[#050a0f] text-white">
      <div
        className="absolute inset-0 bg-cover"
        style={{ backgroundImage: "url('/dragon.webp')", backgroundPosition: "center", backgroundSize: "cover" }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#050a0f] via-[#050a0f]/80 to-transparent" />

      <div className="relative z-10 w-full max-w-md px-4">
        <div className="flex flex-col items-center mb-8 gap-2">
          <img src="/logo.png" alt="logo" className="h-10 w-auto mb-1" />
          <span className="font-display font-bold uppercase tracking-[4px] text-sm">
            <span className="text-white">PROJECTX MARKET</span>
            <span className="text-white/40">, inc</span>
          </span>
        </div>

        <div className="border border-white/20 bg-[#050a0f]/70 backdrop-blur-xl p-8 space-y-6">
          {done ? (
            <div className="text-center space-y-4 py-4">
              <div className="w-14 h-14 rounded-full border border-[#1a8a4a]/40 bg-[#1a8a4a]/10 flex items-center justify-center mx-auto">
                <span className="text-[#1a8a4a] text-2xl">✓</span>
              </div>
              <h1 className="text-xl font-display font-bold uppercase tracking-widest">Password Reset</h1>
              <p className="text-white/50 text-sm">Your password has been updated. Redirecting to sign in…</p>
              <Link href="/signin" className="text-xs text-white/40 hover:text-white uppercase tracking-widest font-display transition-colors">
                Sign In →
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center">
                <h1 className="text-xl font-display font-bold uppercase tracking-widest mb-1">New Password</h1>
                <p className="text-xs text-white/40 uppercase tracking-wider">Choose a strong password for your account</p>
              </div>

              {!token && (
                <div className="border border-red-500/30 bg-red-500/10 p-4 text-center">
                  <p className="text-xs text-red-400 uppercase tracking-widest font-display">Invalid reset link. Please request a new one.</p>
                </div>
              )}

              <form onSubmit={handleReset} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest font-display text-white/50">New Password</label>
                  <div className="relative">
                    <Input
                      type={showPw ? "text" : "password"}
                      placeholder="Min. 8 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="border-white/20 focus-visible:border-white focus-visible:ring-0 rounded-none bg-black/40 h-12 pr-10"
                      disabled={loading || !token}
                    />
                    <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors">
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest font-display text-white/50">Confirm Password</label>
                  <Input
                    type="password"
                    placeholder="Repeat your password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className="border-white/20 focus-visible:border-white focus-visible:ring-0 rounded-none bg-black/40 h-12"
                    disabled={loading || !token}
                  />
                </div>
                <Button type="submit" className="w-full h-12 font-display tracking-widest uppercase" disabled={loading || !token}>
                  {loading ? "Saving…" : "Set New Password"}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
