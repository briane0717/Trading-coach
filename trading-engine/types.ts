// Shared types for the in-memory paper-trading engine. No persistence, no market-data or UI
// imports here — the engine takes execution/current prices as plain number parameters; see
// engine.ts's top-level doc comment for full scope.

export type OrderSide = 'buy' | 'sell';

export interface AccountConfig {
  /** Cash the account starts with. No default is baked into engine logic — see createAccount. */
  startingBalance: number;
}

export interface Position {
  symbol: string;
  /** Whole shares only — this phase has no fractional-share support. */
  quantity: number;
  avgEntryPrice: number;
}

export interface Account {
  cash: number;
  /** Open positions keyed by symbol. A symbol is only present here while quantity > 0. */
  positions: Record<string, Position>;
  tradeHistory: Trade[];
}

export interface Order {
  symbol: string;
  side: OrderSide;
  /** Whole shares only. */
  quantity: number;
  /** Market-order fill price, supplied by the caller — this engine never fetches quotes. */
  executionPrice: number;
}

export interface Trade {
  symbol: string;
  side: OrderSide;
  quantity: number;
  price: number;
  timestamp: number;
  /** Present on sell trades only — the realized P/L on the shares sold in this trade. */
  realizedPnL?: number;
}

/** Result of submitting an order — rejections are values, not thrown exceptions. */
export type OrderResult =
  | { ok: true; account: Account; trade: Trade }
  | { ok: false; reason: string };
