/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_STELLAR_NETWORK: string;
  readonly VITE_EXPLORER_URL: string;
  readonly VITE_PAY_APP_URL: string;
  readonly VITE_ENABLE_MOCKS?: string;
  readonly VITE_E2E?: string;
  readonly VITE_E2E_RELAY_URL?: string;
  readonly VITE_HORIZON_URL?: string;
  readonly VITE_PENDING_PAYMENT_MINUTES?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
