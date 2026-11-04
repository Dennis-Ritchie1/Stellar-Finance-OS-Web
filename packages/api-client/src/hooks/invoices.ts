import { useQuery } from '@tanstack/react-query';
import { useApiClient } from '../context';
import type { components } from '../schema';

export type Invoice = components['schemas']['Invoice'];
export type InvoiceStatus = components['schemas']['InvoiceStatus'];
export type PublicInvoice = components['schemas']['PublicInvoice'];

export const invoiceKeys = {
  all: ['invoices'] as const,
  list: (status?: InvoiceStatus) => [...invoiceKeys.all, 'list', { status }] as const,
  public: (token: string) => ['public-invoice', token] as const,
};

export function useInvoices(status?: InvoiceStatus) {
  const api = useApiClient();
  return useQuery({
    queryKey: invoiceKeys.list(status),
    queryFn: async () => {
      const { data, error } = await api.GET('/invoices', { params: { query: { status } } });
      if (error) throw error;
      return data.data;
    },
  });
}

export function usePublicInvoice(publicToken: string, options: { pollMs?: number } = {}) {
  const api = useApiClient();
  return useQuery({
    queryKey: invoiceKeys.public(publicToken),
    queryFn: async () => {
      const { data, error } = await api.GET('/public/invoices/{publicToken}', {
        params: { path: { publicToken } },
      });
      if (error || !data) throw error ?? new Error('Invoice not found');
      return data;
    },
    refetchInterval: (query) =>
      query.state.data?.status === 'paid' ? false : (options.pollMs ?? false),
  });
}
