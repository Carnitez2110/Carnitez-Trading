# Phase 1: Project Foundation & Design System

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold the Next.js project with the exact Stitch design system, shared layout (top nav + sidebar + mobile nav), and all 5 page routes rendering with placeholder content.

**Architecture:** Next.js 14 App Router with TypeScript. Tailwind CSS configured with the full Stitch color token system. Shared layout component with responsive navigation. All pages are client-side rendered React components.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS 3, Material Symbols Outlined (Google Fonts), Manrope + Inter (Google Fonts)

---

## Phases Overview (this is Phase 1 of 9)

1. **Phase 1: Foundation & Design System** ← THIS PLAN
2. Phase 2: Supabase Backend & Auth
3. Phase 3: Dashboard UI (with mock data)
4. Phase 4: Market Data Integration (Alpha Vantage + CoinGecko)
5. Phase 5: AI Signal Generation (Claude API)
6. Phase 6: Paper Trading Engine
7. Phase 7: Portfolio, Watchlist & Markets Pages
8. Phase 8: AI Insights, Knowledge Vault & Learning Loop
9. Phase 9: Live Trading (Alpaca API) & Settings

---

## File Structure

```
the-financial-architect/
├── package.json
├── tsconfig.json
├── next.config.ts
├── tailwind.config.ts
├── postcss.config.mjs
├── .env.local.example
├── .gitignore
├── public/
│   └── favicon.ico
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout: fonts, metadata, body wrapper
│   │   ├── globals.css             # Tailwind directives + custom utilities
│   │   ├── page.tsx                # Dashboard (home) page
│   │   ├── portfolio/
│   │   │   └── page.tsx            # Portfolio page placeholder
│   │   ├── markets/
│   │   │   └── page.tsx            # Markets/Watchlist page placeholder
│   │   ├── insights/
│   │   │   └── page.tsx            # AI Insights page placeholder
│   │   └── settings/
│   │       └── page.tsx            # Settings page placeholder
│   ├── components/
│   │   ├── layout/
│   │   │   ├── top-nav.tsx         # Top navigation bar
│   │   │   ├── side-nav.tsx        # Sidebar navigation (desktop)
│   │   │   ├── bottom-nav.tsx      # Bottom tab bar (mobile)
│   │   │   └── app-shell.tsx       # Combines top-nav + side-nav + bottom-nav + main content area
│   │   └── ui/
│   │       ├── card.tsx            # Reusable card component
│   │       ├── button.tsx          # Primary + ghost button variants
│   │       ├── badge.tsx           # Status badge (bullish/bearish/neutral)
│   │       ├── toggle.tsx          # Custom toggle switch
│   │       └── confidence-ring.tsx # SVG donut chart for confidence %
│   └── lib/
│       └── utils.ts                # cn() classname merge utility
└── __tests__/
    ├── components/
    │   ├── top-nav.test.tsx
    │   ├── side-nav.test.tsx
    │   ├── bottom-nav.test.tsx
    │   ├── card.test.tsx
    │   ├── button.test.tsx
    │   ├── badge.test.tsx
    │   ├── toggle.test.tsx
    │   └── confidence-ring.test.tsx
    └── app/
        └── pages.test.tsx
```

---

### Task 1: Scaffold Next.js Project

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `postcss.config.mjs`, `.gitignore`, `.env.local.example`

- [ ] **Step 1: Initialize Next.js project**

Run:
```bash
cd C:/Users/bryan/Desktop/Trades
npx create-next-app@14 . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
```

When prompted, accept defaults. This creates the full scaffold.

- [ ] **Step 2: Verify the project runs**

Run:
```bash
cd C:/Users/bryan/Desktop/Trades
npm run dev
```

Expected: Dev server starts on http://localhost:3000, default Next.js page loads.

- [ ] **Step 3: Install testing dependencies**

Run:
```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom @types/jest jest-environment-jsdom ts-jest
```

- [ ] **Step 4: Create Jest config**

Create `jest.config.ts`:

```typescript
import type { Config } from "jest";
import nextJest from "next/jest";

const createJestConfig = nextJest({
  dir: "./",
});

const config: Config = {
  testEnvironment: "jsdom",
  setupFilesAfterSetup: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
};

export default createJestConfig(config);
```

Create `jest.setup.ts`:

