# The Financial Architect — Design Specification

## Overview

A web-based AI-augmented trading application for a beginner investor in the Netherlands. The app provides AI-generated trade signals with plain-English explanations, lets the user approve or skip each trade, and teaches trading concepts through real experience. Starts with paper trading (virtual money), upgradeable to live trading when ready.

## User Profile

- **Location:** Netherlands (Box 3 tax, AFM regulations apply)
- **Experience:** Complete beginner, zero trading knowledge
- **Starting capital:** 50-100 EUR (when switching to live)
- **Trading style:** AI suggests, user approves
- **Instruments:** Stocks, ETFs, crypto — everything
- **Key need:** Learn while earning, with explanations a 12-year-old could understand

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Framework | Next.js 14 (App Router, TypeScript) | React-based, free Vercel hosting, SSR support |
| Styling | Tailwind CSS + custom design tokens | Matches Stitch mockups exactly |
| Icons | Material Symbols Outlined | Consistent with Stitch designs |
| Fonts | Manrope (headlines), Inter (body) | From Stitch designs |
| Database | Supabase PostgreSQL | Free tier, real-time subscriptions, auth, edge functions |
| Auth | Supabase Auth (magic links) | Passwordless, beginner-friendly |
| AI Engine | Claude API (Anthropic) | Sonnet 4.6 for signals, Opus 4.6 for deep analysis |
| Market Data (Stocks) | Alpha Vantage | Free tier (25 req/day), stocks + ETFs + indicators |
| Market Data (Crypto) | CoinGecko | Free, no API key needed for basic use |
| Broker (Paper) | Built-in simulator | Custom paper trading engine in Supabase |
| Broker (Live) | Alpaca Markets API | Free commissions, REST API, supports EU users |
| Hosting | Vercel | Free tier, automatic deployments from GitHub |

## Design System

Extracted from user's Google Stitch mockups. All pages must follow this exactly.

### Colors (Dark Theme Only)

```
Background:           #11131b
Surface:              #11131b
Surface Container:    #1d1f28
Surface Container Low: #191b23
Surface Container High: #282a32
Surface Container Highest: #33343d
Primary:              #bac3ff (purple-blue)
Primary Container:    #4453a7
On Primary:           #15267b
Secondary:            #45d8ed (teal)
Secondary Container:  #00bacd
Tertiary:             #ffb784 (amber)
Tertiary Container:   #8f4700
Error:                #ffb4ab
On Surface:           #e1e1ed
On Surface Variant:   #c5c5d4
Outline:              #8f909e
Outline Variant:      #454652
```

### Typography

- Headlines: Manrope, extrabold (800), tight tracking
- Body: Inter, regular (400) / medium (500)
- Labels: Inter, semibold (600), uppercase tracking-widest for small labels
- Monospace values: font-mono for numbers and percentages

### Component Patterns

- Cards: `bg-surface-container-low rounded-xl p-6/p-8`
- Nested cards: `bg-surface-container-high rounded-lg p-6`
- Glass panels: `background: rgba(51, 52, 61, 0.6); backdrop-filter: blur(24px)`
- Primary buttons: `bg-gradient-to-br from-primary to-primary-container text-on-primary font-bold rounded-xl`
- Ghost buttons: `border border-outline-variant/30 text-on-surface rounded-xl`
- Active nav item: `bg-[#282a32] text-[#bac3ff] rounded-r-full`
- Toggles: Custom divs with colored circles (not native checkboxes)
- Confidence rings: SVG circles with stroke-dasharray/dashoffset
- Status badges: Colored with matching bg/text/border (e.g., `bg-secondary/10 text-secondary border-secondary/20`)

### Layout

- Top nav bar: Fixed, h-16, `bg-[#191b23]`
- Side nav: Fixed, w-64, `bg-[#191b23]`, hidden on mobile
- Main content: `ml-64 pt-6 px-8 pb-12`
- Mobile: Bottom tab bar (h-16), no sidebar
- Background: Subtle gradient blurs (primary/5 and secondary/5)

## Pages

### 1. Dashboard (Home)

The primary page. User lands here after login.

**Layout:** 12-column grid. 8-col main + 4-col sidebar.

**Components:**
- **Portfolio Header:** Total value in EUR (large, `text-5xl`), daily P&L percentage with trending_up/down icon
- **Buying Power Card:** Available cash for trading, progress bar showing allocation
- **Active AI Signals Feed:** Cards for each pending signal containing:
  - Ticker symbol (square badge with ticker text)
  - Company name
  - Sentiment badge (BULLISH in teal, BEARISH in error red)
  - Plain-English reasoning from Claude (2-3 sentences, beginner-friendly)
  - Confidence ring (SVG donut chart, percentage in center)
  - "Approve Trade" button (gradient primary) + "Skip" button (ghost)
  - Timestamp of when signal was generated
