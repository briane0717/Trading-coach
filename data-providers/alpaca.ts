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
import { atr, ema, macd, rsi, sma, vwap } from './internal/indicators';

const DAY_MS = 24 * 60 * 60 * 1000;

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
      sourceType: 'real-time',
      timestamp: new Date(latestTrade.t).getTime(),
      stale: false,
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
