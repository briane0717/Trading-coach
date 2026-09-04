# Architecture Outline

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

## MarketDataProvider interface (draft shape)
Every adapter (simulated now, real vendor later) implements the same contract so the rest of
the app never knows which one it's talking to:

- `getQuote(symbol)` → price, bid, ask, spread, volume, market cap, day high/low, prev close
- `getIntraday(symbol, timeframe)` → candlestick series
- `getHistorical(symbol, range)` → historical OHLC
- `getIndicators(symbol, list)` → VWAP, moving averages, RSI, MACD, ATR, etc. (can be computed
  app-side from OHLC rather than vendor-supplied)
- Every response includes: `sourceType: 'real-time' | 'delayed' | 'historical' | 'simulated'`,
  `timestamp`, and a `stale: boolean` flag

## Phase-by-phase build order
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
- `data-providers/simulated.ts` — `SimulatedMarketDataProvider`, a deterministic
  pseudo-random OHLC/quote generator. Every response is tagged `sourceType: 'simulated'`.
  This is the only registered provider; no vendor SDK is wired in yet (Phase 2 open item).
