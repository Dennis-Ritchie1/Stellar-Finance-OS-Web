import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useOrg, useUpdateOrg, type Org } from '@finance-os/api-client';
import {
  Alert,
  AlertDescription,
  Button,
  Card,
  CardContent,
  Field,
  Input,
  NativeSelect,
} from '@finance-os/ui';
import { CheckCircle2 } from 'lucide-react';
import { usePermission } from '../../auth/use-permission';
import { FormError } from '../../components/forms/form-error';
import { QueryView } from '../../components/query-view';

const schema = z.object({
  name: z.string().trim().min(1, 'Enter a display name'),
  legalName: z.string().trim(),
  defaultAssetCode: z.enum(['USDC', 'XLM']),
});
type Values = z.infer<typeof schema>;

function OrgForm({ org }: { org: Org }) {
  const canManage = usePermission('settings:manage');
  const update = useUpdateOrg();
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: org.name,
      legalName: org.legalName ?? '',
      defaultAssetCode: org.defaultAssetCode === 'XLM' ? 'XLM' : 'USDC',
    },
  });

  const onSubmit = handleSubmit((values) =>
    update.mutate(values, { onSuccess: (saved) => reset({ ...values, name: saved.name }) }),
  );

  return (
    <Card>
      <CardContent>
        <form onSubmit={onSubmit} noValidate className="grid max-w-lg gap-4">
          <FormError error={update.error} />
          {update.isSuccess && !isDirty ? (
            <Alert variant="success">
              <CheckCircle2 />
              <AlertDescription>Saved.</AlertDescription>
            </Alert>
          ) : null}
          <fieldset disabled={!canManage} className="grid gap-4">
            <Field label="Display name" htmlFor="org-name" error={errors.name?.message}>
              <Input id="org-name" aria-invalid={!!errors.name} {...register('name')} />
            </Field>
            <Field label="Legal name" htmlFor="org-legal" hint="Shown on invoices.">
              <Input id="org-legal" {...register('legalName')} />
            </Field>
            <Field label="Default currency" htmlFor="org-asset">
              <NativeSelect id="org-asset" {...register('defaultAssetCode')}>
                <option value="USDC">USDC</option>
                <option value="XLM">XLM</option>
              </NativeSelect>
            </Field>
          </fieldset>
          {canManage ? (
            <div>
              <Button type="submit" disabled={!isDirty || update.isPending}>
                {update.isPending ? 'Saving…' : 'Save changes'}
              </Button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Only owners and admins can change these settings.
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}

export function OrgSettingsPage() {
  const query = useOrg();
  return (
    <QueryView query={query} resource="organization settings">
      {(org) => <OrgForm org={org} />}
    </QueryView>
  );
}
