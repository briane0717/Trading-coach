import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { CandlestickChart } from './CandlestickChart';
import { SimulatedMarketDataProvider } from '../../data-providers';
import type { MarketDataProvider } from '../../data-providers';
import type { WithMeta } from '../../normalized';

const { mockDefaultGetIntraday } = vi.hoisted(() => ({
  mockDefaultGetIntraday: vi.fn(),
}));

// CandlestickChart imports a module-level `new SimulatedMarketDataProvider()` singleton
// directly (as its default provider) rather than only via the `provider` prop, so the module
// is mocked to control/observe that default instance's getIntraday — the same pattern
// OrderForm.test.tsx uses for OrderForm's own module-level singleton.
vi.mock('../../data-providers', () => ({
  SimulatedMarketDataProvider: vi.fn().mockImplementation(() => ({
    getIntraday: mockDefaultGetIntraday,
  })),
}));

// lightweight-charts needs a real <canvas> 2D context, which jsdom doesn't provide (the
// `canvas` npm package isn't installed here, and adding it is out of scope for this task).
// This test only cares about which provider's getIntraday gets called, not chart rendering, so
// createChart/its series are stubbed out rather than exercising real canvas drawing.
vi.mock('lightweight-charts', () => {
  const series = { setData: vi.fn(), createPriceLine: vi.fn(() => ({})), removePriceLine: vi.fn() };
  const chart = {
    addSeries: vi.fn(() => series),
    panes: vi.fn(() => []),
    timeScale: vi.fn(() => ({ fitContent: vi.fn() })),
    applyOptions: vi.fn(),
    remove: vi.fn(),
  };
  return {
    createChart: vi.fn(() => chart),
    CandlestickSeries: 'candlestick',
    HistogramSeries: 'histogram',
    LineSeries: 'line',
    LineStyle: { Dashed: 2 },
  };
});

function makeIntradayResult(symbol: string): WithMeta<{
  symbol: string;
  timeframe: '1d';
  candles: { timestamp: number; open: number; high: number; low: number; close: number; volume: number }[];
}> {
  return {
    symbol,
    timeframe: '1d',
    candles: [{ timestamp: Date.now(), open: 1, high: 2, low: 0.5, close: 1.5, volume: 100 }],
    sourceType: 'simulated',
    timestamp: Date.now(),
    stale: false,
  };
}

beforeEach(() => {
  mockDefaultGetIntraday.mockReset();
  mockDefaultGetIntraday.mockImplementation(async (symbol: string) => makeIntradayResult(symbol));
  // Not cleared here: `defaultProvider` is a module-level singleton constructed once, at
  // CandlestickChart's first import, before any test (or this beforeEach) runs — clearing the
  // constructor mock would erase that one call and make the "constructed once" assertion below
  // see zero calls instead.
});

describe('CandlestickChart provider selection', () => {
  it('defaults to SimulatedMarketDataProvider when no provider prop is given', async () => {
    render(<CandlestickChart symbol="AAPL" timeframe="1d" />);

    await waitFor(() => expect(mockDefaultGetIntraday).toHaveBeenCalledWith('AAPL', '1d'));
    expect(SimulatedMarketDataProvider).toHaveBeenCalledTimes(1);
  });

  it("uses the passed-in provider's getIntraday instead of the default when one is given", async () => {
    const mockGetIntraday = vi.fn(async (symbol: string) => makeIntradayResult(symbol));
    const customProvider = { getIntraday: mockGetIntraday } as unknown as MarketDataProvider;

    render(<CandlestickChart symbol="MSFT" timeframe="1d" provider={customProvider} />);

    await waitFor(() => expect(mockGetIntraday).toHaveBeenCalledWith('MSFT', '1d'));
    expect(mockDefaultGetIntraday).not.toHaveBeenCalled();
  });
});
