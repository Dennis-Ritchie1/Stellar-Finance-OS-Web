import { useAuth } from './auth-context';
import { can, type Permission } from './permissions';

/** UX-only permission check for the current role. The API still enforces. */
export function usePermission(permission: Permission) {
  const { role } = useAuth();
  return can(role, permission);
}
