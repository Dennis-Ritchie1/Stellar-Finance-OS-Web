import { createBrowserRouter, Outlet, type RouteObject } from 'react-router';
import { MissingLinkPage } from './routes/missing-link';
import { PayInvoicePage } from './routes/pay-invoice';

function PayShell() {
  return (
    <div className="min-h-svh bg-muted/40">
      <main className="mx-auto w-full max-w-lg px-4 py-6 sm:py-10">
        <Outlet />
      </main>
      <footer className="pb-6 text-center text-xs text-muted-foreground">Secure payment on the Stellar network</footer>
    </div>
  );
}

export const routes: RouteObject[] = [
  {
    element: <PayShell />,
    children: [
      { path: '/i/:publicToken', element: <PayInvoicePage /> },
      { path: '*', element: <MissingLinkPage /> },
    ],
  },
];

export const createRouter = () => createBrowserRouter(routes);
