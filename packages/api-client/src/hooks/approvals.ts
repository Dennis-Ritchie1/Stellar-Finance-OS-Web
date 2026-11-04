import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useApiClient } from '../context';
import { unwrap } from '../errors';
import { keys } from './keys';

export function useMyApprovals() {
  const api = useApiClient();
  return useQuery({
    queryKey: keys.approvals.all,
    queryFn: async () => unwrap(await api.GET('/approvals')).data,
  });
}

function useDecision(path: '/payment-requests/{id}/approve' | '/payment-requests/{id}/reject') {
  const api = useApiClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, comment }: { id: string; comment?: string }) =>
      unwrap(await api.POST(path, { params: { path: { id } }, body: { comment } })),
    onSuccess: () =>
      Promise.all([
        qc.invalidateQueries({ queryKey: keys.approvals.all }),
        qc.invalidateQueries({ queryKey: keys.paymentRequests.all }),
        qc.invalidateQueries({ queryKey: keys.dashboard }),
      ]),
  });
}

export const useApprovePaymentRequest = () => useDecision('/payment-requests/{id}/approve');
export const useRejectPaymentRequest = () => useDecision('/payment-requests/{id}/reject');
