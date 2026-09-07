import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OrderForm, selectMarketDataProvider } from './OrderForm';
import { AlpacaMarketDataProvider, SimulatedMarketDataProvider } from '../../data-providers';
import { createAccount } from '../../trading-engine';
import type { Account, Order, OrderResult, Trade } from '../../trading-engine';
import type { Quote, SourceType, WithMeta } from '../../normalized';

// OrderForm imports a module-level `new SimulatedMarketDataProvider()` singleton directly
// rather than accepting one as a prop, so tests replace the module to control what getQuote
// resolves to instead of depending on the simulator's real (seeded-random) prices. Both
// provider classes are mocked (not just Simulated) so selectMarketDataProvider's choice
// between them can be asserted without hitting the real Alpaca network path.
const { mockGetQuote, mockAlpacaGetQuote } = vi.hoisted(() => ({
  mockGetQuote: vi.fn(),
  mockAlpacaGetQuote: vi.fn(),
}));

vi.mock('../../data-providers', () => ({
  SimulatedMarketDataProvider: vi.fn().mockImplementation(() => ({ getQuote: mockGetQuote })),
  AlpacaMarketDataProvider: vi.fn().mockImplementation(() => ({ getQuote: mockAlpacaGetQuote })),
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

beforeEach(() => {
  mockGetQuote.mockReset();
  mockGetQuote.mockImplementation(async (symbol: string) => makeQuote(symbol));
  vi.mocked(SimulatedMarketDataProvider).mockClear();
  vi.mocked(AlpacaMarketDataProvider).mockClear();
});

function renderOrderForm(
  overrides: Partial<{ account: Account; equity: number; onSubmit: (order: Order) => OrderResult }> = {}
) {
  const account = overrides.account ?? createAccount({ startingBalance: 10_000 });
  const equity = overrides.equity ?? account.cash;
  const onSubmit = overrides.onSubmit ?? vi.fn<(order: Order) => OrderResult>();
  render(<OrderForm account={account} equity={equity} onSubmit={onSubmit} />);
  return { account, equity, onSubmit };
}

async function fetchQuote(user: ReturnType<typeof userEvent.setup>, symbol: string) {
  await user.type(screen.getByLabelText('Symbol'), symbol);
  await user.click(screen.getByRole('button', { name: 'Get quote' }));
  await screen.findByText(/ask/);
}

function successResult(overrides: Partial<Trade> = {}): OrderResult {
  const trade: Trade = {
    symbol: 'AAPL',
    side: 'buy',
    quantity: 10,
    price: 100.1,
    timestamp: Date.now(),
    ...overrides,
  };
  return { ok: true, account: createAccount({ startingBalance: 10_000 }), trade };
}

describe('OrderForm valid submission', () => {
  it('submits a buy order with the quoted ask price and resets the form on success', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn<(order: Order) => OrderResult>().mockReturnValue(successResult());
    renderOrderForm({ onSubmit });

    await fetchQuote(user, 'AAPL');
    await user.type(screen.getByLabelText('Shares'), '10');

    const reviewBtn = screen.getByRole('button', { name: 'Review order' });
    expect(reviewBtn).toBeEnabled();
    await user.click(reviewBtn);

    const confirmBtn = screen.getByRole('button', { name: 'Confirm & submit' });
    expect(confirmBtn).toBeEnabled();
    await user.click(confirmBtn);

    expect(onSubmit).toHaveBeenCalledWith({
      symbol: 'AAPL',
      side: 'buy',
      quantity: 10,
      executionPrice: 100.1, // the ask, not the midpoint price, for a buy
    });

    expect(await screen.findByText(/Filled: buy 10 AAPL @ \$100\.10\./)).toBeInTheDocument();
    expect(screen.getByLabelText('Symbol')).toHaveValue('');
    expect(screen.getByLabelText('Shares')).toHaveValue('');
  });

  it('uses the bid (not the midpoint price) as the execution price for a sell', async () => {
    const user = userEvent.setup();
    const account = createAccount({ startingBalance: 10_000 });
    account.positions.AAPL = { symbol: 'AAPL', quantity: 20, avgEntryPrice: 90 };
    const onSubmit = vi
      .fn<(order: Order) => OrderResult>()
      .mockReturnValue(successResult({ side: 'sell', price: 99.9 }));
    renderOrderForm({ account, onSubmit });

    await user.click(screen.getByRole('button', { name: 'Sell' }));
    await fetchQuote(user, 'AAPL');
    await user.type(screen.getByLabelText('Shares'), '5');
    await user.click(screen.getByRole('button', { name: 'Review order' }));
    await user.click(screen.getByRole('button', { name: 'Confirm & submit' }));

    expect(onSubmit).toHaveBeenCalledWith({
      symbol: 'AAPL',
      side: 'sell',
      quantity: 5,
      executionPrice: 99.9,
    });
  });
});

describe('OrderForm buying-power validation', () => {
  it('lets the order be reviewed but blocks confirmation when cost exceeds buying power', async () => {
    const user = userEvent.setup();
    const account = createAccount({ startingBalance: 500 });
    const onSubmit = vi.fn<(order: Order) => OrderResult>();
    renderOrderForm({ account, equity: 500, onSubmit });

    await fetchQuote(user, 'AAPL'); // ask 100.1
    await user.type(screen.getByLabelText('Shares'), '10'); // cost 1001 > 500 cash

    const reviewBtn = screen.getByRole('button', { name: 'Review order' });
    expect(reviewBtn).toBeEnabled(); // buying power isn't checked until the confirm step
    await user.click(reviewBtn);

    expect(
      screen.getByText('This order costs more than your available buying power ($500.00).')
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Confirm & submit' })).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Confirm & submit' }));
    expect(onSubmit).not.toHaveBeenCalled();
  });
});

