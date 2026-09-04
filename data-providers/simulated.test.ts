import { describe, expect, it } from 'vitest';
import { SimulatedMarketDataProvider } from './simulated';

const FIXED_NOW = new Date('2024-06-17T15:00:00Z').getTime(); // aligned mid-day, arbitrary

function provider(now: number = FIXED_NOW) {
  return new SimulatedMarketDataProvider({ now: () => now });
}

describe('SimulatedMarketDataProvider.getQuote', () => {
  it('returns a plausible, labeled quote', async () => {
    const quote = await provider().getQuote('AAPL');

    expect(quote.symbol).toBe('AAPL');
    expect(quote.sourceType).toBe('simulated');
    expect(quote.stale).toBe(false);
    expect(quote.timestamp).toBe(FIXED_NOW);

    expect(quote.price).toBeGreaterThan(0);
    expect(quote.bid).toBeLessThanOrEqual(quote.price);
    expect(quote.ask).toBeGreaterThanOrEqual(quote.price);
    expect(quote.spread).toBeCloseTo(quote.ask - quote.bid, 6);
    expect(quote.dayLow).toBeLessThanOrEqual(quote.price);
    expect(quote.dayHigh).toBeGreaterThanOrEqual(quote.price);
    expect(quote.volume).toBeGreaterThan(0);
    expect(quote.marketCap).toBeGreaterThan(0);
    expect(quote.prevClose).toBeGreaterThan(0);
  });

  it('is deterministic for a fixed clock and symbol', async () => {
    const a = await provider().getQuote('MSFT');
    const b = await provider().getQuote('MSFT');
    expect(a).toEqual(b);
  });

  it('gives different symbols different price levels', async () => {
    const a = await provider().getQuote('AAA');
    const b = await provider().getQuote('ZZZ');
    expect(a.price).not.toBe(b.price);
  });
});

describe('SimulatedMarketDataProvider.getIntraday', () => {
  it('returns one bar per interval, in order, with valid OHLC', async () => {
    const { candles, timeframe, sourceType } = await provider().getIntraday('TSLA', '5m');

    expect(timeframe).toBe('5m');
    expect(sourceType).toBe('simulated');
    expect(candles).toHaveLength(78);

    for (let i = 0; i < candles.length; i++) {
      const c = candles[i];
      expect(c.high).toBeGreaterThanOrEqual(Math.max(c.open, c.close));
      expect(c.low).toBeLessThanOrEqual(Math.min(c.open, c.close));
      expect(c.volume).toBeGreaterThan(0);
      if (i > 0) expect(c.timestamp - candles[i - 1].timestamp).toBe(5 * 60_000);
    }
  });

  it("anchors its first bar's open to the daily walk's close from the day before, not basePrice", async () => {
    const p = provider();
    const symbol = 'INTRADAY-ANCHOR';

    const daily = await p.getHistorical(symbol, '5D');
    const priorDayClose = daily.candles[daily.candles.length - 2].close;

    const intraday = await p.getIntraday(symbol, '5m');
    expect(intraday.candles[0].open).toBe(priorDayClose);
  });
});

describe('SimulatedMarketDataProvider.getHistorical', () => {
  it.each([
    ['1D', 1],
    ['5D', 5],
    ['1M', 21],
    ['1Y', 252],
  ] as const)('returns %s of daily bars for range %s', async (range, expectedCount) => {
    const { candles } = await provider().getHistorical('NVDA', range);
    expect(candles).toHaveLength(expectedCount);
  });
});

describe('SimulatedMarketDataProvider cross-method consistency', () => {
  it('returns an identical bar for the same day regardless of window size or method', async () => {
    const p = provider();
    const symbol = 'CONSIST';

    const fiveDay = await p.getHistorical(symbol, '5D');
    const oneMonth = await p.getHistorical(symbol, '1M');
    const oneYear = await p.getHistorical(symbol, '1Y');

    const todayFrom5D = fiveDay.candles[fiveDay.candles.length - 1];
    const todayFrom1M = oneMonth.candles[oneMonth.candles.length - 1];
    const todayFrom1Y = oneYear.candles[oneYear.candles.length - 1];

    // Same calendar day, pulled from three differently-sized windows: must be byte-identical.
    expect(todayFrom1M).toEqual(todayFrom5D);
    expect(todayFrom1Y).toEqual(todayFrom5D);

    // getQuote and getIndicators slice the same underlying daily series; today's bar should
    // agree with what getHistorical returned for the same day.
    const quote = await p.getQuote(symbol);
    expect(quote.price).toBe(todayFrom5D.close);
    expect(quote.dayHigh).toBe(todayFrom5D.high);
    expect(quote.dayLow).toBe(todayFrom5D.low);
    expect(quote.volume).toBe(todayFrom5D.volume);

    const yesterdayFrom5D = fiveDay.candles[fiveDay.candles.length - 2];
    expect(quote.prevClose).toBe(yesterdayFrom5D.close);

    // getIntraday('1d') is also a DAY_MS-interval window and should agree too.
    const dailyIntraday = await p.getIntraday(symbol, '1d');
    const todayFromIntraday = dailyIntraday.candles[dailyIntraday.candles.length - 1];
    expect(todayFromIntraday).toEqual(todayFrom5D);
  });
});

describe('SimulatedMarketDataProvider.getIndicators', () => {
  it('computes the requested indicators with matching metadata', async () => {
    const { indicators, sourceType } = await provider().getIndicators('SPY', [
      { name: 'SMA', period: 10 },
      { name: 'RSI' },
      { name: 'MACD' },
      { name: 'VWAP' },
    ]);

    expect(sourceType).toBe('simulated');
    expect(indicators).toHaveLength(4);

    const sma = indicators.find((i) => i.name === 'SMA')!;
    expect(sma.period).toBe(10);
    expect(sma.points.length).toBeGreaterThan(0);

    const rsi = indicators.find((i) => i.name === 'RSI')!;
    expect(rsi.period).toBe(14); // default period applied
    expect(rsi.points.length).toBeGreaterThan(0);

    const macd = indicators.find((i) => i.name === 'MACD')!;
    expect(macd.points.length).toBeGreaterThan(0);

    const vwap = indicators.find((i) => i.name === 'VWAP')!;
    expect(vwap.points.length).toBeGreaterThan(0);
  });
});
