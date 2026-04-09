"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getMarketSnapshot, getCurrentPrice } from "@/lib/market-data";
import { findTicker } from "@/lib/data/watchlist";
import { generateSignal, SignalGenerationError } from "@/lib/ai/claude";
import type {
  AiSignal,
  PaperAccount,
  PortfolioHolding,
  TradeHistory,
  UserSettings,
} from "@/lib/supabase/types";

/** Result envelope returned to client-side `<form action>` consumers. */
export interface ActionResult {
  ok: boolean;
  message?: string;
}

// =============================================================================
// requestSignal — fetches market data, asks Claude, inserts an ai_signals row
// =============================================================================

export async function requestSignal(formData: FormData): Promise<void> {
  const ticker = String(formData.get("ticker") ?? "").trim();
  if (!ticker) {
    throw new Error("Missing ticker");
  }

  const config = findTicker(ticker);
  if (!config) {
    throw new Error(`Ticker ${ticker} is not in the watchlist`);
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Not authenticated");
  }

  let snapshot;
  try {
    snapshot = await getMarketSnapshot(ticker);
  } catch (err) {
    throw new Error(
      `Failed to fetch market data for ${ticker}: ${(err as Error).message}`
    );
  }

  let signal;
  try {
    signal = await generateSignal(snapshot);
  } catch (err) {
    if (err instanceof SignalGenerationError) {
      throw new Error(`AI signal generation failed: ${err.message}`);
    }
    throw err;
  }

  const { error: insertError } = await supabase.from("ai_signals").insert({
    user_id: user.id,
    ticker: config.ticker,
    name: config.name,
    asset_type: config.asset_type,
    action: signal.action,
    sentiment: signal.sentiment,
    confidence_pct: signal.confidence,
    reasoning_text: signal.reasoning,
    risk_level: signal.risk_level,
    suggested_entry: signal.suggested_entry,
    suggested_stop_loss: signal.suggested_stop_loss,
    suggested_take_profit: signal.suggested_take_profit,
    status: "pending",
  });

  if (insertError) {
    throw new Error(`Failed to save signal: ${insertError.message}`);
  }

  revalidatePath("/");
}

// =============================================================================
// approveSignal — executes a paper trade after passing risk checks
// =============================================================================

