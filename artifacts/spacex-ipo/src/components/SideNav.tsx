import React from "react";
import { Link, useLocation } from "wouter";
import { Rocket, Menu, X, LayoutDashboard, Wallet, Users, Settings, LifeBuoy, LogOut, Newspaper, Sun, Moon } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useTheme } from "@/contexts/ThemeContext";

export function SideNav() {
  const [open, setOpen] = React.useState(false);
  const [location] = useLocation();
  const { theme, toggleTheme, isDark } = useTheme();

  const handleLogout = () => {
    localStorage.removeItem("spcx_user");
    window.location.href = "/";
  };

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Orders",    href: "/orders",    icon: Wallet },
    { name: "News",      href: "/news",      icon: Newspaper },
    { name: "Management",href: "/management",icon: Users },
    { name: "Settings",  href: "/settings",  icon: Settings },
    { name: "Support",   href: "/support",   icon: LifeBuoy },
  ];

  const surface = isDark ? "bg-[#050a0f]" : "bg-white";
  const divider  = isDark ? "border-white/10" : "border-black/10";
  const itemBase = isDark
    ? "text-white/70 hover:text-white hover:bg-white/5"
    : "text-black/60 hover:text-black hover:bg-black/5";
  const activeClass = isDark ? "text-white bg-white/10" : "text-black bg-black/10";

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button className={`p-2 transition-colors rounded-sm ${isDark ? "hover:bg-white/5" : "hover:bg-black/5"}`}>
          <Menu className="w-6 h-6" />
        </button>
      </SheetTrigger>
      <SheetContent side="left" className={`w-[300px] border-r ${divider} ${surface} p-0 flex flex-col`}>
        <div className={`p-6 border-b ${divider} flex items-center justify-between`}>
          <div className="flex items-center gap-2">
            <Rocket className="w-5 h-5" />
            <span className="font-display text-xl tracking-widest font-bold">SPCX</span>
          </div>
          <div className="flex items-center gap-2">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-sm transition-colors ${isDark ? "hover:bg-white/10 text-white/60 hover:text-white" : "hover:bg-black/10 text-black/60 hover:text-black"}`}
              title={isDark ? "Switch to light theme" : "Switch to dark theme"}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button onClick={() => setOpen(false)} className={`${isDark ? "text-white/50 hover:text-white" : "text-black/40 hover:text-black"}`}>
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 py-6 flex flex-col gap-1 px-4">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={`flex items-center gap-3 px-4 py-3 transition-colors cursor-pointer group rounded-sm ${isActive ? activeClass : itemBase}`}
                  onClick={() => setOpen(false)}
                >
                  <item.icon className={`w-5 h-5 transition-colors ${isActive ? "text-primary" : "group-hover:text-primary"}`} />
                  <span className="font-medium tracking-wide">{item.name}</span>
                  {isActive && <div className="ml-auto w-1 h-4 bg-primary" />}
                </div>
              </Link>
            );
          })}
        </div>

        <div className={`p-6 border-t ${divider} space-y-2`}>
          {/* Theme label */}
          <div className={`flex items-center justify-between px-4 py-2 text-xs uppercase tracking-widest font-display ${isDark ? "text-white/30" : "text-black/30"}`}>
            <span>Theme</span>
            <button
              onClick={toggleTheme}
              className={`flex items-center gap-1.5 px-3 py-1 border transition-colors text-xs font-display tracking-widest ${
                isDark
                  ? "border-white/20 text-white/60 hover:border-white/40 hover:text-white"
                  : "border-black/20 text-black/60 hover:border-black/40 hover:text-black"
              }`}
            >
              {isDark ? <><Sun className="w-3 h-3" /> Light</> : <><Moon className="w-3 h-3" /> Dark</>}
            </button>
          </div>
          <button
            onClick={handleLogout}
            className={`flex items-center gap-3 px-4 py-3 transition-colors cursor-pointer w-full text-left rounded-sm ${
              isDark ? "text-white/50 hover:text-red-400 hover:bg-red-500/10" : "text-black/50 hover:text-red-600 hover:bg-red-500/10"
            }`}
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium tracking-wide">Sign Out</span>
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
