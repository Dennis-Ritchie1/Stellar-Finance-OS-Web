import { createBrowserRouter, type RouteObject } from 'react-router';
import { PayShell } from './layouts/pay-shell';
import { MissingLinkPage } from './routes/missing-link';
import { PayInvoicePage } from './routes/pay-invoice';

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
