/**
 * Config plumbing for the upcoming Alpaca Market Data adapter (Phase 2, not yet wired in).
 * Nothing imports this yet — see ARCHITECTURE.md "Open items to research before Phase 2."
 */

export interface AlpacaMarketDataConfig {
  keyId: string;
  secretKey: string;
}

// Fail loudly rather than falling back to simulated data or undefined: a missing/empty key
// here means the Alpaca adapter is misconfigured, and a real Phase 2 caller silently getting
// simulated data (or a crash three layers downstream) instead of a clear startup error would
// hide a broken vendor integration.
export function getAlpacaMarketDataConfig(): AlpacaMarketDataConfig {
  const keyId = import.meta.env.VITE_ALPACA_KEY_ID;
  const secretKey = import.meta.env.VITE_ALPACA_SECRET_KEY;

  if (!keyId) {
    throw new Error(
      'VITE_ALPACA_KEY_ID is missing or empty. Set it in .env.local (see .env.example).'
    );
  }
  if (!secretKey) {
    throw new Error(
      'VITE_ALPACA_SECRET_KEY is missing or empty. Set it in .env.local (see .env.example).'
    );
  }

  return { keyId, secretKey };
}
