# Phase 2: Supabase Backend & Auth

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up the Supabase backend (PostgreSQL schema + Row Level Security), wire the Next.js app to Supabase via `@supabase/ssr`, and ship a magic-link authentication flow that gates every page except `/login` and `/auth/callback`. On first sign-in, seed the user with default risk settings and a 10,000 EUR paper account.

**Architecture:** Three Supabase client surfaces (browser, server component, middleware) using the modern `@supabase/ssr` package. All tables enforce `user_id = auth.uid()` RLS. Auth flow is passwordless email OTP ("magic link"). A `src/middleware.ts` file refreshes the session and redirects unauthenticated requests. After the auth callback exchanges the code for a session, a server action provisions the user's default rows idempotently.

**Tech Stack additions:** `@supabase/supabase-js`, `@supabase/ssr`, Supabase CLI (for type generation and local migrations, invoked via `npx`).

---

## Phases Overview (this is Phase 2 of 9)

1. ✅ Phase 1: Foundation & Design System
2. **Phase 2: Supabase Backend & Auth** ← THIS PLAN
3. Phase 3: Dashboard UI (with mock data)
4. Phase 4: Market Data Integration (Alpha Vantage + CoinGecko)
5. Phase 5: AI Signal Generation (Claude API)
6. Phase 6: Paper Trading Engine
7. Phase 7: Portfolio, Watchlist & Markets Pages
8. Phase 8: AI Insights, Knowledge Vault & Learning Loop
9. Phase 9: Live Trading (Alpaca API) & Settings

---

## File Structure (additions)

```
carnitez-trading/
├── .env.local.example              # updated with Supabase vars
├── supabase/
│   ├── config.toml                 # Supabase CLI project config
│   └── migrations/
│       ├── 0001_init.sql           # Enums, tables, indexes, FKs
│       ├── 0002_rls.sql            # Row Level Security policies
│       └── 0003_seed_functions.sql # First-login seed function + trigger
├── src/
│   ├── middleware.ts               # Session refresh + route protection
│   ├── app/
│   │   ├── login/
│   │   │   └── page.tsx            # Magic link sign-in form
│   │   └── auth/
│   │       └── callback/
│   │           └── route.ts        # Exchange code for session
│   ├── components/
│   │   └── layout/
│   │       └── top-nav.tsx         # (modified) — user email + sign out
│   └── lib/
│       ├── supabase/
│       │   ├── client.ts           # Browser client
│       │   ├── server.ts           # RSC/Server Action client
│       │   ├── middleware.ts       # Middleware helper
│       │   └── types.ts            # Generated DB types
│       └── auth/
│           ├── actions.ts          # signInWithMagicLink, signOut server actions
│           └── seed-user.ts        # Idempotent first-login provisioning
└── __tests__/
    ├── app/
    │   └── login.test.tsx          # Login page UI test
    └── lib/
        └── auth/
            └── seed-user.test.ts   # Seed-user idempotency unit test
```

---

### Task 1: Supabase Project Setup & Environment

**Files:**
- Modify: `.env.local.example`, `.gitignore`, `package.json`
- Create: `.env.local` (manual, not committed)

- [ ] **Step 1: Create the Supabase project (manual)**

The user must do this part — we don't create accounts or projects on their behalf.

1. Sign in at https://supabase.com/dashboard
2. Click **New project** → Organization: personal → Name: `carnitez-trading` → Region: `eu-central-1` (Frankfurt, closest to NL) → generate a strong database password and save it to a password manager
3. Wait for provisioning (~2 min)
4. In **Project Settings → API**, copy these three values:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` secret key → `SUPABASE_SERVICE_ROLE_KEY` (NEVER expose to the browser)
5. In **Project Settings → General**, copy the Reference ID → save as `SUPABASE_PROJECT_REF`

- [ ] **Step 2: Install Supabase packages**

Run:
```bash
cd "/Users/bryan/Documents/Trade test/Carnitez-Trading"
npm install @supabase/supabase-js @supabase/ssr
```

- [ ] **Step 3: Update `.env.local.example`**

Replace the Supabase section of `.env.local.example` with:

```bash
# Supabase — create a project at https://supabase.com/dashboard
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_public_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_never_expose_to_browser
SUPABASE_PROJECT_REF=your_project_ref

# Anthropic (Claude API)
ANTHROPIC_API_KEY=your_anthropic_api_key

