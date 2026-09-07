import { afterEach, describe, expect, it, vi } from 'vitest';
import { AlpacaMarketDataProvider } from './alpaca';
import { macd, rsi, sma } from './internal/indicators';
import type { Candle } from '../normalized';

const FIXED_NOW = new Date('2024-06-17T20:00:00Z').getTime(); // aligned after-hours, arbitrary

function provider(now: number = FIXED_NOW) {
  return new AlpacaMarketDataProvider({ now: () => now });
}

// Realistic Alpaca /v2/stocks/{symbol}/snapshot?feed=iex shape.
const SNAPSHOT_FIXTURE = {
  symbol: 'AAPL',
  latestTrade: {
    t: '2024-06-17T15:59:59.123456789Z',
    x: 'V',
    p: 190.5,
    s: 100,
    c: ['@', 'T'],
    i: 12345,
    z: 'C',
  },
  latestQuote: {
    t: '2024-06-17T15:59:59.987654321Z',
    ax: 'V',
    ap: 190.55,
    as: 1,
    bx: 'V',
    bp: 190.45,
    bs: 2,
    c: ['R'],
  },
  minuteBar: {
    t: '2024-06-17T15:59:00Z',
    o: 190.4,
    h: 190.6,
    l: 190.3,
    c: 190.5,
    v: 12000,
    n: 50,
    vw: 190.45,
  },
  dailyBar: {
    t: '2024-06-17T04:00:00Z',
    o: 189.0,
    h: 191.2,
    l: 188.75,
    c: 190.5,
    v: 45123456,
    n: 250000,
    vw: 190.1,
  },
  prevDailyBar: {
    t: '2024-06-14T04:00:00Z',
    o: 187.0,
    h: 189.5,
    l: 186.2,
    c: 188.0,
    v: 50123456,
    n: 260000,
    vw: 187.9,
  },
};

function makeDailyBar(dayOffset: number, close: number) {
  const t = new Date(FIXED_NOW - dayOffset * 24 * 60 * 60 * 1000).toISOString();
  return { t, o: close - 0.5, h: close + 1, l: close - 1, c: close, v: 1_000_000 + dayOffset };
}

function makeBarsFixture(count: number) {
  // Ascending chronological order, like Alpaca returns, oldest first.
  const bars = [];
  for (let i = count - 1; i >= 0; i--) {
    bars.push(makeDailyBar(i, 100 + (count - i) * 0.1));
  }
  return { bars, symbol: 'AAPL', next_page_token: null };
}

