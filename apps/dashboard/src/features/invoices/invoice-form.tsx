import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router';
import type { Client, InvoiceInput } from '@finance-os/api-client';
import { Button, Card, CardContent, Field, Input, NativeSelect, Textarea } from '@finance-os/ui';
import { FormError } from '../../components/forms/form-error';
import { LineItemsField } from './line-items-field';
import { invoiceFormSchema, toDueDateIso, type InvoiceFormValues } from './invoice-schema';

export interface InvoiceFormProps {
  clients: Client[];
  defaultValues: InvoiceFormValues;
  submitLabel: string;
  pending: boolean;
  error: unknown;
  cancelTo: string;
  onSubmit: (input: InvoiceInput) => void;
}

export function InvoiceForm({
  clients,
  defaultValues,
  submitLabel,
  pending,
  error,
  cancelTo,
  onSubmit,
}: InvoiceFormProps) {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<InvoiceFormValues>({ resolver: zodResolver(invoiceFormSchema), defaultValues });
  const assetCode = useWatch({ control, name: 'assetCode' });

  const submit = handleSubmit((values) =>
    onSubmit({ ...values, dueDate: toDueDateIso(values.dueDate) }),
  );

  return (
    <form onSubmit={submit} noValidate className="grid gap-6">
      <FormError error={error} />
      <Card>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <Field label="Client" htmlFor="clientId" error={errors.clientId?.message}>
            <NativeSelect id="clientId" aria-invalid={!!errors.clientId} {...register('clientId')}>
              <option value="">Choose a client…</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </NativeSelect>
          </Field>
          <Field label="Currency" htmlFor="assetCode" hint="Clients pay in this asset.">
            <NativeSelect id="assetCode" {...register('assetCode')}>
              <option value="USDC">USDC</option>
              <option value="XLM">XLM</option>
            </NativeSelect>
          </Field>
          <Field label="Due date" htmlFor="dueDate" error={errors.dueDate?.message}>
            <Input
              id="dueDate"
              type="date"
              aria-invalid={!!errors.dueDate}
              {...register('dueDate')}
            />
          </Field>
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <LineItemsField
            control={control}
            register={register}
            errors={errors}
            assetCode={assetCode}
          />
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <Field
            label="Notes (optional)"
            htmlFor="notes"
            error={errors.notes?.message}
            hint="Shown to your client on the invoice."
          >
            <Textarea id="notes" rows={3} {...register('notes')} />
          </Field>
        </CardContent>
      </Card>
      <div className="flex justify-end gap-2">
        <Button asChild variant="outline">
          <Link to={cancelTo}>Cancel</Link>
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? 'Saving…' : submitLabel}
        </Button>
      </div>
    </form>
  );
}