# Alpha Vantage (Market Data)
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_api_key

# Alpaca (Live Trading — Phase 9)
ALPACA_API_KEY=your_alpaca_api_key
ALPACA_SECRET_KEY=your_alpaca_secret_key
ALPACA_BASE_URL=https://paper-api.alpaca.markets
```

- [ ] **Step 4: Confirm `.env.local` is gitignored**

Check `.gitignore` contains:
```
.env*.local
```
If not, add it. Then create `.env.local` by copying `.env.local.example` and filling in the real values from Step 1. Do NOT commit `.env.local`.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json .env.local.example .gitignore
git commit -m "chore: add @supabase/ssr and document environment variables"
```

---

### Task 2: Database Schema Migration

**Files:**
- Create: `supabase/config.toml`, `supabase/migrations/0001_init.sql`

- [ ] **Step 1: Initialize the Supabase CLI config**

We use the CLI for local migration management and type generation. Install via `npx` so we don't add a dev dependency.

Run:
```bash
cd "/Users/bryan/Documents/Trade test/Carnitez-Trading"
npx supabase init
```

Expected: creates `supabase/config.toml` and `supabase/.gitignore`. Accept any prompts with defaults.

- [ ] **Step 2: Link the local project to the remote Supabase instance**

Run (replacing with the actual project ref from Task 1):
```bash
npx supabase link --project-ref <SUPABASE_PROJECT_REF>
```

You'll be prompted for the database password from Task 1 Step 1.

- [ ] **Step 3: Create the initial schema migration**

Run:
```bash
npx supabase migration new init
```

This creates `supabase/migrations/<timestamp>_init.sql`. Rename it to `0001_init.sql` for clarity.

- [ ] **Step 4: Populate the schema**

Replace the contents of `supabase/migrations/0001_init.sql` with:

