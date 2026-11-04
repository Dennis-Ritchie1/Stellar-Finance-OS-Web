import type { Role } from '@finance-os/api-client';

// UX ONLY: hides/disables controls. The backend is the source of truth and enforces permissions.
export type Permission =
  | 'invoices:write'
  | 'clients:write'
  | 'vendors:write'
  | 'payments:request'
  | 'payments:submit'
  | 'transactions:match'
  | 'exports:run'
  | 'settings:manage';

const MATRIX: Record<Role, Permission[]> = {
  owner: [
    'invoices:write',
    'clients:write',
    'vendors:write',
    'payments:request',
    'payments:submit',
    'transactions:match',
    'exports:run',
    'settings:manage',
  ],
  admin: [
    'invoices:write',
    'clients:write',
    'vendors:write',
    'payments:request',
    'payments:submit',
    'transactions:match',
    'exports:run',
    'settings:manage',
  ],
  accountant: [
    'invoices:write',
    'clients:write',
    'vendors:write',
    'payments:request',
    'payments:submit',
    'transactions:match',
    'exports:run',
  ],
  approver: ['exports:run'],
  viewer: [],
};

export function can(role: Role | undefined, permission: Permission): boolean {
  return role ? MATRIX[role].includes(permission) : false;
}

export const ROLE_LABELS: Record<Role, string> = {
  owner: 'Owner',
  admin: 'Admin',
  approver: 'Approver',
  accountant: 'Accountant',
  viewer: 'Viewer',
};
