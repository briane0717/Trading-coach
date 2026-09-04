// Shared, vendor-agnostic market data shapes. Every data-provider adapter normalizes into
// these types so nothing downstream ever needs to know which provider produced the data.

/** How the data was obtained. Must be surfaced to the UI on every render — see CLAUDE.md. */
export type SourceType = 'real-time' | 'delayed' | 'historical' | 'simulated';

/** Provenance metadata attached to every provider response. */
export interface MarketDataMeta {
  sourceType: SourceType;
  /** Epoch ms when this data was produced. */
  timestamp: number;
  /** True if this data is known to be older than the caller should treat as current. */
  stale: boolean;
}

/** A provider response is always the requested payload plus provenance metadata. */
export type WithMeta<T> = T & MarketDataMeta;

export interface Quote {
  symbol: string;
  price: number;
  bid: number;
  ask: number;
  spread: number;
  volume: number;
  marketCap: number | null;
  dayHigh: number;
  dayLow: number;
  prevClose: number;
}

export interface Candle {
  /** Epoch ms for the start of this bar. */
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export type Timeframe = '1m' | '5m' | '15m' | '1h' | '1d';

export type HistoricalRange = '1D' | '5D' | '1M' | '3M' | '6M' | '1Y' | '5Y';

export interface CandleSeries {
  symbol: string;
  candles: Candle[];
}

export type IndicatorName = 'SMA' | 'EMA' | 'RSI' | 'MACD' | 'ATR' | 'VWAP';

export interface IndicatorRequest {
  name: IndicatorName;
  /** Lookback period, where applicable. Ignored by indicators that don't use one (e.g. VWAP). */
  period?: number;
}

export interface IndicatorPoint {
  timestamp: number;
  /** A single number for most indicators; a record of named lines for multi-line ones (MACD). */
  value: number | Record<string, number>;
}

export interface IndicatorResult {
  name: IndicatorName;
  period?: number;
  points: IndicatorPoint[];
}
