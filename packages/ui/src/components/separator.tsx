import * as React from 'react';
import { cn } from '../lib/utils';

export function Separator({ className, ...props }: React.ComponentProps<'hr'>) {
  return <hr data-slot="separator" className={cn('border-border', className)} {...props} />;
}
