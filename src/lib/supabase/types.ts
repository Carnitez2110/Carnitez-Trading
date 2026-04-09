// Hand-authored TypeScript types matching supabase/migrations/0001_init.sql.
// Replace with `npx supabase gen types typescript --linked` output once the
// CLI is linked (requires DB password, currently deferred).

export type AssetType = "stock" | "etf" | "crypto";
export type TradeAction = "buy" | "sell";
export type SignalAction = "buy" | "sell" | "hold";
export type Sentiment = "bullish" | "bearish" | "neutral";
export type SignalStatus = "pending" | "approved" | "skipped" | "expired";
export type TradeStatus = "open" | "closed";
export type ExecutionMode = "paper" | "live";
export type RiskLevel = "low" | "medium" | "high";
export type LearningCategory = "success" | "failure" | "pattern";

export interface UserSettings {
  user_id: string;
  max_position_pct: number;
  daily_loss_cap_pct: number;
  stop_loss_pct: number;
  take_profit_pct: number;
  max_concurrent_positions: number;
  execution_mode: ExecutionMode;
  markets_us: boolean;
  markets_eu: boolean;
  markets_crypto: boolean;
  notify_trades: boolean;
  notify_risk: boolean;
  notify_weekly: boolean;
  created_at: string;
  updated_at: string;
}

export interface PaperAccount {
  user_id: string;
  balance_eur: number;
  initial_balance_eur: number;
  created_at: string;
}

export interface AiSignal {
  id: string;
  user_id: string;
  ticker: string;
  name: string;
  asset_type: AssetType;
  action: SignalAction;
  sentiment: Sentiment;
  confidence_pct: number;
  reasoning_text: string;
  risk_level: RiskLevel;
  suggested_entry: number | null;
  suggested_stop_loss: number | null;
  suggested_take_profit: number | null;
  status: SignalStatus;
  created_at: string;
  acted_at: string | null;
}

export interface TradeHistory {
  id: string;
  user_id: string;
  signal_id: string | null;
  ticker: string;
  name: string;
  asset_type: AssetType;
  action: TradeAction;
  quantity: number;
  price: number;
  stop_loss_price: number | null;
  take_profit_price: number | null;
  status: TradeStatus;
  pnl_eur: number | null;
  pnl_pct: number | null;
  opened_at: string;
  closed_at: string | null;
  execution_mode: ExecutionMode;
}

export interface PortfolioHolding {
  id: string;
  user_id: string;
  ticker: string;
  name: string;
  asset_type: AssetType;
  quantity: number;
  avg_entry_price: number;
  current_price: number | null;
  updated_at: string;
}

export interface WatchlistEntry {
  id: string;
  user_id: string;
  ticker: string;
  name: string;
  asset_type: AssetType;
  added_at: string;
}

export interface KnowledgeVaultEntry {
  id: string;
  user_id: string;
  concept_name: string;
  definition: string;
  first_encountered_signal_id: string | null;
  unlocked_at: string;
}

export interface MarketDataCacheRow {
  ticker: string;
  asset_type: AssetType;
  price: number;
  change_pct: number | null;
  volume: number | null;
  rsi: number | null;
  sma_20: number | null;
  sma_50: number | null;
  updated_at: string;
}

export interface LearningEntry {
  id: string;
  user_id: string;
  trade_id: string | null;
  lesson_text: string;
  category: LearningCategory;
  created_at: string;
}

// Minimal Database type shape expected by @supabase/ssr generics.
// We type-cast query results ourselves where needed rather than fully
// spelling out the Database shape. This is a known tradeoff of
// hand-authored types; once the CLI is linked we'll replace this file.
export type Database = {
  public: {
    Tables: {
      user_settings: { Row: UserSettings; Insert: Partial<UserSettings>; Update: Partial<UserSettings> };
      paper_account: { Row: PaperAccount; Insert: Partial<PaperAccount>; Update: Partial<PaperAccount> };
      ai_signals: { Row: AiSignal; Insert: Partial<AiSignal>; Update: Partial<AiSignal> };
      trade_history: { Row: TradeHistory; Insert: Partial<TradeHistory>; Update: Partial<TradeHistory> };
      portfolio_holdings: { Row: PortfolioHolding; Insert: Partial<PortfolioHolding>; Update: Partial<PortfolioHolding> };
      watchlist: { Row: WatchlistEntry; Insert: Partial<WatchlistEntry>; Update: Partial<WatchlistEntry> };
      knowledge_vault: { Row: KnowledgeVaultEntry; Insert: Partial<KnowledgeVaultEntry>; Update: Partial<KnowledgeVaultEntry> };
      market_data_cache: { Row: MarketDataCacheRow; Insert: Partial<MarketDataCacheRow>; Update: Partial<MarketDataCacheRow> };
      learnings: { Row: LearningEntry; Insert: Partial<LearningEntry>; Update: Partial<LearningEntry> };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      asset_type: AssetType;
      trade_action: TradeAction;
      signal_action: SignalAction;
      sentiment: Sentiment;
      signal_status: SignalStatus;
      trade_status: TradeStatus;
      execution_mode: ExecutionMode;
      risk_level: RiskLevel;
      learning_category: LearningCategory;
    };
    CompositeTypes: Record<string, never>;
  };
};
