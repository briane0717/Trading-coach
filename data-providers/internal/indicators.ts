// Minimal indicator math used only to let the simulated adapter satisfy the
// MarketDataProvider#getIndicators contract on its own generated OHLC data.
//
// This is intentionally self-contained rather than a shared /services/ indicator layer —
// that dedicated layer is Phase 3 (see ARCHITECTURE.md build order) and works identically
// on simulated or real data since it only depends on this same Candle shape.

import type { Candle, IndicatorPoint } from '../../normalized';

export function sma(candles: Candle[], period: number): IndicatorPoint[] {
  const points: IndicatorPoint[] = [];
  for (let i = period - 1; i < candles.length; i++) {
    let sum = 0;
    for (let j = i - period + 1; j <= i; j++) sum += candles[j].close;
    points.push({ timestamp: candles[i].timestamp, value: sum / period });
  }
  return points;
}

export function ema(candles: Candle[], period: number): IndicatorPoint[] {
  if (candles.length < period) return [];
  const k = 2 / (period + 1);
  let prev = candles.slice(0, period).reduce((s, c) => s + c.close, 0) / period;
  const points: IndicatorPoint[] = [{ timestamp: candles[period - 1].timestamp, value: prev }];
  for (let i = period; i < candles.length; i++) {
    prev = candles[i].close * k + prev * (1 - k);
    points.push({ timestamp: candles[i].timestamp, value: prev });
  }
  return points;
}

function emaSeries(values: number[], period: number): number[] {
  if (values.length < period) return [];
  const k = 2 / (period + 1);
  let prev = values.slice(0, period).reduce((s, v) => s + v, 0) / period;
  const out = [prev];
  for (let i = period; i < values.length; i++) {
    prev = values[i] * k + prev * (1 - k);
    out.push(prev);
  }
  return out;
}

export function rsi(candles: Candle[], period = 14): IndicatorPoint[] {
  if (candles.length <= period) return [];
  const points: IndicatorPoint[] = [];
  let gainSum = 0;
  let lossSum = 0;
  for (let i = 1; i <= period; i++) {
    const change = candles[i].close - candles[i - 1].close;
    if (change >= 0) gainSum += change;
    else lossSum -= change;
  }
  let avgGain = gainSum / period;
  let avgLoss = lossSum / period;
  const rsiFromAvg = (g: number, l: number) => (l === 0 ? 100 : 100 - 100 / (1 + g / l));
  points.push({ timestamp: candles[period].timestamp, value: rsiFromAvg(avgGain, avgLoss) });

  for (let i = period + 1; i < candles.length; i++) {
    const change = candles[i].close - candles[i - 1].close;
    const gain = change > 0 ? change : 0;
    const loss = change < 0 ? -change : 0;
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
    points.push({ timestamp: candles[i].timestamp, value: rsiFromAvg(avgGain, avgLoss) });
  }
  return points;
}

export function macd(
  candles: Candle[],
  fast = 12,
  slow = 26,
  signalPeriod = 9
): IndicatorPoint[] {
  if (candles.length < slow + signalPeriod) return [];
  const closes = candles.map((c) => c.close);
  const fastEma = emaSeries(closes, fast);
  const slowEma = emaSeries(closes, slow);
  const offset = slow - fast;
  const macdLine: number[] = [];
  for (let i = 0; i < slowEma.length; i++) {
    macdLine.push(fastEma[i + offset] - slowEma[i]);
  }
  const signalLine = emaSeries(macdLine, signalPeriod);
  const signalOffset = signalPeriod - 1;
  const candleOffset = slow - 1;

  const points: IndicatorPoint[] = [];
  for (let i = 0; i < signalLine.length; i++) {
    const macdIndex = i + signalOffset;
    const candleIndex = candleOffset + macdIndex;
    const macdValue = macdLine[macdIndex];
    const signalValue = signalLine[i];
    points.push({
      timestamp: candles[candleIndex].timestamp,
      value: { macd: macdValue, signal: signalValue, histogram: macdValue - signalValue },
    });
  }
  return points;
}

export function atr(candles: Candle[], period = 14): IndicatorPoint[] {
  if (candles.length <= period) return [];
  const trueRanges: number[] = [];
  for (let i = 1; i < candles.length; i++) {
    const { high, low } = candles[i];
    const prevClose = candles[i - 1].close;
    trueRanges.push(Math.max(high - low, Math.abs(high - prevClose), Math.abs(low - prevClose)));
  }
  const points: IndicatorPoint[] = [];
  let prevAtr = trueRanges.slice(0, period).reduce((s, v) => s + v, 0) / period;
  points.push({ timestamp: candles[period].timestamp, value: prevAtr });
  for (let i = period; i < trueRanges.length; i++) {
    prevAtr = (prevAtr * (period - 1) + trueRanges[i]) / period;
    points.push({ timestamp: candles[i + 1].timestamp, value: prevAtr });
  }
  return points;
}

export function vwap(candles: Candle[]): IndicatorPoint[] {
  const points: IndicatorPoint[] = [];
  let cumulativePV = 0;
  let cumulativeVolume = 0;
  for (const candle of candles) {
    const typicalPrice = (candle.high + candle.low + candle.close) / 3;
    cumulativePV += typicalPrice * candle.volume;
    cumulativeVolume += candle.volume;
    points.push({
      timestamp: candle.timestamp,
      value: cumulativeVolume === 0 ? typicalPrice : cumulativePV / cumulativeVolume,
    });
  }
  return points;
}