```typescript
import "@testing-library/jest-dom";
```

- [ ] **Step 5: Create .env.local.example**

Create `.env.local.example`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Anthropic (Claude API)
ANTHROPIC_API_KEY=your_anthropic_api_key

# Alpha Vantage (Market Data)
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_api_key

# Alpaca (Live Trading - Phase 9)
ALPACA_API_KEY=your_alpaca_api_key
ALPACA_SECRET_KEY=your_alpaca_secret_key
ALPACA_BASE_URL=https://paper-api.alpaca.markets
```

- [ ] **Step 6: Add test script to package.json**

In `package.json`, add to `"scripts"`:

```json
"test": "jest",
"test:watch": "jest --watch"
```

- [ ] **Step 7: Verify tests run**

Run:
```bash
npm test -- --passWithNoTests
```

Expected: Jest runs, 0 tests found, exits cleanly.

- [ ] **Step 8: Initialize git and commit**

Run:
```bash
cd C:/Users/bryan/Desktop/Trades
git init
git add -A
git commit -m "chore: scaffold Next.js 14 project with TypeScript, Tailwind, Jest"
```

---

### Task 2: Configure Tailwind Design System

**Files:**
- Modify: `tailwind.config.ts`
- Modify: `src/app/globals.css`
- Create: `src/lib/utils.ts`

- [ ] **Step 1: Install clsx and tailwind-merge**

Run:
```bash
npm install clsx tailwind-merge
```

- [ ] **Step 2: Create the cn() utility**

Create `src/lib/utils.ts`:

```typescript
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 3: Configure Tailwind with Stitch design tokens**

Replace the contents of `tailwind.config.ts` with:

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#11131b",
        surface: {
          DEFAULT: "#11131b",
          dim: "#11131b",
          bright: "#373942",
          container: {
            DEFAULT: "#1d1f28",
            low: "#191b23",
            high: "#282a32",
            highest: "#33343d",
            lowest: "#0c0e16",
          },
          variant: "#33343d",
          tint: "#bac3ff",
        },
        primary: {
          DEFAULT: "#bac3ff",
          container: "#4453a7",
          fixed: "#dee0ff",
          "fixed-dim": "#bac3ff",
        },
        "on-primary": {
          DEFAULT: "#15267b",
          container: "#c9cfff",
          fixed: "#00105b",
          "fixed-variant": "#2f3f92",
        },
        secondary: {
          DEFAULT: "#45d8ed",
          container: "#00bacd",
          fixed: "#98f0ff",
          "fixed-dim": "#45d8ed",
        },
        "on-secondary": {
          DEFAULT: "#00363d",
          container: "#00444d",
          fixed: "#001f24",
          "fixed-variant": "#004f58",
        },
        tertiary: {
          DEFAULT: "#ffb784",
          container: "#8f4700",
          fixed: "#ffdcc6",
          "fixed-dim": "#ffb784",
        },
        "on-tertiary": {
          DEFAULT: "#502500",
          container: "#ffc7a2",
          fixed: "#301400",
          "fixed-variant": "#713700",
        },
        error: {
          DEFAULT: "#ffb4ab",
          container: "#93000a",
        },
        "on-error": {
          DEFAULT: "#690005",
          container: "#ffdad6",
        },
        "on-surface": {
          DEFAULT: "#e1e1ed",
          variant: "#c5c5d4",
        },
        "on-background": "#e1e1ed",
        outline: {
          DEFAULT: "#8f909e",
          variant: "#454652",
        },
        inverse: {
          surface: "#e1e1ed",
          "on-surface": "#2e3039",
          primary: "#4858ab",
        },
      },
      fontFamily: {
        headline: ["Manrope", "sans-serif"],
        body: ["Inter", "sans-serif"],
        label: ["Inter", "sans-serif"],
      },
      borderRadius: {
        xl: "0.75rem",
        "2xl": "1rem",
      },
    },
  },
  plugins: [],
};

export default config;
```

- [ ] **Step 4: Configure globals.css**

Replace the contents of `src/app/globals.css` with:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-background text-on-surface font-body antialiased;
  }
}

@layer utilities {
  .bg-approve-gradient {
    background: linear-gradient(135deg, #bac3ff 0%, #4453a7 100%);
  }

  .glass-panel {
    background: rgba(51, 52, 61, 0.6);
    backdrop-filter: blur(24px);
  }

  .no-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
}
```

