"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Portfolio" },
  { href: "/markets", label: "Markets" },
  { href: "/insights", label: "Signals" },
  { href: "/portfolio", label: "History" },
];

export function TopNav() {
  const pathname = usePathname();

  return (
    <header className="w-full top-0 sticky z-50 bg-surface-container-low border-none">
      <div className="flex justify-between items-center w-full px-8 h-16 max-w-[1440px] mx-auto font-headline antialiased tracking-tight">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-xl font-bold text-on-surface tracking-tight">
            The Financial Architect
          </Link>
          <nav className="hidden md:flex gap-6 items-center">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "transition-colors cursor-pointer active:scale-95",
                    isActive
                      ? "text-primary font-semibold border-b-2 border-primary pb-1"
                      : "text-on-surface/60 hover:text-on-surface"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-surface-container rounded-lg">
            <span className="material-symbols-outlined text-sm text-primary">search</span>
            <input
              className="bg-transparent border-none focus:ring-0 focus:outline-none text-sm text-on-surface-variant w-32 lg:w-48 placeholder:text-outline/40"
              placeholder="Search markets..."
              type="text"
            />
          </div>
          <div className="flex gap-2">
            <button className="p-2 text-on-surface/60 hover:bg-surface-container-high transition-all rounded-lg">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <button className="p-2 text-on-surface/60 hover:bg-surface-container-high transition-all rounded-lg">
              <span className="material-symbols-outlined">settings</span>
            </button>
          </div>
          <div className="w-8 h-8 rounded-full bg-surface-container-highest" />
        </div>
      </div>
    </header>
  );
}
