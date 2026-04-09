import "server-only";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import type { MarketSnapshot } from "./types";
import type { WatchlistTicker } from "@/lib/data/watchlist";

/** TTL for market_data_cache rows. 5 minutes balances freshness vs. rate limits. */
const CACHE_TTL_MS = 5 * 60 * 1000;

/**
 * Service-role Supabase client. Bypasses RLS — only used on the server for
 * cache reads/writes on the shared market_data_cache table.
 */
function serviceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set for market-data cache"
    );
  }
  return createServiceClient<Database>(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function readCached(
  t: WatchlistTicker
): Promise<MarketSnapshot | null> {
  const supabase = serviceClient();
  const { data, error } = await supabase
    .from("market_data_cache")
    .select("*")
    .eq("ticker", t.ticker)
    .eq("asset_type", t.asset_type)
    .maybeSingle();

  if (error || !data) return null;

  const age = Date.now() - new Date(data.updated_at).getTime();
  if (age > CACHE_TTL_MS) return null;

  return {
    ticker: data.ticker,
    name: t.name,
    asset_type: data.asset_type,
    price: Number(data.price),
    change_pct: data.change_pct != null ? Number(data.change_pct) : null,
    volume: data.volume != null ? Number(data.volume) : null,
    rsi: data.rsi != null ? Number(data.rsi) : null,
    sma_20: data.sma_20 != null ? Number(data.sma_20) : null,
    sma_50: data.sma_50 != null ? Number(data.sma_50) : null,
    fetched_at: data.updated_at,
    source: t.asset_type === "crypto" ? "coingecko" : "alpha_vantage",
  };
}

export async function writeCached(snapshot: MarketSnapshot): Promise<void> {
  const supabase = serviceClient();
  await supabase.from("market_data_cache").upsert(
    {
      ticker: snapshot.ticker,
      asset_type: snapshot.asset_type,
      price: snapshot.price,
      change_pct: snapshot.change_pct,
      volume: snapshot.volume,
      rsi: snapshot.rsi,
      sma_20: snapshot.sma_20,
      sma_50: snapshot.sma_50,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "ticker,asset_type" }
  );
}
