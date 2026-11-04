import * as React from 'react';
import { cn } from '../lib/utils';

export function Spinner({ className, label = 'Loading', ...props }: React.ComponentProps<'div'> & { label?: string }) {
  return (
    <div role="status" aria-live="polite" className={cn('flex items-center justify-center py-12', className)} {...props}>
      <span className="size-6 animate-spin rounded-full border-2 border-muted border-t-primary" />
      <span className="sr-only">{label}</span>
    </div>
  );
}