```sql
-- Phase 2 — Initial schema for Carnitez Trading
-- All tables are scoped to auth.users via user_id FK. RLS in 0002_rls.sql.

-- =============================================================================
-- Enums
-- =============================================================================

create type public.asset_type as enum ('stock', 'etf', 'crypto');
create type public.trade_action as enum ('buy', 'sell');
create type public.signal_action as enum ('buy', 'sell', 'hold');
create type public.sentiment as enum ('bullish', 'bearish', 'neutral');
create type public.signal_status as enum ('pending', 'approved', 'skipped', 'expired');
create type public.trade_status as enum ('open', 'closed');
create type public.execution_mode as enum ('paper', 'live');
create type public.risk_level as enum ('low', 'medium', 'high');
create type public.learning_category as enum ('success', 'failure', 'pattern');

-- =============================================================================
-- user_settings
-- =============================================================================

create table public.user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  max_position_pct numeric(5,2) not null default 5.00 check (max_position_pct between 0.10 and 10.00),
  daily_loss_cap_pct numeric(5,2) not null default 2.50 check (daily_loss_cap_pct between 0.10 and 10.00),
  stop_loss_pct numeric(5,2) not null default 1.50 check (stop_loss_pct > 0),
  take_profit_pct numeric(5,2) not null default 4.50 check (take_profit_pct > 0),
  max_concurrent_positions smallint not null default 5 check (max_concurrent_positions between 1 and 10),
  execution_mode public.execution_mode not null default 'paper',
  markets_us boolean not null default true,
  markets_eu boolean not null default true,
  markets_crypto boolean not null default true,
  notify_trades boolean not null default true,
  notify_risk boolean not null default true,
  notify_weekly boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =============================================================================
-- paper_account
-- =============================================================================

create table public.paper_account (
  user_id uuid primary key references auth.users(id) on delete cascade,
  balance_eur numeric(14,2) not null default 10000.00 check (balance_eur >= 0),
  initial_balance_eur numeric(14,2) not null default 10000.00,
  created_at timestamptz not null default now()
);

-- =============================================================================
-- ai_signals
-- =============================================================================

create table public.ai_signals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  ticker text not null,
  name text not null,
  asset_type public.asset_type not null,
  action public.signal_action not null,
  sentiment public.sentiment not null,
  confidence_pct smallint not null check (confidence_pct between 0 and 100),
  reasoning_text text not null,
  risk_level public.risk_level not null,
  suggested_entry numeric(14,4),
  suggested_stop_loss numeric(14,4),
  suggested_take_profit numeric(14,4),
  status public.signal_status not null default 'pending',
  created_at timestamptz not null default now(),
  acted_at timestamptz
);

create index ai_signals_user_status_idx on public.ai_signals (user_id, status, created_at desc);

-- =============================================================================
-- trade_history
-- =============================================================================

create table public.trade_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  signal_id uuid references public.ai_signals(id) on delete set null,
  ticker text not null,
  name text not null,
  asset_type public.asset_type not null,
  action public.trade_action not null,
  quantity numeric(18,8) not null check (quantity > 0),
  price numeric(14,4) not null check (price > 0),
  stop_loss_price numeric(14,4),
  take_profit_price numeric(14,4),
  status public.trade_status not null default 'open',
  pnl_eur numeric(14,2),
  pnl_pct numeric(8,4),
  opened_at timestamptz not null default now(),
  closed_at timestamptz,
  execution_mode public.execution_mode not null default 'paper'
);

create index trade_history_user_status_idx on public.trade_history (user_id, status, opened_at desc);

-- =============================================================================
-- portfolio_holdings
-- =============================================================================

create table public.portfolio_holdings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  ticker text not null,
  name text not null,
  asset_type public.asset_type not null,
  quantity numeric(18,8) not null check (quantity >= 0),
  avg_entry_price numeric(14,4) not null check (avg_entry_price > 0),
  current_price numeric(14,4),
  updated_at timestamptz not null default now(),
  unique (user_id, ticker, asset_type)
);

-- =============================================================================
-- watchlist
-- =============================================================================

create table public.watchlist (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  ticker text not null,
  name text not null,
  asset_type public.asset_type not null,
  added_at timestamptz not null default now(),
  unique (user_id, ticker, asset_type)
);

-- =============================================================================
-- knowledge_vault
-- =============================================================================

create table public.knowledge_vault (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  concept_name text not null,
  definition text not null,
  first_encountered_signal_id uuid references public.ai_signals(id) on delete set null,
  unlocked_at timestamptz not null default now(),
  unique (user_id, concept_name)
);

-- =============================================================================
-- market_data_cache (shared across users — no user_id)
-- =============================================================================

create table public.market_data_cache (
  ticker text not null,
  asset_type public.asset_type not null,
  price numeric(14,4) not null,
  change_pct numeric(8,4),
  volume numeric(20,2),
  rsi numeric(6,2),
  sma_20 numeric(14,4),
  sma_50 numeric(14,4),
  updated_at timestamptz not null default now(),
  primary key (ticker, asset_type)
);

-- =============================================================================
-- learnings
-- =============================================================================

create table public.learnings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  trade_id uuid references public.trade_history(id) on delete set null,
  lesson_text text not null,
  category public.learning_category not null,
  created_at timestamptz not null default now()
);

create index learnings_user_created_idx on public.learnings (user_id, created_at desc);

-- =============================================================================
-- updated_at trigger (generic)
-- =============================================================================

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger user_settings_touch_updated_at
  before update on public.user_settings
  for each row execute function public.touch_updated_at();

create trigger portfolio_holdings_touch_updated_at
  before update on public.portfolio_holdings
  for each row execute function public.touch_updated_at();
```

- [ ] **Step 5: Push the migration to Supabase**

Run:
```bash
npx supabase db push
```

Expected: the CLI applies `0001_init.sql` to the linked remote project. Verify by opening **Table Editor** in the Supabase dashboard — all 9 tables should be visible.

- [ ] **Step 6: Commit**

```bash
git add supabase/config.toml supabase/migrations/0001_init.sql supabase/.gitignore
git commit -m "feat(db): initial schema — 9 tables, enums, indexes"
```

---

### Task 3: Row Level Security Policies

**Files:**
- Create: `supabase/migrations/0002_rls.sql`

- [ ] **Step 1: Create the RLS migration**

Run:
```bash
npx supabase migration new rls
```

Rename it to `0002_rls.sql`.

- [ ] **Step 2: Populate the policies**

Replace the contents of `supabase/migrations/0002_rls.sql` with:

