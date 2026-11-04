import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateTreasuryAccount, useTreasuryAccounts } from '@finance-os/api-client';
import { Button, Card, CardContent, CardHeader, CardTitle, Field, Input } from '@finance-os/ui';
import { isStellarAccountId } from '@finance-os/utils';
import { usePermission } from '../../auth/use-permission';
import { FormError } from '../../components/forms/form-error';
import { QueryView } from '../../components/query-view';
import { TreasuryCard } from '../../features/dashboard/treasury-card';

const schema = z.object({
  name: z.string().trim().min(1, 'Name the account'),
  address: z.string().trim().refine(isStellarAccountId, 'Enter a Stellar G-address'),
});
type Values = z.infer<typeof schema>;

function AddAccountForm() {
  const create = useCreateTreasuryAccount();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { name: '', address: '' } });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add a treasury account</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          noValidate
          className="grid gap-4"
          onSubmit={handleSubmit((values) => create.mutate(values, { onSuccess: () => reset() }))}
        >
          <FormError error={create.error} />
          <Field label="Account name" htmlFor="ta-name" error={errors.name?.message}>
            <Input id="ta-name" aria-invalid={!!errors.name} {...register('name')} />
          </Field>
          <Field
            label="Stellar address"
            htmlFor="ta-address"
            hint="Public address only. Finance OS never asks for secret keys."
            error={errors.address?.message}
          >
            <Input
              id="ta-address"
              className="font-mono text-xs"
              aria-invalid={!!errors.address}
              {...register('address')}
            />
          </Field>
          <div>
            <Button type="submit" disabled={create.isPending}>
              {create.isPending ? 'Adding…' : 'Add account'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export function TreasurySettingsPage() {
  const query = useTreasuryAccounts();
  const canManage = usePermission('settings:manage');
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <QueryView query={query} resource="treasury accounts">
        {(accounts) => <TreasuryCard accounts={accounts} />}
      </QueryView>
      {canManage ? <AddAccountForm /> : null}
    </div>
  );
}
