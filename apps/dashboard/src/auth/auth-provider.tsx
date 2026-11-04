import { useCallback, useMemo, useSyncExternalStore, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useLogout, useMe, type Session } from '@finance-os/api-client';
import { AuthContext, type AuthState } from './auth-context';
import { sessionStore } from './session-store';

export function AuthProvider({ children }: { children: ReactNode }) {
  const stored = useSyncExternalStore(sessionStore.subscribe, sessionStore.get);
  const qc = useQueryClient();
  const me = useMe({ enabled: Boolean(stored?.token) });
  const logout = useLogout();

  const signIn = useCallback(
    (session: Session) => {
      qc.clear();
      sessionStore.set({ token: session.token, orgId: session.memberships[0]?.orgId ?? null });
      qc.setQueryData(['me'], { user: session.user, memberships: session.memberships });
    },
    [qc],
  );

  const signOut = useCallback(() => {
    logout.mutate();
    sessionStore.clear();
    qc.clear();
  }, [logout, qc]);

  const switchOrg = useCallback(
    (orgId: string) => {
      sessionStore.setOrg(orgId);
      // Drop the previous org's data so nothing from it flashes on screen.
      void qc.resetQueries({ predicate: (q) => q.queryKey[0] !== 'me' });
    },
    [qc],
  );

  const value = useMemo<AuthState>(() => {
    const memberships = me.data?.memberships ?? [];
    const membership = memberships.find((m) => m.orgId === stored?.orgId) ?? memberships[0] ?? null;
    const status = !stored?.token
      ? 'anonymous'
      : me.data
        ? 'authenticated'
        : me.isError
          ? 'anonymous'
          : 'loading';
    return {
      status,
      user: me.data?.user ?? null,
      memberships,
      membership,
      role: membership?.role,
      signIn,
      signOut,
      switchOrg,
    };
  }, [me.data, me.isError, stored, signIn, signOut, switchOrg]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
