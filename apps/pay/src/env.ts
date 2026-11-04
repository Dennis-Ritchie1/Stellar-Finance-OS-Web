import { parseNetwork } from '@finance-os/wallet';

export const env = {
  apiUrl: import.meta.env.VITE_API_URL ?? 'http://localhost:3000/v1',
  network: parseNetwork(import.meta.env.VITE_STELLAR_NETWORK ?? 'testnet'),
  explorerUrl: import.meta.env.VITE_EXPLORER_URL ?? 'https://stellar.expert/explorer/testnet',
  payAppUrl: import.meta.env.VITE_PAY_APP_URL ?? 'http://localhost:5174',
  horizonUrl: import.meta.env.VITE_HORIZON_URL ?? 'https://horizon-testnet.stellar.org',
} as const;
