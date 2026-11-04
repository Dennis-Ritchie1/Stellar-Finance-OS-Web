import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useApiClient } from '../context';
import { unwrap } from '../errors';
import type { ClientInput } from '../types';
import { keys } from './keys';

export function useClients() {
  const api = useApiClient();
  return useQuery({
    queryKey: keys.clients.all,
    queryFn: async () => unwrap(await api.GET('/clients')).data,
  });
}

export function useCreateClient() {
  const api = useApiClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: ClientInput) => unwrap(await api.POST('/clients', { body })),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.clients.all }),
  });
}

export function useUpdateClient(id: string) {
  const api = useApiClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: ClientInput) =>
      unwrap(await api.PATCH('/clients/{id}', { params: { path: { id } }, body })),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.clients.all }),
  });
}