```sql
-- Phase 2 — Row Level Security
-- Rule: every user-scoped table restricts all operations to rows where user_id = auth.uid().
-- market_data_cache is shared read-only for authenticated users.

-- =============================================================================
-- Enable RLS
-- =============================================================================

alter table public.user_settings       enable row level security;
alter table public.paper_account       enable row level security;
alter table public.ai_signals          enable row level security;
alter table public.trade_history       enable row level security;
alter table public.portfolio_holdings  enable row level security;
alter table public.watchlist           enable row level security;
alter table public.knowledge_vault     enable row level security;
alter table public.learnings           enable row level security;
alter table public.market_data_cache   enable row level security;

-- =============================================================================
-- Helper: owner policy generator
-- =============================================================================
-- Inline policies (no helper fn) for clarity and auditability.

-- user_settings --------------------------------------------------------------
create policy "user_settings_owner_select" on public.user_settings
  for select using (user_id = auth.uid());
create policy "user_settings_owner_insert" on public.user_settings
  for insert with check (user_id = auth.uid());
create policy "user_settings_owner_update" on public.user_settings
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

-- paper_account --------------------------------------------------------------
create policy "paper_account_owner_select" on public.paper_account
  for select using (user_id = auth.uid());
create policy "paper_account_owner_insert" on public.paper_account
  for insert with check (user_id = auth.uid());
create policy "paper_account_owner_update" on public.paper_account
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ai_signals -----------------------------------------------------------------
create policy "ai_signals_owner_select" on public.ai_signals
  for select using (user_id = auth.uid());
create policy "ai_signals_owner_insert" on public.ai_signals
  for insert with check (user_id = auth.uid());
create policy "ai_signals_owner_update" on public.ai_signals
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "ai_signals_owner_delete" on public.ai_signals
  for delete using (user_id = auth.uid());

-- trade_history --------------------------------------------------------------
create policy "trade_history_owner_select" on public.trade_history
  for select using (user_id = auth.uid());
create policy "trade_history_owner_insert" on public.trade_history
  for insert with check (user_id = auth.uid());
create policy "trade_history_owner_update" on public.trade_history
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

-- portfolio_holdings ---------------------------------------------------------
create policy "portfolio_holdings_owner_select" on public.portfolio_holdings
  for select using (user_id = auth.uid());
create policy "portfolio_holdings_owner_insert" on public.portfolio_holdings
  for insert with check (user_id = auth.uid());
create policy "portfolio_holdings_owner_update" on public.portfolio_holdings
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "portfolio_holdings_owner_delete" on public.portfolio_holdings
  for delete using (user_id = auth.uid());

-- watchlist ------------------------------------------------------------------
create policy "watchlist_owner_select" on public.watchlist
  for select using (user_id = auth.uid());
create policy "watchlist_owner_insert" on public.watchlist
  for insert with check (user_id = auth.uid());
create policy "watchlist_owner_delete" on public.watchlist
  for delete using (user_id = auth.uid());

-- knowledge_vault ------------------------------------------------------------
create policy "knowledge_vault_owner_select" on public.knowledge_vault
  for select using (user_id = auth.uid());
create policy "knowledge_vault_owner_insert" on public.knowledge_vault
  for insert with check (user_id = auth.uid());

-- learnings ------------------------------------------------------------------
create policy "learnings_owner_select" on public.learnings
  for select using (user_id = auth.uid());
create policy "learnings_owner_insert" on public.learnings
  for insert with check (user_id = auth.uid());

-- market_data_cache — authenticated users can read; writes done via service role
create policy "market_data_cache_authenticated_select" on public.market_data_cache
  for select using (auth.role() = 'authenticated');
```

- [ ] **Step 3: Push**

```bash
npx supabase db push
```

- [ ] **Step 4: Verify RLS in the dashboard**

Open **Authentication → Policies** in the Supabase dashboard. Every table listed above should show a green "RLS enabled" badge and the policies from the migration.

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/0002_rls.sql
git commit -m "feat(db): enable RLS and owner-only policies on all user tables"
```

---

### Task 4: First-Login Seed Function

**Files:**
- Create: `supabase/migrations/0003_seed_functions.sql`

We provision `user_settings` and `paper_account` in a database trigger fired when a new row is inserted into `auth.users`. This guarantees every authenticated user has defaults the first time they log in, without relying on client code.

- [ ] **Step 1: Create the migration**

```bash
npx supabase migration new seed_functions
```

Rename to `0003_seed_functions.sql`.

- [ ] **Step 2: Populate**

```sql
-- Phase 2 — Seed default rows when a new auth.users row is created.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_settings (user_id)
    values (new.id)
    on conflict (user_id) do nothing;

  insert into public.paper_account (user_id)
    values (new.id)
    on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
