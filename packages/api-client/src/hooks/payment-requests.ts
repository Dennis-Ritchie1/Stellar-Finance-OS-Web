import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useApiClient } from '../context';
import { unwrap } from '../errors';
import type { PaymentRequestInput, PaymentRequestStatus } from '../types';
import { keys } from './keys';

const IN_FLIGHT: PaymentRequestStatus[] = ['submitted'];

export function usePaymentRequests(status?: PaymentRequestStatus) {
  const api = useApiClient();
  return useQuery({
    queryKey: keys.paymentRequests.list(status),
    queryFn: async () =>
      unwrap(await api.GET('/payment-requests', { params: { query: { status } } })).data,
  });
}

/** Polls while the payment is submitted and waiting for the indexer to settle it. */
export function usePaymentRequest(id: string, options: { pollMs?: number } = {}) {
  const api = useApiClient();
  return useQuery({
    queryKey: keys.paymentRequests.detail(id),
    queryFn: async () =>
      unwrap(await api.GET('/payment-requests/{id}', { params: { path: { id } } })),
    enabled: Boolean(id),
    refetchInterval: (query) =>
      query.state.data && IN_FLIGHT.includes(query.state.data.status)
        ? (options.pollMs ?? 4000)
        : false,
  });
}

export function useCreatePaymentRequest() {
  const api = useApiClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: PaymentRequestInput) =>
      unwrap(await api.POST('/payment-requests', { body })),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.paymentRequests.all }),
  });
}

/** Step 1 of signing: backend builds the unsigned XDR + a readable summary. */
export function useBuildPaymentTransaction() {
  const api = useApiClient();
  return useMutation({
    mutationFn: async (id: string) =>
      unwrap(await api.POST('/payment-requests/{id}/build-tx', { params: { path: { id } } })),
  });
}

/** Step 2 of signing: hand the wallet-signed XDR back to the backend to submit. */
export function useSubmitPaymentTransaction() {
  const api = useApiClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, signedXdr }: { id: string; signedXdr: string }) =>
      unwrap(
        await api.POST('/payment-requests/{id}/submit', {
          params: { path: { id } },
          body: { signedXdr },
        }),
      ),
    onSuccess: (request) => {
      qc.setQueryData(keys.paymentRequests.detail(request.id), request);
      return qc.invalidateQueries({ queryKey: keys.paymentRequests.all });
    },
  });
}
