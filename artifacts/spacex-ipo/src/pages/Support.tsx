import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { SideNav } from "@/components/SideNav";
import { useTheme } from "@/contexts/ThemeContext";
import { Send, User } from "lucide-react";

interface Message {
  id: number;
  from: "bot" | "user";
  text: string;
  time: string;
}

const QUICK_ACTIONS = [
  { label: "Account", query: "Tell me about my account" },
  { label: "Orders", query: "How do I make a deposit?" },
  { label: "Payments", query: "What payment methods are accepted?" },
];

const BOT_KB: Record<string, string> = {
  default:
    "Hi there! 👋\nThanks for reaching out to SPCX Support.\nHow can we assist you today?",
  greeting:
    "Hello! I'm your SPCX virtual assistant. I can help with deposits, your holdings, what this IPO is about, and more. Just ask away!",
};

function getBotReply(input: string): string {
  const q = input.toLowerCase();

  if (/(hello|hi|hey|greet)/i.test(q))
    return "Hey there! Great to hear from you. How can I help you with your SPCX account today?";

  if (/deposit|fund|send|transfer|crypto|btc|eth|doge|bitcoin|ethereum|dogecoin/i.test(q))
    return `**How to Deposit** 💰\n\n1. Go to **Orders → Fund Account**.\n2. Select **Crypto Wallet** as your payment method.\n3. Choose BTC, ETH, or DOGE.\n4. Enter the USD value of your deposit and copy the wallet address.\n5. Send the exact crypto amount to that address.\n6. Our team verifies your transfer, typically within 30–60 minutes.\n\nOnce confirmed, shares will be credited to your holdings automatically.`;

  if (/earn|profit|return|dividend|how.*make.*money|gain/i.test(q))
    return `**How You Earn with SPCX** 📈\n\nYou earn returns through **share appreciation**. Here's how it works:\n\n• You purchase pre-IPO shares at the current offering price.\n• As SpaceX approaches its public listing on NASDAQ, the valuation grows.\n• When the IPO happens, your shares convert to publicly tradeable stock.\n• You sell on the open market at the IPO price (or higher).\n\nCurrent SPCX pre-IPO shares are priced around **$147.62**. Analysts project the IPO listing at $200–$250+.`;

  if (/ipo|what is|how does.*work|about|explain/i.test(q))
    return `**About the SpaceX IPO (SPCX)** 🚀\n\nSpaceX is preparing for one of the most anticipated public listings in history on NASDAQ under the ticker **SPCX**.\n\n**What is an IPO?**\nAn Initial Public Offering (IPO) is when a private company first sells shares to the public. Retail investors who buy *pre-IPO* shares gain early access before the stock is available on open markets.\n\n**Why SpaceX?**\n• Valued at $1.92 trillion\n• 13 billion shares outstanding\n• Revenues from Starlink, Falcon 9, Dragon, and Starship\n• Exclusive pre-IPO access closes once the listing goes live`;

  if (/minimum|min|how much|least|small/i.test(q))
    return `**Minimum Investment**\n\nThe minimum lot size is **100 shares** at current pricing (~$14,762 USD). Fractional shares are not available in this offering phase.\n\nYou can deposit any amount — partial positions are held in reserve until you accumulate enough for allocation.`;

  if (/account|status|approved|pending|reject/i.test(q))
    return `**Account Status**\n\nAfter submitting your access request, our compliance team reviews your application. You'll be either **Approved** or asked for additional verification.\n\n• **Pending** — Your request is under review (usually within 24 hours).\n• **Approved** — You have full access to fund your account and receive allocations.\n• **Rejected** — Contact support at ir@spcxipo.live for clarification.`;

  if (/payment|method|card|bank|wire|credit|debit/i.test(q))
    return `**Payment Methods** 💳\n\n• **Crypto Wallet** — BTC, ETH, DOGE. Fastest — credited after network confirmations.\n• **Bank Wire / ACH** — Coming soon.\n• **Debit / Credit Card** — Coming soon.\n\nWe recommend crypto for the fastest processing times.`;

  if (/how long|time|confirm|verif|network/i.test(q))
    return `**Processing Times**\n\n• **BTC** — ~30 minutes (3 network confirmations)\n• **ETH** — ~3 minutes (12 confirmations)\n• **DOGE** — ~6 minutes (6 confirmations)\n\nAfter blockchain confirmation, our team manually verifies and credits shares within 1–4 hours.`;

  if (/secure|safe|security|protect|risk/i.test(q))
    return `**Security & Safety** 🔒\n\nYour account and deposits are protected by:\n\n• 256-bit end-to-end encryption\n• SIPC investor protection (up to $500,000)\n• Two-factor authentication on all admin actions\n• Cold storage for all crypto deposits\n• Regular third-party security audits`;

  if (/contact|email|human|agent|speak|live/i.test(q))
    return `**Contact a Human Agent**\n\nFor complex issues, reach our investor relations team:\n\n📧 **ir@spcxipo.live**\n\nResponse time: within 24 hours on business days. Please include your registered email in the subject line for faster lookup.`;

  if (/withdraw|sell|exit|liquidate/i.test(q))
    return `**Withdrawals & Selling**\n\nPre-IPO shares are **locked** until the public listing date. This is standard for pre-IPO offerings — your position converts to publicly tradeable stock at IPO and you may sell on NASDAQ immediately after.\n\nIf you have concerns, contact: ir@spcxipo.live`;

  return `I'm not sure about that one — but I'm always improving! 🤖\n\nFor specific account questions, contact our team at **ir@spcxipo.live** and we'll respond within 24 hours.\n\nYou can also try asking me about:\n• How to deposit\n• What the IPO is\n• How you earn returns\n• Payment methods`;
}