describe('OrderForm quantity validation', () => {
  it.each(['0', '-5', 'abc', '3.5'])(
    'rejects a quantity of %s and disables Review order',
    async (badQuantity) => {
      const user = userEvent.setup();
      renderOrderForm();

      await fetchQuote(user, 'AAPL');
      await user.type(screen.getByLabelText('Shares'), badQuantity);

      expect(screen.getByText('Enter a whole number of shares greater than 0.')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Review order' })).toBeDisabled();
    }
  );

  it('accepts a whole positive quantity with no error shown', async () => {
    const user = userEvent.setup();
    renderOrderForm();

    await fetchQuote(user, 'AAPL');
    await user.type(screen.getByLabelText('Shares'), '10');

    expect(
      screen.queryByText('Enter a whole number of shares greater than 0.')
    ).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Review order' })).toBeEnabled();
  });
});

describe('OrderForm sell-quantity-vs-holdings validation', () => {
  it('lets the order be reviewed but blocks confirmation when selling more than is held', async () => {
    const user = userEvent.setup();
    const account = createAccount({ startingBalance: 10_000 });
    account.positions.AAPL = { symbol: 'AAPL', quantity: 5, avgEntryPrice: 90 };
    const onSubmit = vi.fn<(order: Order) => OrderResult>();
    renderOrderForm({ account, onSubmit });

    await user.click(screen.getByRole('button', { name: 'Sell' }));
    await fetchQuote(user, 'AAPL');
    await user.type(screen.getByLabelText('Shares'), '10'); // only 5 held

    const reviewBtn = screen.getByRole('button', { name: 'Review order' });
    expect(reviewBtn).toBeEnabled(); // shares-held isn't checked until the confirm step either
    await user.click(reviewBtn);

    expect(screen.getByText('You only hold 5 share(s) of AAPL.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Confirm & submit' })).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Confirm & submit' }));
    expect(onSubmit).not.toHaveBeenCalled();
  });
});

