import { createBrowserRouter, type RouteObject } from 'react-router';
import { RedirectIfAuthenticated, RequireAuth } from './auth/guards';
import { AppLayout } from './layouts/app-layout';
import { AuthLayout } from './layouts/auth-layout';
import { ApprovalsPage } from './routes/approvals';
import { ClientsPage } from './routes/clients';
import { ExportsPage } from './routes/exports';
import { HomePage } from './routes/home';
import { InvoiceDetailPage } from './routes/invoice-detail';
import { InvoiceEditorPage, InvoiceEditPage } from './routes/invoice-editor';
import { InvoicesPage } from './routes/invoices';
import { LoginPage } from './routes/login';
import { NotFoundPage } from './routes/not-found';
import { OutgoingPaymentsPage } from './routes/payments-outgoing';
import { RegisterPage } from './routes/register';
import { ReportsPage } from './routes/reports';
import { MembersSettingsPage } from './routes/settings/members-settings';
import { OrgSettingsPage } from './routes/settings/org-settings';
import { PoliciesSettingsPage } from './routes/settings/policies-settings';
import { SettingsLayout } from './routes/settings/settings-layout';
import { TreasurySettingsPage } from './routes/settings/treasury-settings';
import { WalletSettingsPage } from './routes/settings/wallet-settings';
import { TransactionsPage } from './routes/transactions';
import { VendorsPage } from './routes/vendors';

export const routes: RouteObject[] = [
  {
    element: <RedirectIfAuthenticated />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: '/login', element: <LoginPage /> },
          { path: '/register', element: <RegisterPage /> },
        ],
      },
    ],
  },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <HomePage /> },
          { path: 'invoices', element: <InvoicesPage /> },
          { path: 'invoices/new', element: <InvoiceEditorPage /> },
          { path: 'invoices/:id', element: <InvoiceDetailPage /> },
          { path: 'invoices/:id/edit', element: <InvoiceEditPage /> },
          { path: 'clients', element: <ClientsPage /> },
          { path: 'vendors', element: <VendorsPage /> },
          { path: 'payments/outgoing', element: <OutgoingPaymentsPage /> },
          { path: 'approvals', element: <ApprovalsPage /> },
          { path: 'transactions', element: <TransactionsPage /> },
          { path: 'reports', element: <ReportsPage /> },
          { path: 'exports', element: <ExportsPage /> },
          {
            path: 'settings',
            element: <SettingsLayout />,
            children: [
              { index: true, element: <OrgSettingsPage /> },
              { path: 'members', element: <MembersSettingsPage /> },
              { path: 'treasury', element: <TreasurySettingsPage /> },
              { path: 'policies', element: <PoliciesSettingsPage /> },
              { path: 'wallet', element: <WalletSettingsPage /> },
            ],
          },
          { path: '*', element: <NotFoundPage /> },
        ],
      },
    ],
  },
];

export const createRouter = () => createBrowserRouter(routes);
