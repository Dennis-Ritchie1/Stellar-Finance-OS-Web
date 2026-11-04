import createClient, { type Middleware } from 'openapi-fetch';
import type { paths } from './schema';

export type ApiClient = ReturnType<typeof createApiClient>;

export interface ApiClientOptions {
  baseUrl: string;
  /** Returns the current session token, if any. */
  getToken?: () => string | null | undefined;
}

export function createApiClient({ baseUrl, getToken }: ApiClientOptions) {
  const client = createClient<paths>({ baseUrl });
  const auth: Middleware = {
    onRequest({ request }) {
      const token = getToken?.();
      if (token) request.headers.set('Authorization', `Bearer ${token}`);
      return request;
    },
  };
  client.use(auth);
  return client;
}
