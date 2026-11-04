import { setupServer } from 'msw/node';
import { createDb, createHandlers, type MockDb } from '@finance-os/api-client/mocks';
import { env } from '../env';

export const server = setupServer();
export let db: MockDb = createDb();

/** Fresh mock backend for each test. */
export function resetMockBackend() {
  db = createDb();
  server.resetHandlers(...createHandlers({ baseUrl: env.apiUrl, db }));
  return db;
}
