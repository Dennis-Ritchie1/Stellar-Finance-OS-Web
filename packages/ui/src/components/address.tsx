import * as React from 'react';
import { ExternalLink } from 'lucide-react';
import { explorerUrl, truncateAddress, type ExplorerEntity } from '@finance-os/utils';
import { cn } from '../lib/utils';
import { CopyButton } from './copy-button';

export interface AddressProps extends React.ComponentProps<'span'> {
  value: string;
  /** VITE_EXPLORER_URL for the current network. Omit to hide the explorer link. */
  explorerBaseUrl?: string;
  entity?: ExplorerEntity;
  /** Show the full value instead of `GABC…WXYZ`. */
  full?: boolean;
}

/** Stellar address/hash display: truncated, copyable, with a "View on explorer" link. */
export function Address({
  value,
  explorerBaseUrl,
  entity = 'account',
  full = false,
  className,
  ...props
}: AddressProps) {
  return (
    <span
      data-slot="address"
      className={cn('inline-flex items-center gap-1', className)}
      {...props}
    >
      <code title={value} className={cn('font-mono text-sm', full && 'break-all')}>
        {full ? value : truncateAddress(value)}
      </code>
      <CopyButton
        value={value}
        label="Copy address"
        variant="ghost"
        size="sm"
        className="h-7 px-2 [&>span]:sr-only"
      />
      {explorerBaseUrl ? (
        <a
          href={explorerUrl(explorerBaseUrl, entity, value)}
          target="_blank"
          rel="noreferrer"
          className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        >
          <ExternalLink className="size-4" />
          <span className="sr-only">View on explorer</span>
        </a>
      ) : null}
    </span>
  );
}
