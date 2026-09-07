import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { alpacaDevProxy } from './vite-plugins/alpacaProxy';

export default defineConfig(({ mode }) => {
  // Vite only auto-exposes VITE_-prefixed vars (to import.meta.env, client-side). Alpaca's
  // keys are deliberately unprefixed so they stay server-only — loadEnv(..., '') reads .env /
  // .env.local regardless of prefix so the dev-only proxy plugin can read them from process.env.
  const env = loadEnv(mode, process.cwd(), '');
  process.env.ALPACA_KEY_ID ??= env.ALPACA_KEY_ID;
  process.env.ALPACA_SECRET_KEY ??= env.ALPACA_SECRET_KEY;

  return {
    plugins: [react(), alpacaDevProxy()],
    root: '.',
  };
});