function now() {
  return new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function formatBotText(text: string) {
  return text.split("\n").map((line, i) => {
    // Bold **text**
    const parts = line.split(/\*\*(.*?)\*\*/g);
    return (
      <React.Fragment key={i}>
        {parts.map((p, j) => (j % 2 === 1 ? <strong key={j}>{p}</strong> : p))}
        {i < text.split("\n").length - 1 && <br />}
      </React.Fragment>
    );
  });
}

export default function Support() {
  const [, setLocation] = useLocation();
  const userRaw = localStorage.getItem("spcx_user");
  const user = userRaw ? JSON.parse(userRaw) : null;
  const { isDark } = useTheme();

  const [messages, setMessages] = useState<Message[]>([
    { id: 0, from: "bot", text: BOT_KB.default, time: now() },
  ]);
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    if (!user) setLocation("/signin");
  }, [user, setLocation]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { id: Date.now(), from: "user", text: text.trim(), time: now() };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      const reply = getBotReply(text);
      setMessages((m) => [...m, { id: Date.now() + 1, from: "bot", text: reply, time: now() }]);
    }, 900 + Math.random() * 600);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  if (!user) return null;

  const bg = isDark ? "bg-[#050a0f]" : "bg-[#f5f7fa]";
  const headerBg = isDark ? "bg-[#050a0f]/80 border-white/10" : "bg-white/80 border-black/10";
  const chatBg = isDark ? "bg-[#080d13]" : "bg-[#eef1f5]";
  const botBubble = isDark ? "bg-[#131a24] text-white" : "bg-white text-black shadow-sm";
  const userBubble = "bg-[#1a8a4a] text-white";
  const inputBg = isDark ? "bg-[#0a0f16] border-white/10 text-white placeholder:text-white/30" : "bg-white border-black/10 text-black placeholder:text-black/30";
  const quickBtn = isDark ? "border-white/15 text-white/70 hover:bg-white/10 hover:border-white/30" : "border-black/15 text-black/60 hover:bg-black/5 hover:border-black/25";

  return (
    <div className={`min-h-[100dvh] ${bg} flex flex-col`}>
      <header className={`h-16 border-b ${headerBg} backdrop-blur-md flex items-center px-4 sticky top-0 z-40`}>
        <SideNav />
        <span className={`ml-4 font-display tracking-widest font-bold text-lg uppercase ${isDark ? "text-white" : "text-black"}`}>Live Support</span>
      </header>

      <div className={`flex-1 flex flex-col max-w-2xl w-full mx-auto`}>
        {/* Agent Header */}
        <div className={`${chatBg} border-b ${isDark ? "border-white/5" : "border-black/5"} p-6 flex flex-col items-center text-center`}>
          <div className="relative mb-3">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#005288] to-[#1a8a4a] flex items-center justify-center overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80"
                alt="Support Agent"
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
            </div>
            <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#1a8a4a] border-2 border-[#050a0f] rounded-full flex items-center justify-center">
              <span className="w-2 h-2 bg-white rounded-full" />
            </span>
          </div>
          <h2 className={`font-display text-xl font-bold uppercase tracking-widest ${isDark ? "text-white" : "text-black"}`}>Live Support</h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="w-2 h-2 rounded-full bg-[#1a8a4a] animate-pulse" />
            <span className="text-xs text-[#1a8a4a] font-display tracking-widest uppercase font-bold">Online</span>
          </div>
          <p className={`text-xs mt-2 ${isDark ? "text-white/50" : "text-black/50"}`}>
            We're here to help with your SPCX account and investments.
          </p>
        </div>

        {/* Chat messages */}
        <div className={`flex-1 ${chatBg} p-4 space-y-4 overflow-y-auto`} style={{ minHeight: 340 }}>
          <div className={`text-center text-xs uppercase tracking-widest font-display ${isDark ? "text-white/25" : "text-black/25"} my-2`}>
            Today
          </div>

          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-3 ${msg.from === "user" ? "flex-row-reverse" : "flex-row"}`}>
              {msg.from === "bot" && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#005288] to-[#1a8a4a] shrink-0 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&q=80"
                    alt=""
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                </div>
              )}
              {msg.from === "user" && (
                <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-sm font-bold ${isDark ? "bg-white/10" : "bg-black/10"}`}>
                  <User className="w-4 h-4" />
                </div>
              )}
              <div className="flex flex-col gap-1 max-w-[78%]">
                <div className={`px-4 py-3 text-sm leading-relaxed ${msg.from === "bot" ? botBubble : userBubble}`} style={{ borderRadius: 2 }}>
                  {msg.from === "bot" ? formatBotText(msg.text) : msg.text}
                </div>
                <span className={`text-[10px] ${isDark ? "text-white/25" : "text-black/25"} ${msg.from === "user" ? "text-right" : ""}`}>
                  {msg.time}
                </span>
              </div>
            </div>
          ))}

          {typing && (
            <div className="flex gap-3 items-end">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#005288] to-[#1a8a4a] shrink-0" />
              <div className={`px-4 py-3 ${botBubble} flex gap-1 items-center`} style={{ borderRadius: 2 }}>
                <span className="w-2 h-2 rounded-full bg-current opacity-60 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 rounded-full bg-current opacity-60 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 rounded-full bg-current opacity-60 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* Quick actions */}
        <div className={`${chatBg} px-4 pb-2 flex gap-2 overflow-x-auto scrollbar-hide border-t ${isDark ? "border-white/5" : "border-black/5"} pt-3`}>
          {QUICK_ACTIONS.map((a) => (
            <button
              key={a.label}
              onClick={() => sendMessage(a.query)}
              className={`px-4 py-2 border text-xs font-display tracking-widest uppercase whitespace-nowrap transition-colors ${quickBtn}`}
            >
              {a.label}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className={`${chatBg} p-4 border-t ${isDark ? "border-white/10" : "border-black/10"}`}>
          <form onSubmit={handleSubmit} className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className={`flex-1 h-12 px-4 text-sm border ${inputBg} focus:outline-none focus:border-[#1a8a4a] transition-colors`}
              style={{ borderRadius: 2 }}
              disabled={typing}
            />
            <button
              type="submit"
              disabled={!input.trim() || typing}
              className="w-12 h-12 bg-[#1a8a4a] disabled:opacity-40 flex items-center justify-center hover:bg-[#15803d] transition-colors shrink-0"
              style={{ borderRadius: 2 }}
            >
              <Send className="w-4 h-4 text-white" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
