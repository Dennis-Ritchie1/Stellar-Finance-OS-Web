import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateClient, useUpdateClient, type Client } from '@finance-os/api-client';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Field,
  Input,
  Textarea,
} from '@finance-os/ui';
import { isStellarAccountId } from '@finance-os/utils';
import { FormError } from '../../components/forms/form-error';

const schema = z.object({
  name: z.string().trim().min(1, 'Enter the client name'),
  email: z.email('Enter a valid email address'),
  senderAddresses: z
    .string()
    .transform((s) => s.split(/\s+/).filter(Boolean))
    .refine((list) => list.every(isStellarAccountId), 'Each address must be a Stellar G-address'),
});
type FormInput = z.input<typeof schema>;
type FormOutput = z.output<typeof schema>;

export function ClientFormDialog({
  open,
  onOpenChange,
  client,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Edit this client; omit to create. */
  client?: Client;
}) {
  const create = useCreateClient();
  const update = useUpdateClient(client?.id ?? '');
  const mutation = client ? update : create;
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormInput, unknown, FormOutput>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (open) {
      mutation.reset();
      reset({
        name: client?.name ?? '',
        email: client?.email ?? '',
        senderAddresses: client?.senderAddresses.join('\n') ?? '',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset only when the dialog opens
  }, [open, client]);

  const onSubmit = handleSubmit((values) =>
    mutation.mutate(values, { onSuccess: () => onOpenChange(false) }),
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{client ? 'Edit client' : 'New client'}</DialogTitle>
          <DialogDescription>
            Linked sender addresses help match payments that arrive without a memo.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} noValidate className="grid gap-4">
          <FormError error={mutation.error} />
          <Field label="Name" htmlFor="client-name" error={errors.name?.message}>
            <Input id="client-name" aria-invalid={!!errors.name} {...register('name')} />
          </Field>
          <Field label="Billing email" htmlFor="client-email" error={errors.email?.message}>
            <Input
              id="client-email"
              type="email"
              aria-invalid={!!errors.email}
              {...register('email')}
            />
          </Field>
          <Field
            label="Sender addresses (optional)"
            htmlFor="client-addresses"
            hint="One Stellar address per line."
            error={errors.senderAddresses?.message}
          >
            <Textarea
              id="client-addresses"
              rows={3}
              className="font-mono text-xs"
              aria-invalid={!!errors.senderAddresses}
              {...register('senderAddresses')}
            />
          </Field>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Saving…' : client ? 'Save changes' : 'Add client'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