function makeIntradayBarsFixture(count: number, intervalMs: number) {
  const bars = [];
  for (let i = count - 1; i >= 0; i--) {
    const t = new Date(FIXED_NOW - i * intervalMs).toISOString();
    const close = 100 + (count - i) * 0.05;
    bars.push({ t, o: close - 0.05, h: close + 0.1, l: close - 0.1, c: close, v: 10_000 + i });
  }
  return { bars, symbol: 'AAPL', next_page_token: null };
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

function mockFetchRouting(handlers: { snapshot?: unknown; bars?: unknown }) {
  return vi.fn(async (input: string | URL) => {
    const url = input.toString();
    if (url.includes('/snapshot')) {
      if (handlers.snapshot === undefined) throw new Error('unexpected snapshot call');
      return jsonResponse(handlers.snapshot);
    }
    if (url.includes('/bars')) {
      if (handlers.bars === undefined) throw new Error('unexpected bars call');
      return jsonResponse(handlers.bars);
    }
    throw new Error(`unexpected URL: ${url}`);
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('AlpacaMarketDataProvider.getQuote', () => {
  it('maps the snapshot response into a labeled Quote', async () => {
    const fetchMock = mockFetchRouting({ snapshot: SNAPSHOT_FIXTURE });
    vi.stubGlobal('fetch', fetchMock);

    const quote = await provider().getQuote('AAPL');

    expect(quote.symbol).toBe('AAPL');
    expect(quote.price).toBe(190.5);
    expect(quote.bid).toBe(190.45);
    expect(quote.ask).toBe(190.55);
    expect(quote.spread).toBeCloseTo(0.1, 6);
    expect(quote.volume).toBe(45123456);
    expect(quote.dayHigh).toBe(191.2);
    expect(quote.dayLow).toBe(188.75);
    expect(quote.prevClose).toBe(188.0);
    expect(quote.marketCap).toBeNull();
    expect(quote.sourceType).toBe('real-time');
    expect(quote.stale).toBe(false);
    expect(quote.timestamp).toBe(new Date(SNAPSHOT_FIXTURE.latestTrade.t).getTime());

    const calledUrl = fetchMock.mock.calls[0][0].toString();
    expect(calledUrl).toBe('/api/alpaca/v2/stocks/AAPL/snapshot?feed=iex');
  });

  it('throws with status and body on a non-200 response, without returning data', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => jsonResponse({ message: 'symbol not found' }, 404))
    );

    await expect(provider().getQuote('BADSYM')).rejects.toThrow(/404/);
    await expect(provider().getQuote('BADSYM')).rejects.toThrow(/symbol not found/);
  });
});

describe('AlpacaMarketDataProvider.getIntraday', () => {
  it("maps daily bars and labels '1d' as historical", async () => {
    const fixture = makeBarsFixture(30);
    vi.stubGlobal('fetch', mockFetchRouting({ bars: fixture }));

    const { candles, timeframe, sourceType } = await provider().getIntraday('AAPL', '1d');

    expect(timeframe).toBe('1d');
    expect(sourceType).toBe('historical');
    expect(candles).toHaveLength(30);
    expect(candles[0].timestamp).toBeLessThan(candles[candles.length - 1].timestamp);
    expect(candles[0]).toEqual({
      timestamp: new Date(fixture.bars[0].t).getTime(),
      open: fixture.bars[0].o,
      high: fixture.bars[0].h,
      low: fixture.bars[0].l,
      close: fixture.bars[0].c,
      volume: fixture.bars[0].v,
    });
  });

  it("labels sub-day timeframes as real-time and requests the mapped Alpaca timeframe", async () => {
    const fixture = makeIntradayBarsFixture(78, 5 * 60_000);
    const fetchMock = mockFetchRouting({ bars: fixture });
    vi.stubGlobal('fetch', fetchMock);

    const { candles, sourceType } = await provider().getIntraday('AAPL', '5m');

    expect(sourceType).toBe('real-time');
    expect(candles).toHaveLength(78);

    const calledUrl = fetchMock.mock.calls[0][0].toString();
    expect(calledUrl).toContain('timeframe=5Min');
  });

  it('slices to the most recent N bars when more are returned than needed', async () => {
    const fixture = makeIntradayBarsFixture(200, 15 * 60_000); // more than the 26 needed for '15m'
    vi.stubGlobal('fetch', mockFetchRouting({ bars: fixture }));

    const { candles } = await provider().getIntraday('AAPL', '15m');

    expect(candles).toHaveLength(26);
    // Should be the most recent 26, i.e. the tail of the fixture.
    expect(candles[candles.length - 1].close).toBe(fixture.bars[fixture.bars.length - 1].c);
  });
});

describe('AlpacaMarketDataProvider.getHistorical', () => {
  it.each([
    ['1D', 1],
    ['5D', 5],
    ['1M', 21],
    ['1Y', 252],
  ] as const)('returns %s of daily bars for range %s, labeled historical', async (range, expectedCount) => {
    const fixture = makeBarsFixture(expectedCount);
    const fetchMock = mockFetchRouting({ bars: fixture });
    vi.stubGlobal('fetch', fetchMock);

    const { candles, sourceType } = await provider().getHistorical('AAPL', range);

    expect(sourceType).toBe('historical');
    expect(candles).toHaveLength(expectedCount);

    const calledUrl = fetchMock.mock.calls[0][0].toString();
    expect(calledUrl).toContain('timeframe=1Day');
  });

  it('throws rather than returning data on a non-200 proxy response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => jsonResponse({ error: 'rate limit exceeded' }, 429))
    );

    await expect(provider().getHistorical('AAPL', '1M')).rejects.toThrow(/429/);
  });
});

describe('AlpacaMarketDataProvider.getIndicators', () => {
  it('produces the same output as calling the shared indicator functions directly', async () => {
    const fixture = makeBarsFixture(300);
    vi.stubGlobal('fetch', mockFetchRouting({ bars: fixture }));

    const { indicators, sourceType } = await provider().getIndicators('AAPL', [
      { name: 'SMA', period: 10 },
      { name: 'RSI' },
      { name: 'MACD' },
    ]);

    expect(sourceType).toBe('historical');

    const expectedCandles: Candle[] = fixture.bars.map((bar) => ({
      timestamp: new Date(bar.t).getTime(),
      open: bar.o,
      high: bar.h,
      low: bar.l,
      close: bar.c,
      volume: bar.v,
    }));

    const smaResult = indicators.find((i) => i.name === 'SMA')!;
    expect(smaResult.points).toEqual(sma(expectedCandles, 10));

    const rsiResult = indicators.find((i) => i.name === 'RSI')!;
    expect(rsiResult.period).toBe(14);
    expect(rsiResult.points).toEqual(rsi(expectedCandles, 14));

    const macdResult = indicators.find((i) => i.name === 'MACD')!;
    expect(macdResult.points).toEqual(macd(expectedCandles));
  });

  it('looks back far enough for 300 bars even when no indicator needs that many', async () => {
    const fixture = makeBarsFixture(300);
    const fetchMock = mockFetchRouting({ bars: fixture });
    vi.stubGlobal('fetch', fetchMock);

    await provider().getIndicators('AAPL', [{ name: 'SMA', period: 5 }]);

    const calledUrl = new URL(
      fetchMock.mock.calls[0][0].toString(),
      'http://localhost'
    );
    const startMs = new Date(calledUrl.searchParams.get('start')!).getTime();
    const calendarDaysBack = (FIXED_NOW - startMs) / (24 * 60 * 60 * 1000);

    // period 5 alone would only need ~55 bars of lookback; getIndicators floors at 300.
    expect(calendarDaysBack).toBeGreaterThan(300 * 1.6);
  });

  it('throws rather than returning data on a non-200 proxy response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => jsonResponse({ message: 'internal error' }, 500))
    );

    await expect(provider().getIndicators('AAPL', [{ name: 'SMA' }])).rejects.toThrow(/500/);
  });
});
