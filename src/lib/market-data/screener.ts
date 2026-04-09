import "server-only";
import { MarketDataError } from "./types";
import type { WatchlistTicker } from "@/lib/data/watchlist";

/**
 * A screening candidate — a ticker with enough shallow data to rank it.
 * Extends WatchlistTicker so it can be passed directly to
 * getMarketSnapshotForConfig for deep-dive fetching.
 */
export interface ScreenCandidate extends WatchlistTicker {
  /** Current price at screening time (native currency). */
  screenPrice: number;
  /** Daily change as decimal (0.0523 = +5.23%). */
  screenChangePct: number;
  /** Volume in base units (shares or coins). */
  screenVolume: number | null;
}

/** Scored candidate after running through the composite scorer. */
export interface ScoredCandidate extends ScreenCandidate {
  score: number;
}

// =============================================================================
// Alpha Vantage — TOP_GAINERS_LOSERS (1 API call returns 60 US stocks)
// =============================================================================

interface AvMoverRow {
  ticker: string;
  price: string;
  change_amount: string;
  change_percentage: string;
  volume: string;
}

interface AvTopMoversResponse {
  metadata?: string;
  last_updated?: string;
  top_gainers?: AvMoverRow[];
  top_losers?: AvMoverRow[];
  most_actively_traded?: AvMoverRow[];
  Information?: string;
  Note?: string;
  "Error Message"?: string;
}

/**
 * Fetch US market movers from Alpha Vantage's free TOP_GAINERS_LOSERS endpoint.
 * Returns up to ~60 US tickers (gainers + losers + most active, deduped) in a
 * single API call. Burns 1/25 of the daily free quota.
 */
export async function fetchUsMovers(): Promise<ScreenCandidate[]> {
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
  if (!apiKey) {
    throw new MarketDataError(
      "ALPHA_VANTAGE_API_KEY missing in environment",
      "TOP_GAINERS_LOSERS"
    );
  }

  const url = `https://www.alphavantage.co/query?function=TOP_GAINERS_LOSERS&apikey=${apiKey}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new MarketDataError(
      `Alpha Vantage HTTP ${res.status}`,
      "TOP_GAINERS_LOSERS"
    );
  }

  const data = (await res.json()) as AvTopMoversResponse;
  if (data["Error Message"]) {
    throw new MarketDataError(data["Error Message"], "TOP_GAINERS_LOSERS");
  }
  if (data.Note) {
    throw new MarketDataError(
      `Alpha Vantage rate limit: ${data.Note}`,
      "TOP_GAINERS_LOSERS"
    );
  }
  if (data.Information) {
    throw new MarketDataError(
      `Alpha Vantage info: ${data.Information}`,
      "TOP_GAINERS_LOSERS"
    );
  }

  const gainers = data.top_gainers ?? [];
  const losers = data.top_losers ?? [];
  const active = data.most_actively_traded ?? [];

  // Dedupe by ticker, preferring gainers > active > losers in conflicts.
  const seen = new Set<string>();
  const out: ScreenCandidate[] = [];
  for (const row of [...gainers, ...active, ...losers]) {
    if (seen.has(row.ticker)) continue;
    seen.add(row.ticker);

    const price = Number(row.price);
    const changePct = Number(row.change_percentage.replace("%", "")) / 100;
    const volume = Number(row.volume);
    if (!Number.isFinite(price) || !Number.isFinite(changePct)) continue;

    // Filter out penny stocks and illiquid names — bad for a beginner.
    if (price < 5) continue;
    if (Number.isFinite(volume) && volume < 200_000) continue;

    out.push({
      ticker: row.ticker,
      name: row.ticker, // AV doesn't return company name here; use ticker placeholder
      asset_type: "stock",
      region: "us",
      screenPrice: price,
      screenChangePct: changePct,
      screenVolume: Number.isFinite(volume) ? volume : null,
    });
  }
  return out;
}

// =============================================================================
// CoinGecko — top crypto by volume (free, no key needed)
// =============================================================================

interface CgMarketRow {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number | null;
  total_volume: number;
}

/**
 * Fetch the top 20 crypto assets by 24h trading volume from CoinGecko.
 * No API key required. Returns candidates in EUR.
 */
export async function fetchTopCrypto(): Promise<ScreenCandidate[]> {
  const url =
    "https://api.coingecko.com/api/v3/coins/markets?vs_currency=eur&order=volume_desc&per_page=20&page=1&sparkline=false";
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new MarketDataError(
      `CoinGecko HTTP ${res.status}`,
      "coins/markets"
    );
  }

  const rows = (await res.json()) as CgMarketRow[];
  return rows
    .filter((r) => typeof r.current_price === "number")
    .map((r) => ({
      ticker: r.symbol.toUpperCase(),
      name: r.name,
      asset_type: "crypto" as const,
      region: "crypto" as const,
      coingecko_id: r.id,
      screenPrice: r.current_price,
      screenChangePct: (r.price_change_percentage_24h ?? 0) / 100,
      screenVolume: r.total_volume ?? null,
    }));
}

// =============================================================================
// Scoring
// =============================================================================

/**
 * Composite score for ranking screener candidates. Range is roughly -30 to +40.
 * Higher = stronger BUY candidate for a beginner.
 *
 * Weights:
 *  - Momentum (capped ±20): raw daily change %, capped to avoid rewarding
 *    news-driven pumps/dumps that are typically mean-reverting.
 *  - Sweet spot bonus (+10): healthy upward move (+2% to +8%) without mania.
 *    This is the zone where beginners should learn — clear trends, low drama.
 *  - High-volume bonus (+5): liquidity makes fills reliable and reduces slippage.
 *  - Downside penalty (-10): big daily losses tempt bottom-fishing but usually
 *    signal more pain ahead. Explicitly discourage them.
 */
export function scoreCandidate(c: ScreenCandidate): number {
  const momentumPct = c.screenChangePct * 100; // decimal → percent
  const cappedMomentum = Math.max(-20, Math.min(20, momentumPct));

  const sweetSpotBonus = momentumPct >= 2 && momentumPct <= 8 ? 10 : 0;
  const downsidePenalty = momentumPct < -3 ? -10 : 0;

  const volumeBonus =
    c.screenVolume != null && c.screenVolume > 1_000_000 ? 5 : 0;

  return cappedMomentum + sweetSpotBonus + downsidePenalty + volumeBonus;
}

// =============================================================================
// Full screen pipeline: fetch all providers, dedupe, rank, take top N
// =============================================================================

/**
 * Run the full screener and return the top N ranked candidates across all
 * providers. Partial failures (e.g., Alpha Vantage rate limit) are tolerated
 * as long as at least one provider returns data.
 */
export async function screenTopCandidates(
  limit = 10
): Promise<ScoredCandidate[]> {
  const [usResult, cryptoResult] = await Promise.allSettled([
    fetchUsMovers(),
    fetchTopCrypto(),
  ]);

  const all: ScreenCandidate[] = [];
  if (usResult.status === "fulfilled") all.push(...usResult.value);
  else console.error("[screener] US movers failed:", usResult.reason);

  if (cryptoResult.status === "fulfilled") all.push(...cryptoResult.value);
  else console.error("[screener] Crypto failed:", cryptoResult.reason);

  if (all.length === 0) {
    throw new MarketDataError(
      "All screener providers failed",
      "screenTopCandidates"
    );
  }

  const ranked: ScoredCandidate[] = all
    .map((c) => ({ ...c, score: scoreCandidate(c) }))
    .sort((a, b) => b.score - a.score);

  return ranked.slice(0, limit);
}
