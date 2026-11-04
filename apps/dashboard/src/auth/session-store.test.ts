import { describe, expect, it, vi } from 'vitest';
import { sessionStore } from './session-store';

describe('sessionStore', () => {
  it('persists, switches org, notifies and clears', () => {
    const listener = vi.fn();
    const unsubscribe = sessionStore.subscribe(listener);
    sessionStore.set({ token: 't', orgId: 'org_a' });
    sessionStore.setOrg('org_b');
    expect(sessionStore.getOrgId()).toBe('org_b');
    expect(JSON.parse(localStorage.getItem('finance-os.session')!)).toEqual({
      token: 't',
      orgId: 'org_b',
    });
    sessionStore.clear();
    expect(sessionStore.getToken()).toBeNull();
    expect(listener).toHaveBeenCalledTimes(3);
    unsubscribe();
  });
});
