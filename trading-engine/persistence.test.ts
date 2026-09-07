import { describe, expect, it } from 'vitest';
import { createAccount, executeOrder } from './engine';
import {
  clearAccount,
  DEFAULT_ACCOUNT_STORAGE_KEY,
  loadAccount,
  saveAccount,
  type AccountStorage,
} from './persistence';
import type { Account, Order } from './types';

/** Minimal in-memory Storage fake — same shape the browser's window.localStorage satisfies. */
function fakeStorage(): AccountStorage & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return {
    data,
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => {
      data.set(key, value);
    },
    removeItem: (key) => {
      data.delete(key);
    },
  };
}

function buy(symbol: string, quantity: number, executionPrice: number): Order {
  return { symbol, side: 'buy', quantity, executionPrice };
}

const clock = () => new Date('2024-06-17T15:00:00Z').getTime();

describe('saveAccount / loadAccount round trip', () => {
  it('loads back an account identical to what was saved, for a fresh account', () => {
    const storage = fakeStorage();
    const account = createAccount({ startingBalance: 50_000 });
    expect(saveAccount(storage, account)).toBe(true);
    expect(loadAccount(storage)).toEqual(account);
  });

  it('round-trips an account with open positions and trade history', () => {
    const storage = fakeStorage();
    let account = createAccount();
    const buyResult = executeOrder(account, buy('AAPL', 10, 150), clock);
    if (!buyResult.ok) throw new Error('setup: buy should have succeeded');
    account = buyResult.account;

    expect(saveAccount(storage, account)).toBe(true);
    expect(loadAccount(storage)).toEqual(account);
  });

  it('uses DEFAULT_ACCOUNT_STORAGE_KEY when no key is given, and namespaces custom keys separately', () => {
    const storage = fakeStorage();
    const account = createAccount({ startingBalance: 12_345 });
    saveAccount(storage, account);
    expect(storage.data.has(DEFAULT_ACCOUNT_STORAGE_KEY)).toBe(true);

    saveAccount(storage, createAccount({ startingBalance: 1 }), 'other-key');
    expect(loadAccount(storage, 'other-key')?.cash).toBe(1);
    expect(loadAccount(storage)?.cash).toBe(12_345);
  });
});

