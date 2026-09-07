import type { Account, OrderSide, Position, Trade } from './types';

/**
 * Minimal structural subset of the Web Storage API (`Storage`). Defined locally rather than
 * imported from `lib.dom` because this module lives under the data-layer tsconfig
 * (`lib: ["ES2022"]`, no DOM) — see engine.ts's docblock: no UI imports here. The browser's
 * `window.localStorage` satisfies this interface structurally, so the UI layer (which does have
 * DOM types) can pass it straight through with no adapter code of its own. `sessionStorage`, or
 * an in-memory fake for tests, work the same way.
 */
export interface AccountStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

/** Default localStorage key for the single paper-trading account (no multi-account model yet). */
export const DEFAULT_ACCOUNT_STORAGE_KEY = 'trading-coach:paper-account';

/**
 * Schema version stamped into every payload this module writes. There's no migration logic yet
 * (nothing to migrate from) — its only job is to give a future version bump a safe way to detect
 * old-shaped data and treat it as invalid rather than trying to load it as-is. Bump this if
 * Account/Order/Trade's shape changes in a way old saved data wouldn't satisfy (e.g. fees,
 * limit orders — see engine.ts's out-of-scope list).
 */
const SCHEMA_VERSION = 1;

interface PersistedAccountV1 {
  version: 1;
  account: Account;
}

/**
 * Saves `account` to `storage` under `key` as JSON. Returns `true` on success, `false` if
 * storage threw (quota exceeded, private browsing, storage disabled) — callers may ignore this
 * for a "best effort" save, or surface it (e.g. "changes may not be saved") since silently
 * losing paper-trading history is worse than losing free-text notes.
 */
export function saveAccount(
  storage: AccountStorage,
  account: Account,
  key: string = DEFAULT_ACCOUNT_STORAGE_KEY
): boolean {
  try {
    const payload: PersistedAccountV1 = { version: SCHEMA_VERSION, account };
    storage.setItem(key, JSON.stringify(payload));
    return true;
  } catch {
    return false;
  }
}

/**
 * Loads and validates an Account previously saved with `saveAccount`. Returns `undefined` if
 * nothing is stored, storage threw, the JSON is malformed, the schema version doesn't match, or
 * the parsed data fails validation — in every case the caller is expected to fall back to
 * `createAccount()` for a fresh account, exactly like `loadPersisted` does in
 * TradingPlanWorksheet.tsx for its own localStorage use.
 *
 * Validation is all-or-nothing: a single malformed position or trade invalidates the whole
 * account rather than being dropped or coerced. This is financial state (cash/positions/trade
 * history all have to agree with each other) — silently dropping one bad entry could leave cash
 * and positions inconsistent with each other in a way nothing downstream would catch.
 */
export function loadAccount(
  storage: AccountStorage,
  key: string = DEFAULT_ACCOUNT_STORAGE_KEY
): Account | undefined {
  let raw: string | null;
  try {
    raw = storage.getItem(key);
  } catch {
    return undefined;
  }
  if (!raw) return undefined;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return undefined;
  }

  if (!isRecord(parsed) || parsed.version !== SCHEMA_VERSION) return undefined;
  const account = parsed.account;
  return isValidAccount(account) ? account : undefined;
}

/** Removes any persisted account under `key`. Used for a "reset account" action. */
export function clearAccount(
  storage: AccountStorage,
  key: string = DEFAULT_ACCOUNT_STORAGE_KEY
): void {
  try {
    storage.removeItem(key);
  } catch {
    // Storage unavailable — nothing to clear.
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isValidAccount(value: unknown): value is Account {
  if (!isRecord(value)) return false;
  if (!isFiniteNumber(value.cash)) return false;
  if (!isRecord(value.positions)) return false;
  if (!Array.isArray(value.tradeHistory)) return false;

  for (const [symbol, position] of Object.entries(value.positions)) {
    if (!isValidPosition(position) || position.symbol !== symbol) return false;
  }
  for (const trade of value.tradeHistory) {
    if (!isValidTrade(trade)) return false;
  }
  return true;
}

function isValidPosition(value: unknown): value is Position {
  if (!isRecord(value)) return false;
  return (
    typeof value.symbol === 'string' &&
    value.symbol.length > 0 &&
    Number.isInteger(value.quantity) &&
    (value.quantity as number) > 0 &&
    isFiniteNumber(value.avgEntryPrice) &&
    (value.avgEntryPrice as number) > 0
  );
}

function isValidTrade(value: unknown): value is Trade {
  if (!isRecord(value)) return false;
  if (typeof value.symbol !== 'string' || value.symbol.length === 0) return false;
  if (!isValidOrderSide(value.side)) return false;
  if (!Number.isInteger(value.quantity) || (value.quantity as number) <= 0) return false;
  if (!isFiniteNumber(value.price) || (value.price as number) <= 0) return false;
  if (!isFiniteNumber(value.timestamp)) return false;
  if (value.realizedPnL !== undefined && !isFiniteNumber(value.realizedPnL)) return false;
  return true;
}

function isValidOrderSide(value: unknown): value is OrderSide {
  return value === 'buy' || value === 'sell';
}
