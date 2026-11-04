import type { InvoiceMatch } from '@finance-os/api-client';
import { Amount, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@finance-os/ui';
import { explorerUrl, formatDate, truncateAddress } from '@finance-os/utils';
import { ExternalLink } from 'lucide-react';
import { env } from '../../env';

export function MatchHistory({ matches }: { matches: InvoiceMatch[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Payments received</CardTitle>
        <CardDescription>Payments matched to this invoice.</CardDescription>
      </CardHeader>
      <CardContent>
        {matches.length === 0 ? (
          <p className="text-sm text-muted-foreground">No payments yet.</p>
        ) : (
          <ul className="divide-y text-sm">
            {matches.map((m) => (
              <li key={m.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                <div>
                  <p className="font-medium">
                    Payment received · <Amount value={m.amount} assetCode={m.assetCode} />
                  </p>
                  <p className="text-muted-foreground">
                    {formatDate(m.matchedAt)} · from {truncateAddress(m.from)} ·{' '}
                    {m.method === 'manual' ? 'Matched manually' : 'Matched automatically'}
                  </p>
                </div>
                <a
                  href={explorerUrl(env.explorerUrl, 'tx', m.txHash)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-primary hover:underline"
                >
                  View on explorer <ExternalLink className="size-3.5" />
                </a>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