- [ ] **Step 5: Verify Tailwind tokens work**

Replace `src/app/page.tsx` with:

```tsx
export default function Home() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="font-headline text-4xl font-extrabold text-on-surface tracking-tight">
          The Financial Architect
        </h1>
        <p className="text-on-surface-variant font-body">
          Design system loaded successfully
        </p>
        <div className="flex gap-4 justify-center">
          <span className="px-3 py-1 bg-primary/10 text-primary rounded text-sm">Primary</span>
          <span className="px-3 py-1 bg-secondary/10 text-secondary rounded text-sm">Secondary</span>
          <span className="px-3 py-1 bg-tertiary/10 text-tertiary rounded text-sm">Tertiary</span>
          <span className="px-3 py-1 bg-error/10 text-error rounded text-sm">Error</span>
        </div>
      </div>
    </div>
  );
}
```

Run:
```bash
npm run dev
```

Expected: Dark page with "The Financial Architect" heading, colored badges showing Primary (purple-blue), Secondary (teal), Tertiary (amber), Error (red).

- [ ] **Step 6: Commit**

```bash
git add tailwind.config.ts src/app/globals.css src/lib/utils.ts src/app/page.tsx package.json package-lock.json
git commit -m "feat: configure Tailwind with Stitch design tokens and utilities"
```

---

### Task 3: Root Layout with Google Fonts

**Files:**
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Configure root layout with fonts and metadata**

Replace `src/app/layout.tsx` with:

```tsx
import type { Metadata } from "next";
import { Manrope, Inter } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "The Financial Architect",
  description: "AI-powered trading platform for beginners",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${manrope.variable} ${inter.variable} selection:bg-primary/30`}>
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Update Tailwind font config to use CSS variables**

In `tailwind.config.ts`, update the `fontFamily` section:

```typescript
      fontFamily: {
        headline: ["var(--font-manrope)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
        label: ["var(--font-inter)", "sans-serif"],
      },
```

- [ ] **Step 3: Verify fonts render correctly**

Run:
```bash
npm run dev
```

Expected: "The Financial Architect" renders in Manrope (extrabold, tight tracking). Body text renders in Inter. Material Symbols icon font is available.

- [ ] **Step 4: Commit**

```bash
git add src/app/layout.tsx tailwind.config.ts
git commit -m "feat: configure root layout with Manrope, Inter, Material Symbols"
```

---

### Task 4: Top Navigation Bar Component

**Files:**
- Create: `src/components/layout/top-nav.tsx`
- Create: `__tests__/components/top-nav.test.tsx`

- [ ] **Step 1: Write the test**

Create `__tests__/components/top-nav.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { TopNav } from "@/components/layout/top-nav";

describe("TopNav", () => {
  it("renders the brand name", () => {
    render(<TopNav />);
    expect(screen.getByText("The Financial Architect")).toBeInTheDocument();
  });

  it("renders navigation links", () => {
    render(<TopNav />);
    expect(screen.getByText("Portfolio")).toBeInTheDocument();
    expect(screen.getByText("Markets")).toBeInTheDocument();
    expect(screen.getByText("Signals")).toBeInTheDocument();
    expect(screen.getByText("History")).toBeInTheDocument();
  });

  it("renders search input", () => {
    render(<TopNav />);
    expect(screen.getByPlaceholderText("Search markets...")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:
```bash
npx jest __tests__/components/top-nav.test.tsx --no-cache
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement TopNav**

Create `src/components/layout/top-nav.tsx`:

```tsx
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
```

- [ ] **Step 4: Run test to verify it passes**

Run:
```bash
npx jest __tests__/components/top-nav.test.tsx --no-cache
```

Expected: PASS — 3 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/layout/top-nav.tsx __tests__/components/top-nav.test.tsx
git commit -m "feat: add TopNav component matching Stitch design"
```

---

### Task 5: Side Navigation Bar Component

**Files:**
- Create: `src/components/layout/side-nav.tsx`
- Create: `__tests__/components/side-nav.test.tsx`

- [ ] **Step 1: Write the test**

Create `__tests__/components/side-nav.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { SideNav } from "@/components/layout/side-nav";

jest.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

