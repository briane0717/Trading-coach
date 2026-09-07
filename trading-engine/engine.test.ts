import { describe, expect, it } from 'vitest';
import {
  createAccount,
  executeOrder,
  getBuyingPower,
  getEquity,
  getUnrealizedPnL,
} from './engine';
import type { Account, Order } from './types';

const FIXED_NOW = new Date('2024-06-17T15:00:00Z').getTime();
const clock = (now: number = FIXED_NOW) => () => now;

function buy(symbol: string, quantity: number, executionPrice: number): Order {
  return { symbol, side: 'buy', quantity, executionPrice };
}

function sell(symbol: string, quantity: number, executionPrice: number): Order {
  return { symbol, side: 'sell', quantity, executionPrice };
}

describe('createAccount', () => {
  it('uses the configured starting balance, with no positions or trade history', () => {
    const account = createAccount({ startingBalance: 50_000 });
    expect(account.cash).toBe(50_000);
    expect(account.positions).toEqual({});
    expect(account.tradeHistory).toEqual([]);
  });

  it('defaults to 100000 when no config is given', () => {
    expect(createAccount().cash).toBe(100_000);
  });

  it('rejects a non-positive starting balance', () => {
    expect(() => createAccount({ startingBalance: 0 })).toThrow();
    expect(() => createAccount({ startingBalance: -100 })).toThrow();
  });
});

describe('executeOrder — buy', () => {
  it('executes a buy with sufficient cash: deducts cost, opens a position', () => {
    const account = createAccount({ startingBalance: 10_000 });
    const result = executeOrder(account, buy('AAPL', 10, 100), clock());

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.account.cash).toBe(9_000);
    expect(result.account.positions.AAPL).toEqual({
      symbol: 'AAPL',
      quantity: 10,
      avgEntryPrice: 100,
    });
    expect(result.trade).toEqual({
      symbol: 'AAPL',
      side: 'buy',
      quantity: 10,
      price: 100,
      timestamp: FIXED_NOW,
    });
  });

  it('rejects a buy with insufficient cash, leaving the account untouched', () => {
    const account = createAccount({ startingBalance: 500 });
    const result = executeOrder(account, buy('AAPL', 10, 100), clock());

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toMatch(/insufficient cash/i);
    // Original account object must be untouched — the engine is pure.
    expect(account.cash).toBe(500);
    expect(account.positions).toEqual({});
  });

  it('computes a correct weighted average entry price after multiple buys at different prices', () => {
    let account = createAccount({ startingBalance: 100_000 });
    let result = executeOrder(account, buy('MSFT', 10, 100), clock());
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    account = result.account;

    result = executeOrder(account, buy('MSFT', 30, 120), clock());
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    account = result.account;

    // (10*100 + 30*120) / 40 = 115
    expect(account.positions.MSFT.quantity).toBe(40);
    expect(account.positions.MSFT.avgEntryPrice).toBe(115);
    expect(account.cash).toBe(100_000 - 1_000 - 3_600);
  });
});

describe('executeOrder — sell', () => {
  function accountWithPosition(): Account {
    const account = createAccount({ startingBalance: 100_000 });
    const result = executeOrder(account, buy('TSLA', 20, 200), clock());
    if (!result.ok) throw new Error('setup buy failed');
    return result.account;
  }

  it('fully sells an existing position: closes it and credits cash', () => {
    const account = accountWithPosition();
    const result = executeOrder(account, sell('TSLA', 20, 250), clock());

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.account.positions.TSLA).toBeUndefined();
    expect(result.account.cash).toBe(96_000 + 5_000); // 100_000 - 4_000 cost + 5_000 proceeds
  });

  it('partially sells an existing position: reduces quantity, keeps avg entry price', () => {
    const account = accountWithPosition();
    const result = executeOrder(account, sell('TSLA', 5, 250), clock());

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.account.positions.TSLA).toEqual({
      symbol: 'TSLA',
      quantity: 15,
      avgEntryPrice: 200,
    });
  });

  it('rejects selling more shares than owned, leaving the account untouched', () => {
    const account = accountWithPosition();
    const result = executeOrder(account, sell('TSLA', 21, 250), clock());

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toMatch(/only 20 held/i);
    expect(account.positions.TSLA.quantity).toBe(20);
  });

  it('rejects selling a symbol with no position at all', () => {
    const account = createAccount();
    const result = executeOrder(account, sell('NFLX', 1, 400), clock());

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toMatch(/only 0 held/i);
  });

  it('computes correct realized P/L on a sell', () => {
    const account = accountWithPosition(); // 20 shares @ avg 200
    const result = executeOrder(account, sell('TSLA', 8, 260), clock());

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    // (260 - 200) * 8 = 480
    expect(result.trade.realizedPnL).toBe(480);
  });

  it('computes a realized loss correctly when selling below avg entry price', () => {
    const account = accountWithPosition(); // 20 shares @ avg 200
    const result = executeOrder(account, sell('TSLA', 10, 150), clock());

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    // (150 - 200) * 10 = -500
    expect(result.trade.realizedPnL).toBe(-500);
  });

  it('never sets realizedPnL on a buy trade', () => {
    const account = createAccount();
    const result = executeOrder(account, buy('GOOG', 1, 150), clock());
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.trade.realizedPnL).toBeUndefined();
  });
});

