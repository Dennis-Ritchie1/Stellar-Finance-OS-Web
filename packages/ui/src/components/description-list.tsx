import * as React from 'react';
import { cn } from '../lib/utils';

export interface DescriptionItem {
  label: React.ReactNode;
  value: React.ReactNode;
}

/** Label/value pairs, e.g. a transaction summary before signing. */
export function DescriptionList({
  items,
  className,
  ...props
}: React.ComponentProps<'dl'> & { items: DescriptionItem[] }) {
  return (
    <dl
      data-slot="description-list"
      className={cn('divide-y rounded-lg border text-sm', className)}
      {...props}
    >
      {items.map((item, i) => (
        <div
          key={i}
          className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-2.5"
        >
          <dt className="text-muted-foreground">{item.label}</dt>
          <dd className="min-w-0 text-right font-medium">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
