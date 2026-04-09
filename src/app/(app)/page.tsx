import { createClient } from "@/lib/supabase/server";
import {
  requestSignal,
  approveSignal,
  skipSignal,
  closePosition,
} from "@/lib/trading/actions";
import { WATCHLIST, type WatchlistTicker } from "@/lib/data/watchlist";
import type {
  AiSignal,
  PaperAccount,
  PortfolioHolding,
} from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="p-8 text-on-surface-variant">
        Not signed in — <a href="/login" className="text-primary underline">sign in</a>.
      </div>
    );
  }

  const [
    { data: paperRow },
    { data: holdingsRows },
    { data: pendingSignalsRows },
  ] = await Promise.all([
    supabase
      .from("paper_account")
      .select("*")
      .eq("user_id", user.id)
      .single(),
    supabase
      .from("portfolio_holdings")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false }),
    supabase
      .from("ai_signals")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "pending")
      .order("created_at", { ascending: false }),
  ]);

  const paper = paperRow as PaperAccount | null;
  const holdings = (holdingsRows ?? []) as PortfolioHolding[];
  const pendingSignals = (pendingSignalsRows ?? []) as AiSignal[];

  const cashBalance = paper ? Number(paper.balance_eur) : 0;
  const holdingsValue = holdings.reduce(
    (sum, h) => sum + Number(h.quantity) * Number(h.current_price ?? h.avg_entry_price),
    0
  );
  const totalEquity = cashBalance + holdingsValue;
  const initialBalance = paper ? Number(paper.initial_balance_eur) : 10000;
  const totalReturnPct = ((totalEquity - initialBalance) / initialBalance) * 100;

  return (
    <div>
      <header className="mb-8">
        <h1 className="font-headline text-4xl font-extrabold tracking-tight text-on-surface mb-2">
          Dashboard
        </h1>
        <p className="text-on-surface-variant">
          Your AI-powered paper trading desk.
        </p>
      </header>

      {/* Portfolio summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatCard
          label="Total Equity"
          value={formatEur(totalEquity)}
          sub={`${totalReturnPct >= 0 ? "+" : ""}${totalReturnPct.toFixed(2)}% all-time`}
          accent={totalReturnPct >= 0 ? "positive" : "negative"}
        />
        <StatCard label="Cash" value={formatEur(cashBalance)} sub="Buying power" />
        <StatCard
          label="Positions"
          value={holdings.length.toString()}
          sub={holdings.length > 0 ? formatEur(holdingsValue) + " at mark" : "None yet"}
        />
      </div>

      {/* Pending signals */}
      <section className="mb-8">
        <h2 className="font-headline text-2xl font-extrabold tracking-tight mb-4">
          Pending AI Signals
        </h2>
        {pendingSignals.length === 0 ? (
          <div className="bg-surface-container-low rounded-xl p-6 text-on-surface-variant text-sm">
            No pending signals. Request one from the watchlist below.
          </div>
        ) : (
          <div className="space-y-4">
            {pendingSignals.map((sig) => (
              <SignalCard key={sig.id} signal={sig} />
            ))}
          </div>
        )}
      </section>

      {/* Holdings */}
      <section className="mb-8">
        <h2 className="font-headline text-2xl font-extrabold tracking-tight mb-4">
          Open Positions
        </h2>
        {holdings.length === 0 ? (
          <div className="bg-surface-container-low rounded-xl p-6 text-on-surface-variant text-sm">
            No open positions yet. Approve a signal to open your first trade.
          </div>
        ) : (
          <HoldingsTable holdings={holdings} />
        )}
      </section>

      {/* Watchlist */}
      <section>
        <h2 className="font-headline text-2xl font-extrabold tracking-tight mb-4">
          Watchlist
        </h2>
        <WatchlistGrid />
      </section>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Subcomponents (all server components)
// ---------------------------------------------------------------------------

function StatCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub: string;
  accent?: "positive" | "negative";
}) {
  const subClass =
    accent === "positive"
      ? "text-secondary"
      : accent === "negative"
      ? "text-error"
      : "text-on-surface-variant";
  return (
    <div className="bg-surface-container-low rounded-xl p-6">
      <p className="text-on-surface-variant text-xs uppercase tracking-widest mb-2">
        {label}
      </p>
      <p className="text-3xl font-extrabold font-headline tracking-tight">
        {value}
      </p>
      <p className={`text-sm mt-2 font-mono ${subClass}`}>{sub}</p>
    </div>
  );
}

