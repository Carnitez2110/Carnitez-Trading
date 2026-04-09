/**
 * Technical indicator calculations. All functions take a reverse-chronological
 * array of closing prices (newest first — as delivered by Alpha Vantage and
 * CoinGecko).
 */

/** Simple moving average over the last N closes. Returns null if not enough data. */
export function sma(closes: number[], period: number): number | null {
  if (closes.length < period) return null;
  const slice = closes.slice(0, period);
  const sum = slice.reduce((a, b) => a + b, 0);
  return sum / period;
}

/**
 * 14-period Relative Strength Index using Wilder's smoothing.
 * Closes array is newest-first, so we flip it before computing.
 * Returns null if fewer than `period + 1` closes are available.
 */
export function rsi(closes: number[], period = 14): number | null {
  if (closes.length < period + 1) return null;

  // Reverse to chronological (oldest first) for calculation clarity.
  const chronological = [...closes].reverse();

  let gains = 0;
  let losses = 0;

  // Initial average gain/loss over first `period` price changes.
  for (let i = 1; i <= period; i++) {
    const diff = chronological[i] - chronological[i - 1];
    if (diff >= 0) gains += diff;
    else losses -= diff;
  }
  let avgGain = gains / period;
  let avgLoss = losses / period;

  // Wilder's smoothing for the remaining bars.
  for (let i = period + 1; i < chronological.length; i++) {
    const diff = chronological[i] - chronological[i - 1];
    const gain = diff >= 0 ? diff : 0;
    const loss = diff < 0 ? -diff : 0;
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
  }

  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
}

/** Percent change between the two most recent closes, as a decimal (0.0123 = +1.23%). */
export function dailyChange(closes: number[]): number | null {
  if (closes.length < 2) return null;
  const [today, yesterday] = closes;
  return (today - yesterday) / yesterday;
}
