import { round2 } from './internal/money';
import type { Account, AccountConfig, Order, OrderResult, Position, Trade } from './types';

/**
 * In-memory paper-trading engine core: account/position/order math only.
 *
 * No persistence (the caller holds the returned Account in memory — nothing here writes to
 * localStorage, a file, or a database), no UI, and no market-data integration — every function
 * takes execution/current prices as plain number parameters rather than fetching quotes itself,
 * so this module never imports from /data-providers/ or /normalized/.
 *
 * Whole shares and market orders only in this phase — no fractional shares, no limit/stop
 * orders, no fees/slippage/partial fills, no market-hours logic (all explicitly out of scope;
 * see the task that introduced this module).
 *
 * All functions are pure: on success they return a *new* Account rather than mutating the one
 * passed in, so a caller can hold onto a prior Account (e.g. for undo, or comparing before/after)
 * without it changing out from under them.
 */

const DEFAULT_STARTING_BALANCE = 100_000;

export function createAccount(
  config: AccountConfig = { startingBalance: DEFAULT_STARTING_BALANCE }
): Account {
  if (!Number.isFinite(config.startingBalance) || config.startingBalance <= 0) {
    throw new Error(`startingBalance must be a positive number, got ${config.startingBalance}`);
  }
  return { cash: round2(config.startingBalance), positions: {}, tradeHistory: [] };
}

/**
 * Executes a market order against `account` and returns a new Account reflecting it. Rejections
 * (bad quantity/price, insufficient cash, insufficient shares held) come back as
 * `{ ok: false, reason }` rather than a thrown exception, so a caller (e.g. an order-entry UI)
 * can always handle them gracefully.
 *
 * `now` is injectable for deterministic tests, matching the pattern SimulatedMarketDataProvider
 * uses for its clock.
 */
export function executeOrder(
  account: Account,
  order: Order,
  now: () => number = Date.now
): OrderResult {
  if (!Number.isInteger(order.quantity) || order.quantity <= 0) {
    return { ok: false, reason: `Quantity must be a positive whole number, got ${order.quantity}.` };
  }
  if (!Number.isFinite(order.executionPrice) || order.executionPrice <= 0) {
    return {
      ok: false,
      reason: `Execution price must be a positive number, got ${order.executionPrice}.`,
    };
  }

  return order.side === 'buy' ? executeBuy(account, order, now) : executeSell(account, order, now);
}

function executeBuy(account: Account, order: Order, now: () => number): OrderResult {
  const cost = round2(order.quantity * order.executionPrice);
  if (cost > account.cash) {
    return {
      ok: false,
      reason: `Insufficient cash: order costs $${cost.toFixed(2)}, only $${account.cash.toFixed(2)} available.`,
    };
  }

  const existing = account.positions[order.symbol];
  const newQuantity = (existing?.quantity ?? 0) + order.quantity;
  const newAvgEntryPrice = existing
    ? round2(
        (existing.quantity * existing.avgEntryPrice + order.quantity * order.executionPrice) /
          newQuantity
      )
    : round2(order.executionPrice);

  const position: Position = {
    symbol: order.symbol,
    quantity: newQuantity,
    avgEntryPrice: newAvgEntryPrice,
  };
  const trade: Trade = {
    symbol: order.symbol,
    side: 'buy',
    quantity: order.quantity,
    price: order.executionPrice,
    timestamp: now(),
  };

  const nextAccount: Account = {
    cash: round2(account.cash - cost),
    positions: { ...account.positions, [order.symbol]: position },
    tradeHistory: [...account.tradeHistory, trade],
  };
  return { ok: true, account: nextAccount, trade };
}

function executeSell(account: Account, order: Order, now: () => number): OrderResult {
  const existing = account.positions[order.symbol];
  const held = existing?.quantity ?? 0;
  if (order.quantity > held) {
    return {
      ok: false,
      reason: `Cannot sell ${order.quantity} share(s) of ${order.symbol}: only ${held} held.`,
    };
  }

  const proceeds = round2(order.quantity * order.executionPrice);
  const realizedPnL = round2((order.executionPrice - existing!.avgEntryPrice) * order.quantity);
  const remaining = held - order.quantity;

  const positions = { ...account.positions };
  if (remaining === 0) {
    delete positions[order.symbol];
  } else {
    positions[order.symbol] = {
      symbol: order.symbol,
      quantity: remaining,
      avgEntryPrice: existing!.avgEntryPrice,
    };
  }

  const trade: Trade = {
    symbol: order.symbol,
    side: 'sell',
    quantity: order.quantity,
    price: order.executionPrice,
    timestamp: now(),
    realizedPnL,
  };

  const nextAccount: Account = {
    cash: round2(account.cash + proceeds),
    positions,
    tradeHistory: [...account.tradeHistory, trade],
  };
  return { ok: true, account: nextAccount, trade };
}

/**
 * Buying power available for new orders. This phase has no margin, so it's just cash — kept as
 * its own function (rather than a stored field that could drift out of sync) so this is the one
 * place that changes if margin is introduced in a later phase.
 */
export function getBuyingPower(account: Account): number {
  return account.cash;
}

/** Unrealized P/L for one position at `currentPrice`. Does not touch account cash. */
export function getUnrealizedPnL(position: Position, currentPrice: number): number {
  return round2((currentPrice - position.avgEntryPrice) * position.quantity);
}

/**
 * Total account equity: cash plus the market value of every open position at `currentPrices`.
 * `currentPrices` must have an entry for every symbol the account currently holds — a missing
 * price is a caller bug (not a runtime order to reject), so this throws rather than returning a
 * result type.
 */
export function getEquity(account: Account, currentPrices: Record<string, number>): number {
  let marketValue = 0;
  for (const position of Object.values(account.positions)) {
    const price = currentPrices[position.symbol];
    if (price === undefined) {
      throw new Error(`getEquity: missing current price for held symbol "${position.symbol}"`);
    }
    marketValue += position.quantity * price;
  }
  return round2(account.cash + marketValue);
}
