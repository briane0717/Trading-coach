# Architecture Outline

## Tracks: asset class × style (future architecture — documentation only)
The app is designed around two independent dimensions that together define a "track." Nothing
below this section describes what's built yet — see "Current build scope" — it documents the
shape the architecture is meant to grow into so early decisions don't paint us into a corner.

**Dimension 1 — Asset class**: equities, options, forex, and possibly others later (futures,
crypto, etc.). Each asset class has its own:
- Market data provider (different instruments, different quote/candle shapes — see below)
- Curriculum (fundamentals specific to how that instrument trades)
- Trading Readiness criteria (what "demonstrated skill" means differs by instrument)

**Dimension 2 — Style**: day trading, swing trading, position trading. Style crosses asset
class — it's a second independent axis, not a subcategory of it. A style shares the asset
class's common fundamentals modules but diverges on:
- Timeframe emphasis (intraday charts vs. daily/weekly)
- Risk parameters (stop distance, position hold time, max concurrent positions)
- Trading Readiness criteria (e.g. day trading readiness likely needs to test fast decision-making
  under time pressure; swing/position readiness weighs patience and multi-day risk management
  more heavily)

A **track** = (asset class × style). The user selects a track similarly to a language-picker
model — pick an asset class, then a style — and that selection determines which curriculum,
which market data provider, and which readiness criteria apply. Tracks share the app's common
fundamentals modules (risk management basics, reading a chart, order types, psychology) but
branch from there.

This means `MarketDataProvider` (see below) should eventually generalize from an
equities-shaped contract to one where each asset class supplies its own provider implementing
a shared base contract, with asset-class-specific extensions where instruments genuinely
differ (e.g. options need strikes/expirations/greeks; forex needs pairs/pip values instead of
share-based quotes). Likewise `/data-providers/`, curriculum content, and readiness criteria
are expected to grow into per-asset-class, per-style subdirectories rather than staying
hardcoded to one instrument type. None of that restructuring happens until a second track is
actually authorized — see "Current build scope."

## Current build scope
**Equities + swing trading is the first complete path being built, through Phase 5.** No other
asset class, no other style, and no non-equities/non-swing-trading content should be built
until explicitly instructed — this file documents the target architecture, not a build queue
for the other tracks.

Swing trading was chosen over day trading for this first track because it doesn't require
rapid intraday decision-making. Day trading's compressed decision loop (seconds-to-minutes,
frequent forced choices under time pressure) is a skill layered on top of basic trading
fundamentals, not part of them — better to build and prove out fundamentals (risk management,
chart reading, position sizing, psychology) on a style that gives the learner time to think
before adding that pressure. Day trading, position trading, and every asset class besides
equities remain future tracks under the model above, not current work.

Everything below this point — folder structure, the `MarketDataProvider` interface, the
phase-by-phase build order — describes the equities × swing-trading track currently being
built, generalized only where noted above for future tracks.

## Data flow (from spec)
```
Market Data Provider(s)
      ↓
Data Adapter / Abstraction Layer   (normalizes vendor-specific formats)
      ↓
Normalized Market Data              (price, bid/ask, volume, OHLC, etc. — one shape)
      ↓
Application Services                (indicators, readiness scoring, journal, coach)
      ↓
Charts / Analysis / Simulator / AI Coach   (UI + AI layer)
```

Rule: nothing above the adapter line ever imports a vendor SDK directly. Swapping providers
later should mean rewriting one adapter, not touching the app.

## Suggested folder structure
Current (equities-only, what actually exists today):
```
/data-providers/          one file per vendor (simulated, and later real providers)
/data-providers/interface.ts   the MarketDataProvider contract every adapter implements
/normalized/               shared types: Quote, Candle, Indicator, etc.
/trading-engine/            in-memory paper-trading engine — orders, positions, P&L, buying
                             power — plus localStorage persistence; no market-data or UI imports
/services/                  indicator calc, readiness scoring, journal, risk-sizing
/coach/                     AI coach prompts/logic — interpretation layer, clearly separated
                             from raw-data display
/ui/                        charts, dashboards, education content
/ui/trading/                 paper-trading UI: order-entry form, portfolio dashboard
/brokerage/                 EMPTY until Phase 6 is explicitly authorized — do not scaffold yet
```

