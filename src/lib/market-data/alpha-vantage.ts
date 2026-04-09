import { MarketDataError, type MarketSnapshot } from "./types";
import { dailyChange, rsi, sma } from "./indicators";
import type { WatchlistTicker } from "@/lib/data/watchlist";

const BASE_URL = "https://www.alphavantage.co/query";

interface DailyTimeSeriesResponse {
  "Meta Data"?: Record<string, string>;
  "Time Series (Daily)"?: Record<
    string,
    {
      "1. open": string;
      "2. high": string;
      "3. low": string;
      "4. close": string;
      "5. volume": string;
    }
  >;
  Note?: string;
  Information?: string;
  "Error Message"?: string;
}

/**
 * Fetch ~100 days of daily OHLCV for a stock ticker and compute the snapshot.
 * Uses a single Alpha Vantage call (TIME_SERIES_DAILY), which burns 1/25 of
 * the daily free tier.
 */
export async function fetchStockSnapshot(
  t: WatchlistTicker
): Promise<MarketSnapshot> {
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
  if (!apiKey) {
    throw new MarketDataError(
      "ALPHA_VANTAGE_API_KEY missing in environment",
      t.ticker
    );
  }

  const url = `${BASE_URL}?function=TIME_SERIES_DAILY&symbol=${encodeURIComponent(
    t.ticker
  )}&outputsize=compact&apikey=${apiKey}`;

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new MarketDataError(
      `Alpha Vantage HTTP ${res.status}`,
      t.ticker
    );
  }

  const data = (await res.json()) as DailyTimeSeriesResponse;

  if (data["Error Message"]) {
    throw new MarketDataError(data["Error Message"], t.ticker);
  }
  if (data.Note) {
    // Note fires when we've hit the rate limit (5/min or 25/day).
    throw new MarketDataError(`Alpha Vantage rate limit: ${data.Note}`, t.ticker);
  }
  if (data.Information) {
    throw new MarketDataError(
      `Alpha Vantage info block: ${data.Information}`,
      t.ticker
    );
  }

  const series = data["Time Series (Daily)"];
  if (!series || Object.keys(series).length === 0) {
    throw new MarketDataError(
      "Empty time series — ticker may be invalid",
      t.ticker
    );
  }

  // Sort descending by date (newest first).
  const entries = Object.entries(series).sort((a, b) =>
    b[0].localeCompare(a[0])
  );
  const closes = entries.map(([, bar]) => Number.parseFloat(bar["4. close"]));
  const volume = Number.parseFloat(entries[0][1]["5. volume"]);

  return {
    ticker: t.ticker,
    name: t.name,
    asset_type: t.asset_type,
    price: closes[0],
    change_pct: dailyChange(closes),
    volume: Number.isFinite(volume) ? volume : null,
    rsi: rsi(closes, 14),
    sma_20: sma(closes, 20),
    sma_50: sma(closes, 50),
    fetched_at: new Date().toISOString(),
    source: "alpha_vantage",
  };
}
