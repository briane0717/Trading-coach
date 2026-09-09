import type {
  Candle,
  HistoricalRange,
  IndicatorRequest,
  IndicatorResult,
  Quote,
  SourceType,
  Timeframe,
  WithMeta,
} from '../normalized';
import type { MarketDataProvider } from './interface';
import { atr, ema, macd, rsi, sma, vwap } from './internal/indicators';

const DAY_MS = 24 * 60 * 60 * 1000;

const REGULAR_MARKET_OPEN_MINUTES = 9 * 60 + 30; // 9:30am ET
const REGULAR_MARKET_CLOSE_MINUTES = 16 * 60; // 4:00pm ET
const QUOTE_STALE_THRESHOLD_MS = 15 * 60_000; // >15min old during a live session is stale

const NY_WEEKDAY_INDEX: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

// Wall-clock weekday + minutes-since-midnight in America/New_York for the given instant, via
// Intl's bundled IANA tz data — this handles EST/EDT transitions correctly without a
// market-calendar library. US market holidays are NOT accounted for (approximate is fine here);
// a holiday will be misread as a regular weekday session.
function newYorkTimeParts(epochMs: number): { weekday: number; minutesSinceMidnight: number } {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    weekday: 'short',
    hour: 'numeric',
    minute: 'numeric',
    hourCycle: 'h23',
  }).formatToParts(new Date(epochMs));
  const get = (type: string) => parts.find((p) => p.type === type)!.value;
  return {
    weekday: NY_WEEKDAY_INDEX[get('weekday')],
    minutesSinceMidnight: Number(get('hour')) * 60 + Number(get('minute')),
  };
}

// en-CA formats as YYYY-MM-DD, a convenient string key for "same New York calendar date".
function newYorkDateKey(epochMs: number): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York' }).format(
    new Date(epochMs)
  );
}

function isRegularMarketHours(epochMs: number): boolean {
  const { weekday, minutesSinceMidnight } = newYorkTimeParts(epochMs);
  if (weekday === 0 || weekday === 6) return false;
  return (
    minutesSinceMidnight >= REGULAR_MARKET_OPEN_MINUTES &&
    minutesSinceMidnight < REGULAR_MARKET_CLOSE_MINUTES
  );
}

// A "real-time" quote is only trustworthy as real-time when: the market is open right now, the
// trade happened in today's (NY) session rather than a prior one, and it's fresh enough (<=15min)
// that a live feed should still be showing it.
function quoteStaleness(tradeTimestampMs: number, nowMs: number): { sourceType: SourceType; stale: boolean } {
  const stale =
    !isRegularMarketHours(nowMs) ||
    newYorkDateKey(tradeTimestampMs) !== newYorkDateKey(nowMs) ||
    nowMs - tradeTimestampMs > QUOTE_STALE_THRESHOLD_MS;
  return stale ? { sourceType: 'delayed', stale: true } : { sourceType: 'real-time', stale: false };
}

const ALPACA_TIMEFRAME: Record<Timeframe, string> = {
  '1m': '1Min',
  '5m': '5Min',
  '15m': '15Min',
  '1h': '1Hour',
  '1d': '1Day',
};

// Mirrors SimulatedMarketDataProvider's INTRADAY_PARAMS counts (one trading session's worth of
// bars for sub-day timeframes, 30 daily bars for '1d') so both providers return comparably
// sized windows for the same request.
const INTRADAY_BAR_COUNTS: Record<Timeframe, number> = {
  '1m': 390,
  '5m': 78,
  '15m': 26,
  '1h': 7,
  '1d': 30,
};

// Mirrors SimulatedMarketDataProvider's RANGE_DAYS (trading-day counts, not calendar days).
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

// A trading day is only ~5/7 of a calendar day; pad generously for weekends/holidays so a
// single request's [start, end] window always contains at least the trading days we need —
// we then slice the most recent N bars from whatever comes back, same as
// SimulatedMarketDataProvider.dailyCandles does with its in-memory series.
function calendarDaysForTradingDays(tradingDays: number): number {
  return Math.ceil(tradingDays * 1.6) + 10;
}

// Sub-day timeframes only ever need "the most recent session's worth of bars" — a week of
// calendar lookback comfortably covers a long weekend plus a holiday.
const INTRADAY_LOOKBACK_CALENDAR_DAYS = 7;

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

interface AlpacaBar {
  t: string;
  o: number;
  h: number;
  l: number;
  c: number;
  v: number;
}

interface AlpacaBarsResponse {
  bars: AlpacaBar[] | null;
  symbol: string;
  next_page_token: string | null;
}

interface AlpacaTrade {
  t: string;
  p: number;
}

interface AlpacaQuote {
  t: string;
  bp: number;
  ap: number;
}

interface AlpacaSnapshot {
  symbol: string;
  latestTrade: AlpacaTrade;
  latestQuote: AlpacaQuote;
  dailyBar: AlpacaBar;
  prevDailyBar: AlpacaBar;
}

