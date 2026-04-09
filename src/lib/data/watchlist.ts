import type { AssetType } from "@/lib/supabase/types";

export interface WatchlistTicker {
  ticker: string;
  name: string;
  asset_type: AssetType;
  /** Region tag used for UI grouping and data-source routing. */
  region: "us" | "eu" | "crypto";
  /** CoinGecko id for crypto. Ignored for stocks. */
  coingecko_id?: string;
}

/**
 * Hardcoded Day-1 watchlist. Covers US mega-caps, a few EU heavyweights,
 * and the two largest crypto assets. Expand via the settings page later.
 */
export const WATCHLIST: WatchlistTicker[] = [
  // US stocks
  { ticker: "AAPL",  name: "Apple Inc.",               asset_type: "stock", region: "us" },
  { ticker: "MSFT",  name: "Microsoft Corporation",    asset_type: "stock", region: "us" },
  { ticker: "NVDA",  name: "NVIDIA Corporation",       asset_type: "stock", region: "us" },
  { ticker: "GOOGL", name: "Alphabet Inc. (Class A)",  asset_type: "stock", region: "us" },
  { ticker: "AMZN",  name: "Amazon.com, Inc.",         asset_type: "stock", region: "us" },
  { ticker: "TSLA",  name: "Tesla, Inc.",              asset_type: "stock", region: "us" },
  { ticker: "META",  name: "Meta Platforms, Inc.",     asset_type: "stock", region: "us" },

  // EU stocks (Alpha Vantage uses .AMS / .DE / .PAR suffixes)
  { ticker: "ASML.AMS", name: "ASML Holding N.V.",     asset_type: "stock", region: "eu" },
  { ticker: "SAP.DE",   name: "SAP SE",                asset_type: "stock", region: "eu" },
  { ticker: "MC.PAR",   name: "LVMH Moët Hennessy",    asset_type: "stock", region: "eu" },

  // Crypto (via CoinGecko)
  { ticker: "BTC", name: "Bitcoin",  asset_type: "crypto", region: "crypto", coingecko_id: "bitcoin" },
  { ticker: "ETH", name: "Ethereum", asset_type: "crypto", region: "crypto", coingecko_id: "ethereum" },
];

export function findTicker(ticker: string): WatchlistTicker | undefined {
  return WATCHLIST.find((t) => t.ticker === ticker);
}