function SignalCard({ signal }: { signal: AiSignal }) {
  const actionColor =
    signal.action === "buy"
      ? "text-secondary border-secondary/30 bg-secondary/10"
      : signal.action === "sell"
      ? "text-error border-error/30 bg-error/10"
      : "text-on-surface-variant border-outline-variant/30 bg-surface-container-high";
  const riskColor =
    signal.risk_level === "low"
      ? "text-secondary"
      : signal.risk_level === "medium"
      ? "text-tertiary"
      : "text-error";

  return (
    <div className="bg-surface-container-low rounded-xl p-6">
      <div className="flex items-start justify-between gap-4 mb-3 flex-wrap">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="font-mono text-xs bg-surface-container-high px-2 py-1 rounded">
              {signal.ticker}
            </span>
            <span className="text-lg font-bold font-headline">{signal.name}</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span
              className={`font-semibold uppercase px-2 py-1 rounded border ${actionColor}`}
            >
              {signal.action}
            </span>
            <span className="text-on-surface-variant">
              Confidence: <span className="font-mono">{signal.confidence_pct}%</span>
            </span>
            <span className={riskColor}>Risk: {signal.risk_level}</span>
          </div>
        </div>
        <div className="flex gap-2">
          {signal.action !== "hold" && (
            <form action={approveSignal}>
              <input type="hidden" name="signal_id" value={signal.id} />
              <button
                type="submit"
                className="rounded-lg bg-gradient-to-br from-primary to-primary-container text-on-primary font-bold px-4 py-2 text-sm hover:brightness-110 active:scale-95"
              >
                Approve
              </button>
            </form>
          )}
          <form action={skipSignal}>
            <input type="hidden" name="signal_id" value={signal.id} />
            <button
              type="submit"
              className="rounded-lg border border-outline-variant/30 text-on-surface-variant px-4 py-2 text-sm hover:bg-surface-container-high active:scale-95"
            >
              Skip
            </button>
          </form>
        </div>
      </div>
      <p className="text-sm text-on-surface leading-relaxed mb-3">
        {signal.reasoning_text}
      </p>
      {signal.action !== "hold" && (
        <div className="grid grid-cols-3 gap-4 text-xs font-mono border-t border-outline-variant/10 pt-3">
          <SigDetail label="Entry" value={signal.suggested_entry} />
          <SigDetail label="Stop Loss" value={signal.suggested_stop_loss} />
          <SigDetail label="Take Profit" value={signal.suggested_take_profit} />
        </div>
      )}
    </div>
  );
}

function SigDetail({ label, value }: { label: string; value: number | null }) {
  return (
    <div>
      <p className="text-on-surface-variant uppercase tracking-widest text-[10px] mb-1">
        {label}
      </p>
      <p className="text-on-surface">
        {value == null ? "—" : value.toFixed(value > 1000 ? 0 : 2)}
      </p>
    </div>
  );
}

function HoldingsTable({ holdings }: { holdings: PortfolioHolding[] }) {
  return (
    <div className="bg-surface-container-low rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-surface-container text-xs uppercase tracking-widest text-on-surface-variant">
          <tr>
            <th className="text-left px-4 py-3">Ticker</th>
            <th className="text-right px-4 py-3">Qty</th>
            <th className="text-right px-4 py-3">Entry</th>
            <th className="text-right px-4 py-3">Mark</th>
            <th className="text-right px-4 py-3">P&amp;L</th>
            <th className="text-right px-4 py-3">Action</th>
          </tr>
        </thead>
        <tbody className="font-mono">
          {holdings.map((h) => {
            const qty = Number(h.quantity);
            const entry = Number(h.avg_entry_price);
            const mark = Number(h.current_price ?? h.avg_entry_price);
            const pnlEur = qty * (mark - entry);
            const pnlPct = ((mark - entry) / entry) * 100;
            const pnlClass =
              pnlEur >= 0 ? "text-secondary" : "text-error";
            return (
              <tr
                key={h.id}
                className="border-t border-outline-variant/10 hover:bg-surface-container-high/40"
              >
                <td className="px-4 py-3">
                  <div className="font-bold font-sans">{h.ticker}</div>
                  <div className="text-xs text-on-surface-variant font-sans">
                    {h.name}
                  </div>
                </td>
                <td className="text-right px-4 py-3">{qty}</td>
                <td className="text-right px-4 py-3">{entry.toFixed(2)}</td>
                <td className="text-right px-4 py-3">{mark.toFixed(2)}</td>
                <td className={`text-right px-4 py-3 ${pnlClass}`}>
                  {pnlEur >= 0 ? "+" : ""}
                  {pnlEur.toFixed(2)}
                  <div className="text-xs">
                    {pnlPct >= 0 ? "+" : ""}
                    {pnlPct.toFixed(2)}%
                  </div>
                </td>
                <td className="text-right px-4 py-3">
                  <form action={closePosition}>
                    <input type="hidden" name="holding_id" value={h.id} />
                    <button
                      type="submit"
                      className="rounded-lg border border-outline-variant/30 text-on-surface-variant px-3 py-1.5 text-xs hover:bg-surface-container-high"
                    >
                      Close
                    </button>
                  </form>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function WatchlistGrid() {
  const groups: Record<string, WatchlistTicker[]> = {
    "US Stocks": WATCHLIST.filter((t) => t.region === "us"),
    "EU Stocks": WATCHLIST.filter((t) => t.region === "eu"),
    "Crypto": WATCHLIST.filter((t) => t.region === "crypto"),
  };

  return (
    <div className="space-y-6">
      {Object.entries(groups).map(([group, tickers]) => (
        <div key={group}>
          <h3 className="text-xs uppercase tracking-widest text-on-surface-variant mb-3">
            {group}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {tickers.map((t) => (
              <WatchlistRow key={t.ticker} t={t} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function WatchlistRow({ t }: { t: WatchlistTicker }) {
  return (
    <form
      action={requestSignal}
      className="bg-surface-container-low rounded-xl p-4 flex items-center justify-between gap-3 hover:bg-surface-container transition-colors"
    >
      <input type="hidden" name="ticker" value={t.ticker} />
      <div className="min-w-0">
        <div className="font-mono text-sm font-bold">{t.ticker}</div>
        <div className="text-xs text-on-surface-variant truncate">{t.name}</div>
      </div>
      <button
        type="submit"
        className="flex-shrink-0 rounded-lg bg-gradient-to-br from-primary/80 to-primary-container text-on-primary font-semibold px-3 py-2 text-xs hover:brightness-110 active:scale-95"
      >
        AI Signal
      </button>
    </form>
  );
}

function formatEur(value: number): string {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  }).format(value);
}
