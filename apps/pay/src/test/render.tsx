import { render } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import type { WalletClient } from '@finance-os/wallet';
import { Providers } from '../providers';
import { routes } from '../router';

export function renderPay(path: string, options: { walletClient?: WalletClient } = {}) {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  return render(
    <Providers walletClient={options.walletClient}>
      <RouterProvider router={router} />
    </Providers>,
  );
}
