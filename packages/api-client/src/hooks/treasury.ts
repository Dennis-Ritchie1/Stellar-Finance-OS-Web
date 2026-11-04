import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useApiClient } from '../context';
import { unwrap } from '../errors';
import type { TreasuryAccountInput } from '../types';
import { keys } from './keys';

export function useTreasuryAccounts() {
  const api = useApiClient();
  return useQuery({
    queryKey: keys.treasuryAccounts.all,
    queryFn: async () => unwrap(await api.GET('/treasury-accounts')).data,
  });
}

export function useCreateTreasuryAccount() {
  const api = useApiClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: TreasuryAccountInput) =>
      unwrap(await api.POST('/treasury-accounts', { body })),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.treasuryAccounts.all }),
  });
}
