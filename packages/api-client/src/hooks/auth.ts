import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useApiClient } from '../context';
import { unwrap } from '../errors';
import type { LoginInput, RegisterInput } from '../types';
import { keys } from './keys';

export function useMe(options: { enabled?: boolean } = {}) {
  const api = useApiClient();
  return useQuery({
    queryKey: keys.me,
    queryFn: async () => unwrap(await api.GET('/me')),
    enabled: options.enabled ?? true,
    retry: false,
  });
}

export function useLogin() {
  const api = useApiClient();
  return useMutation({
    mutationFn: async (body: LoginInput) => unwrap(await api.POST('/auth/login', { body })),
  });
}

export function useRegister() {
  const api = useApiClient();
  return useMutation({
    mutationFn: async (body: RegisterInput) => unwrap(await api.POST('/auth/register', { body })),
  });
}

export function useLogout() {
  const api = useApiClient();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await api.POST('/auth/logout');
    },
    onSettled: () => qc.clear(),
  });
}
