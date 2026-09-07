import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { PaperTradingDashboard } from './PaperTradingDashboard';
import { CandlestickChart } from '../education/CandlestickChart';
import { AlpacaMarketDataProvider, SimulatedMarketDataProvider } from '../../data-providers';
import { createAccount, saveAccount } from '../../trading-engine';
import type { Account } from '../../trading-engine';
import type { IndicatorResult, Quote, SourceType, WithMeta } from '../../normalized';

// Both providers are mocked (not just Simulated) so this test is unaffected by whichever one
// VITE_MARKET_DATA_PROVIDER actually resolves to in a given environment — see OrderForm.test.tsx
// for the same pattern.
const { mockGetQuote, mockAlpacaGetQuote, mockGetIndicators, mockAlpacaGetIndicators } = vi.hoisted(() => ({
  mockGetQuote: vi.fn(),
  mockAlpacaGetQuote: vi.fn(),
  mockGetIndicators: vi.fn(),
  mockAlpacaGetIndicators: vi.fn(),
}));

vi.mock('../../data-providers', () => ({
  SimulatedMarketDataProvider: vi
    .fn()
    .mockImplementation(() => ({ getQuote: mockGetQuote, getIndicators: mockGetIndicators })),
  AlpacaMarketDataProvider: vi
    .fn()
    .mockImplementation(() => ({ getQuote: mockAlpacaGetQuote, getIndicators: mockAlpacaGetIndicators })),
}));

type MockChartProps = {
  symbol: string;
  timeframe: string;
  overlayLines?: { label: string; color: string; points: { timestamp: number; value: number }[] }[];
  oscillatorPane?: {
    label: string;
    color: string;
    points: { timestamp: number; value: number }[];
    referenceLines?: { value: number; label: string; color?: string }[];
  };
  macdPane?: {
    macdLine: { label: string; color: string; points: { timestamp: number; value: number }[] };
    signalLine: { label: string; color: string; points: { timestamp: number; value: number }[] };
    histogram: {
      points: { timestamp: number; value: number }[];
      positiveColor?: string;
      negativeColor?: string;
    };
  };
};

// CandlestickChart renders via lightweight-charts, which needs a real <canvas> 2D context that
// jsdom doesn't provide — this test only cares about which props the dashboard passes down, not
// chart rendering, so the component is stubbed to a simple marker and its mock's call history is
// inspected directly for the more complex indicator props (overlayLines/oscillatorPane/macdPane).
vi.mock('../education/CandlestickChart', () => ({
  CandlestickChart: vi.fn((props: MockChartProps) => (
    <div data-testid="candlestick-chart" data-symbol={props.symbol} data-timeframe={props.timeframe} />
  )),
}));

function lastChartProps(): MockChartProps {
  const calls = vi.mocked(CandlestickChart).mock.calls;
  return calls[calls.length - 1][0] as MockChartProps;
}

function makeIndicatorResult(overrides: Partial<IndicatorResult> = {}): IndicatorResult {
  return {
    name: 'SMA',
    period: 20,
    points: [{ timestamp: 1_700_000_000_000, value: 123.45 }],
    ...overrides,
  };
}

function makeIndicatorsResponse(indicators: IndicatorResult[]) {
  return {
    symbol: 'AAPL',
    indicators,
    sourceType: 'simulated' as SourceType,
    timestamp: Date.now(),
    stale: false,
  };
}

// Sets the same implementation on both the Simulated and Alpaca getIndicators mocks, since the
// active provider depends on VITE_MARKET_DATA_PROVIDER (see the top-of-file comment) and this
// repo's .env.local pins it to 'alpaca' even for a bare `npm test` run.
function mockIndicatorsImplementation(
  impl: (symbol: string, list: { name: string }[]) => Promise<ReturnType<typeof makeIndicatorsResponse>>
) {
  mockGetIndicators.mockImplementation(impl);
  mockAlpacaGetIndicators.mockImplementation(impl);
}

function makeQuote(symbol: string, overrides: Partial<WithMeta<Quote>> = {}): WithMeta<Quote> {
  const sourceType: SourceType = 'simulated';
  return {
    symbol,
    price: 100,
    bid: 99.9,
    ask: 100.1,
    spread: 0.2,
    volume: 1_000_000,
    marketCap: 1_000_000_000,
    dayHigh: 101,
    dayLow: 99,
    prevClose: 100,
    sourceType,
    timestamp: Date.now(),
    stale: false,
    ...overrides,
  };
}

function seedAccount(account: Account) {
  saveAccount(window.localStorage, account);
}

function renderDashboard() {
  return render(
    <MemoryRouter>
      <PaperTradingDashboard />
    </MemoryRouter>
  );
}

beforeEach(() => {
  window.localStorage.clear();
  mockGetQuote.mockReset();
  mockAlpacaGetQuote.mockReset();
  mockGetIndicators.mockReset();
  mockAlpacaGetIndicators.mockReset();
  mockGetQuote.mockImplementation(async (symbol: string) => makeQuote(symbol));
  mockAlpacaGetQuote.mockImplementation(async (symbol: string) => makeQuote(symbol));
  mockIndicatorsImplementation(async () => makeIndicatorsResponse([]));
  vi.mocked(SimulatedMarketDataProvider).mockClear();
  vi.mocked(AlpacaMarketDataProvider).mockClear();
  vi.mocked(CandlestickChart).mockClear();
});

function seedAccountWithPosition(): void {
  const account = createAccount({ startingBalance: 10_000 });
  account.positions.AAPL = { symbol: 'AAPL', quantity: 10, avgEntryPrice: 90 };
  seedAccount(account);
}