Future, once a second track is authorized (not built yet — see "Current build scope"), the
asset-class-specific pieces are expected to become pluggable units keyed by asset class, with
style-specific curriculum/readiness nested under each:
```
/data-providers/<asset-class>/       e.g. equities/, options/, forex/ — each implements the
                                       shared provider contract plus any asset-class extension
/data-providers/interface.ts          the shared base MarketDataProvider contract
/normalized/<asset-class>/            shared types, extended per asset class where instruments
                                       genuinely differ (e.g. options contracts vs. equity candles)
/curriculum/<asset-class>/<style>/    track-specific content, branching from shared fundamentals
/services/readiness/<asset-class>/<style>/   track-specific Trading Readiness criteria
```
Only `equities/` (folded into the current flat `/data-providers/` today) and the swing-trading
curriculum/readiness are in scope right now; the rest of this shape is documented, not built.

## MarketDataProvider interface (draft shape)
This is the equities-shaped contract used by the current track. Every adapter (simulated now,
real vendor later) implements the same contract so the rest of the app never knows which one
it's talking to:

- `getQuote(symbol)` → price, bid, ask, spread, volume, market cap, day high/low, prev close
- `getIntraday(symbol, timeframe)` → candlestick series
- `getHistorical(symbol, range)` → historical OHLC
- `getIndicators(symbol, list)` → VWAP, moving averages, RSI, MACD, ATR, etc. (can be computed
  app-side from OHLC rather than vendor-supplied)
- Every response includes: `sourceType: 'real-time' | 'delayed' | 'historical' | 'simulated'`,
  `timestamp`, and a `stale: boolean` flag

## Build order
This build order is for the equities × swing-trading track (see "Current build scope"). Other
tracks are not scheduled.

1. **Step 1: Simulated data adapter** — generates plausible OHLC/quote data so every other layer can
   be built and tested without any vendor account or API key. ✅ Built — see
   `/data-providers/simulated.ts`.

   Also built, not originally called out as its own numbered step: the in-memory
   **paper-trading engine** (`/trading-engine/`) and its **order-entry/portfolio UI**
   (`/ui/trading/`) — account state, market-order execution, buying-power and shares-held
   checks, and localStorage persistence, all running on the simulated adapter above. ✅ Built.
