import { useState, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ApiClientProvider, ApiError, createApiClient } from '@finance-os/api-client';
import { AuthProvider } from './auth/auth-provider';
import { sessionStore } from './auth/session-store';
import { env } from './env';

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        // Don't retry auth/permission/not-found errors — show the right state immediately.
        retry: (count, error) =>
          !(error instanceof ApiError && [401, 403, 404].includes(error.status)) && count < 1,
      },
    },
  });
}

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(makeQueryClient);
  const [apiClient] = useState(() =>
    createApiClient({
      baseUrl: env.apiUrl,
      getToken: sessionStore.getToken,
      getOrgId: sessionStore.getOrgId,
      onUnauthorized: () => sessionStore.get() && sessionStore.clear(),
    }),
  );
  return (
    <ApiClientProvider client={apiClient}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>{children}</AuthProvider>
      </QueryClientProvider>
    </ApiClientProvider>
  );
}
