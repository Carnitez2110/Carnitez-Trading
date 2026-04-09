import { MarketDataError, type MarketSnapshot } from "./types";
import { rsi, sma } from "./indicators";
import type { WatchlistTicker } from "@/lib/data/watchlist";

const BASE_URL = "https://api.coingecko.com/api/v3";

/**
 * Fetch current price + 60 days of daily closes for a crypto asset.
 * Uses two CoinGecko endpoints (both free, no key):
 *  - /simple/price for current price and 24h change
 *  - /coins/{id}/market_chart for historical closes (for RSI/SMA)
 */
export async function fetchCryptoSnapshot(
  t: WatchlistTicker
): Promise<MarketSnapshot> {
  if (!t.coingecko_id) {
    throw new MarketDataError("Missing coingecko_id on ticker config", t.ticker);
  }

  // 1. Current price + 24h change in EUR.
  const priceUrl = `${BASE_URL}/simple/price?ids=${encodeURIComponent(
    t.coingecko_id
  )}&vs_currencies=eur&include_24hr_change=true&include_24hr_vol=true`;

  const priceRes = await fetch(priceUrl, { cache: "no-store" });
  if (!priceRes.ok) {
    throw new MarketDataError(
      `CoinGecko price HTTP ${priceRes.status}`,
      t.ticker
    );
  }
  const priceData = (await priceRes.json()) as Record<
    string,
    { eur?: number; eur_24h_change?: number; eur_24h_vol?: number }
  >;
  const priceEntry = priceData[t.coingecko_id];
  if (!priceEntry || typeof priceEntry.eur !== "number") {
    throw new MarketDataError("Empty CoinGecko price response", t.ticker);
  }

  // 2. 60 days of daily closes (for RSI + SMA).
  const historyUrl = `${BASE_URL}/coins/${encodeURIComponent(
    t.coingecko_id
  )}/market_chart?vs_currency=eur&days=60&interval=daily`;

  const histRes = await fetch(historyUrl, { cache: "no-store" });
  if (!histRes.ok) {
    throw new MarketDataError(
      `CoinGecko market_chart HTTP ${histRes.status}`,
      t.ticker
    );
  }
  const histData = (await histRes.json()) as {
    prices?: Array<[number, number]>;
  };
  const prices = histData.prices ?? [];

  // CoinGecko returns oldest-first; we want newest-first.
  const closes = prices.map(([, close]) => close).reverse();

  return {
    ticker: t.ticker,
    name: t.name,
    asset_type: t.asset_type,
    price: priceEntry.eur,
    change_pct:
      typeof priceEntry.eur_24h_change === "number"
        ? priceEntry.eur_24h_change / 100
        : null,
    volume:
      typeof priceEntry.eur_24h_vol === "number"
        ? priceEntry.eur_24h_vol
        : null,
    rsi: rsi(closes, 14),
    sma_20: sma(closes, 20),
    sma_50: sma(closes, 50),
    fetched_at: new Date().toISOString(),
    source: "coingecko",
  };
}