2. **Step 2: Education module** — content + simulator using the simulated adapter.
3. **Step 3: Indicator services** — moving averages, RSI, MACD, ATR, VWAP, support/resistance, computed
   from OHLC (works identically on simulated or real data since it's downstream of the adapter).
4. **Step 4: Charting UI** — candlesticks, multiple timeframes, indicator overlays.
   - Candlestick chart on `/trading` ✅ Built — reuses `CandlestickChart` via a `provider` prop,
     with `activeSymbol` state lifted into `PaperTradingDashboard`.
   - Indicator toggles ✅ Built (`PaperTradingDashboard.tsx`) — SMA/EMA/VWAP render as
     independent multi-select overlay checkboxes (`CandlestickChart`'s `overlayLines` accepts
     more than one at a time); RSI/ATR/MACD share a single-select "bottom pane" control
     (`None` / `RSI` / `ATR` / `MACD`), since `CandlestickChart` has only one `oscillatorPane`
     slot and one `macdPane` slot — at most one bottom-pane indicator can render at once.
     Fixed default periods only this round (SMA 20, EMA 20, RSI 14, ATR 14; VWAP and MACD use
     `data-providers/internal/indicators.ts`'s existing internal defaults) — no
     period-customization UI yet.
   - Timeframe switcher ✅ Built (`PaperTradingDashboard.tsx`) — a 1m/5m/15m/1h/1d selector
     replaces the previously-hardcoded `timeframe="1d"` passed to `CandlestickChart`.
     `CandlestickChart` itself needed no changes: it was already timeframe-generic, calling
     `provider.getIntraday(symbol, timeframe)` for any of the five values.
   - Timeframe-aware indicators ✅ Built — `IndicatorRequest` (`normalized/types.ts`) carries an
     optional `timeframe` (defaulting to `1d`), period is bar-count-relative to that timeframe
     (SMA(20) on `5m` = last 20 five-minute bars), and both `SimulatedMarketDataProvider` and
     `AlpacaMarketDataProvider` fetch/generate candles at the requested timeframe rather than
     always computing against daily bars. `PaperTradingDashboard` passes its current timeframe
     on every `getIndicators` request and no longer disables or clears the SMA/EMA/VWAP
     checkboxes or the bottom-pane selector when the chart is off `1d`.
5. **Step 5: AI coach (interpretation layer)** — consumes normalized data + indicators, walks through
   a setup, explicitly separates fact vs. interpretation, never issues directives.
6. **Step 6: Trading Readiness system** — risk-management tests, position-sizing tests, chart-analysis
   tests, drawdown/consistency tracking. Gates progression on demonstrated skill, not P&L.
7. **Step 7: Real data adapter research** — ✅ Resolved: Alpaca Market Data (free tier) selected,
   chosen for genuine bid/ask via its IEX feed — see `data-providers/alpaca.ts`'s class-level
   comment for the rationale. `AlpacaMarketDataProvider` implements `MarketDataProvider` and is
   tested (`data-providers/alpaca.test.ts`), and is now selectable in `OrderForm` as an explicit
   opt-in via `VITE_MARKET_DATA_PROVIDER=alpaca` — see "Current provider status" below.
8. **Step 8: Brokerage research (CLAUDE.md Phase 6, later, separate authorization)** — not started.

## Open items to research before Phase 3
**Resolved — see item 7 above:** Alpaca Market Data (free tier) was selected and
`AlpacaMarketDataProvider` is built. The criteria that were being researched:
- Which market-data vendor's licensing terms actually permit display in a consumer-facing app
  (some prohibit redistribution/display outside their own UI at lower pricing tiers).
- Real-time vs. 15-min-delayed cost tiers for each candidate vendor.

## Dev-only Alpaca proxy (narrow exception, not a backend)
`vite-plugins/alpacaProxy.ts` is a same-origin Vite dev-server relay: it attaches Alpaca API
keys (read from `process.env`, never bundled into client code) and forwards requests to
`data.alpaca.markets`. It exists solely because Alpaca's Market Data API doesn't support
direct browser calls (no CORS) and because its keys must never reach client code — not because
this app has, or is growing, a general backend. It's a stateless credential relay, single-
purpose and hardcoded to one vendor's one API, not a proxy for arbitrary requests.

It only runs under `npm run dev`. A deployed build has no equivalent yet — shipping
`AlpacaMarketDataProvider` to production needs an equivalent server-side proxy (e.g. a
serverless function) built first; that isn't done.

## Current provider status
- `data-providers/interface.ts` — the `MarketDataProvider` contract (complete).
  Currently equities-shaped; will need to split into a shared base + asset-class extensions
  if/when a second asset class is authorized (see "Tracks: asset class × style" above).
- `data-providers/simulated.ts` — `SimulatedMarketDataProvider`, a deterministic
  pseudo-random OHLC/quote generator for equities. Every response is tagged
  `sourceType: 'simulated'`. Still the default provider in the UI (see
  `ui/trading/OrderForm.tsx`'s `selectMarketDataProvider`) — used whenever
  `VITE_MARKET_DATA_PROVIDER` is unset, missing, or unrecognized, per CLAUDE.md's rule that
  ambiguity must never default to real data.
- `data-providers/alpaca.ts` — `AlpacaMarketDataProvider`, implements `MarketDataProvider`
  against Alpaca Market Data's IEX feed. Calls only the dev-only proxy above — never
  `data.alpaca.markets` directly — so vendor credentials never reach client code. `sourceType`
  per method: `getQuote` → `real-time`; `getHistorical`, `getIndicators`, and
  `getIntraday('1d')` → `historical`; sub-day `getIntraday` (1m/5m/15m/1h) → `real-time`.
  Tested in `data-providers/alpaca.test.ts` (fetch mocked, no network). Selectable in
  `OrderForm` as an explicit opt-in via `VITE_MARKET_DATA_PROVIDER=alpaca` (see
  `.env.example`); only functional under `npm run dev` since the Alpaca proxy is dev-only.
  `ui/trading/PaperTradingDashboard.tsx` now imports `OrderForm`'s `selectMarketDataProvider`
  and honors the same env var, so the dashboard and the order form can't disagree about which
  provider is active.
- No options, forex, or other asset-class provider exists, and none should be built until
  that track is explicitly authorized.
