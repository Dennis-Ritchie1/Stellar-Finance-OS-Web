import { useMutation, useQuery } from '@tanstack/react-query';
import { useApiClient } from '../context';
import { ApiError, unwrap } from '../errors';
import { keys } from './keys';

export function useDashboardSummary() {
  const api = useApiClient();
  return useQuery({
    queryKey: keys.dashboard,
    queryFn: async () => unwrap(await api.GET('/dashboard/summary')),
  });
}

export function useTreasuryReport(from: string, to: string) {
  const api = useApiClient();
  return useQuery({
    queryKey: keys.reports.treasury(from, to),
    queryFn: async () =>
      unwrap(await api.GET('/reports/treasury', { params: { query: { from, to } } })),
    enabled: Boolean(from && to),
  });
}

/** Fetches the reconciliation CSV as text; the caller turns it into a download. */
export function useExportReconciliation() {
  const api = useApiClient();
  return useMutation({
    mutationFn: async ({ from, to }: { from: string; to: string }) => {
      const { data, response } = await api.GET('/exports/reconciliation', {
        params: { query: { from, to } },
        parseAs: 'text',
      });
      if (!response.ok || data === undefined) throw new ApiError(response.status);
      return data;
    },
  });
}
