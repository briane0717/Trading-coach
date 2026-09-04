import type {
  Candle,
  HistoricalRange,
  IndicatorRequest,
  IndicatorResult,
  Quote,
  Timeframe,
  WithMeta,
} from '../normalized';
import type { MarketDataProvider } from './interface';
import { gaussian, hashString, mulberry32 } from './internal/rng';
import { atr, ema, macd, rsi, sma, vwap } from './internal/indicators';

const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

const INTRADAY_PARAMS: Record<Timeframe, { intervalMs: number; count: number }> = {
  '1m': { intervalMs: MINUTE_MS, count: 390 }, // one 6.5h trading session
  '5m': { intervalMs: 5 * MINUTE_MS, count: 78 },
  '15m': { intervalMs: 15 * MINUTE_MS, count: 26 },
  '1h': { intervalMs: HOUR_MS, count: 7 },
  '1d': { intervalMs: DAY_MS, count: 30 },
};

const RANGE_DAYS: Record<HistoricalRange, number> = {
  '1D': 1,
  '5D': 5,
  '1M': 21,
  '3M': 63,
  '6M': 126,
  '1Y': 252,
  '5Y': 1260,
};

const DEFAULT_INDICATOR_PERIOD: Partial<Record<IndicatorRequest['name'], number>> = {
  SMA: 20,
  EMA: 20,
  RSI: 14,
  ATR: 14,
};

