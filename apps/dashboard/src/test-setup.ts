import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, beforeEach } from 'vitest';
import { sessionStore } from './auth/session-store';
import { resetMockBackend, server } from './test/server';

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
