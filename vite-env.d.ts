/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ALPACA_KEY_ID: string;
  readonly VITE_ALPACA_SECRET_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
