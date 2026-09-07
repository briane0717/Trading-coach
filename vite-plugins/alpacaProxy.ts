import type { Plugin } from 'vite';

const ALPACA_API_BASE = 'https://data.alpaca.markets';
const PROXY_PREFIX = '/api/alpaca';

// Reads Alpaca credentials from process.env, not import.meta.env: this module only runs
// inside the Vite dev server process (Node), never in the browser, so the keys are never
// exposed to client code or inlined into the bundle.
function getAlpacaCredentials(): { keyId: string; secretKey: string } {
  const keyId = process.env.ALPACA_KEY_ID;
  const secretKey = process.env.ALPACA_SECRET_KEY;

  if (!keyId) {
    throw new Error('ALPACA_KEY_ID is missing or empty. Set it in .env.local (see .env.example).');
  }
  if (!secretKey) {
    throw new Error(
      'ALPACA_SECRET_KEY is missing or empty. Set it in .env.local (see .env.example).'
    );
  }

  return { keyId, secretKey };
}

// Dev-only relay for Alpaca Market Data, single-purpose (hardcoded to data.alpaca.markets,
// not a general proxy). Only works under `npm run dev` — a deployed build needs an equivalent
// server-side proxy (serverless function or similar); see ARCHITECTURE.md open items.
export function alpacaDevProxy(): Plugin {
  return {
    name: 'alpaca-dev-proxy',
    configureServer(server) {
      server.middlewares.use(PROXY_PREFIX, async (req, res) => {
        try {
          const { keyId, secretKey } = getAlpacaCredentials();
          const targetUrl = `${ALPACA_API_BASE}${req.url}`;

          const alpacaRes = await fetch(targetUrl, {
            method: req.method,
            headers: {
              'APCA-API-KEY-ID': keyId,
              'APCA-API-SECRET-KEY': secretKey,
            },
          });

          res.statusCode = alpacaRes.status;
          const contentType = alpacaRes.headers.get('content-type');
          if (contentType) {
            res.setHeader('content-type', contentType);
          }
          res.end(Buffer.from(await alpacaRes.arrayBuffer()));
        } catch (err) {
          res.statusCode = 502;
          res.end(JSON.stringify({ error: err instanceof Error ? err.message : 'proxy error' }));
        }
      });
    },
  };
}
