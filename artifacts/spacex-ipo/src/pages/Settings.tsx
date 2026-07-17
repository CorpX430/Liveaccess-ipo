import React, { useEffect } from "react";
import { useLocation } from "wouter";
import { SideNav } from "@/components/SideNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { LogOut, Shield, Bell, User as UserIcon } from "lucide-react";

export default function Settings() {
  const [location, setLocation] = useLocation();
  const userRaw = localStorage.getItem("spcx_user");
  const user = userRaw ? JSON.parse(userRaw) : null;

  useEffect(() => {
    if (!user) setLocation("/signin");
  }, [user, setLocation]);

  const handleLogout = () => {
    localStorage.removeItem("spcx_user");
    setLocation("/");
  };

  if (!user) return null;

  return (
    <div className="min-h-[100dvh] bg-[#050a0f] text-white">
      <header className="h-16 border-b border-white/10 bg-[#050a0f]/80 backdrop-blur-md flex items-center px-4 sticky top-0 z-40">
        <SideNav />
        <span className="ml-4 font-display tracking-widest font-bold text-lg uppercase">Settings</span>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-4xl grid md:grid-cols-[240px_1fr] gap-12">
        <aside className="space-y-2 hidden md:block">
          {[
            { id: "profile", label: "Profile", icon: UserIcon },
            { id: "security", label: "Security", icon: Shield },
            { id: "notifications", label: "Notifications", icon: Bell },
          ].map((item) => (
            <div key={item.id} className="flex items-center gap-3 px-4 py-3 bg-white/5 border-l-2 border-primary text-white cursor-pointer">
              <item.icon className="w-4 h-4" />
              <span className="font-display tracking-widest text-sm uppercase">{item.label}</span>
            </div>
          ))}
        </aside>

        <div className="space-y-16">
          <section className="space-y-6">
            <div>
              <h2 className="text-2xl font-display font-bold uppercase tracking-widest mb-1">Profile Information</h2>
              <p className="text-white/50 text-sm">Update your account details and contact information.</p>
            </div>
            
            <div className="space-y-4 max-w-md">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest font-display text-white/70">Full Name</label>
                <Input value={user.fullName} readOnly className="bg-white/5 border-white/10 text-white/70 cursor-not-allowed" />
                <p className="text-[10px] text-white/40">Name changes require compliance review.</p>
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest font-display text-white/70">Email Address</label>
                <Input value={user.email} readOnly className="bg-white/5 border-white/10 text-white/70 cursor-not-allowed" />
              </div>
            </div>
          </section>

          <section className="space-y-6 border-t border-white/10 pt-16">
            <div>
              <h2 className="text-2xl font-display font-bold uppercase tracking-widest mb-1">Notifications</h2>
              <p className="text-white/50 text-sm">Manage how you receive alerts and updates.</p>
            </div>

            <div className="space-y-6 max-w-md">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-sm font-medium">Trade Executions</div>
                  <div className="text-xs text-white/50">Alerts when your orders are filled</div>
                </div>
                <Switch checked={true} />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-sm font-medium">Deposit Confirmations</div>
                  <div className="text-xs text-white/50">Notifications for incoming funds</div>
                </div>
                <Switch checked={true} />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-sm font-medium">IPO Announcements</div>
                  <div className="text-xs text-white/50">Critical timeline updates and news</div>
                </div>
                <Switch checked={true} />
              </div>
            </div>
          </section>

          <section className="space-y-6 border-t border-white/10 pt-16">
            <div>
              <h2 className="text-2xl font-display font-bold uppercase tracking-widest mb-1 text-red-500">Danger Zone</h2>
            </div>
            <Button variant="outline" className="border-red-500/50 text-red-500 hover:bg-red-500/10 hover:text-red-400 flex items-center gap-2" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </section>
        </div>
      </main>
    </div>
  );
}
