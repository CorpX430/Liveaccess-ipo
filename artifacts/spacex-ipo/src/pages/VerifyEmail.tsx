import React, { useEffect, useState } from "react";
import { Link, useSearch } from "wouter";

type State = "loading" | "success" | "error";

export default function VerifyEmail() {
  const search = useSearch();
  const token = new URLSearchParams(search).get("token") || "";
  const [state, setState] = useState<State>("loading");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (!token) { setState("error"); return; }
    const base = import.meta.env.BASE_URL.replace(/\/$/, "");
    fetch(`${base}/api/auth/verify-email?token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) { setEmail(d.email || ""); setState("success"); }
        else setState("error");
      })
      .catch(() => setState("error"));
  }, [token]);

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

        <div className="border border-white/20 bg-[#050a0f]/70 backdrop-blur-xl p-8 text-center space-y-5">
          {state === "loading" && (
            <>
              <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center mx-auto animate-spin border-t-white border-r-transparent border-b-transparent border-l-transparent" />
              <p className="text-white/50 text-sm uppercase tracking-widest font-display">Verifying your email…</p>
            </>
          )}
          {state === "success" && (
            <>
              <div className="w-14 h-14 rounded-full border border-[#1a8a4a]/40 bg-[#1a8a4a]/10 flex items-center justify-center mx-auto">
                <span className="text-[#1a8a4a] text-2xl">✓</span>
              </div>
              <h1 className="text-xl font-display font-bold uppercase tracking-widest">Email Verified</h1>
              {email && <p className="text-white/50 text-sm">{email}</p>}
              <p className="text-white/40 text-xs uppercase tracking-widest font-display">
                Your email has been confirmed. Your application is now under review.
              </p>
              <Link href="/signin" className="inline-block mt-2 h-11 px-8 bg-white text-[#050a0f] font-bold uppercase tracking-widest font-display text-xs leading-[44px]">
                Sign In
              </Link>
            </>
          )}
          {state === "error" && (
            <>
              <div className="w-14 h-14 rounded-full border border-red-500/40 bg-red-500/10 flex items-center justify-center mx-auto">
                <span className="text-red-400 text-2xl">✕</span>
              </div>
              <h1 className="text-xl font-display font-bold uppercase tracking-widest">Invalid Link</h1>
              <p className="text-white/40 text-xs uppercase tracking-widest font-display">
                This verification link is invalid or has expired.
              </p>
              <Link href="/" className="inline-block mt-2 text-xs text-white/40 hover:text-white uppercase tracking-widest font-display transition-colors">
                ← Return Home
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
