"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { requestMarketScan } from "@/lib/trading/actions";

const navItems = [
  { href: "/", label: "Dashboard", icon: "dashboard" },
  { href: "/portfolio", label: "Analytics", icon: "monitoring" },
  { href: "/insights", label: "AI Insights", icon: "psychology" },
  { href: "/markets", label: "Orders", icon: "receipt_long" },
  { href: "/settings", label: "Settings", icon: "shield" },
];

export function SideNav() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col py-6 border-r border-outline-variant/15 h-full w-64 fixed left-0 top-16 bg-surface-container-low font-headline text-sm">
      <div className="px-6 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-container/20 flex items-center justify-center">
            <span
              className="material-symbols-outlined text-primary"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              account_balance
            </span>
          </div>
          <div>
            <p className="text-lg font-black text-on-surface leading-tight">Private Wealth</p>
            <p className="text-xs text-on-surface-variant/60 uppercase tracking-widest">
              Institutional Grade
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 py-3 px-6 transition-all",
                isActive
                  ? "bg-surface-container-high text-primary font-medium rounded-r-full mr-4"
                  : "text-on-surface/50 hover:bg-surface-container-high/50 hover:text-on-surface ml-4 mr-4 mb-2 rounded-lg"
              )}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="px-4 mt-auto space-y-2">
        <form action={requestMarketScan}>
          <button
            type="submit"
            className="w-full py-4 bg-approve-gradient text-on-primary font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-primary/10 active:scale-95 transition-all hover:brightness-110"
          >
            <span className="material-symbols-outlined">radar</span>
            Run Market Scan
          </button>
        </form>
        <p className="text-[10px] text-on-surface-variant/60 text-center leading-tight px-2">
          Scans US movers + top crypto. Claude deep-dives the top 10. Takes
          30–60 seconds. ~$0.14 per scan.
        </p>
      </div>
    </aside>
  );
}