describe('PaperTradingDashboard chart section', () => {
  it('shows a placeholder instead of a chart when there are no positions and no quote fetched yet', () => {
    renderDashboard();

    expect(
      screen.getByText('Get a quote or hold a position to see its chart here.')
    ).toBeInTheDocument();
    expect(screen.queryByTestId('candlestick-chart')).not.toBeInTheDocument();
  });

  it('defaults activeSymbol to the first held position (alphabetical) and renders the chart for it', async () => {
    const account = createAccount({ startingBalance: 10_000 });
    account.positions.MSFT = { symbol: 'MSFT', quantity: 5, avgEntryPrice: 300 };
    account.positions.AAPL = { symbol: 'AAPL', quantity: 10, avgEntryPrice: 90 };
    seedAccount(account);

    renderDashboard();

    const chart = await screen.findByTestId('candlestick-chart');
    expect(chart).toHaveAttribute('data-symbol', 'AAPL');
    expect(chart).toHaveAttribute('data-timeframe', '1d');
    expect(
      screen.queryByText('Get a quote or hold a position to see its chart here.')
    ).not.toBeInTheDocument();
  });

  it('renders the chart for a symbol looked up via OrderForm when no positions are held', async () => {
    const user = userEvent.setup();
    renderDashboard();

    expect(screen.queryByTestId('candlestick-chart')).not.toBeInTheDocument();

    await user.type(screen.getByLabelText('Symbol'), 'TSLA');
    await user.click(screen.getByRole('button', { name: 'Get quote' }));

    const chart = await screen.findByTestId('candlestick-chart');
    expect(chart).toHaveAttribute('data-symbol', 'TSLA');
    expect(chart).toHaveAttribute('data-timeframe', '1d');
  });
});

describe('PaperTradingDashboard indicator toggles', () => {
  it('passes no indicator props to the chart when nothing is toggled', async () => {
    seedAccountWithPosition();
    renderDashboard();

    await screen.findByTestId('candlestick-chart');

    expect(mockGetIndicators).not.toHaveBeenCalled();
    expect(mockAlpacaGetIndicators).not.toHaveBeenCalled();
    const props = lastChartProps();
    expect(props.overlayLines).toBeUndefined();
    expect(props.oscillatorPane).toBeUndefined();
    expect(props.macdPane).toBeUndefined();
  });

  it('toggling overlay checkboxes passes the matching overlayLines entries through', async () => {
    const user = userEvent.setup();
    seedAccountWithPosition();
    mockIndicatorsImplementation(async (_symbol, list) =>
      makeIndicatorsResponse(
        list.map((req) =>
          req.name === 'SMA'
            ? makeIndicatorResult({ name: 'SMA', period: 20, points: [{ timestamp: 1, value: 111 }] })
            : makeIndicatorResult({ name: 'EMA', period: 20, points: [{ timestamp: 2, value: 222 }] })
        )
      )
    );
    renderDashboard();
    await screen.findByTestId('candlestick-chart');

    await user.click(screen.getByLabelText('SMA (20)'));

    await waitFor(() => {
      expect(lastChartProps().overlayLines).toEqual([
        { label: 'SMA(20)', color: '#2563eb', points: [{ timestamp: 1, value: 111 }] },
      ]);
    });

    await user.click(screen.getByLabelText('EMA (20)'));

    await waitFor(() => {
      expect(lastChartProps().overlayLines).toEqual([
        { label: 'SMA(20)', color: '#2563eb', points: [{ timestamp: 1, value: 111 }] },
        { label: 'EMA(20)', color: '#f97316', points: [{ timestamp: 2, value: 222 }] },
      ]);
    });

    expect(lastChartProps().oscillatorPane).toBeUndefined();
    expect(lastChartProps().macdPane).toBeUndefined();
  });

  it('selecting a bottom-pane option maps to oscillatorPane or macdPane, clearing the other on switch', async () => {
    const user = userEvent.setup();
    seedAccountWithPosition();
    mockIndicatorsImplementation(async (_symbol, list) => {
      if (list[0]?.name === 'RSI') {
        return makeIndicatorsResponse([
          makeIndicatorResult({ name: 'RSI', period: 14, points: [{ timestamp: 1, value: 55 }] }),
        ]);
      }
      return makeIndicatorsResponse([
        makeIndicatorResult({
          name: 'MACD',
          period: undefined,
          points: [{ timestamp: 2, value: { macd: 1.5, signal: 1.2, histogram: 0.3 } }],
        }),
      ]);
    });
    renderDashboard();
    await screen.findByTestId('candlestick-chart');

    await user.selectOptions(screen.getByLabelText('Bottom pane'), 'RSI');

    await waitFor(() => {
      expect(lastChartProps().oscillatorPane).toMatchObject({
        label: 'RSI(14)',
        color: '#0891b2',
        points: [{ timestamp: 1, value: 55 }],
      });
    });
    expect(lastChartProps().macdPane).toBeUndefined();

    await user.selectOptions(screen.getByLabelText('Bottom pane'), 'MACD');

    await waitFor(() => {
      expect(lastChartProps().macdPane).toEqual({
        macdLine: { label: 'MACD', color: '#2563eb', points: [{ timestamp: 2, value: 1.5 }] },
        signalLine: { label: 'Signal', color: '#f97316', points: [{ timestamp: 2, value: 1.2 }] },
        histogram: { points: [{ timestamp: 2, value: 0.3 }] },
      });
    });
    expect(lastChartProps().oscillatorPane).toBeUndefined();
  });
});
