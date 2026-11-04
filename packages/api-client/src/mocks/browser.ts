import { setupWorker } from 'msw/browser';
import { createHandlers } from './index';

/**
 * Start the MSW service worker in the browser. Apps call this (dev only) before rendering.
 * Requests that don't hit the API (assets, Horizon, wallets) pass straight through.
 */
export async function startMockWorker(baseUrl: string) {
  const worker = setupWorker(...createHandlers({ baseUrl }));
  await worker.start({ onUnhandledFrame: 'bypass', quiet: true });
  console.info('[mocks] API is served by MSW. Log in as ada@acme.test / password.');
  return worker;
}
