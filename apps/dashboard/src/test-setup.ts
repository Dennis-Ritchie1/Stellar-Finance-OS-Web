import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, beforeEach } from 'vitest';
import { sessionStore } from './auth/session-store';
import { resetMockBackend, server } from './test/server';

// jsdom installs its own Uint8Array, so stellar-sdk's `instanceof Uint8Array` checks reject
// Node Buffers (used by the mock backend). Use Node's Uint8Array in tests.
globalThis.Uint8Array = Object.getPrototypeOf(Buffer.prototype).constructor as Uint8ArrayConstructor;

beforeAll(() => server.listen({ onUnhandledFrame: 'error' }));
beforeEach(() => {
  resetMockBackend();
});
// Vitest runs without globals, so Testing Library can't register auto-cleanup itself.
afterEach(() => {
  cleanup();
  sessionStore.clear();
});
afterAll(() => server.close());
