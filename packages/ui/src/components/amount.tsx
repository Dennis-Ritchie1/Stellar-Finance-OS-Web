import * as React from 'react';
import { formatAmount, type FormatAmountOptions } from '@finance-os/utils';
import { cn } from '../lib/utils';

export interface AmountProps extends React.ComponentProps<'span'>, FormatAmountOptions {
  /** Decimal string from the API — never a float. */
  value: string;
  assetCode: string;
}

/** Always shows the asset code next to the amount, e.g. "5,000.00 USDC". */
export function Amount({ value, assetCode, decimals, locale, className, ...props }: AmountProps) {
  return (
    <span data-slot="amount" className={cn('tabular-nums', className)} {...props}>
      {formatAmount(value, assetCode, { decimals, locale })}
    </span>
  );
}
