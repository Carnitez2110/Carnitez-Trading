import "server-only";
import { fetchStockSnapshot } from "./alpha-vantage";
import { fetchCryptoSnapshot } from "./coingecko";
import { readCached, writeCached } from "./cache";
import { findTicker, type WatchlistTicker } from "@/lib/data/watchlist";
import { MarketDataError, type MarketSnapshot } from "./types";

export { MarketDataError };
export type { MarketSnapshot };

/**
 * Fetch (or retrieve from cache) a full market snapshot for a known config.
 * Cheaper internal entry point used by both the watchlist flow and the
 * market scanner — callers who already have a WatchlistTicker-shaped object
 * skip the findTicker lookup.
 */
export async function getMarketSnapshotForConfig(
  config: WatchlistTicker
): Promise<MarketSnapshot> {
  const cached = await readCached(config);
  if (cached) return cached;

  const snapshot =
    config.asset_type === "crypto"
      ? await fetchCryptoSnapshot(config)
      : await fetchStockSnapshot(config);

  await writeCached(snapshot);
  return snapshot;
}

/**
 * Unified snapshot entry point by ticker symbol. Looks up the ticker in the
 * hardcoded watchlist and delegates to getMarketSnapshotForConfig.
 * Used by the per-ticker "AI Signal" flow where the symbol is all we have.
 */
export async function getMarketSnapshot(
  ticker: string
): Promise<MarketSnapshot> {
  const config = findTicker(ticker);
  if (!config) {
    throw new MarketDataError("Ticker not in watchlist", ticker);
  }
  return getMarketSnapshotForConfig(config);
}

/**
 * Fetch the current price only (uses the same cache). Exists as a separate
 * entry point so close-position doesn't need to re-run indicators.
 */
export async function getCurrentPrice(ticker: string): Promise<number> {
  const snapshot = await getMarketSnapshot(ticker);
  return snapshot.price;
}
