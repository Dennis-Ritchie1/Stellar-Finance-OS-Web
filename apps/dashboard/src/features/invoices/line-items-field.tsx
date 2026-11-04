import {
  useFieldArray,
  useWatch,
  type Control,
  type FieldErrors,
  type UseFormRegister,
} from 'react-hook-form';
import { Button, Input, Label } from '@finance-os/ui';
import { formatAmount, multiplyDecimals, sumDecimals } from '@finance-os/utils';
import { Plus, Trash2 } from 'lucide-react';
import { emptyLineItem, type InvoiceFormValues } from './invoice-schema';

export function LineItemsField({
  control,
  register,
  errors,
  assetCode,
}: {
  control: Control<InvoiceFormValues>;
  register: UseFormRegister<InvoiceFormValues>;
  errors: FieldErrors<InvoiceFormValues>;
  assetCode: string;
}) {
  const { fields, append, remove } = useFieldArray({ control, name: 'lineItems' });
  const items = useWatch({ control, name: 'lineItems' }) ?? [];
  const lineTotals = items.map((i) => multiplyDecimals(i?.quantity ?? '', i?.unitPrice ?? ''));

  return (
    <fieldset className="grid gap-3">
      <legend className="mb-2 text-sm font-medium">Line items</legend>
      <div className="hidden grid-cols-[1fr_6rem_8rem_8rem_2.25rem] gap-2 text-xs font-medium text-muted-foreground sm:grid">
        <span>Description</span>
        <span>Qty</span>
        <span>Unit price</span>
        <span className="text-right">Line total</span>
      </div>
      {fields.map((field, index) => {
        const e = errors.lineItems?.[index];
        return (
          <div
            key={field.id}
            className="grid grid-cols-2 gap-2 rounded-lg border p-3 sm:grid-cols-[1fr_6rem_8rem_8rem_2.25rem] sm:border-0 sm:p-0"
          >
            <div className="col-span-2 sm:col-span-1">
              <Label htmlFor={`li-${index}-description`} className="sr-only">
                Description for line {index + 1}
              </Label>
              <Input
                id={`li-${index}-description`}
                placeholder="Description"
                aria-invalid={!!e?.description}
                {...register(`lineItems.${index}.description`)}
              />
            </div>
            <div>
              <Label htmlFor={`li-${index}-quantity`} className="sr-only">
                Quantity for line {index + 1}
              </Label>
              <Input
                id={`li-${index}-quantity`}
                inputMode="decimal"
                aria-invalid={!!e?.quantity}
                {...register(`lineItems.${index}.quantity`)}
              />
            </div>
            <div>
              <Label htmlFor={`li-${index}-unitPrice`} className="sr-only">
                Unit price for line {index + 1}
              </Label>
              <Input
                id={`li-${index}-unitPrice`}
                inputMode="decimal"
                placeholder="0.00"
                aria-invalid={!!e?.unitPrice}
                {...register(`lineItems.${index}.unitPrice`)}
              />
            </div>
            <div className="flex items-center justify-end text-sm tabular-nums">
              {lineTotals[index] ? formatAmount(lineTotals[index]!, assetCode) : '—'}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={`Remove line ${index + 1}`}
              disabled={fields.length === 1}
              onClick={() => remove(index)}
            >
              <Trash2 />
            </Button>
            {e ? (
              <p role="alert" className="col-span-full text-sm text-destructive">
                {e.description?.message ?? e.quantity?.message ?? e.unitPrice?.message}
              </p>
            ) : null}
          </div>
        );
      })}
      {errors.lineItems?.root?.message ? (
        <p role="alert" className="text-sm text-destructive">
          {errors.lineItems.root.message}
        </p>
      ) : null}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append({ ...emptyLineItem })}
        >
          <Plus /> Add line
        </Button>
        <p className="text-sm">
          <span className="text-muted-foreground">Estimated total </span>
          <span className="font-semibold tabular-nums">
            {formatAmount(sumDecimals(lineTotals), assetCode)}
          </span>
        </p>
      </div>
      <p className="text-xs text-muted-foreground">
        The final amount is calculated by Finance OS when you save.
      </p>
    </fieldset>
  );
}
