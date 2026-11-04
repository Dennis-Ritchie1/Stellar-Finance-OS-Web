import createClient, { type Middleware } from 'openapi-fetch';
import type { paths } from './schema';

export type ApiClient = ReturnType<typeof createApiClient>;

export interface ApiClientOptions {
  baseUrl: string;
  /** Returns the current session token, if any. */
  getToken?: () => string | null | undefined;
  /** Returns the active organization id, sent as `X-Org-Id`. */
  getOrgId?: () => string | null | undefined;
  /** Called when the API answers 401, e.g. to clear the session. */
  onUnauthorized?: () => void;
}

export function createApiClient({ baseUrl, getToken, getOrgId, onUnauthorized }: ApiClientOptions) {
  const client = createClient<paths>({ baseUrl });
  const middleware: Middleware = {
    onRequest({ request }) {
      const token = getToken?.();
      if (token) request.headers.set('Authorization', `Bearer ${token}`);
      const orgId = getOrgId?.();
      if (orgId) request.headers.set('X-Org-Id', orgId);
      return request;
    },
    onResponse({ response }) {
      if (response.status === 401) onUnauthorized?.();
      return response;
    },
  };
  client.use(middleware);
  return client;
}
