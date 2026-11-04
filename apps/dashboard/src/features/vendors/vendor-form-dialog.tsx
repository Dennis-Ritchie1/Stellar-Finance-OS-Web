import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateVendor, useUpdateVendor, type Vendor } from '@finance-os/api-client';
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
  NativeSelect,
} from '@finance-os/ui';
import { isStellarAccountId, isValidMemo } from '@finance-os/utils';
import { FormError } from '../../components/forms/form-error';

const schema = z
  .object({
    name: z.string().trim().min(1, 'Enter the vendor name'),
    email: z.union([z.literal(''), z.email('Enter a valid email address')]),
    payoutAddress: z.string().trim().refine(isStellarAccountId, 'Enter a Stellar G-address'),
    requiredMemo: z.string().trim(),
    memoType: z.enum(['text', 'id', 'hash']),
  })
  .refine((v) => !v.requiredMemo || isValidMemo(v.requiredMemo, v.memoType), {
    path: ['requiredMemo'],
    message: 'This memo is not valid for the selected type',
  });
type Values = z.infer<typeof schema>;

export function VendorFormDialog({
  open,
  onOpenChange,
  vendor,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vendor?: Vendor;
}) {
  const create = useCreateVendor();
  const update = useUpdateVendor(vendor?.id ?? '');
  const mutation = vendor ? update : create;
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Values>({ resolver: zodResolver(schema) });
  const memo = useWatch({ control, name: 'requiredMemo' });

  useEffect(() => {
    if (open) {
      mutation.reset();
      reset({
        name: vendor?.name ?? '',
        email: vendor?.email ?? '',
        payoutAddress: vendor?.payoutAddress ?? '',
        requiredMemo: vendor?.requiredMemo ?? '',
        memoType: vendor?.memoType ?? 'text',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset only when the dialog opens
  }, [open, vendor]);

  const onSubmit = handleSubmit(({ requiredMemo, memoType, email, ...rest }) =>
    mutation.mutate(
      { ...rest, email: email || undefined, ...(requiredMemo ? { requiredMemo, memoType } : {}) },
      { onSuccess: () => onOpenChange(false) },
    ),
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{vendor ? 'Edit vendor' : 'New vendor'}</DialogTitle>
          <DialogDescription>Where payments to this vendor are sent.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} noValidate className="grid gap-4">
          <FormError error={mutation.error} />
          <Field label="Name" htmlFor="vendor-name" error={errors.name?.message}>
            <Input id="vendor-name" aria-invalid={!!errors.name} {...register('name')} />
          </Field>
          <Field label="Email (optional)" htmlFor="vendor-email" error={errors.email?.message}>
            <Input
              id="vendor-email"
              type="email"
              aria-invalid={!!errors.email}
              {...register('email')}
            />
          </Field>
          <Field
            label="Payout address"
            htmlFor="vendor-address"
            error={errors.payoutAddress?.message}
          >
            <Input
              id="vendor-address"
              className="font-mono text-xs"
              placeholder="G…"
              aria-invalid={!!errors.payoutAddress}
              {...register('payoutAddress')}
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-[1fr_8rem]">
            <Field
              label="Required memo (optional)"
              htmlFor="vendor-memo"
              hint="Exchanges often need one to credit the right account."
              error={errors.requiredMemo?.message}
            >
              <Input
                id="vendor-memo"
                aria-invalid={!!errors.requiredMemo}
                {...register('requiredMemo')}
              />
            </Field>
            <Field label="Memo type" htmlFor="vendor-memo-type">
              <NativeSelect id="vendor-memo-type" disabled={!memo} {...register('memoType')}>
                <option value="text">Text</option>
                <option value="id">ID</option>
                <option value="hash">Hash</option>
              </NativeSelect>
            </Field>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Saving…' : vendor ? 'Save changes' : 'Add vendor'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
