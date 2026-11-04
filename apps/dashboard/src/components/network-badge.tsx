import { networkLabel } from '@finance-os/wallet';
import { cn } from '@finance-os/ui';
import { env } from '../env';

/** Always-visible reminder of which Stellar network the app is pointed at. */
export function NetworkBadge() {
  const testnet = env.network === 'testnet';
  return (
    <span
      className={cn(
        'rounded-full border px-2.5 py-0.5 text-xs font-medium',
        testnet
          ? 'border-status-warning/40 bg-status-warning/10 text-status-warning'
          : 'border-status-success/40 bg-status-success/10 text-status-success',
      )}
    >
      {networkLabel(env.network)}
    </span>
  );
}