```

- [ ] **Step 3: Push and commit**

```bash
npx supabase db push
git add supabase/migrations/0003_seed_functions.sql
git commit -m "feat(db): seed user_settings and paper_account on auth.users insert"
```

---

### Task 5: Generate TypeScript Types

**Files:**
- Create: `src/lib/supabase/types.ts`
- Modify: `package.json` (script)

- [ ] **Step 1: Add a `db:types` script**

In `package.json`, add to `"scripts"`:

```json
"db:types": "supabase gen types typescript --linked > src/lib/supabase/types.ts"
```

- [ ] **Step 2: Generate types**

Run:
```bash
mkdir -p src/lib/supabase
npx supabase gen types typescript --linked > src/lib/supabase/types.ts
```

Expected: a file that exports a `Database` type containing every table, enum, and function. Open it to confirm the 9 tables and 9 enums from Tasks 2–4 are present.

- [ ] **Step 3: Commit**

```bash
git add package.json src/lib/supabase/types.ts
git commit -m "feat(db): generate Supabase TypeScript types"
```

---

### Task 6: Supabase Client Utilities

**Files:**
- Create: `src/lib/supabase/client.ts`, `src/lib/supabase/server.ts`, `src/lib/supabase/middleware.ts`

Three clients are required because `@supabase/ssr` handles cookies differently in each Next.js runtime.

- [ ] **Step 1: Browser client**

Create `src/lib/supabase/client.ts`:

```ts
import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./types";

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

- [ ] **Step 2: Server component / server action client**

Create `src/lib/supabase/server.ts`:

```ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "./types";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component — ignore. Middleware handles refresh.
          }
        },
      },
    }
  );
}
```

- [ ] **Step 3: Middleware client**

Create `src/lib/supabase/middleware.ts`:

```ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "./types";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: must call getUser() to refresh session cookies.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isPublic =
    pathname.startsWith("/login") ||
    pathname.startsWith("/auth/callback") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico";

  if (!user && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (user && pathname === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.searchParams.delete("next");
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
```

- [ ] **Step 4: Commit**

```bash
git add src/lib/supabase/client.ts src/lib/supabase/server.ts src/lib/supabase/middleware.ts
git commit -m "feat(auth): add Supabase browser, server, and middleware clients"
```

---

### Task 7: Root Middleware

**Files:**
- Create: `src/middleware.ts`

- [ ] **Step 1: Create the middleware entry point**

Create `src/middleware.ts`:

```ts
import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public assets with extensions
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
```

- [ ] **Step 2: Verify the redirect**

Run:
```bash
npm run dev
```

Visit http://localhost:3000. Expected: redirected to `/login?next=/`. Visiting `/portfolio` → `/login?next=/portfolio`. (The login page itself is built in Task 8; this step will 404 until then, but the redirect itself should fire.)

- [ ] **Step 3: Commit**

```bash
git add src/middleware.ts
git commit -m "feat(auth): protect all routes via Supabase session middleware"
```

---

### Task 8: Login Page & Magic Link Server Action

**Files:**
- Create: `src/lib/auth/actions.ts`
- Create: `src/app/login/page.tsx`
- Create: `__tests__/app/login.test.tsx`

- [ ] **Step 1: Write the login page test**