function alignDown(ms: number, interval: number): number {
  return Math.floor(ms / interval) * interval;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function seededFraction(key: string): number {
  return mulberry32(hashString(key))();
}

/**
 * Generates plausible OHLC/quote data with no vendor account or API key required. Series are
 * deterministic per (symbol, interval, window) so the same query reproduces the same bars,
 * while different windows (e.g. calling again a minute later) extend the walk realistically.
 *
 * Daily bars (used by getQuote, getHistorical, getIndicators, and getIntraday('1d')) are one
 * continuous per-symbol walk anchored at the Unix epoch: each day's bar is seeded only by
 * (symbol, absolute day index), never by how many bars or what start time the caller asked
 * for. Any window is a slice of that same history, so the same calendar day always returns an
 * identical bar no matter which method or window pulled it — see simulated.test.ts's
 * "cross-method consistency" test. Sub-day intraday timeframes (1m/5m/15m/1h) still use a
 * window-seeded walk; their bar counts are fixed per timeframe rather than caller-supplied, so
 * they aren't subject to the inconsistency this fixes.
 *
 * Every response is tagged `sourceType: 'simulated'` — see CLAUDE.md: simulated data must
 * never render without that label.
 */
export class SimulatedMarketDataProvider implements MarketDataProvider {
  private readonly now: () => number;

  constructor(options: { now?: () => number } = {}) {
    this.now = options.now ?? (() => Date.now());
  }

  private basePrice(symbol: string): number {
    return 5 + seededFraction(`base:${symbol}`) * 495; // $5 - $500
  }

  private volatility(symbol: string): number {
    return 0.005 + seededFraction(`vol:${symbol}`) * 0.03; // 0.5% - 3.5% per bar
  }

  private baseVolume(symbol: string): number {
    return 100_000 + seededFraction(`volu:${symbol}`) * 4_900_000;
  }

  private sharesOutstanding(symbol: string): number {
    return 50_000_000 + seededFraction(`shares:${symbol}`) * 4_950_000_000;
  }

  private spreadFactor(symbol: string): number {
    return 0.0003 + seededFraction(`spread:${symbol}`) * 0.0017; // 0.03% - 0.2%
  }

  private generateCandles(
    symbol: string,
    count: number,
    intervalMs: number,
    endTime: number
  ): Candle[] {
    const startTime = endTime - (count - 1) * intervalMs;
    const rand = mulberry32(hashString(`${symbol}:${intervalMs}:${startTime}:${count}`));
    const volatility = this.volatility(symbol);
    const baseVolume = this.baseVolume(symbol);

    const candles: Candle[] = [];
    let prevClose = this.basePrice(symbol);
    for (let i = 0; i < count; i++) {
      const timestamp = startTime + i * intervalMs;
      const open = prevClose;
      const drift = 0.0001;
      const change = open * (drift + gaussian(rand) * volatility);
      const close = Math.max(0.01, open + change);
      const wick = Math.abs(gaussian(rand)) * volatility * open * 0.5;
      const high = Math.max(open, close) + wick;
      const low = Math.max(0.01, Math.min(open, close) - wick);
      const volume = Math.round(baseVolume * (0.4 + rand() * 1.2));

      candles.push({
        timestamp,
        open: round2(open),
        high: round2(high),
        low: round2(low),
        close: round2(close),
        volume,
      });
      prevClose = close;
    }
    return candles;
  }

  /**
   * The canonical daily walk for `symbol`, from day index 0 (the Unix epoch) through
   * `throughDayIndex` inclusive. Each day's noise is seeded by `(symbol, dayIndex)` alone —
   * never by count or start time — so a given day index always produces the same bar
   * regardless of how large a window the caller asked for. `open` still chains from the prior
   * day's `close`, which is what makes this one continuous series rather than independent
   * per-day values.
   */
  private generateDailySeries(symbol: string, throughDayIndex: number): Candle[] {
    const volatility = this.volatility(symbol);
    const baseVolume = this.baseVolume(symbol);

    const candles: Candle[] = [];
    let prevClose = this.basePrice(symbol);
    for (let dayIndex = 0; dayIndex <= throughDayIndex; dayIndex++) {
      const rand = mulberry32(hashString(`${symbol}:day:${dayIndex}`));
      const timestamp = dayIndex * DAY_MS;
      const open = prevClose;
      const drift = 0.0001;
      const change = open * (drift + gaussian(rand) * volatility);
      const close = Math.max(0.01, open + change);
      const wick = Math.abs(gaussian(rand)) * volatility * open * 0.5;
      const high = Math.max(open, close) + wick;
      const low = Math.max(0.01, Math.min(open, close) - wick);
      const volume = Math.round(baseVolume * (0.4 + rand() * 1.2));

      candles.push({
        timestamp,
        open: round2(open),
        high: round2(high),
        low: round2(low),
        close: round2(close),
        volume,
      });
      prevClose = close;
    }
    return candles;
  }

  /** The last `count` daily bars ending at `endTime`, sliced from the one continuous series. */
  private dailyCandles(symbol: string, endTime: number, count: number): Candle[] {
    const dayIndex = Math.round(alignDown(endTime, DAY_MS) / DAY_MS);
    const series = this.generateDailySeries(symbol, dayIndex);
    return series.slice(-count);
  }

  async getQuote(symbol: string): Promise<WithMeta<Quote>> {
    const now = this.now();
    const endTime = alignDown(now, DAY_MS);
    const [prevDay, today] = this.dailyCandles(symbol, endTime, 2);
    const price = today.close;
    const rawSpread = price * this.spreadFactor(symbol);
    const bid = round2(price - rawSpread / 2);
    const ask = round2(price + rawSpread / 2);

    return {
      symbol,
      price,
      bid,
      ask,
      spread: round2(ask - bid),
      volume: today.volume,
      marketCap: Math.round(price * this.sharesOutstanding(symbol)),
      dayHigh: today.high,
      dayLow: today.low,
      prevClose: prevDay.close,
      sourceType: 'simulated',
      timestamp: now,
      stale: false,
    };
  }

  async getIntraday(
    symbol: string,
    timeframe: Timeframe
  ): Promise<WithMeta<{ symbol: string; timeframe: Timeframe; candles: Candle[] }>> {
    const now = this.now();
    const { intervalMs, count } = INTRADAY_PARAMS[timeframe];
    const endTime = alignDown(now, intervalMs);
    const candles =
      intervalMs === DAY_MS
        ? this.dailyCandles(symbol, endTime, count)
        : this.generateCandles(symbol, count, intervalMs, endTime);

    return { symbol, timeframe, candles, sourceType: 'simulated', timestamp: now, stale: false };
  }

  async getHistorical(
    symbol: string,
    range: HistoricalRange
  ): Promise<WithMeta<{ symbol: string; range: HistoricalRange; candles: Candle[] }>> {
    const now = this.now();
    const endTime = alignDown(now, DAY_MS);
    const candles = this.dailyCandles(symbol, endTime, RANGE_DAYS[range]);

    return { symbol, range, candles, sourceType: 'simulated', timestamp: now, stale: false };
  }

  async getIndicators(
    symbol: string,
    list: IndicatorRequest[]
  ): Promise<WithMeta<{ symbol: string; indicators: IndicatorResult[] }>> {
    const now = this.now();
    const endTime = alignDown(now, DAY_MS);
    const neededBars = list.map(
      (req) => (req.period ?? DEFAULT_INDICATOR_PERIOD[req.name] ?? 20) + 50
    );
    const barCount = Math.max(300, ...neededBars);
    const candles = this.dailyCandles(symbol, endTime, barCount);

    const indicators: IndicatorResult[] = list.map((req) => {
      switch (req.name) {
        case 'SMA': {
          const period = req.period ?? DEFAULT_INDICATOR_PERIOD.SMA!;
          return { name: 'SMA', period, points: sma(candles, period) };
        }
        case 'EMA': {
          const period = req.period ?? DEFAULT_INDICATOR_PERIOD.EMA!;
          return { name: 'EMA', period, points: ema(candles, period) };
        }
        case 'RSI': {
          const period = req.period ?? DEFAULT_INDICATOR_PERIOD.RSI!;
          return { name: 'RSI', period, points: rsi(candles, period) };
        }
        case 'ATR': {
          const period = req.period ?? DEFAULT_INDICATOR_PERIOD.ATR!;
          return { name: 'ATR', period, points: atr(candles, period) };
        }
        case 'MACD':
          return { name: 'MACD', points: macd(candles) };
        case 'VWAP':
          return { name: 'VWAP', points: vwap(candles) };
        default: {
          const exhaustive: never = req.name;
          throw new Error(`Unsupported indicator: ${exhaustive}`);
        }
      }
    });

    return { symbol, indicators, sourceType: 'simulated', timestamp: now, stale: false };
  }
}
