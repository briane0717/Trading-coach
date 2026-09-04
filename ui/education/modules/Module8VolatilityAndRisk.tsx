import type { Candle } from '../../../normalized';

/**
 * Fresh, hand-authored 35-bar series built only for this module: a single stock that stays
 * structurally calm the entire time — no breakout, no expansion phase, unlike this module's
 * other example (Module 7's `ATR_VOLATILITY_CANDLES`, reused below), which is one stock whose
 * volatility changes partway through. Same tight-range character as that array's first 18
 * bars (small day-to-day drift, a fixed small wick offset on every candle), just sustained for
 * the whole series instead of breaking into a wide-range expansion.
 *
 * One condition was checked programmatically against `calculateATR`'s real output before this
 * array was finalized: ATR(14) stays in a consistent, narrow range for every exposed point,
 * with no meaningful drift from the first reading to the last. ATR(14) first becomes available
 * at candle index 14 (2026-01-23), reading about $0.45 on a $40.00 close — about 1.13% of
 * price. By the last bar (2026-02-20), ATR(14) is about $0.43 on a $40.05 close — about 1.08%
 * of price. Every one of the 21 exposed ATR(14) readings in between falls within that same
 * roughly 1.08%-1.13% band — this is the exact array that passed on the first attempt.
 */
const CALM_STOCK_CANDLES: Candle[] = [
  { timestamp: 1767623400000, open: 39.9, high: 40.15, low: 39.75, close: 40, volume: 700000 },
  { timestamp: 1767709800000, open: 40, high: 40.35, low: 39.85, close: 40.2, volume: 715000 },
  { timestamp: 1767796200000, open: 40.2, high: 40.35, low: 39.9, close: 40.05, volume: 730000 },
  { timestamp: 1767882600000, open: 40.05, high: 40.2, low: 39.75, close: 39.9, volume: 745000 },
  { timestamp: 1767969000000, open: 39.9, high: 40.25, low: 39.75, close: 40.1, volume: 760000 },
  { timestamp: 1768228200000, open: 40.1, high: 40.4, low: 39.95, close: 40.25, volume: 700000 },
  { timestamp: 1768314600000, open: 40.25, high: 40.4, low: 39.95, close: 40.1, volume: 715000 },
  { timestamp: 1768401000000, open: 40.1, high: 40.25, low: 39.8, close: 39.95, volume: 730000 },
  { timestamp: 1768487400000, open: 39.95, high: 40.1, low: 39.65, close: 39.8, volume: 745000 },
  { timestamp: 1768573800000, open: 39.8, high: 40.1, low: 39.65, close: 39.95, volume: 760000 },
  { timestamp: 1768833000000, open: 39.95, high: 40.25, low: 39.8, close: 40.1, volume: 700000 },
  { timestamp: 1768919400000, open: 40.1, high: 40.35, low: 39.95, close: 40.2, volume: 715000 },
  { timestamp: 1769005800000, open: 40.2, high: 40.35, low: 39.9, close: 40.05, volume: 730000 },
  { timestamp: 1769092200000, open: 40.05, high: 40.2, low: 39.75, close: 39.9, volume: 745000 },
  { timestamp: 1769178600000, open: 39.9, high: 40.15, low: 39.75, close: 40, volume: 760000 },
  { timestamp: 1769437800000, open: 40, high: 40.3, low: 39.85, close: 40.15, volume: 700000 },
  { timestamp: 1769524200000, open: 40.15, high: 40.45, low: 40, close: 40.3, volume: 715000 },
  { timestamp: 1769610600000, open: 40.3, high: 40.45, low: 40, close: 40.15, volume: 730000 },
  { timestamp: 1769697000000, open: 40.15, high: 40.3, low: 39.85, close: 40, volume: 745000 },
  { timestamp: 1769783400000, open: 40, high: 40.15, low: 39.7, close: 39.85, volume: 760000 },
  { timestamp: 1770042600000, open: 39.85, high: 40.1, low: 39.7, close: 39.95, volume: 700000 },
  { timestamp: 1770129000000, open: 39.95, high: 40.25, low: 39.8, close: 40.1, volume: 715000 },
  { timestamp: 1770215400000, open: 40.1, high: 40.35, low: 39.95, close: 40.2, volume: 730000 },
  { timestamp: 1770301800000, open: 40.2, high: 40.35, low: 39.9, close: 40.05, volume: 745000 },
  { timestamp: 1770388200000, open: 40.05, high: 40.2, low: 39.75, close: 39.9, volume: 760000 },
  { timestamp: 1770647400000, open: 39.9, high: 40.15, low: 39.75, close: 40, volume: 700000 },
  { timestamp: 1770733800000, open: 40, high: 40.3, low: 39.85, close: 40.15, volume: 715000 },
  { timestamp: 1770820200000, open: 40.15, high: 40.4, low: 40, close: 40.25, volume: 730000 },
  { timestamp: 1770906600000, open: 40.25, high: 40.4, low: 39.95, close: 40.1, volume: 745000 },
  { timestamp: 1770993000000, open: 40.1, high: 40.25, low: 39.8, close: 39.95, volume: 760000 },
  { timestamp: 1771252200000, open: 39.95, high: 40.2, low: 39.8, close: 40.05, volume: 700000 },
  { timestamp: 1771338600000, open: 40.05, high: 40.35, low: 39.9, close: 40.2, volume: 715000 },
  { timestamp: 1771425000000, open: 40.2, high: 40.35, low: 39.95, close: 40.1, volume: 730000 },
  { timestamp: 1771511400000, open: 40.1, high: 40.25, low: 39.8, close: 39.95, volume: 745000 },
  { timestamp: 1771597800000, open: 39.95, high: 40.2, low: 39.8, close: 40.05, volume: 760000 },
];

export { CALM_STOCK_CANDLES };
