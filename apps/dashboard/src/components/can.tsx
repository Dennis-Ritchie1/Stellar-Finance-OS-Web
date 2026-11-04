import type { ReactNode } from 'react';
import { useAuth } from '../auth/auth-context';
import { can, type Permission } from '../auth/permissions';

/** Renders children only if the current role has `permission`. UX only — the API enforces. */
export function Can({
  permission,
  children,
  fallback = null,
}: {
  permission: Permission;
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { role } = useAuth();
  return <>{can(role, permission) ? children : fallback}</>;
}

export function usePermission(permission: Permission) {
  const { role } = useAuth();
  return can(role, permission);
}