describe('OrderForm stop-price validation (buy only)', () => {
  it.each([
    ['0', 'Stop must be a number greater than $0.'],
    ['-5', 'Stop must be a number greater than $0.'],
    ['abc', 'Stop must be a number greater than $0.'],
    [
      '150',
      "Stop must be below the estimated buy price — a stop above entry isn't a stop for a long position.",
    ],
  ])('rejects a stop of %s with the expected message', async (badStop, expectedMessage) => {
    const user = userEvent.setup();
    renderOrderForm();

    await fetchQuote(user, 'AAPL'); // ask 100.1
    await user.type(screen.getByLabelText('Shares'), '10');
    await user.type(screen.getByLabelText(/Stop price/), badStop);

    expect(screen.getByText(expectedMessage)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Review order' })).toBeDisabled();
  });

  it('is not validated at all on the sell side', async () => {
    const user = userEvent.setup();
    const account = createAccount({ startingBalance: 10_000 });
    account.positions.AAPL = { symbol: 'AAPL', quantity: 20, avgEntryPrice: 90 };
    renderOrderForm({ account });

    await user.click(screen.getByRole('button', { name: 'Sell' }));
    await fetchQuote(user, 'AAPL');
    await user.type(screen.getByLabelText('Shares'), '5');

    expect(screen.queryByLabelText(/Stop price/)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Review order' })).toBeEnabled();
  });
});

describe('OrderForm target-price validation (buy only)', () => {
  it.each(['0', '-5', 'abc'])('rejects a target of %s', async (badTarget) => {
    const user = userEvent.setup();
    renderOrderForm();

    await fetchQuote(user, 'AAPL');
    await user.type(screen.getByLabelText('Shares'), '10');
    await user.type(screen.getByLabelText(/Target price/), badTarget);

    expect(screen.getByText('Target must be a number greater than $0.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Review order' })).toBeDisabled();
  });
});

describe('OrderForm risk-sizing math', () => {
  it('computes max loss, % account risk, and risk/reward ratio from stop and target', async () => {
    const user = userEvent.setup();
    renderOrderForm({ equity: 10_000 });

    await fetchQuote(user, 'AAPL'); // ask 100.1
    await user.type(screen.getByLabelText('Shares'), '10');
    await user.type(screen.getByLabelText(/Stop price/), '95');
    await user.type(screen.getByLabelText(/Target price/), '110');

    // maxLoss = (100.1 - 95) * 10 = 51; %risk = 51 / 10000 * 100 = 0.51%;
    // R:R = |110 - 100.1| / (100.1 - 95) ≈ 1.94:1
    expect(screen.getByText('$51.00')).toBeInTheDocument();
    expect(screen.getByText('0.51%')).toBeInTheDocument();
    expect(screen.getByText('1.94:1')).toBeInTheDocument();
  });

  it('shows estimated realized P/L for a sell based on the position average entry price', async () => {
    const user = userEvent.setup();
    const account = createAccount({ startingBalance: 10_000 });
    account.positions.AAPL = { symbol: 'AAPL', quantity: 20, avgEntryPrice: 90 };
    renderOrderForm({ account });

    await user.click(screen.getByRole('button', { name: 'Sell' }));
    await fetchQuote(user, 'AAPL'); // bid 99.9
    await user.type(screen.getByLabelText('Shares'), '5');

    // realized P/L = (99.9 - 90) * 5 = $49.50
    expect(screen.getByText('$49.50')).toBeInTheDocument();
  });
});

describe('OrderForm quote/symbol consistency', () => {
  it('invalidates the fetched quote and disables Review order when the symbol is edited afterward', async () => {
    const user = userEvent.setup();
    renderOrderForm();

    await fetchQuote(user, 'AAPL');
    await user.type(screen.getByLabelText('Shares'), '10');
    expect(screen.getByRole('button', { name: 'Review order' })).toBeEnabled();

    await user.type(screen.getByLabelText('Symbol'), 'X');

    expect(screen.queryByText(/ask/)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Review order' })).toBeDisabled();
  });
});

describe('OrderForm quote failure', () => {
  it("shows the provider's error message and does not render a quote", async () => {
    const user = userEvent.setup();
    mockGetQuote.mockRejectedValueOnce(new Error('symbol not found'));
    renderOrderForm();

    await user.type(screen.getByLabelText('Symbol'), 'BADSYM');
    await user.click(screen.getByRole('button', { name: 'Get quote' }));

    expect(await screen.findByText(/Couldn't fetch a quote: symbol not found/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Review order' })).toBeDisabled();
  });
});

describe('selectMarketDataProvider (VITE_MARKET_DATA_PROVIDER)', () => {
  it('defaults to SimulatedMarketDataProvider when the value is undefined', () => {
    selectMarketDataProvider(undefined);
    expect(SimulatedMarketDataProvider).toHaveBeenCalledTimes(1);
    expect(AlpacaMarketDataProvider).not.toHaveBeenCalled();
  });

  it('falls back to SimulatedMarketDataProvider for an unrecognized value', () => {
    selectMarketDataProvider('bogus');
    expect(SimulatedMarketDataProvider).toHaveBeenCalledTimes(1);
    expect(AlpacaMarketDataProvider).not.toHaveBeenCalled();
  });

  it('selects AlpacaMarketDataProvider only for the exact value "alpaca"', () => {
    selectMarketDataProvider('alpaca');
    expect(AlpacaMarketDataProvider).toHaveBeenCalledTimes(1);
    expect(SimulatedMarketDataProvider).not.toHaveBeenCalled();
  });

  it('is case-sensitive — "Alpaca" is not recognized and falls back to simulated', () => {
    selectMarketDataProvider('Alpaca');
    expect(SimulatedMarketDataProvider).toHaveBeenCalledTimes(1);
    expect(AlpacaMarketDataProvider).not.toHaveBeenCalled();
  });
});

describe('OrderForm sourceType badge', () => {
  it.each([
    ['real-time', 'Real-time data'],
    ['delayed', 'Delayed data'],
    ['historical', 'Historical data'],
    ['simulated', 'Simulated data'],
  ] satisfies [SourceType, string][])(
    'renders "%s" as "%s", read live from the quote response',
    async (sourceType, expectedLabel) => {
      const user = userEvent.setup();
      mockGetQuote.mockImplementation(async (symbol: string) => makeQuote(symbol, { sourceType }));
      renderOrderForm();

      await fetchQuote(user, 'AAPL');

      expect(screen.getByText(expectedLabel)).toBeInTheDocument();
    }
  );

  it('updates the badge when a new quote for a different symbol reports a different sourceType', async () => {
    const user = userEvent.setup();
    mockGetQuote.mockImplementationOnce(async (symbol: string) =>
      makeQuote(symbol, { sourceType: 'simulated' })
    );
    renderOrderForm();

    await fetchQuote(user, 'AAPL');
    expect(screen.getByText('Simulated data')).toBeInTheDocument();

    mockGetQuote.mockImplementationOnce(async (symbol: string) =>
      makeQuote(symbol, { sourceType: 'real-time' })
    );
    await user.clear(screen.getByLabelText('Symbol'));
    await fetchQuote(user, 'MSFT');

    expect(screen.getByText('Real-time data')).toBeInTheDocument();
    expect(screen.queryByText('Simulated data')).not.toBeInTheDocument();
  });
});