export async function approveSignal(formData: FormData): Promise<void> {
  const signalId = String(formData.get("signal_id") ?? "").trim();
  if (!signalId) throw new Error("Missing signal_id");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // 1. Load the signal
  const { data: signal, error: signalErr } = await supabase
    .from("ai_signals")
    .select("*")
    .eq("id", signalId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (signalErr || !signal) {
    throw new Error("Signal not found or already acted on");
  }
  if (signal.status !== "pending") {
    throw new Error(`Signal is already ${signal.status}`);
  }
  if (signal.action === "hold") {
    throw new Error("Cannot approve a HOLD signal — nothing to execute");
  }
  if (signal.action === "sell") {
    throw new Error(
      "SELL signals open short positions — not supported in MVP. Use Close Position on an existing holding instead."
    );
  }

  // 2. Load user settings + paper account
  const [{ data: settings }, { data: paper }] = await Promise.all([
    supabase
      .from("user_settings")
      .select("*")
      .eq("user_id", user.id)
      .single(),
    supabase
      .from("paper_account")
      .select("*")
      .eq("user_id", user.id)
      .single(),
  ]);

  if (!settings || !paper) {
    throw new Error("Missing user_settings or paper_account row");
  }
  const s = settings as UserSettings;
  const p = paper as PaperAccount;

  // 3. Determine entry price
  const entry =
    signal.suggested_entry != null
      ? Number(signal.suggested_entry)
      : await getCurrentPrice(signal.ticker);
  if (!Number.isFinite(entry) || entry <= 0) {
    throw new Error("Invalid entry price");
  }

  // 4. Position sizing — max_position_pct of current balance
  const maxEuro = (Number(p.balance_eur) * Number(s.max_position_pct)) / 100;
  // Crypto can be fractional; stocks should be whole units.
  const quantity =
    signal.asset_type === "crypto"
      ? Number((maxEuro / entry).toFixed(6))
      : Math.floor(maxEuro / entry);

  if (quantity <= 0) {
    throw new Error(
      `Position size too small: max €${maxEuro.toFixed(
        2
      )} / entry €${entry.toFixed(2)} = ${quantity} units. Increase max_position_pct or wait for a lower-priced instrument.`
    );
  }

  const cost = quantity * entry;
  if (cost > Number(p.balance_eur)) {
    throw new Error(
      `Insufficient balance: need €${cost.toFixed(
        2
      )}, have €${Number(p.balance_eur).toFixed(2)}`
    );
  }

  // 5. Derive stop-loss / take-profit from signal or fall back to settings
  const stopLoss =
    signal.suggested_stop_loss != null
      ? Number(signal.suggested_stop_loss)
      : entry * (1 - Number(s.stop_loss_pct) / 100);
  const takeProfit =
    signal.suggested_take_profit != null
      ? Number(signal.suggested_take_profit)
      : entry * (1 + Number(s.take_profit_pct) / 100);

  // 6. Insert trade_history
  const { data: trade, error: tradeErr } = await supabase
    .from("trade_history")
    .insert({
      user_id: user.id,
      signal_id: signal.id,
      ticker: signal.ticker,
      name: signal.name,
      asset_type: signal.asset_type,
      action: "buy",
      quantity,
      price: entry,
      stop_loss_price: stopLoss,
      take_profit_price: takeProfit,
      status: "open",
      execution_mode: "paper",
    })
    .select()
    .single();

  if (tradeErr || !trade) {
    throw new Error(`Failed to record trade: ${tradeErr?.message}`);
  }

  // 7. Upsert portfolio_holdings
  //    If a holding exists, blend the avg_entry_price. If not, create one.
  const { data: existing } = await supabase
    .from("portfolio_holdings")
    .select("*")
    .eq("user_id", user.id)
    .eq("ticker", signal.ticker)
    .eq("asset_type", signal.asset_type)
    .maybeSingle();

  if (existing) {
    const prev = existing as PortfolioHolding;
    const newQty = Number(prev.quantity) + quantity;
    const newAvg =
      (Number(prev.quantity) * Number(prev.avg_entry_price) + cost) / newQty;
    await supabase
      .from("portfolio_holdings")
      .update({
        quantity: newQty,
        avg_entry_price: newAvg,
        current_price: entry,
      })
      .eq("id", prev.id);
  } else {
    await supabase.from("portfolio_holdings").insert({
      user_id: user.id,
      ticker: signal.ticker,
      name: signal.name,
      asset_type: signal.asset_type,
      quantity,
      avg_entry_price: entry,
      current_price: entry,
    });
  }

  // 8. Deduct from paper_account balance
  await supabase
    .from("paper_account")
    .update({ balance_eur: Number(p.balance_eur) - cost })
    .eq("user_id", user.id);

  // 9. Mark signal as approved
  await supabase
    .from("ai_signals")
    .update({ status: "approved", acted_at: new Date().toISOString() })
    .eq("id", signal.id);

  revalidatePath("/");
}

// =============================================================================
// skipSignal — marks a pending signal as skipped
// =============================================================================

export async function skipSignal(formData: FormData): Promise<void> {
  const signalId = String(formData.get("signal_id") ?? "").trim();
  if (!signalId) throw new Error("Missing signal_id");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  await supabase
    .from("ai_signals")
    .update({ status: "skipped", acted_at: new Date().toISOString() })
    .eq("id", signalId)
    .eq("user_id", user.id)
    .eq("status", "pending");

  revalidatePath("/");
}

// =============================================================================
// closePosition — sells a paper holding at current market price
// =============================================================================

export async function closePosition(formData: FormData): Promise<void> {
  const holdingId = String(formData.get("holding_id") ?? "").trim();
  if (!holdingId) throw new Error("Missing holding_id");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // 1. Load the holding
  const { data: holding, error: holdingErr } = await supabase
    .from("portfolio_holdings")
    .select("*")
    .eq("id", holdingId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (holdingErr || !holding) {
    throw new Error("Holding not found");
  }
  const h = holding as PortfolioHolding;

  if (Number(h.quantity) <= 0) {
    throw new Error("Holding quantity is zero");
  }

  // 2. Fetch current price
  const currentPrice = await getCurrentPrice(h.ticker);
  const proceeds = Number(h.quantity) * currentPrice;
  const costBasis = Number(h.quantity) * Number(h.avg_entry_price);
  const pnlEur = proceeds - costBasis;
  const pnlPct = (pnlEur / costBasis) * 100;

  // 3. Find the most recent open trade for this ticker, close it
  const { data: openTrades } = await supabase
    .from("trade_history")
    .select("*")
    .eq("user_id", user.id)
    .eq("ticker", h.ticker)
    .eq("asset_type", h.asset_type)
    .eq("status", "open")
    .order("opened_at", { ascending: false })
    .limit(1);

  if (openTrades && openTrades.length > 0) {
    const trade = openTrades[0] as TradeHistory;
    await supabase
      .from("trade_history")
      .update({
        status: "closed",
        pnl_eur: pnlEur,
        pnl_pct: pnlPct,
        closed_at: new Date().toISOString(),
      })
      .eq("id", trade.id);
  }

  // 4. Delete the holding row (MVP: full closeout, no partial sells)
  await supabase.from("portfolio_holdings").delete().eq("id", h.id);

  // 5. Credit the paper account
  const { data: paper } = await supabase
    .from("paper_account")
    .select("balance_eur")
    .eq("user_id", user.id)
    .single();
  if (paper) {
    await supabase
      .from("paper_account")
      .update({
        balance_eur: Number((paper as PaperAccount).balance_eur) + proceeds,
      })
      .eq("user_id", user.id);
  }

  revalidatePath("/");
}

// Re-export the signal type for components that want to render it.
export type { AiSignal };
