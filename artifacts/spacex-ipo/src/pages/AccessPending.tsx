import { Link, useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Rocket } from "lucide-react";

export default function AccessPending() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(location.split('?')[1]);
  const email = searchParams.get('email') || 'your email';

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-stars">
      <div className="absolute inset-0 bg-[#050a0f]/80 backdrop-blur-sm z-0" />
      
      <div className="relative z-10 w-full max-w-md p-8 border border-white/20 bg-[#050a0f]/90 text-center space-y-8">
        <div className="flex justify-center">
          <Badge variant="outline" className="border-white/20 px-4 py-1 gap-2 bg-white/5">
            <Rocket className="w-3 h-3 text-[#005288]" />
            SPCX OPEN
          </Badge>
        </div>

        <div className="space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full border border-white/20 flex items-center justify-center bg-white/5 mb-6">
            <CheckCircle2 className="w-8 h-8 text-white/50" />
          </div>
          <h1 className="text-4xl font-display font-bold uppercase tracking-widest">Access Pending</h1>
          <p className="text-white/60 text-sm">
            Request received for <span className="text-white font-medium">{email}</span>.
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 p-6 text-sm text-white/70 leading-relaxed">
          Our team personally reviews every request to ensure compliance. You will hear back via email within 48 hours.
        </div>

        <div className="flex flex-col gap-4 pt-4 border-t border-white/10">
          <Link href="/" className="text-xs uppercase tracking-widest font-display text-white/50 hover:text-white transition-colors">
            Use a different email?
          </Link>
          <a href="mailto:ir@spcxipo.live" className="text-xs uppercase tracking-widest font-display text-white/50 hover:text-white transition-colors">
            ir@spcxipo.live
          </a>
        </div>
      </div>
    </div>
  );
}
