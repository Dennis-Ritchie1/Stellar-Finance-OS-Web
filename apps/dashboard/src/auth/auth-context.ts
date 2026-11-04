import { createContext, useContext } from 'react';
import type { Membership, Role, Session, User } from '@finance-os/api-client';

export interface AuthState {
  status: 'anonymous' | 'loading' | 'authenticated';
  user: User | null;
  memberships: Membership[];
  /** Membership for the active organization. */
  membership: Membership | null;
  role: Role | undefined;
  signIn: (session: Session) => void;
  signOut: () => void;
  switchOrg: (orgId: string) => void;
}

export const AuthContext = createContext<AuthState | null>(null);

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
