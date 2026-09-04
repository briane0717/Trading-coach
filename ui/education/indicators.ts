// Thin wrapper around `data-providers/internal/indicators.ts` — the single place in the repo
// that computes SMA/EMA/RSI/MACD/ATR/VWAP. This file only adapts that output into the shapes
// the education UI and CandlestickChart.tsx's `overlayLines` prop expect: plain
// {timestamp, value}[] points, and MACD split into three parallel series instead of one
// Record-valued series.
//
// This file previously reimplemented the same formulas independently (flagged as duplication
// to consolidate). Consolidated now rather than waiting for the dedicated Phase 3 /services/
// layer (see ARCHITECTURE.md) — duplicated indicator math is a correctness risk, and the two
// implementations already had to be proven numerically identical before this refactor, so there
// was no benefit to keeping both around.

import type { Candle } from '../../normalized';
import { atr, ema, macd, rsi, sma, vwap } from '../../data-providers/internal/indicators';

export interface IndicatorPoint {
  timestamp: number;
  value: number;
}

function asNumberPoints(
  points: { timestamp: number; value: number | Record<string, number> }[]
): IndicatorPoint[] {
  return points.map((p) => ({ timestamp: p.timestamp, value: p.value as number }));
}

export function calculateSMA(candles: Candle[], period: number): IndicatorPoint[] {
  return asNumberPoints(sma(candles, period));
}

export function calculateEMA(candles: Candle[], period: number): IndicatorPoint[] {
  return asNumberPoints(ema(candles, period));
}

export function calculateRSI(candles: Candle[], period = 14): IndicatorPoint[] {
  return asNumberPoints(rsi(candles, period));
}

export function calculateATR(candles: Candle[], period = 14): IndicatorPoint[] {
  return asNumberPoints(atr(candles, period));
}

/**
 * Cumulative volume-weighted average price. Assumes `candles` represents a single session —
 * no multi-day reset logic. Real intraday session data doesn't exist yet (known gap).
 */
export function calculateVWAP(candles: Candle[]): IndicatorPoint[] {
  return asNumberPoints(vwap(candles));
}

/**
 * Adapts the reference `macd()`'s combined {macd, signal, histogram} points into three parallel
 * series. Note: the reference implementation only emits a point once the signal line is
 * available (from `slowPeriod + signalPeriod - 1` bars in), so `macdLine` here is the same
 * length as `signalLine`/`histogram` — it no longer includes the earlier macd-only values that
 * exist before the signal line starts (a behavior change from this file's previous standalone
 * implementation, which exposed those early points).
 */
export function calculateMACD(
  candles: Candle[],
  fastPeriod = 12,
  slowPeriod = 26,
  signalPeriod = 9
): { macdLine: IndicatorPoint[]; signalLine: IndicatorPoint[]; histogram: IndicatorPoint[] } {
  const points = macd(candles, fastPeriod, slowPeriod, signalPeriod);
  const macdLine: IndicatorPoint[] = [];
  const signalLine: IndicatorPoint[] = [];
  const histogram: IndicatorPoint[] = [];
  for (const p of points) {
    const v = p.value as Record<string, number>;
    macdLine.push({ timestamp: p.timestamp, value: v.macd });
    signalLine.push({ timestamp: p.timestamp, value: v.signal });
    histogram.push({ timestamp: p.timestamp, value: v.histogram });
  }
  return { macdLine, signalLine, histogram };
}
