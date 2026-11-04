// Server-side approval rules, simulated for mocks. The UI never re-implements these.
import Big from 'big.js';
import type { PaymentRequest, Role } from '../types';
import type { Caller } from './context';
import type { MockDb } from './db';

export function policyFor(db: MockDb, amount: string, assetCode: string) {
  const applicable = db.approvalPolicies
    .filter((p) => p.assetCode === assetCode && new Big(amount).gte(p.minAmount))
    .sort((a, b) => b.requiredApprovals - a.requiredApprovals);
  return applicable[0] ?? { requiredApprovals: 1, approverRoles: ['owner', 'admin'] as Role[] };
}

const SUBMIT_ROLES: Role[] = ['owner', 'admin', 'accountant'];

/** Decorate a request with what this caller may do. */
export function viewFor(db: MockDb, request: PaymentRequest, caller: Caller): PaymentRequest {
  const policy = policyFor(db, request.amount, request.assetCode);
  const alreadyDecided = request.approvals.some((a) => a.userId === caller.user.id);
  return {
    ...request,
    canApprove:
      request.status === 'pending_approval' &&
      policy.approverRoles.includes(caller.role) &&
      !alreadyDecided &&
      request.createdByName !== caller.user.name,
    canSubmit: request.status === 'approved' && SUBMIT_ROLES.includes(caller.role),
  };
}
