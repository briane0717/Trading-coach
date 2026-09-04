import type {
  Candle,
  HistoricalRange,
  IndicatorRequest,
  IndicatorResult,
  Quote,
  Timeframe,
  WithMeta,
} from '../normalized';

/**
 * The contract every market-data adapter implements — simulated today, real vendors later.
 * Application code must depend only on this interface, never on a vendor SDK directly
 * (see ARCHITECTURE.md: "nothing above the adapter line ever imports a vendor SDK directly").
 */
export interface MarketDataProvider {
  getQuote(symbol: string): Promise<WithMeta<Quote>>;

  getIntraday(
    symbol: string,
    timeframe: Timeframe
  ): Promise<WithMeta<{ symbol: string; timeframe: Timeframe; candles: Candle[] }>>;

  getHistorical(
    symbol: string,
    range: HistoricalRange
  ): Promise<WithMeta<{ symbol: string; range: HistoricalRange; candles: Candle[] }>>;

  getIndicators(
    symbol: string,
    list: IndicatorRequest[]
  ): Promise<WithMeta<{ symbol: string; indicators: IndicatorResult[] }>>;
}
