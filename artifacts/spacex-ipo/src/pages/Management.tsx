import React, { useEffect } from "react";
import { useLocation } from "wouter";
import { SideNav } from "@/components/SideNav";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, ExternalLink } from "lucide-react";

const EXECS = [
  {
    name: "Elon Musk",
    title: "Chief Executive Officer",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&q=80",
    desc: "Founder, CEO and Chief Engineer of SpaceX. CEO and product architect of Tesla, Inc."
  },
  {
    name: "Gwynne Shotwell",
    title: "President & COO",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&q=80",
    desc: "Responsible for day-to-day operations and managing all customer and strategic relations to support company growth."
  },
  {
    name: "Bret Johnsen",
    title: "Chief Financial Officer",
    image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=800&q=80",
    desc: "Oversees the financial strategy and long-term financial health of the organization."
  }
];

export default function Management() {
  const [location, setLocation] = useLocation();
  const user = localStorage.getItem("spcx_user");

  useEffect(() => {
    if (!user) setLocation("/signin");
  }, [user, setLocation]);

  if (!user) return null;

  return (
    <div className="min-h-[100dvh] bg-[#050a0f] text-white">
      <header className="h-16 border-b border-white/10 bg-[#050a0f]/80 backdrop-blur-md flex items-center px-4 sticky top-0 z-40">
        <SideNav />
        <span className="ml-4 font-display tracking-widest font-bold text-lg uppercase">Management & Governance</span>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="mb-16">
          <h1 className="text-4xl md:text-5xl font-display font-bold uppercase tracking-widest mb-4">Leadership</h1>
          <p className="text-white/50 text-lg max-w-2xl">The visionary team executing the mission to make humanity multiplanetary.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-24">
          {EXECS.map((exec) => (
            <Card key={exec.name} className="bg-transparent border-white/10 overflow-hidden group">
              <div className="aspect-[4/5] relative overflow-hidden bg-white/5">
                <img 
                  src={exec.image} 
                  alt={exec.name}
                  className="object-cover w-full h-full grayscale group-hover:grayscale-0 transition-all duration-700 opacity-60 group-hover:opacity-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050a0f] via-[#050a0f]/20 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <h3 className="font-display text-2xl font-bold uppercase tracking-wider mb-1">{exec.name}</h3>
                  <div className="text-sm font-display tracking-widest text-primary uppercase">{exec.title}</div>
                </div>
              </div>
              <CardContent className="p-6">
                <p className="text-sm text-white/60 leading-relaxed mb-6">
                  {exec.desc}
                </p>
                <button className="text-xs font-display tracking-widest uppercase text-white hover:text-primary transition-colors flex items-center gap-2">
                  Learn More <ExternalLink className="w-3 h-3" />
                </button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="border-t border-white/10 pt-16">
          <h2 className="text-3xl font-display font-bold uppercase tracking-widest mb-8">Corporate Governance</h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            {[
              "Audit Committee Charter",
              "Compensation Committee Charter",
              "Code of Business Conduct",
              "Corporate Governance Guidelines",
              "Insider Trading Policy"
            ].map((doc) => (
              <div key={doc} className="flex items-center justify-between p-6 border border-white/10 bg-[#0a0f16] hover:bg-white/5 transition-colors cursor-pointer group">
                <div className="flex items-center gap-4">
                  <FileText className="w-5 h-5 text-white/40 group-hover:text-white transition-colors" />
                  <span className="font-display tracking-wider font-medium text-sm">{doc}</span>
                </div>
                <ExternalLink className="w-4 h-4 text-white/20 group-hover:text-white/80 transition-colors" />
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
