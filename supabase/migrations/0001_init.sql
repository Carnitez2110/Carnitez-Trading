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
