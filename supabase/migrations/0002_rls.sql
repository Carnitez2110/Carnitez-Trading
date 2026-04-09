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
-- Policies (inline, no helper function — explicit for auditability)
-- =============================================================================

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
