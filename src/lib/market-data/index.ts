import "server-only";
import { fetchStockSnapshot } from "./alpha-vantage";
import { fetchCryptoSnapshot } from "./coingecko";
import { readCached, writeCached } from "./cache";
import { findTicker } from "@/lib/data/watchlist";
import { MarketDataError, type MarketSnapshot } from "./types";

export { MarketDataError };
export type { MarketSnapshot };

/**
 * Unified snapshot entry point. Returns a cached value if one exists and is
 * fresh (<5 min old); otherwise hits the provider, writes through to the
 * cache, and returns the fresh value.
 */
export async function getMarketSnapshot(
  ticker: string
): Promise<MarketSnapshot> {
  const config = findTicker(ticker);
  if (!config) {
    throw new MarketDataError("Ticker not in watchlist", ticker);
  }

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
 * Fetch the current price only (uses the same cache). Exists as a separate
 * entry point so close-position doesn't need to re-run indicators.
 */
export async function getCurrentPrice(ticker: string): Promise<number> {
  const snapshot = await getMarketSnapshot(ticker);
  return snapshot.price;
}
