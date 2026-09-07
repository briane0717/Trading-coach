import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { PaperTradingDashboard } from './PaperTradingDashboard';
import { AlpacaMarketDataProvider, SimulatedMarketDataProvider } from '../../data-providers';
import { createAccount, saveAccount } from '../../trading-engine';
import type { Account } from '../../trading-engine';
import type { Quote, SourceType, WithMeta } from '../../normalized';

// Both providers are mocked (not just Simulated) so this test is unaffected by whichever one
// VITE_MARKET_DATA_PROVIDER actually resolves to in a given environment — see OrderForm.test.tsx
// for the same pattern.
const { mockGetQuote, mockAlpacaGetQuote } = vi.hoisted(() => ({
  mockGetQuote: vi.fn(),
  mockAlpacaGetQuote: vi.fn(),
}));

vi.mock('../../data-providers', () => ({
  SimulatedMarketDataProvider: vi.fn().mockImplementation(() => ({ getQuote: mockGetQuote })),
  AlpacaMarketDataProvider: vi.fn().mockImplementation(() => ({ getQuote: mockAlpacaGetQuote })),
}));

// CandlestickChart renders via lightweight-charts, which needs a real <canvas> 2D context that
// jsdom doesn't provide — this test only cares about which symbol/timeframe/provider the
// dashboard passes down, not chart rendering, so the component is stubbed to a simple marker.
vi.mock('../education/CandlestickChart', () => ({
  CandlestickChart: vi.fn((props: { symbol: string; timeframe: string }) => (
    <div data-testid="candlestick-chart" data-symbol={props.symbol} data-timeframe={props.timeframe} />
  )),
}));

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
  mockGetQuote.mockImplementation(async (symbol: string) => makeQuote(symbol));
  mockAlpacaGetQuote.mockImplementation(async (symbol: string) => makeQuote(symbol));
  vi.mocked(SimulatedMarketDataProvider).mockClear();
  vi.mocked(AlpacaMarketDataProvider).mockClear();
});

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
