import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@finance-os/ui';

/** A single headline number. Not a chart — the number is the point. */
export function StatTile({
  label,
  value,
  detail,
  to,
}: {
  label: string;
  value: ReactNode;
  detail?: ReactNode;
  to?: string;
}) {
  const body = (
    <Card className="h-full gap-2 transition-colors hover:bg-accent/40">
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-2xl tabular-nums">{value}</CardTitle>
      </CardHeader>
      {detail ? (
        <CardContent className="text-sm text-muted-foreground">{detail}</CardContent>
      ) : null}
    </Card>
  );
  return to ? (
    <Link
      to={to}
      className="block rounded-xl focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
    >
      {body}
    </Link>
  ) : (
    body
  );
}
