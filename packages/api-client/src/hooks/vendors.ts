import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useApiClient } from '../context';
import { unwrap } from '../errors';
import type { VendorInput } from '../types';
import { keys } from './keys';

export function useVendors() {
  const api = useApiClient();
  return useQuery({
    queryKey: keys.vendors.all,
    queryFn: async () => unwrap(await api.GET('/vendors')).data,
  });
}

export function useCreateVendor() {
  const api = useApiClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: VendorInput) => unwrap(await api.POST('/vendors', { body })),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.vendors.all }),
  });
}

export function useUpdateVendor(id: string) {
  const api = useApiClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: VendorInput) =>
      unwrap(await api.PATCH('/vendors/{id}', { params: { path: { id } }, body })),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.vendors.all }),
  });
}
