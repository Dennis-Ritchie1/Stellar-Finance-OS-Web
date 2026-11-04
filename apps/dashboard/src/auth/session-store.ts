// Tiny external store for the session token + active org, persisted to localStorage.
// Only the opaque API token is stored here — never a Stellar secret key.
const KEY = 'finance-os.session';

export interface StoredSession {
  token: string;
  orgId: string | null;
}

type Listener = () => void;
const listeners = new Set<Listener>();

function read(): StoredSession | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as StoredSession) : null;
  } catch {
    return null;
  }
}

let current = read();

function write(next: StoredSession | null) {
  current = next;
  try {
    if (next) localStorage.setItem(KEY, JSON.stringify(next));
    else localStorage.removeItem(KEY);
  } catch {
    // Storage can be unavailable (private mode); the in-memory value still works for this tab.
  }
  listeners.forEach((l) => l());
}

export const sessionStore = {
  get: () => current,
  getToken: () => current?.token ?? null,
  getOrgId: () => current?.orgId ?? null,
  set: (session: StoredSession) => write(session),
  setOrg: (orgId: string) => current && write({ ...current, orgId }),
  clear: () => write(null),
  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};
