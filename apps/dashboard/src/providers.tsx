import { useState, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ApiClientProvider, createApiClient } from '@finance-os/api-client';
import { env } from './env';

// Session handling lands in task #3; until then requests go out unauthenticated.
const getToken = () => null;

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () => new QueryClient({ defaultOptions: { queries: { staleTime: 30_000, retry: 1 } } }),
  );
  const [apiClient] = useState(() => createApiClient({ baseUrl: env.apiUrl, getToken }));
  return (
    <ApiClientProvider client={apiClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </ApiClientProvider>
  );
}
