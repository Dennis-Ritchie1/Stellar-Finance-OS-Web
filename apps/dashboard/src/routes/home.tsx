import { Link } from 'react-router';
import { useDashboardSummary } from '@finance-os/api-client';
import {
  Amount,
  Button,
  CardDescription,
  CashflowChart,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  PageHeader,
  Skeleton,
} from '@finance-os/ui';
import { Plus } from 'lucide-react';
import { Can } from '../components/can';
import { QueryView } from '../components/query-view';
import { StatTile } from '../features/dashboard/stat-tile';
import { TreasuryCard } from '../features/dashboard/treasury-card';

function HomeSkeleton() {
  return (
    <div className="grid gap-4" aria-busy="true" aria-label="Loading dashboard">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
      <Skeleton className="h-80" />
    </div>
  );
}

export function HomePage() {
  const query = useDashboardSummary();

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Balances, cash flow and what needs your attention."
        actions={
          <Can permission="invoices:write">
            <Button asChild>
              <Link to="/invoices/new">
                <Plus /> New invoice
              </Link>
            </Button>
          </Can>
        }
      />
      <QueryView query={query} resource="your dashboard" loading={<HomeSkeleton />}>
        {(summary) => (
          <div className="grid gap-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatTile
                label="Open invoices"
                to="/invoices"
                value={summary.openInvoices.count}
                detail={
                  <Amount
                    value={summary.openInvoices.amount}
                    assetCode={summary.openInvoices.assetCode}
                  />
                }
              />
              <StatTile
                label="Overdue"
                to="/invoices?status=overdue"
                value={summary.overdueInvoices.count}
                detail={
                  <Amount
                    value={summary.overdueInvoices.amount}
                    assetCode={summary.overdueInvoices.assetCode}
                  />
                }
              />
              <StatTile
                label="Waiting for your approval"
                to="/approvals"
                value={summary.pendingApprovals}
                detail="Payment requests"
              />
              <StatTile
                label="Unmatched payments"
                to="/transactions?filter=unmatched"
                value={summary.unmatchedPayments}
                detail="Need linking to an invoice"
              />
            </div>
            <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
              <Card>
                <CardHeader>
                  <CardTitle>Cash flow · last 30 days</CardTitle>
                  <CardDescription>Money in and out across all treasury accounts.</CardDescription>
                </CardHeader>
                <CardContent>
                  <CashflowChart data={summary.cashflow} assetCode={summary.cashflowAssetCode} />
                </CardContent>
              </Card>
              <TreasuryCard accounts={summary.treasuryAccounts} />
            </div>
          </div>
        )}
      </QueryView>
    </>
  );
}
