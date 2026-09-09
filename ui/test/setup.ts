import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// vitest.config's `test.globals` is left off (the project uses explicit imports elsewhere), so
// Testing Library's own auto-cleanup — which only self-registers when it detects `afterEach` as
// a global — never fires. Do it explicitly so each test starts from an empty DOM.
afterEach(() => {
  cleanup();
});

// Vite/Vitest loads .env.local same as `npm run dev` does, so whatever VITE_MARKET_DATA_PROVIDER
// is set to on a given machine (e.g. 'alpaca') would otherwise leak into `npm test`. OrderForm
// and PaperTradingDashboard each resolve their provider via a module-level
// `selectMarketDataProvider(import.meta.env.VITE_MARKET_DATA_PROVIDER)` singleton, read once at
// import time — so this must run here, as setupFiles top-level code (which Vitest guarantees
// runs before a test file's own imports are evaluated), not inside a beforeEach/afterEach hook,
// which would fire too late to affect that read. This makes 'simulated' the stable default
// regardless of ambient env; a test file that legitimately needs the Alpaca path should stub
// 'alpaca' itself — but because of that same import-time timing, it'll need to do so before
// importing OrderForm/PaperTradingDashboard, e.g. via vi.resetModules() + a dynamic import
// inside the test, not a plain top-of-file vi.stubEnv call (which runs after static imports
// have already resolved).
vi.stubEnv('VITE_MARKET_DATA_PROVIDER', 'simulated');