describe('loadAccount — no/invalid data', () => {
  it('returns undefined when nothing is stored', () => {
    expect(loadAccount(fakeStorage())).toBeUndefined();
  });

  it('returns undefined for malformed JSON', () => {
    const storage = fakeStorage();
    storage.setItem(DEFAULT_ACCOUNT_STORAGE_KEY, '{not json');
    expect(loadAccount(storage)).toBeUndefined();
  });

  it('returns undefined when the payload has no version field', () => {
    const storage = fakeStorage();
    storage.setItem(DEFAULT_ACCOUNT_STORAGE_KEY, JSON.stringify(createAccount()));
    expect(loadAccount(storage)).toBeUndefined();
  });

  it('returns undefined for a mismatched schema version', () => {
    const storage = fakeStorage();
    storage.setItem(
      DEFAULT_ACCOUNT_STORAGE_KEY,
      JSON.stringify({ version: 999, account: createAccount() })
    );
    expect(loadAccount(storage)).toBeUndefined();
  });

  it('rejects a non-finite cash value', () => {
    const storage = fakeStorage();
    const account = { ...createAccount(), cash: Number.NaN };
    storage.setItem(DEFAULT_ACCOUNT_STORAGE_KEY, JSON.stringify({ version: 1, account }));
    expect(loadAccount(storage)).toBeUndefined();
  });

  it('rejects a position whose map key does not match its own symbol field', () => {
    const storage = fakeStorage();
    const account: Account = {
      cash: 1000,
      positions: { AAPL: { symbol: 'MSFT', quantity: 5, avgEntryPrice: 100 } },
      tradeHistory: [],
    };
    storage.setItem(DEFAULT_ACCOUNT_STORAGE_KEY, JSON.stringify({ version: 1, account }));
    expect(loadAccount(storage)).toBeUndefined();
  });

  it('rejects a position with a non-integer or non-positive quantity', () => {
    const storage = fakeStorage();
    for (const badQuantity of [0, -5, 1.5]) {
      const account: Account = {
        cash: 1000,
        positions: { AAPL: { symbol: 'AAPL', quantity: badQuantity, avgEntryPrice: 100 } },
        tradeHistory: [],
      };
      storage.setItem(DEFAULT_ACCOUNT_STORAGE_KEY, JSON.stringify({ version: 1, account }));
      expect(loadAccount(storage), `quantity=${badQuantity}`).toBeUndefined();
    }
  });

  it('rejects a trade with an invalid side', () => {
    const storage = fakeStorage();
    const account = {
      cash: 1000,
      positions: {},
      tradeHistory: [{ symbol: 'AAPL', side: 'short', quantity: 1, price: 100, timestamp: 1 }],
    };
    storage.setItem(DEFAULT_ACCOUNT_STORAGE_KEY, JSON.stringify({ version: 1, account }));
    expect(loadAccount(storage)).toBeUndefined();
  });

  it('rejects the whole account when only one trade in history is malformed (all-or-nothing)', () => {
    const storage = fakeStorage();
    const account = {
      cash: 1000,
      positions: {},
      tradeHistory: [
        { symbol: 'AAPL', side: 'buy', quantity: 1, price: 100, timestamp: 1 },
        { symbol: 'AAPL', side: 'buy', quantity: -1, price: 100, timestamp: 2 },
      ],
    };
    storage.setItem(DEFAULT_ACCOUNT_STORAGE_KEY, JSON.stringify({ version: 1, account }));
    expect(loadAccount(storage)).toBeUndefined();
  });

  it('accepts a sell trade with realizedPnL and rejects one where realizedPnL is not a number', () => {
    const storage = fakeStorage();
    const validAccount = {
      cash: 1000,
      positions: {},
      tradeHistory: [
        { symbol: 'AAPL', side: 'sell', quantity: 1, price: 100, timestamp: 1, realizedPnL: 10 },
      ],
    };
    storage.setItem(DEFAULT_ACCOUNT_STORAGE_KEY, JSON.stringify({ version: 1, account: validAccount }));
    expect(loadAccount(storage)).toEqual(validAccount);

    const invalidAccount = {
      ...validAccount,
      tradeHistory: [{ ...validAccount.tradeHistory[0], realizedPnL: 'ten' }],
    };
    storage.setItem(DEFAULT_ACCOUNT_STORAGE_KEY, JSON.stringify({ version: 1, account: invalidAccount }));
    expect(loadAccount(storage)).toBeUndefined();
  });
});

describe('storage failures', () => {
  function throwingStorage(): AccountStorage {
    return {
      getItem: () => {
        throw new Error('storage disabled');
      },
      setItem: () => {
        throw new Error('quota exceeded');
      },
      removeItem: () => {
        throw new Error('storage disabled');
      },
    };
  }

  it('saveAccount returns false instead of throwing when storage.setItem throws', () => {
    expect(saveAccount(throwingStorage(), createAccount())).toBe(false);
  });

  it('loadAccount returns undefined instead of throwing when storage.getItem throws', () => {
    expect(loadAccount(throwingStorage())).toBeUndefined();
  });

  it('clearAccount does not throw when storage.removeItem throws', () => {
    expect(() => clearAccount(throwingStorage())).not.toThrow();
  });
});

describe('clearAccount', () => {
  it('removes a previously saved account so loadAccount returns undefined afterward', () => {
    const storage = fakeStorage();
    saveAccount(storage, createAccount());
    expect(loadAccount(storage)).toBeDefined();

    clearAccount(storage);
    expect(loadAccount(storage)).toBeUndefined();
  });
});