describe('invalid order quantities', () => {
  it('rejects a zero-quantity order', () => {
    const account = createAccount();
    const result = executeOrder(account, buy('AAPL', 0, 100), clock());
    expect(result.ok).toBe(false);
  });

  it('rejects a negative-quantity order', () => {
    const account = createAccount();
    const result = executeOrder(account, buy('AAPL', -5, 100), clock());
    expect(result.ok).toBe(false);
  });

  it('rejects a non-integer (fractional) quantity', () => {
    const account = createAccount();
    const result = executeOrder(account, buy('AAPL', 1.5, 100), clock());
    expect(result.ok).toBe(false);
  });

  it('rejects a zero or negative execution price', () => {
    const account = createAccount();
    expect(executeOrder(account, buy('AAPL', 1, 0), clock()).ok).toBe(false);
    expect(executeOrder(account, buy('AAPL', 1, -10), clock()).ok).toBe(false);
  });
});

describe('getUnrealizedPnL', () => {
  it('computes correct unrealized P/L as price moves up and down', () => {
    const account = createAccount();
    const result = executeOrder(account, buy('NVDA', 10, 500), clock());
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const position = result.account.positions.NVDA;

    expect(getUnrealizedPnL(position, 550)).toBe(500); // (550-500)*10
    expect(getUnrealizedPnL(position, 500)).toBe(0);
    expect(getUnrealizedPnL(position, 470)).toBe(-300); // (470-500)*10
  });
});

describe('getEquity', () => {
  it('computes correct account equity with multiple open positions', () => {
    let account = createAccount({ startingBalance: 100_000 });
    let result = executeOrder(account, buy('AAPL', 10, 100), clock());
    if (!result.ok) throw new Error('setup failed');
    account = result.account;

    result = executeOrder(account, buy('MSFT', 5, 300), clock());
    if (!result.ok) throw new Error('setup failed');
    account = result.account;

    // cash = 100_000 - 1_000 - 1_500 = 97_500
    // market value = 10*110 + 5*310 = 1_100 + 1_550 = 2_650
    const equity = getEquity(account, { AAPL: 110, MSFT: 310 });
    expect(equity).toBe(97_500 + 2_650);
  });

  it('equals cash alone when there are no open positions', () => {
    const account = createAccount({ startingBalance: 25_000 });
    expect(getEquity(account, {})).toBe(25_000);
  });

  it('throws if a current price is missing for a held symbol', () => {
    const account = createAccount();
    const result = executeOrder(account, buy('AAPL', 1, 100), clock());
    if (!result.ok) throw new Error('setup failed');
    expect(() => getEquity(result.account, {})).toThrow();
  });
});

describe('getBuyingPower', () => {
  it('equals cash (no margin in this phase)', () => {
    const account = createAccount({ startingBalance: 12_345 });
    expect(getBuyingPower(account)).toBe(12_345);
  });
});

describe('a realistic sequence of trades', () => {
  it('tracks cash and trade history correctly across buys and sells', () => {
    let account = createAccount({ startingBalance: 10_000 });
    const executed: unknown[] = [];

    const steps: Order[] = [
      buy('AAPL', 10, 100), // cost 1000, cash 9000
      buy('AAPL', 10, 120), // cost 1200, cash 7800, avg (1000+1200)/20=110
      sell('AAPL', 5, 130), // proceeds 650, cash 8450, realized (130-110)*5=100
      buy('MSFT', 4, 50), // cost 200, cash 8250
      sell('MSFT', 4, 60), // proceeds 240, cash 8490, realized (60-50)*4=40, closes MSFT
    ];

    for (const order of steps) {
      const result = executeOrder(account, order, clock());
      expect(result.ok).toBe(true);
      if (!result.ok) throw new Error('sequence step failed');
      account = result.account;
      executed.push(result.trade);
    }

    expect(account.cash).toBe(8_490);
    expect(account.positions.AAPL).toEqual({ symbol: 'AAPL', quantity: 15, avgEntryPrice: 110 });
    expect(account.positions.MSFT).toBeUndefined();

    // Trade history records every execution, in order.
    expect(account.tradeHistory).toHaveLength(5);
    expect(account.tradeHistory).toEqual(executed);
    expect(account.tradeHistory.map((t) => `${t.side}:${t.symbol}:${t.quantity}`)).toEqual([
      'buy:AAPL:10',
      'buy:AAPL:10',
      'sell:AAPL:5',
      'buy:MSFT:4',
      'sell:MSFT:4',
    ]);
    expect(account.tradeHistory[2].realizedPnL).toBe(100);
    expect(account.tradeHistory[4].realizedPnL).toBe(40);
  });

  it('does not mutate the account passed into executeOrder', () => {
    const original = createAccount({ startingBalance: 5_000 });
    const originalSnapshot = JSON.parse(JSON.stringify(original));

    executeOrder(original, buy('AAPL', 1, 100), clock());

    expect(original).toEqual(originalSnapshot);
  });
});
