/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Selects the live MarketDataProvider. Unset/missing/unrecognized → 'simulated' (never
   * defaults to real data on ambiguity). See ui/trading/OrderForm.tsx and .env.example. */
  readonly VITE_MARKET_DATA_PROVIDER?: 'simulated' | 'alpaca';
}
