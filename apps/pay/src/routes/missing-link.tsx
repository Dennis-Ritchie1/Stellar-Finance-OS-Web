import { EmptyState } from '@finance-os/ui';
import { Link2Off } from 'lucide-react';

export function MissingLinkPage() {
  return (
    <EmptyState
      icon={<Link2Off />}
      title="Invoice link needed"
      description="Open the payment link from the invoice you received to pay it."
    />
  );
}