describe("SideNav", () => {
  it("renders the brand subtitle", () => {
    render(<SideNav />);
    expect(screen.getByText("Private Wealth")).toBeInTheDocument();
    expect(screen.getByText("Institutional Grade")).toBeInTheDocument();
  });

  it("renders all navigation items", () => {
    render(<SideNav />);
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Analytics")).toBeInTheDocument();
    expect(screen.getByText("AI Insights")).toBeInTheDocument();
    expect(screen.getByText("Orders")).toBeInTheDocument();
    expect(screen.getByText("Settings")).toBeInTheDocument();
  });

  it("renders the New Trade button", () => {
    render(<SideNav />);
    expect(screen.getByText("New Trade")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:
```bash
npx jest __tests__/components/side-nav.test.tsx --no-cache
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement SideNav**

Create `src/components/layout/side-nav.tsx`:

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

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

      <div className="px-4 mt-auto">
        <button className="w-full py-4 bg-approve-gradient text-on-primary font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-primary/10 active:scale-95 transition-all">
          <span className="material-symbols-outlined">add_chart</span>
          New Trade
        </button>
      </div>
    </aside>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run:
```bash
npx jest __tests__/components/side-nav.test.tsx --no-cache
```

Expected: PASS — 3 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/layout/side-nav.tsx __tests__/components/side-nav.test.tsx
git commit -m "feat: add SideNav component matching Stitch design"
```

---

### Task 6: Bottom Navigation Bar (Mobile)

**Files:**
- Create: `src/components/layout/bottom-nav.tsx`
- Create: `__tests__/components/bottom-nav.test.tsx`

- [ ] **Step 1: Write the test**

Create `__tests__/components/bottom-nav.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { BottomNav } from "@/components/layout/bottom-nav";

jest.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

describe("BottomNav", () => {
  it("renders mobile navigation items", () => {
    render(<BottomNav />);
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Markets")).toBeInTheDocument();
    expect(screen.getByText("Signals")).toBeInTheDocument();
    expect(screen.getByText("Profile")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:
```bash
npx jest __tests__/components/bottom-nav.test.tsx --no-cache
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement BottomNav**

Create `src/components/layout/bottom-nav.tsx`:

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const mobileNavItems = [
  { href: "/", label: "Home", icon: "dashboard" },
  { href: "/markets", label: "Markets", icon: "monitoring" },
  { href: "/insights", label: "Signals", icon: "psychology" },
  { href: "/settings", label: "Profile", icon: "person" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-surface-container-low flex justify-around items-center px-4 z-50">
      {mobileNavItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-1",
              isActive ? "text-primary" : "text-on-surface/50"
            )}
          >
            <span
              className="material-symbols-outlined"
              style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
            >
              {item.icon}
            </span>
            <span className="text-[10px]">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run:
```bash
npx jest __tests__/components/bottom-nav.test.tsx --no-cache
```

Expected: PASS — 1 test passes.

- [ ] **Step 5: Commit**

```bash
git add src/components/layout/bottom-nav.tsx __tests__/components/bottom-nav.test.tsx
git commit -m "feat: add BottomNav mobile navigation component"
```

---

### Task 7: App Shell (Layout Wrapper)

**Files:**
- Create: `src/components/layout/app-shell.tsx`

- [ ] **Step 1: Create AppShell component**

Create `src/components/layout/app-shell.tsx`:

```tsx
import { TopNav } from "./top-nav";
import { SideNav } from "./side-nav";
import { BottomNav } from "./bottom-nav";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-background text-on-surface overflow-x-hidden">
      {/* Background gradient blurs */}
      <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[30%] h-[30%] bg-secondary/5 blur-[120px] rounded-full" />
      </div>

      <TopNav />
      <SideNav />

      <main className="lg:ml-64 pt-6 px-8 pb-20 lg:pb-12 max-w-[1440px]">
        {children}
      </main>

      <BottomNav />
    </div>
  );
}
```

- [ ] **Step 2: Integrate AppShell into root layout**

Replace `src/app/layout.tsx` with:

```tsx
import type { Metadata } from "next";
import { Manrope, Inter } from "next/font/google";
import { AppShell } from "@/components/layout/app-shell";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "The Financial Architect",
  description: "AI-powered trading platform for beginners",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${manrope.variable} ${inter.variable} selection:bg-primary/30`}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Verify the shell renders**

Run:
```bash
npm run dev
```

Expected: Page shows top nav bar with "The Financial Architect", left sidebar with "Private Wealth" and nav items, main content area with the test page. On narrow screens, sidebar hides and bottom tab bar appears.

- [ ] **Step 4: Commit**

```bash
git add src/components/layout/app-shell.tsx src/app/layout.tsx
git commit -m "feat: add AppShell layout wrapper combining all nav components"
```

---

### Task 8: Reusable UI Components

**Files:**
- Create: `src/components/ui/card.tsx`
- Create: `src/components/ui/button.tsx`
- Create: `src/components/ui/badge.tsx`
- Create: `src/components/ui/toggle.tsx`
- Create: `src/components/ui/confidence-ring.tsx`
- Create: `__tests__/components/card.test.tsx`
- Create: `__tests__/components/button.test.tsx`
- Create: `__tests__/components/badge.test.tsx`
- Create: `__tests__/components/confidence-ring.test.tsx`

- [ ] **Step 1: Write Card test**

Create `__tests__/components/card.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { Card } from "@/components/ui/card";

describe("Card", () => {
  it("renders children", () => {
    render(<Card>Test content</Card>);
    expect(screen.getByText("Test content")).toBeInTheDocument();
  });

  it("applies nested variant", () => {
    const { container } = render(<Card variant="nested">Nested</Card>);
    expect(container.firstChild).toHaveClass("bg-surface-container-high");
  });
});
```

- [ ] **Step 2: Implement Card**

Create `src/components/ui/card.tsx`:

```tsx
import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  variant?: "default" | "nested" | "glass";
  className?: string;
}

export function Card({ children, variant = "default", className }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl",
        variant === "default" && "bg-surface-container-low p-6",
        variant === "nested" && "bg-surface-container-high rounded-lg p-6",
        variant === "glass" && "glass-panel p-6 relative overflow-hidden",
        className
      )}
    >
      {children}
    </div>
  );
}
```

- [ ] **Step 3: Write Button test**

Create `__tests__/components/button.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { Button } from "@/components/ui/button";

describe("Button", () => {
  it("renders with text", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  it("renders ghost variant", () => {
    const { container } = render(<Button variant="ghost">Ghost</Button>);
    expect(container.firstChild).toHaveClass("border");
  });
});
```

- [ ] **Step 4: Implement Button**

Create `src/components/ui/button.tsx`:

```tsx
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost";
  children: React.ReactNode;
}

export function Button({ variant = "primary", children, className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "font-bold rounded-xl transition-all active:scale-95",
        variant === "primary" &&
          "bg-approve-gradient text-on-primary shadow-lg shadow-primary/10 hover:brightness-110",
        variant === "ghost" &&
          "border border-outline-variant/30 text-on-surface hover:bg-surface-container-highest",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
```

- [ ] **Step 5: Write Badge test**

Create `__tests__/components/badge.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { Badge } from "@/components/ui/badge";

describe("Badge", () => {
  it("renders bullish badge", () => {
    render(<Badge sentiment="bullish" />);
    expect(screen.getByText("BULLISH")).toBeInTheDocument();
  });

  it("renders bearish badge", () => {
    render(<Badge sentiment="bearish" />);
    expect(screen.getByText("BEARISH")).toBeInTheDocument();
  });

  it("renders neutral badge", () => {
    render(<Badge sentiment="neutral" />);
    expect(screen.getByText("NEUTRAL")).toBeInTheDocument();
  });
});
```

- [ ] **Step 6: Implement Badge**

Create `src/components/ui/badge.tsx`:

```tsx
import { cn } from "@/lib/utils";

type Sentiment = "bullish" | "bearish" | "neutral";

interface BadgeProps {
  sentiment: Sentiment;
  className?: string;
}

const sentimentStyles: Record<Sentiment, string> = {
  bullish: "bg-secondary/10 text-secondary border-secondary/20",
  bearish: "bg-error/10 text-error border-error/20",
  neutral: "bg-outline/10 text-outline border-outline/20",
};

const sentimentLabels: Record<Sentiment, string> = {
  bullish: "BULLISH",
  bearish: "BEARISH",
  neutral: "NEUTRAL",
};

export function Badge({ sentiment, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border",
        sentimentStyles[sentiment],
        className
      )}
    >
      {sentimentLabels[sentiment]}
    </span>
  );
}
```

- [ ] **Step 7: Implement Toggle**

Create `src/components/ui/toggle.tsx`:

```tsx
"use client";

import { cn } from "@/lib/utils";

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  className?: string;
}

export function Toggle({ checked, onChange, label, className }: ToggleProps) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "w-10 h-5 rounded-full relative transition-colors",
        checked ? "bg-primary shadow-inner" : "bg-surface-container-highest",
        className
      )}
    >
      <div
        className={cn(
          "absolute top-1 w-3 h-3 rounded-full transition-all",
          checked ? "right-1 bg-white" : "left-1 bg-outline"
        )}
      />
    </button>
  );
}
```

- [ ] **Step 8: Write ConfidenceRing test**

Create `__tests__/components/confidence-ring.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { ConfidenceRing } from "@/components/ui/confidence-ring";

describe("ConfidenceRing", () => {
  it("renders the percentage", () => {
    render(<ConfidenceRing percentage={85} />);
    expect(screen.getByText("85%")).toBeInTheDocument();
  });

  it("renders the label", () => {
    render(<ConfidenceRing percentage={60} />);
    expect(screen.getByText("Confidence")).toBeInTheDocument();
  });
});
```

- [ ] **Step 9: Implement ConfidenceRing**

Create `src/components/ui/confidence-ring.tsx`:

```tsx
import { cn } from "@/lib/utils";

interface ConfidenceRingProps {
  percentage: number;
  size?: number;
  className?: string;
}

export function ConfidenceRing({ percentage, size = 128, className }: ConfidenceRingProps) {
  const radius = (size / 2) - 6;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  // Color based on confidence level
  const ringColor = percentage >= 70 ? "text-secondary" : percentage >= 40 ? "text-tertiary" : "text-error";

  return (
    <div className={cn("relative flex items-center justify-center", className)} style={{ width: size, height: size }}>
      <svg className="w-full h-full transform -rotate-90">
        <circle
          className="text-surface-container-highest"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="currentColor"
          strokeWidth="8"
        />
        <circle
          className={ringColor}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="currentColor"
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-extrabold font-headline">{percentage}%</span>
        <span className="text-[10px] text-on-surface-variant uppercase tracking-tighter">
          Confidence
        </span>
      </div>
    </div>
  );
}
```

- [ ] **Step 10: Run all component tests**

Run:
```bash
npx jest __tests__/components/ --no-cache
```

Expected: ALL PASS — Card (2), Button (2), Badge (3), ConfidenceRing (2) tests pass.

- [ ] **Step 11: Commit**

```bash
git add src/components/ui/ __tests__/components/
git commit -m "feat: add reusable UI components (Card, Button, Badge, Toggle, ConfidenceRing)"
```

---

### Task 9: Create All Page Routes with Placeholders

**Files:**
- Modify: `src/app/page.tsx`
- Create: `src/app/portfolio/page.tsx`
- Create: `src/app/markets/page.tsx`
- Create: `src/app/insights/page.tsx`
- Create: `src/app/settings/page.tsx`
- Create: `__tests__/app/pages.test.tsx`

- [ ] **Step 1: Write the test**

Create `__tests__/app/pages.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";

// Import each page component
import DashboardPage from "@/app/page";
import PortfolioPage from "@/app/portfolio/page";
import MarketsPage from "@/app/markets/page";
import InsightsPage from "@/app/insights/page";
import SettingsPage from "@/app/settings/page";

describe("Page routes", () => {
  it("renders Dashboard page", () => {
    render(<DashboardPage />);
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
  });

  it("renders Portfolio page", () => {
    render(<PortfolioPage />);
    expect(screen.getByText("Portfolio")).toBeInTheDocument();
  });

  it("renders Markets page", () => {
    render(<MarketsPage />);
    expect(screen.getByText("Markets & Watchlist")).toBeInTheDocument();
  });

  it("renders AI Insights page", () => {
    render(<InsightsPage />);
    expect(screen.getByText("AI Insights")).toBeInTheDocument();
  });

  it("renders Settings page", () => {
    render(<SettingsPage />);
    expect(screen.getByText("Settings & Risk Management")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:
```bash
npx jest __tests__/app/pages.test.tsx --no-cache
```

Expected: FAIL — pages don't exist yet (except home).

- [ ] **Step 3: Create Dashboard page (home)**

Replace `src/app/page.tsx`:

```tsx
export default function DashboardPage() {
  return (
    <div>
      <header className="mb-10">
        <h1 className="font-headline text-4xl font-extrabold tracking-tight text-on-surface mb-2">
          Dashboard
        </h1>
        <p className="text-on-surface-variant">
          Your AI-powered trading command center.
        </p>
      </header>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8 space-y-6">
          <div className="bg-surface-container-low rounded-xl p-8">
            <p className="text-on-surface-variant text-sm uppercase tracking-widest mb-1">
              Total Portfolio Value
            </p>
            <p className="text-5xl font-extrabold font-headline tracking-tight">
              €0.00
            </p>
          </div>
          <div className="bg-surface-container rounded-xl p-6">
            <h2 className="text-xl font-bold font-headline mb-4">Active AI Signals</h2>
            <p className="text-on-surface-variant text-sm">
              No signals yet. Connect your market data to get started.
            </p>
          </div>
        </div>
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <div className="bg-surface-container-low rounded-xl p-6">
            <p className="text-sm font-bold font-headline text-on-surface-variant uppercase tracking-widest mb-4">
              Market Sentiment
            </p>
            <p className="text-on-surface-variant text-sm">Loading...</p>
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create Portfolio page**

Create `src/app/portfolio/page.tsx`:

```tsx
export default function PortfolioPage() {
  return (
    <div>
      <header className="mb-10">
        <h1 className="font-headline text-4xl font-extrabold tracking-tight text-on-surface mb-2">
          Portfolio
        </h1>
        <p className="text-on-surface-variant">
          Track your holdings and trade history.
        </p>
      </header>

      <div className="space-y-6">
        <div className="bg-surface-container-low rounded-xl p-8">
          <h2 className="text-xl font-bold font-headline mb-4">Holdings</h2>
          <p className="text-on-surface-variant text-sm">
            No holdings yet. Approve a trade signal to get started.
          </p>
        </div>
        <div className="bg-surface-container rounded-xl p-6">
          <h2 className="text-xl font-bold font-headline mb-4">Trade History</h2>
          <p className="text-on-surface-variant text-sm">
            No trades recorded yet.
          </p>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Create Markets page**

Create `src/app/markets/page.tsx`:

```tsx
export default function MarketsPage() {
  return (
    <div>
      <header className="mb-10">
        <h1 className="font-headline text-4xl font-extrabold tracking-tight text-on-surface mb-2">
          Markets & Watchlist
        </h1>
        <p className="text-on-surface-variant">
          Track tickers and discover opportunities.
        </p>
      </header>

      <div className="space-y-6">
        <div className="bg-surface-container-low rounded-xl p-6">
          <div className="flex items-center gap-2 px-3 py-2 bg-surface-container rounded-lg w-full max-w-md">
            <span className="material-symbols-outlined text-sm text-primary">search</span>
            <input
              className="bg-transparent border-none focus:ring-0 focus:outline-none text-sm text-on-surface-variant w-full placeholder:text-outline/40"
              placeholder="Search stocks, ETFs, crypto..."
              type="text"
            />
          </div>
        </div>
        <div className="bg-surface-container rounded-xl p-6">
          <h2 className="text-xl font-bold font-headline mb-4">Your Watchlist</h2>
          <p className="text-on-surface-variant text-sm">
            No tickers in your watchlist. Search and add some above.
          </p>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Create AI Insights page**

Create `src/app/insights/page.tsx`:

```tsx
export default function InsightsPage() {
  return (
    <div>
      <header className="mb-10">
        <h1 className="font-headline text-4xl font-extrabold tracking-tight text-on-surface mb-2">
          AI Insights
        </h1>
        <p className="text-on-surface-variant">
          Learn from every trade. Understand every signal.
        </p>
      </header>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8 space-y-6">
          <div className="bg-surface-container-low rounded-xl p-8">
            <h2 className="text-xl font-bold font-headline mb-4">Signal History</h2>
            <p className="text-on-surface-variant text-sm">
              No signals analyzed yet. Once AI generates signals, their reasoning and outcomes will appear here.
            </p>
          </div>
          <div className="bg-surface-container rounded-xl p-6">
            <h2 className="text-xl font-bold font-headline mb-4">Weekly Review</h2>
            <p className="text-on-surface-variant text-sm">
              Your first weekly review will be available after your first week of trading.
            </p>
          </div>
        </div>
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <div className="bg-surface-container-low rounded-xl p-6">
            <h2 className="text-lg font-bold font-headline mb-4">Knowledge Vault</h2>
            <p className="text-on-surface-variant text-sm">
              Trading concepts you encounter will be collected here as you learn.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 7: Create Settings page**

Create `src/app/settings/page.tsx`:

```tsx
export default function SettingsPage() {
  return (
    <div>
      <header className="mb-10">
        <h1 className="font-headline text-4xl font-extrabold tracking-tight text-on-surface mb-2">
          Settings & Risk Management
        </h1>
        <p className="text-on-surface-variant">
          Configure your institutional guardrails and platform preferences.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <section className="lg:col-span-8 space-y-8">
          <div className="bg-surface-container-low rounded-xl p-8">
            <div className="flex items-center gap-3 mb-8">
              <span
                className="material-symbols-outlined text-secondary"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                security
              </span>
              <h3 className="font-headline text-xl font-bold">Capital Protection Guardrails</h3>
            </div>
            <p className="text-on-surface-variant text-sm">
              Risk management controls will be configured here in Phase 9.
            </p>
          </div>
          <div className="bg-surface-container rounded-xl p-8">
            <h3 className="font-headline text-xl font-bold mb-4">Execution Mode</h3>
            <div className="flex bg-surface-container-lowest p-1 rounded-full w-fit">
              <button className="px-6 py-2 rounded-full text-sm font-bold bg-primary text-on-primary">
                Paper
              </button>
              <button className="px-6 py-2 rounded-full text-sm font-bold text-on-surface/50">
                Live
              </button>
            </div>
          </div>
        </section>
        <aside className="lg:col-span-4 space-y-8">
          <div className="bg-surface-container-low rounded-xl p-6">
            <h3 className="font-headline font-bold text-lg mb-6">Market Coverage</h3>
            <p className="text-on-surface-variant text-sm">
              Market toggles will be added in Phase 9.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
```

- [ ] **Step 8: Run tests**

Run:
```bash
npx jest __tests__/app/pages.test.tsx --no-cache
```

Expected: PASS — all 5 page tests pass.

- [ ] **Step 9: Visual verification**

Run:
```bash
npm run dev
```

Navigate to each page and verify:
- `http://localhost:3000/` — Dashboard with portfolio value and signals placeholder
- `http://localhost:3000/portfolio` — Portfolio with holdings and trade history placeholders
- `http://localhost:3000/markets` — Markets with search bar and watchlist placeholder
- `http://localhost:3000/insights` — AI Insights with signal history, weekly review, knowledge vault
- `http://localhost:3000/settings` — Settings with guardrails section and paper/live toggle

All pages should share the same layout: top nav, sidebar (desktop), bottom nav (mobile).

- [ ] **Step 10: Commit**

```bash
git add src/app/ __tests__/app/
git commit -m "feat: add all 5 page routes with placeholder content"
```

---

### Task 10: Build Verification & Final Commit

**Files:** None new — verification only.

- [ ] **Step 1: Run all tests**

Run:
```bash
npx jest --no-cache
```

Expected: ALL PASS — all component and page tests pass.

- [ ] **Step 2: Run production build**

Run:
```bash
npm run build
```

Expected: Build completes successfully with no errors.

- [ ] **Step 3: Run lint**

Run:
```bash
npm run lint
```

Expected: No lint errors.

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "chore: Phase 1 complete — foundation, design system, layout, all page routes"
```

---

## Phase 1 Completion Criteria

When this plan is complete, you should have:

1. A working Next.js 14 app with TypeScript
2. Tailwind CSS configured with all Stitch design tokens (colors, fonts, components)
3. Shared layout with responsive navigation (top nav, sidebar, mobile bottom nav)
4. 5 page routes all rendering with proper styling and placeholder content
5. 5 reusable UI components (Card, Button, Badge, Toggle, ConfidenceRing)
6. All tests passing
7. Production build succeeding
8. Clean git history with descriptive commits

**Next:** Phase 2 — Supabase Backend & Auth (database tables, magic link auth, edge functions)
