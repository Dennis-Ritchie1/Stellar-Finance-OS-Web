import type { TreasuryAccount } from '@finance-os/api-client';
import {
  Address,
  Amount,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@finance-os/ui';
import { env } from '../../env';

export function TreasuryCard({ accounts }: { accounts: TreasuryAccount[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Treasury balances</CardTitle>
        <CardDescription>Per account, as reported by the network.</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="divide-y">
          {accounts.map((a) => (
            <li key={a.id} className="grid gap-1 py-3 first:pt-0 last:pb-0">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium">{a.name}</span>
                <Address value={a.address} explorerBaseUrl={env.explorerUrl} />
              </div>
              {a.balances.length ? (
                a.balances.map((b) => (
                  <Amount
                    key={b.assetCode}
                    value={b.amount}
                    assetCode={b.assetCode}
                    className="text-sm text-muted-foreground"
                  />
                ))
              ) : (
                <span className="text-sm text-muted-foreground">No balances yet</span>
              )}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