Create `__tests__/app/login.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import LoginPage from "@/app/login/page";

describe("LoginPage", () => {
  it("renders the email input and submit button", () => {
    render(<LoginPage searchParams={Promise.resolve({})} />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /send magic link/i })
    ).toBeInTheDocument();
  });

  it("renders the brand headline", () => {
    render(<LoginPage searchParams={Promise.resolve({})} />);
    expect(screen.getByText(/carnitez trading/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Create the sign-in server action**

Create `src/lib/auth/actions.ts`:

```ts
"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export async function signInWithMagicLink(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) {
    redirect("/login?error=missing_email");
  }

  const supabase = await createClient();
  const origin = (await headers()).get("origin") ?? "http://localhost:3000";

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/login?sent=1");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
```

- [ ] **Step 3: Create the login page**

Create `src/app/login/page.tsx`:

```tsx
import { signInWithMagicLink } from "@/lib/auth/actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string; error?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="min-h-screen flex items-center justify-center bg-surface px-6">
      <div className="w-full max-w-md bg-surface-container-low rounded-xl p-8">
        <h1 className="font-headline text-4xl font-extrabold tracking-tight text-on-surface">
          Carnitez Trading
        </h1>
        <p className="mt-2 text-on-surface-variant">
          Sign in with a magic link — no password required.
        </p>

        <form action={signInWithMagicLink} className="mt-8 space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-on-surface-variant">
              Email
            </span>
            <input
              type="email"
              name="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              className="mt-1 w-full rounded-lg bg-surface-container-high border border-outline-variant/30 px-4 py-3 text-on-surface placeholder:text-on-surface/40 focus:outline-none focus:border-primary"
            />
          </label>

          <button
            type="submit"
            className="w-full rounded-xl bg-gradient-to-br from-primary to-primary-container text-on-primary font-bold py-3 transition-all active:scale-[0.98] hover:brightness-110"
          >
            Send magic link
          </button>
        </form>

        {params.sent && (
          <p className="mt-6 text-sm text-secondary">
            Check your email — we sent you a sign-in link.
          </p>
        )}
        {params.error && (
          <p className="mt-6 text-sm text-error">{params.error}</p>
        )}
      </div>
    </main>
  );
}
```

- [ ] **Step 4: Run the test**

```bash
npm test -- login.test
```

Expected: both tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/lib/auth/actions.ts src/app/login/page.tsx __tests__/app/login.test.tsx
git commit -m "feat(auth): add login page and magic link server action"
```

---

### Task 9: Auth Callback Route

**Files:**
- Create: `src/app/auth/callback/route.ts`

- [ ] **Step 1: Create the route handler**

Create `src/app/auth/callback/route.ts`:

```ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(error.message)}`
    );
  }

  return NextResponse.redirect(`${origin}/login?error=missing_code`);
}
```

- [ ] **Step 2: Manual end-to-end test**

1. `npm run dev`
2. Visit http://localhost:3000 → should redirect to `/login`
3. Enter your real email → submit → "Check your email" message appears
4. Open the email from Supabase → click the magic link
5. Expected: callback exchanges the code, redirects to `/`, and the Dashboard shell renders
6. In the Supabase dashboard, check **Authentication → Users** — a new user exists
7. In **Table Editor**, open `user_settings` and `paper_account` — both should contain a row for your user (seeded by Task 4 trigger)

- [ ] **Step 3: Commit**

```bash
git add src/app/auth/callback/route.ts
git commit -m "feat(auth): handle magic link callback and exchange code for session"
```

---

### Task 10: Sign-Out & User Identity in TopNav

**Files:**
- Modify: `src/components/layout/top-nav.tsx`
- Modify: `__tests__/components/top-nav.test.tsx`

Current `top-nav.tsx` renders a static avatar. We make it async (Server Component), look up the current user, and display the email + a sign-out form.

- [ ] **Step 1: Update the test**

Replace `__tests__/components/top-nav.test.tsx` with a test that mocks the Supabase server client. Because `TopNav` becomes async, we render its resolved output.

```tsx
import { render, screen } from "@testing-library/react";
import { TopNav } from "@/components/layout/top-nav";

jest.mock("@/lib/supabase/server", () => ({
  createClient: jest.fn().mockResolvedValue({
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user: { email: "test@example.com" } },
        error: null,
      }),
    },
  }),
}));

