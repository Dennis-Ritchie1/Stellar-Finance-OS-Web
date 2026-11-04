import { render } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { TOKEN_PREFIX } from '@finance-os/api-client/mocks';
import type { WalletClient } from '@finance-os/wallet';
import { sessionStore } from '../auth/session-store';
import { Providers } from '../providers';
import { routes } from '../router';

export const USERS = {
  owner: 'u_ada',
  approver: 'u_ben',
  accountant: 'u_chi',
  viewer: 'u_dee',
  approver2: 'u_eze',
} as const;

/** Render the full app at `path`, optionally signed in as a mock user. */
export function renderApp(
  path: string,
  options: { as?: keyof typeof USERS; walletClient?: WalletClient } = {},
) {
  if (options.as)
    sessionStore.set({ token: `${TOKEN_PREFIX}${USERS[options.as]}`, orgId: 'org_acme' });
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  const utils = render(
    <Providers walletClient={options.walletClient}>
      <RouterProvider router={router} />
    </Providers>,
  );
  return { ...utils, router };
}
