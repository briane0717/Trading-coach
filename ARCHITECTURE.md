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
**Equities + swing trading is the first complete path being built, through Phase 4.** No other
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
/services/                  indicator calc, readiness scoring, journal, risk-sizing
/coach/                     AI coach prompts/logic — interpretation layer, clearly separated
                             from raw-data display
/ui/                        charts, dashboards, education content
/brokerage/                 EMPTY until Phase 5 is explicitly authorized — do not scaffold yet
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

## Phase-by-phase build order
This build order is for the equities × swing-trading track (see "Current build scope"). Other
tracks are not scheduled.

1. **Simulated data adapter** — generates plausible OHLC/quote data so every other layer can
   be built and tested without any vendor account or API key. ✅ Built — see
   `/data-providers/simulated.ts`.
2. **Education module** — content + simulator using the simulated adapter.
3. **Indicator services** — moving averages, RSI, MACD, ATR, VWAP, support/resistance, computed
   from OHLC (works identically on simulated or real data since it's downstream of the adapter).
4. **Charting UI** — candlesticks, multiple timeframes, indicator overlays.
5. **AI coach (interpretation layer)** — consumes normalized data + indicators, walks through
   a setup, explicitly separates fact vs. interpretation, never issues directives.
6. **Trading Readiness system** — risk-management tests, position-sizing tests, chart-analysis
   tests, drawdown/consistency tracking. Gates progression on demonstrated skill, not P&L.
7. **Real data adapter research (open item)** — evaluate vendors (e.g. IEX Cloud successors,
   Polygon.io, Alpaca Market Data, Finnhub, Twelve Data) on: real-time vs. delayed tiers,
   pricing, rate limits, and licensing terms for display in a third-party app. This needs a
   dedicated research pass when you're ready for Phase 2 — pricing/licensing terms move fast
   enough that it shouldn't be answered from memory.
8. **Brokerage research (Phase 5, later, separate authorization)** — not started.

## Open items to research before Phase 2
- Which market-data vendor's licensing terms actually permit display in a consumer-facing app
  (some prohibit redistribution/display outside their own UI at lower pricing tiers).
- Real-time vs. 15-min-delayed cost tiers for each candidate vendor.

## Current provider status
- `data-providers/interface.ts` — the `MarketDataProvider` contract (Phase 1, complete).
  Currently equities-shaped; will need to split into a shared base + asset-class extensions
  if/when a second asset class is authorized (see "Tracks: asset class × style" above).
- `data-providers/simulated.ts` — `SimulatedMarketDataProvider`, a deterministic
  pseudo-random OHLC/quote generator for equities. Every response is tagged
  `sourceType: 'simulated'`. This is the only registered provider; no vendor SDK is wired in
  yet (Phase 2 open item).
- No options, forex, or other asset-class provider exists, and none should be built until
  that track is explicitly authorized.