- **Market Sentiment Gauge:** Horizontal bar (Fear ↔ Greed) with needle indicator (0-100), plus an "Insight" box with Claude's interpretation
- **Quick Stats Grid:** Win rate (%), total trades count, best performer (ticker + return %)
- **Recent Activity:** Last 5 trades with buy/sell icon, ticker, timestamp, amount in EUR

### 2. AI Insights

Where Claude explains its thinking and the user learns.

**Components:**
- **Signal History:** Past signals with full reasoning, outcome (profit/loss), and what Claude learned
- **Knowledge Vault:** Grid of concept cards the user has encountered through trading:
  - RSI, MACD, Moving Averages, Bollinger Bands, Head & Shoulders, Support/Resistance, etc.
  - Each card shows: concept name, one-line definition, "Encountered in: ASML trade on Oct 24"
  - Cards unlock as the user encounters them in real signals
- **Weekly Review:** Claude-generated summary of the week's performance:
  - What went well (winning trades and why)
  - What went wrong (losing trades and what to learn)
  - Suggested adjustments for next week
- **Learnings Feed:** Auto-generated entries from `Learnings.md` — what the AI has learned from past trades

### 3. Portfolio

Current holdings and trade history.

**Components:**
- **Holdings Table:** Ticker, name, quantity, avg entry price, current price, P&L (EUR + %), allocation %
- **Portfolio Chart:** Simple line chart of portfolio value over time (last 30 days default)
- **Trade History:** Filterable table — date, ticker, action (buy/sell), quantity, price, P&L, status (open/closed)
- **Performance Summary:** Total return, best trade, worst trade, average hold time

### 4. Markets / Watchlist

Track tickers the user is interested in.

**Components:**
- **Search Bar:** Search across stocks, ETFs, crypto by name or ticker
- **Watchlist:** User's saved tickers with:
  - Current price, daily change %, mini sparkline chart
  - Quick action: "Request AI Analysis" button → sends to Claude for a one-off signal
- **Market Movers:** Auto-populated section showing top gainers/losers of the day
- **Add/Remove:** Simple toggle to add/remove from watchlist

### 5. Settings & Risk Management

From Stitch design — already fully specified.

**Components:**
- **Capital Protection Guardrails:**
  - Max Position Size (slider, default 5%)
  - Daily Loss Cap (number input, default 2.5%)
  - Default Stop-Loss (input with % suffix, default 1.5%)
  - Take Profit Target (input with % suffix, default 4.5%)
- **Execution Mode:** Paper / Live toggle with broker connection status
- **Market Coverage:** Toggles for US Equity, European Stocks, Digital Assets (Crypto)
- **Sentiment Engine:** Bull/bear ratio display
- **Notifications:** Checkboxes for trade execution, risk alerts, weekly report
- **Education Card:** Link to risk management guide

## Data Model (Supabase PostgreSQL)

### Tables

**users** (managed by Supabase Auth)
- id, email, created_at

**user_settings**
- user_id (FK), max_position_pct, daily_loss_cap_pct, stop_loss_pct, take_profit_pct, execution_mode (paper/live), markets_us, markets_eu, markets_crypto, notify_trades, notify_risk, notify_weekly

**portfolio_holdings**
- id, user_id, ticker, name, asset_type (stock/etf/crypto), quantity, avg_entry_price, current_price, updated_at

**trade_history**
- id, user_id, ticker, name, action (buy/sell), quantity, price, stop_loss_price, take_profit_price, status (open/closed), pnl_eur, pnl_pct, opened_at, closed_at, signal_id (FK)

**ai_signals**
- id, user_id, ticker, name, action (buy/sell/hold), sentiment (bullish/bearish/neutral), confidence_pct, reasoning_text, risk_level, status (pending/approved/skipped/expired), created_at, acted_at

**watchlist**
- id, user_id, ticker, name, asset_type, added_at

**knowledge_vault**
- id, user_id, concept_name, definition, first_encountered_signal_id, unlocked_at

**market_data_cache**
- ticker, asset_type, price, change_pct, volume, rsi, sma_20, sma_50, updated_at

**paper_account**
- user_id, balance_eur, initial_balance_eur, created_at

**learnings**
- id, user_id, trade_id (FK), lesson_text, category (success/failure/pattern), created_at

