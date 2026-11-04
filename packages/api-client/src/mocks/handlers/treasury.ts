import { http, HttpResponse } from 'msw';
import type { TreasuryAccountInput } from '../../types';
import { ADMIN_ROLES, authenticate, newId, requireRole, type MockContext } from '../context';

export const treasuryHandlers = ({ db, base }: MockContext) => [
  http.get(`${base}/treasury-accounts`, ({ request }) => {
    const caller = authenticate(db, request);
    if (caller instanceof Response) return caller;
    return HttpResponse.json({ data: db.treasuryAccounts });
  }),

  http.post(`${base}/treasury-accounts`, async ({ request }) => {
    const caller = authenticate(db, request);
    if (caller instanceof Response) return caller;
    const denied = requireRole(caller, ADMIN_ROLES);
    if (denied) return denied;
    const input = (await request.json()) as TreasuryAccountInput;
    const account = { id: newId('ta'), ...input, balances: [] };
    db.treasuryAccounts.push(account);
    return HttpResponse.json(account, { status: 201 });
  }),
];
