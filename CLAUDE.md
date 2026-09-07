# Trading Coach App — Project Rules

## What this is
An education → paper-trading → market-analysis → (eventual, separate) brokerage-execution
application. Built in strict phases. Do not skip ahead.

## Phase order (hard boundary — do not blur these)
1. **Education** — trading fundamentals, historical/simulated data only.
2. **Paper trading** — the in-memory paper-trading engine (`/trading-engine/` —
   `createAccount`, `executeOrder`, `getBuyingPower`, `getUnrealizedPnL`, `getEquity`, plus a
   localStorage persistence adapter) and the order-entry/portfolio UI (`/ui/trading/` —
   `usePaperAccount`, `PaperTradingDashboard`, `OrderForm`, routed at `/trading`), running
   entirely on `SimulatedMarketDataProvider`. Complete and confirmed working.
3. **Real market analysis** — real-time/delayed data display only. No trade execution.
4. **Advanced analysis / AI coach** — helps interpret setups, never issues buy/sell commands.
5. **Trading Readiness system** — gates progression via tested skill, not P&L.
6. **Brokerage integration (optional, future, separate dev phase)** — not started until 1-5 are solid.

Do not build brokerage connectivity, order placement, or credential storage in phases 1-5.
If a task seems to require it, stop and flag it instead of building a placeholder for it.

## Non-negotiable safety rules
- No real brokerage connection until explicitly instructed to start Phase 6.
- No automatic trade execution, ever — even after brokerage integration exists.
- Never store brokerage credentials in plaintext, in code, or in the repo. Use environment
  variables / a secrets manager, and flag any deviation.
- Any order-submission UI (future) must show: symbol, direction, share count, order type,
  estimated price, stop, target, max potential loss, % account risk, R:R, buying-power impact
  — and require an explicit confirm action before submission.
- Every piece of displayed market data must be labeled: **real-time / delayed / historical /
  simulated**. Never let simulated or delayed data render without that label.
- The AI coach explains setups and teaches evaluation — it must not output a bare directive
  like "buy this" or "sell this." Always separate "what the data shows" from "interpretation."

## Architecture
- Market data flows through a single abstraction layer (`MarketDataProvider` interface).
  No application code should call a specific vendor's SDK/API directly — only the adapter does.
- See ARCHITECTURE.md for the full layer breakdown and current provider status.

## Current status
- Phase 1 (Education): feature-complete and confirmed working.
- Phase 2 (Paper trading): feature-complete and confirmed working — the paper-trading engine
  and the order-entry/portfolio UI all run on `SimulatedMarketDataProvider`.
- Phase 3 (real market data): vendor research is done — Alpaca Market Data (free tier),
  chosen for genuine bid/ask via its IEX feed (see the adapter's code comments for the
  CORS/proxy rationale). `AlpacaMarketDataProvider` is built and tested, and is now
  selectable in `OrderForm` as an explicit opt-in via `VITE_MARKET_DATA_PROVIDER=alpaca`
  (default remains `simulated`; only functional under `npm run dev`). `PaperTradingDashboard`
  now uses the same `selectMarketDataProvider` helper as `OrderForm`, so both screens honor
  `VITE_MARKET_DATA_PROVIDER` and can't disagree about which provider is active. See
  ARCHITECTURE.md's "Current provider status" for details.
- Brokerage integration: not started, not authorized.

## Working style
- Build one vertical slice at a time; don't scaffold future-phase code "just in case."
- When something breaks, stop and troubleshoot before adding new code on top of it.
- Flag when a request would blur a phase boundary rather than quietly complying.

## Usage discipline
- Don't independently re-verify a completed report by default. Spot-check only when something
  looks inconsistent (numbers don't add up, a claim contradicts an earlier one, "done" isn't
  backed by a diff).
- A "pushed" claim gets one cheap `git fetch` + `git log origin/...` check — not a full
  rebuild-and-retest cycle.
- Run bare `npm test` only, not the simulated/alpaca/bare three-way matrix, unless the change
  actually touches provider-selection code.
- Collapse build + verify + commit into one round trip; don't add an extra review pass by default.
- Keep reports tight: outcome and what changed, not full blow-by-blow narration.
