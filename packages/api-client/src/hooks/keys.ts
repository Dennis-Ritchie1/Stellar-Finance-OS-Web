import type { InvoiceStatus, MatchStatus, PaymentRequestStatus } from '../types';

/** Central query keys so mutations can invalidate precisely. */
export const keys = {
  me: ['me'] as const,
  clients: {
    all: ['clients'] as const,
    detail: (id: string) => ['clients', id] as const,
  },
  invoices: {
    all: ['invoices'] as const,
    list: (status?: InvoiceStatus) => ['invoices', 'list', { status }] as const,
    detail: (id: string) => ['invoices', 'detail', id] as const,
    public: (token: string) => ['public-invoice', token] as const,
  },
  vendors: { all: ['vendors'] as const },
  treasuryAccounts: { all: ['treasury-accounts'] as const },
  paymentRequests: {
    all: ['payment-requests'] as const,
    list: (status?: PaymentRequestStatus) => ['payment-requests', 'list', { status }] as const,
    detail: (id: string) => ['payment-requests', 'detail', id] as const,
  },
  approvals: { all: ['approvals'] as const },
  transactions: {
    all: ['transactions'] as const,
    list: (matchStatus?: MatchStatus) => ['transactions', 'list', { matchStatus }] as const,
  },
  dashboard: ['dashboard'] as const,
  reports: { treasury: (from: string, to: string) => ['reports', 'treasury', from, to] as const },
  org: ['org'] as const,
  members: ['members'] as const,
  approvalPolicies: ['approval-policies'] as const,
};
