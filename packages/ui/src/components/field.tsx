import * as React from 'react';
import { cn } from '../lib/utils';
import { Label } from './label';

export interface FieldProps extends React.ComponentProps<'div'> {
  label: React.ReactNode;
  htmlFor: string;
  hint?: React.ReactNode;
  error?: string;
}

/** Label + control + hint/error, wired up with ids for screen readers. */
export function Field({ label, htmlFor, hint, error, className, children, ...props }: FieldProps) {
  return (
    <div data-slot="field" className={cn('grid gap-2', className)} {...props}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error ? (
        <p id={`${htmlFor}-error`} role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : hint ? (
        <p id={`${htmlFor}-hint`} className="text-sm text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
