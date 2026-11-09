import { createBrowserRouter, type RouteObject } from 'react-router';
import { RouteError } from './components/route-error';
import { PayShell } from './layouts/pay-shell';
import { MissingLinkPage } from './routes/missing-link';
import { PayInvoicePage } from './routes/pay-invoice';

export const routes: RouteObject[] = [
  {
    element: <PayShell />,
    errorElement: <RouteError />,
    children: [
      { path: '/i/:publicToken', element: <PayInvoicePage />, errorElement: <RouteError /> },
      { path: '*', element: <MissingLinkPage /> },
    ],
  },
];

export const createRouter = () => createBrowserRouter(routes);
