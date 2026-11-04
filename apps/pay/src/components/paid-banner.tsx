import { CheckCircle2 } from 'lucide-react';

export function PaidBanner() {
  return (
    <div
      role="status"
      className="flex items-center gap-3 rounded-xl border border-status-success/40 bg-status-success/10 p-4"
    >
      <CheckCircle2 className="size-6 text-status-success" />
      <div>
        <p className="font-semibold">Paid ✓</p>
        <p className="text-sm text-muted-foreground">Payment received. Thank you!</p>
      </div>
    </div>
  );
}
