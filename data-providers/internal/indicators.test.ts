import { describe, expect, it } from 'vitest';
import type { Candle } from '../../normalized';
import { atr, ema, macd, rsi, sma, vwap } from './indicators';

const DAY_MS = 86_400_000;

function candlesFromCloses(closes: number[], wick = 0): Candle[] {
  return closes.map((close, i) => ({
    timestamp: i * DAY_MS,
    open: close,
    high: close + wick,
    low: close - wick,
    close,
    volume: 1000,
  }));
}

describe('sma', () => {
  it('averages the trailing window', () => {
    const candles = candlesFromCloses([1, 2, 3, 4, 5]);
    const points = sma(candles, 3);
    expect(points.map((p) => p.value)).toEqual([2, 3, 4]);
  });

  it('returns nothing when there are fewer candles than the period', () => {
    expect(sma(candlesFromCloses([1, 2]), 3)).toEqual([]);
  });
});

describe('ema', () => {
  it('seeds from the SMA of the first window, then applies smoothing', () => {
    const candles = candlesFromCloses([1, 2, 3, 4, 5]);
    const points = ema(candles, 3);
    expect(points.map((p) => p.value)).toEqual([2, 3, 4]);
  });
});

describe('rsi', () => {
  it('is 100 when every bar gains', () => {
    const closes = Array.from({ length: 20 }, (_, i) => 100 + i);
    const points = rsi(candlesFromCloses(closes), 14);
    expect(points.length).toBeGreaterThan(0);
    for (const point of points) expect(point.value).toBe(100);
  });

  it('is 0 when every bar loses', () => {
    const closes = Array.from({ length: 20 }, (_, i) => 100 - i);
    const points = rsi(candlesFromCloses(closes), 14);
    expect(points.length).toBeGreaterThan(0);
    for (const point of points) expect(point.value).toBe(0);
  });
});

describe('atr', () => {
  it('produces one positive value per bar past the warmup period', () => {
    const closes = Array.from({ length: 20 }, (_, i) => 100 + i);
    const points = atr(candlesFromCloses(closes, 1), 14);
    expect(points).toHaveLength(20 - 14);
    for (const point of points) expect(point.value as number).toBeGreaterThan(0);
  });
});

describe('macd', () => {
  it('reports histogram as the difference between macd and signal', () => {
    const closes = Array.from({ length: 60 }, (_, i) => 100 + Math.sin(i / 3) * 5);
    const points = macd(candlesFromCloses(closes));
    expect(points.length).toBeGreaterThan(0);
    for (const point of points) {
      const { macd: macdValue, signal, histogram } = point.value as Record<string, number>;
      expect(histogram).toBeCloseTo(macdValue - signal, 10);
    }
  });
});

describe('vwap', () => {
  it('equals the constant typical price when price and volume never change', () => {
    const candles = candlesFromCloses([100, 100, 100, 100]);
    const points = vwap(candles);
    for (const point of points) expect(point.value).toBe(100);
  });
});
