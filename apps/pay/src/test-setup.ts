import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, beforeEach } from 'vitest';
import { resetMockBackend, server } from './test/server';

beforeAll(() => server.listen({ onUnhandledFrame: 'error' }));
beforeEach(() => {
  resetMockBackend();
  window.localStorage.clear();
  window.sessionStorage.clear();
});
// Vitest runs without globals, so Testing Library can't register auto-cleanup itself.
afterEach(() => cleanup());
afterAll(() => server.close());
