import { useState, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ApiClientProvider, createApiClient } from '@finance-os/api-client';
import { WalletProvider, type WalletClient } from '@finance-os/wallet';
import { env } from './env';

/** Public app: no auth token — just the API client, query cache and wallet. */
export function Providers({
  children,
  walletClient,
}: {
  children: ReactNode;
  walletClient?: WalletClient;
}) {
  const [queryClient] = useState(
    () => new QueryClient({ defaultOptions: { queries: { retry: 1 } } }),
  );
  const [apiClient] = useState(() => createApiClient({ baseUrl: env.apiUrl }));
  return (
    <ApiClientProvider client={apiClient}>
      <QueryClientProvider client={queryClient}>
        <WalletProvider network={env.network} client={walletClient}>
          {children}
        </WalletProvider>
      </QueryClientProvider>
    </ApiClientProvider>
  );
}