describe("TopNav", () => {
  it("renders the brand name", async () => {
    const ui = await TopNav();
    render(ui);
    expect(screen.getByText("Carnitez Trading")).toBeInTheDocument();
  });

  it("renders the authenticated user email", async () => {
    const ui = await TopNav();
    render(ui);
    expect(screen.getByText("test@example.com")).toBeInTheDocument();
  });

  it("renders a sign out button", async () => {
    const ui = await TopNav();
    render(ui);
    expect(
      screen.getByRole("button", { name: /sign out/i })
    ).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Convert `top-nav.tsx` to a Server Component**

Read the current file first and preserve its structure. Update it to:

```tsx
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/lib/auth/actions";

export async function TopNav() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-surface-container-low border-b border-outline-variant/10 flex items-center justify-between px-6 z-40">
      <span className="font-headline text-xl font-extrabold tracking-tight text-on-surface">
        Carnitez Trading
      </span>

      <div className="flex items-center gap-4">
        {user && (
          <span className="hidden md:inline text-sm text-on-surface-variant">
            {user.email}
          </span>
        )}
        <form action={signOut}>
          <button
            type="submit"
            className="text-sm text-on-surface-variant hover:text-on-surface transition-colors"
          >
            Sign out
          </button>
        </form>
      </div>
    </header>
  );
}
```

*Note:* any Client Component that imported `TopNav` directly must now `await` it or be changed to render it via a server boundary. If `app-shell.tsx` is a Client Component (`"use client"`), convert it to a Server Component and keep the child nav items as Client Components only where they need browser APIs. If that cascade gets messy, move the user badge into a dedicated `<UserBadge />` async component and leave `TopNav` as-is.

- [ ] **Step 3: Run tests**

```bash
npm test
```

All tests should pass. If `app-shell.tsx` breaks because of the server/client boundary, fix it by splitting the affected component: server components render the async bits, client components handle interactivity.

- [ ] **Step 4: Manual smoke test**

1. `npm run dev`
2. Sign in → the Dashboard loads with your email in the top nav
3. Click **Sign out** → redirected to `/login`
4. Visit `/` again → redirected back to `/login`

- [ ] **Step 5: Commit**

```bash
git add src/components/layout/top-nav.tsx __tests__/components/top-nav.test.tsx
git commit -m "feat(auth): show authenticated user and sign-out action in top nav"
```

---

### Task 11: Build Verification & Final Commit

**Files:** None new — verification only.

- [ ] **Step 1: Run all tests**

```bash
npx jest --no-cache
```

Expected: ALL PASS. Total should be the Phase 1 count (21) plus the new login and updated top-nav tests.

- [ ] **Step 2: Run lint**

```bash
npm run lint
```

Expected: no errors.

- [ ] **Step 3: Run production build**

```bash
npm run build
```

Expected: build succeeds. Middleware is emitted as an Edge runtime bundle. `/login` and `/auth/callback` are present in the route manifest.

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "chore: Phase 2 complete — Supabase backend, schema, RLS, magic link auth"
```

---

## Phase 2 Completion Criteria

When this plan is complete, you should have:

1. A Supabase project in the `eu-central-1` region, linked to the repo via `supabase/config.toml`
2. Three migrations applied: initial schema (9 tables), RLS policies, new-user seed trigger
3. Generated TypeScript types in `src/lib/supabase/types.ts` matching the schema
4. Three Supabase client helpers (browser, server, middleware) using `@supabase/ssr`
5. Root middleware at `src/middleware.ts` that refreshes sessions and redirects unauthenticated users to `/login`
6. A magic-link login page at `/login` wired to a server action
7. An OAuth-style callback handler at `/auth/callback` that exchanges the code for a session
8. Top nav displaying the signed-in user's email and a sign-out action
9. First-login trigger verified: signing in as a new user creates rows in `user_settings` and `paper_account` automatically
10. All tests passing, lint clean, production build succeeding
11. Clean git history with per-task commits

**Next:** Phase 3 — Dashboard UI with mock data (portfolio header, buying power, active signals feed, sentiment gauge, stats grid, recent activity).

---

## Open Questions & Risks

1. **Email deliverability:** Supabase's default SMTP has low rate limits (3 emails/hour in free tier). For development this is fine; before Phase 9 we'll want to configure a custom SMTP provider (Resend or Postmark) for reliable magic link delivery.
2. **RLS gotchas:** The `market_data_cache` policy allows any authenticated user to read. Writes must happen via the service role key inside Edge Functions (Phase 4). Never expose the service role key to the browser.
3. **Server/Client boundary in `app-shell.tsx`:** If the shell was authored as a Client Component in Phase 1 (to use `usePathname` for active-link styling), Task 10's conversion of `TopNav` to async will force either (a) splitting the shell into server+client halves, or (b) moving the user badge out of `TopNav` into its own async sibling. Decide at implementation time; Task 10 Step 2 notes the fallback.
4. **Type generation requires the CLI to be linked:** `npx supabase gen types --linked` fails if `supabase link` hasn't been run or if the access token is missing. If this happens, run `npx supabase login` first, then re-link.
5. **Trigger vs. server-action seeding:** We chose a DB trigger (Task 4) over a post-callback server action because the trigger runs even if the user signs up via a non-web channel later. Downside: harder to unit-test. The `seed-user.test.ts` file in the file structure is reserved for Phase 3 if we decide to move seeding into app code.