function toCandle(bar: AlpacaBar): Candle {
  return {
    timestamp: new Date(bar.t).getTime(),
    open: bar.o,
    high: bar.h,
    low: bar.l,
    close: bar.c,
    volume: bar.v,
  };
}

/**
 * Real-market equivalent of SimulatedMarketDataProvider, backed by Alpaca Market Data's IEX
 * feed via the dev-only same-origin proxy (see vite-plugins/alpacaProxy.ts) — never a vendor
 * SDK, and never a direct cross-origin call, so Alpaca credentials stay server-side only (see
 * CLAUDE.md: never store brokerage/vendor credentials in client code).
 *
 * Not wired into any provider-selection logic or the UI yet — that's a separate, later step.
 */
export class AlpacaMarketDataProvider implements MarketDataProvider {
  private readonly now: () => number;

  constructor(options: { now?: () => number } = {}) {
    this.now = options.now ?? (() => Date.now());
  }

  private async fetchJson<T>(url: string): Promise<T> {
    const res = await fetch(url);
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(
        `Alpaca request to ${url} failed with status ${res.status}${body ? `: ${body}` : ''}`
      );
    }
    return res.json() as Promise<T>;
  }

  private async fetchBars(
    symbol: string,
    alpacaTimeframe: string,
    calendarLookbackDays: number,
    count: number
  ): Promise<Candle[]> {
    const end = this.now();
    const start = end - calendarLookbackDays * DAY_MS;
    const params = new URLSearchParams({
      timeframe: alpacaTimeframe,
      start: new Date(start).toISOString(),
      end: new Date(end).toISOString(),
      limit: '10000',
      feed: 'iex',
    });

    const data = await this.fetchJson<AlpacaBarsResponse>(
      `/api/alpaca/v2/stocks/${encodeURIComponent(symbol)}/bars?${params.toString()}`
    );
    const candles = (data.bars ?? []).map(toCandle);
    return candles.slice(-count);
  }

  async getQuote(symbol: string): Promise<WithMeta<Quote>> {
    const snapshot = await this.fetchJson<AlpacaSnapshot>(
      `/api/alpaca/v2/stocks/${encodeURIComponent(symbol)}/snapshot?feed=iex`
    );
    const { latestTrade, latestQuote, dailyBar, prevDailyBar } = snapshot;
    const bid = latestQuote.bp;
    const ask = latestQuote.ap;
    const tradeTimestamp = new Date(latestTrade.t).getTime();
    const { sourceType, stale } = quoteStaleness(tradeTimestamp, this.now());

    return {
      symbol,
      price: latestTrade.p,
      bid,
      ask,
      spread: round2(ask - bid),
      volume: dailyBar.v,
      marketCap: null,
      dayHigh: dailyBar.h,
      dayLow: dailyBar.l,
      prevClose: prevDailyBar.c,
      sourceType,
      timestamp: tradeTimestamp,
      stale,
    };
  }

  async getIntraday(
    symbol: string,
    timeframe: Timeframe
  ): Promise<WithMeta<{ symbol: string; timeframe: Timeframe; candles: Candle[] }>> {
    const count = INTRADAY_BAR_COUNTS[timeframe];
    const lookbackDays =
      timeframe === '1d' ? calendarDaysForTradingDays(count) : INTRADAY_LOOKBACK_CALENDAR_DAYS;
    const candles = await this.fetchBars(symbol, ALPACA_TIMEFRAME[timeframe], lookbackDays, count);

    return {
      symbol,
      timeframe,
      candles,
      sourceType: timeframe === '1d' ? 'historical' : 'real-time',
      timestamp: this.now(),
      stale: false,
    };
  }

  async getHistorical(
    symbol: string,
    range: HistoricalRange
  ): Promise<WithMeta<{ symbol: string; range: HistoricalRange; candles: Candle[] }>> {
    const tradingDays = RANGE_DAYS[range];
    const candles = await this.fetchBars(
      symbol,
      ALPACA_TIMEFRAME['1d'],
      calendarDaysForTradingDays(tradingDays),
      tradingDays
    );

    return { symbol, range, candles, sourceType: 'historical', timestamp: this.now(), stale: false };
  }

  async getIndicators(
    symbol: string,
    list: IndicatorRequest[]
  ): Promise<WithMeta<{ symbol: string; indicators: IndicatorResult[] }>> {
    const neededBars = list.map(
      (req) => (req.period ?? DEFAULT_INDICATOR_PERIOD[req.name] ?? 20) + 50
    );
    const barCount = Math.max(300, ...neededBars);
    const candles = await this.fetchBars(
      symbol,
      ALPACA_TIMEFRAME['1d'],
      calendarDaysForTradingDays(barCount),
      barCount
    );

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

    return { symbol, indicators, sourceType: 'historical', timestamp: this.now(), stale: false };
  }
}
