import * as React from 'react';
import { Check, Copy } from 'lucide-react';
import { Button, type ButtonProps } from './button';

export interface CopyButtonProps extends Omit<ButtonProps, 'onClick' | 'children'> {
  value: string;
  /** Accessible label, e.g. "Copy address". */
  label?: string;
}

export function CopyButton({ value, label = 'Copy', variant = 'outline', size = 'sm', ...props }: CopyButtonProps) {
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(t);
  }, [copied]);

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      aria-label={label}
      onClick={async () => {
        await navigator.clipboard.writeText(value);
        setCopied(true);
      }}
      {...props}
    >
      {copied ? <Check /> : <Copy />}
      {copied ? 'Copied' : 'Copy'}
    </Button>
  );
}
