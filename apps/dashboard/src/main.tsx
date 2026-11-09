import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router';
import { Providers } from './providers';
import { loadE2eWallet } from './e2e-wallet';
import { enableMocking } from './mocks';
import { initErrorReporting } from './error-reporting';
import { createRouter } from './router';
import './index.css';

await enableMocking();
await initErrorReporting();
const walletClient = await loadE2eWallet();

const router = createRouter();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Providers walletClient={walletClient}>
      <RouterProvider router={router} />
    </Providers>
  </StrictMode>,
);
