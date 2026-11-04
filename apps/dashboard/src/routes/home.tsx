import { Link } from 'react-router';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  PageHeader,
} from '@finance-os/ui';
import { Plus } from 'lucide-react';

export function HomePage() {
  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Balances, cash flow and what needs your attention."
        actions={
          <Button asChild>
            <Link to="/invoices/new">
              <Plus /> New invoice
            </Link>
          </Button>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {['Treasury balance', 'Open invoices', 'Pending approvals', 'Unmatched payments'].map(
          (label) => (
            <Card key={label}>
              <CardHeader>
                <CardDescription>{label}</CardDescription>
                <CardTitle className="text-2xl text-muted-foreground">—</CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">
                Widgets arrive in task #10.
              </CardContent>
            </Card>
          ),
        )}
      </div>
    </>
  );
}
