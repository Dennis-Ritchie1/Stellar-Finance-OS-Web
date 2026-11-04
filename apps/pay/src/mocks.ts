import { env } from './env';

/** Start MSW before first render when running `pnpm dev` with VITE_ENABLE_MOCKS=true. */
export async function enableMocking() {
  if (!import.meta.env.DEV || import.meta.env.VITE_ENABLE_MOCKS !== 'true') return;
  const { startMockWorker } = await import('@finance-os/api-client/mocks/browser');
  await startMockWorker(env.apiUrl);
}
