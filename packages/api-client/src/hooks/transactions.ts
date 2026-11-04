import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useApiClient } from '../context';
import { unwrap } from '../errors';
import type { MatchStatus } from '../types';
import { keys } from './keys';

export function useTransactions(matchStatus?: MatchStatus) {
  const api = useApiClient();
  return useQuery({
    queryKey: keys.transactions.list(matchStatus),
    queryFn: async () =>
      unwrap(await api.GET('/transactions', { params: { query: { matchStatus } } })).data,
  });
}

export function useMatchTransaction() {
  const api = useApiClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, invoiceId }: { id: string; invoiceId: string }) =>
      unwrap(
        await api.POST('/transactions/{id}/match', {
          params: { path: { id } },
          body: { invoiceId },
        }),
      ),
    onSuccess: () =>
      Promise.all([
        qc.invalidateQueries({ queryKey: keys.transactions.all }),
        qc.invalidateQueries({ queryKey: keys.invoices.all }),
        qc.invalidateQueries({ queryKey: keys.dashboard }),
      ]),
  });
}