## AI Integration

### Claude System Prompt (for signal generation)

Claude acts as a protective financial mentor for a complete beginner. Every response must:
1. Use plain language a 12-year-old could understand
2. Explain the "why" behind every recommendation
3. Name the specific indicators/patterns it sees
4. Assess confidence level (0-100%)
5. Flag risks explicitly
6. Never recommend a trade that violates the user's risk settings

### Signal Generation Flow

1. Supabase cron triggers edge function every 30 minutes during market hours
2. Edge function fetches latest price data from Alpha Vantage / CoinGecko
3. Edge function calculates technical indicators (RSI, SMA-20, SMA-50)
4. Data + user's learnings + market context sent to Claude Sonnet 4.6
5. Claude returns structured JSON response:
   ```json
   {
     "action": "buy",
     "ticker": "ASML",
     "confidence": 85,
     "sentiment": "bullish",
     "reasoning": "The stock has hit a significant support level...",
     "risk_level": "medium",
     "suggested_entry": 640.00,
     "suggested_stop_loss": 630.40,
     "suggested_take_profit": 668.80
   }
   ```
6. Signal stored in `ai_signals` table
7. Supabase real-time pushes to Dashboard
8. User sees signal card → approves or skips

### Trade Execution Flow (on Approve)

1. Validate against risk settings:
   - Position size <= max_position_pct of account
   - Daily losses < daily_loss_cap_pct
   - Stop-loss is set
2. If paper mode: deduct from paper_account, create trade_history entry
3. If live mode: send order to Alpaca API with bracket order (entry + stop-loss + take profit)
4. Update portfolio_holdings
5. Push notification to user

### Learning Loop

After every closed trade:
1. Calculate actual P&L
2. Send trade details to Claude with prompt: "Analyze this trade outcome and extract one key lesson"
3. Store lesson in learnings table
4. Update knowledge_vault if new concepts were involved
5. Before next signal generation, include recent learnings in Claude's context

### Weekly Review (Claude Opus 4.6)

Every Sunday, triggered by cron:
1. Gather all trades from the past week
2. Send to Claude Opus with prompt requesting deep analysis
3. Claude produces: what worked, what failed, adjustments for next week
4. Store as a special AI Insight entry
5. Notify user if weekly notifications are enabled

## Risk Management (Hardcoded Safety)

These are enforced at the code level, independent of Claude's suggestions:

| Rule | Default | Configurable? |
|------|---------|--------------|
| Max single position size | 5% of account | Yes (1-10% range) |
| Daily loss cap | 2.5% of account | Yes (1-10% range) |
| Mandatory stop-loss | Every trade | No — always required |
| Default stop-loss distance | 1.5% below entry | Yes |
| Take profit target | 4.5% above entry | Yes |
| Max concurrent positions | 5 | Yes (1-10 range) |
| Trading halt on daily cap breach | Automatic | No — always enforced |

### Position Sizing Formula

```
Position Size (units) = (Account Balance * Risk Per Trade %) / (Entry Price - Stop Loss Price)
```

Example with 100 EUR account, 2% risk, entry at 10 EUR, stop-loss at 9.80 EUR:
```
(100 * 0.02) / (10 - 9.80) = 2 / 0.20 = 10 units = 100 EUR position
```

## Paper Trading Engine

Built into Supabase, no external dependency:

- User starts with configurable virtual balance (default: 10,000 EUR)
- All trades execute at current market price (simulated fills)
- Stop-loss and take-profit monitored by cron job (checks every 5 min during market hours)
- Full P&L tracking identical to live mode
- User must paper trade before switching to live (recommendation, not enforced)

## Authentication

- Supabase Auth with magic links (email-based, no password)
- Single user system initially (no multi-tenancy needed)
- API keys stored as Supabase environment variables (never in frontend)

## Deployment

- GitHub repository for version control
- Vercel for frontend hosting (auto-deploy from GitHub)
- Supabase for backend (managed PostgreSQL + edge functions)
- Environment variables: ANTHROPIC_API_KEY, ALPHA_VANTAGE_API_KEY, SUPABASE_URL, SUPABASE_ANON_KEY

## Regulatory Notes (Netherlands)

- App is for personal private wealth management (Box 3)
- All AI decisions are logged for auditability
- Claude's reasoning is always visible to the user (transparency)
- No financial advice is given — only analysis and signals for user to approve
- User maintains full control over every trade execution

## Design Reference Files

- `design-reference/dashboard-page.html` — Stitch mockup of Dashboard
- `design-reference/settings-page.html` — Stitch mockup of Settings page
