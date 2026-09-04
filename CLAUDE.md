# Trading Coach App — Project Rules

## What this is
An education → paper-trading → market-analysis → (eventual, separate) brokerage-execution
application. Built in strict phases. Do not skip ahead.

## Phase order (hard boundary — do not blur these)
1. **Education** — trading fundamentals, historical/simulated data only.
2. **Real market analysis** — real-time/delayed data display only. No trade execution.
3. **Advanced analysis / AI coach** — helps interpret setups, never issues buy/sell commands.
4. **Trading Readiness system** — gates progression via tested skill, not P&L.
5. **Brokerage integration (optional, future, separate dev phase)** — not started until 1-4 are solid.

Do not build brokerage connectivity, order placement, or credential storage in phases 1-4.
If a task seems to require it, stop and flag it instead of building a placeholder for it.

## Non-negotiable safety rules
- No real brokerage connection until explicitly instructed to start Phase 5.
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
- Phase: 1 (Education) — simulated market data adapter built.
- Market data provider: simulated adapter only — real vendor pending research (see
  ARCHITECTURE.md open items).
- Brokerage integration: not started, not authorized.

## Working style
- Build one vertical slice at a time; don't scaffold future-phase code "just in case."
- When something breaks, stop and troubleshoot before adding new code on top of it.
- Flag when a request would blur a phase boundary rather than quietly complying.
