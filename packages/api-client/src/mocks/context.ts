import { HttpResponse } from 'msw';
import type { Role } from '../types';
import type { MockDb, MockUser } from './db';

export interface MockContext {
  db: MockDb;
  /** API base URL, e.g. http://localhost:3000/v1 */
  base: string;
}

export const TOKEN_PREFIX = 'mock-token:';

export function error(status: number, code: string, message: string) {
  return HttpResponse.json({ code, message }, { status });
}

export interface Caller {
  user: MockUser;
  orgId: string;
  role: Role;
}

/** Resolve the caller from Authorization + X-Org-Id, or return an error Response. */
export function authenticate(db: MockDb, request: Request): Caller | Response {
  const header = request.headers.get('Authorization') ?? '';
  const userId = header.startsWith(`Bearer ${TOKEN_PREFIX}`)
    ? header.slice(`Bearer ${TOKEN_PREFIX}`.length)
    : null;
  const user = db.users.find((u) => u.id === userId);
  if (!user) return error(401, 'unauthorized', 'Please log in again.');
  const orgId = request.headers.get('X-Org-Id') ?? user.memberships[0]?.orgId;
  const membership = user.memberships.find((m) => m.orgId === orgId);
  if (!membership) return error(403, 'forbidden', "You don't have access to this organization.");
  return { user, orgId: membership.orgId, role: membership.role };
}

/** Enforce a role server-side, like the real backend would. */
export function requireRole(caller: Caller, roles: Role[]): Response | null {
  return roles.includes(caller.role)
    ? null
    : error(403, 'forbidden', "Your role doesn't allow this action.");
}

export const WRITE_ROLES: Role[] = ['owner', 'admin', 'accountant'];
export const ADMIN_ROLES: Role[] = ['owner', 'admin'];

let counter = 0;
export const newId = (prefix: string) =>
  `${prefix}_${Date.now().toString(36)}${(counter++).toString(36)}`;
