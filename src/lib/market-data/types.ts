import type { AssetType } from "@/lib/supabase/types";

/**
 * Unified snapshot passed to Claude. Shape is provider-agnostic so the same
 * Claude prompt works for US stocks, EU stocks, and crypto.
 */
export interface MarketSnapshot {
  ticker: string;
  name: string;
  asset_type: AssetType;
  /** Most recent price in the instrument's native currency. */
  price: number;
  /** Fractional daily change (e.g., 0.0123 = +1.23%). */
  change_pct: number | null;
  volume: number | null;
  rsi: number | null;
  sma_20: number | null;
  sma_50: number | null;
  /** When the underlying data was fetched (ISO string). */
  fetched_at: string;
  /** Provider name for debugging. */
  source: "alpha_vantage" | "coingecko";
}

export class MarketDataError extends Error {
  constructor(
    message: string,
    public readonly ticker: string,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = "MarketDataError";
  }
}
