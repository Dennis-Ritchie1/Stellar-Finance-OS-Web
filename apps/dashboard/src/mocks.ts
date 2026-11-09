import { env } from './env';

/** Start MSW before first render when running `pnpm dev` with VITE_ENABLE_MOCKS=true. */
export async function enableMocking() {
  if (!import.meta.env.DEV || import.meta.env.VITE_ENABLE_MOCKS !== 'true') return;
  if (import.meta.env.VITE_E2E === 'true') {
    // Playwright runs: the two apps share one mock database through a local relay.
    const { startE2eWorker } = await import('@finance-os/api-client/mocks/e2e');
    await startE2eWorker({
      baseUrl: env.apiUrl,
      horizonUrl: import.meta.env.VITE_HORIZON_URL ?? 'https://horizon-testnet.stellar.org',
      relayUrl: import.meta.env.VITE_E2E_RELAY_URL ?? 'http://localhost:5190',
    });
    return;
  }
  const { startMockWorker } = await import('@finance-os/api-client/mocks/browser');
  await startMockWorker(env.apiUrl);
}
