import { useState } from 'react';
import {
  useApprovalPolicies,
  useCreateApprovalPolicy,
  useDeleteApprovalPolicy,
  type Role,
} from '@finance-os/api-client';
import {
  Amount,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  EmptyState,
  Field,
  Input,
  NativeSelect,
} from '@finance-os/ui';
import { isValidAmount } from '@finance-os/utils';
import { ShieldCheck } from 'lucide-react';
import { ROLE_LABELS } from '../../auth/permissions';
import { usePermission } from '../../auth/use-permission';
import { FormError } from '../../components/forms/form-error';
import { QueryView } from '../../components/query-view';

const APPROVER_ROLES: Role[] = ['owner', 'admin', 'approver'];

function NewPolicyForm() {
  const create = useCreateApprovalPolicy();
  const [name, setName] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [requiredApprovals, setRequired] = useState('1');
  const valid = name.trim() && (minAmount === '0' || isValidAmount(minAmount));

  return (
    <Card>
      <CardHeader>
        <CardTitle>New policy</CardTitle>
        <CardDescription>
          Payments at or above the threshold need this many approvals.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="grid gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!valid) return;
            create.mutate(
              {
                name: name.trim(),
                assetCode: 'USDC',
                minAmount,
                requiredApprovals: Number(requiredApprovals),
                approverRoles: APPROVER_ROLES,
              },
              { onSuccess: () => (setName(''), setMinAmount('')) },
            );
          }}
        >
          <FormError error={create.error} />
          <Field label="Policy name" htmlFor="pol-name">
            <Input id="pol-name" value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Applies from (USDC)" htmlFor="pol-min">
              <Input
                id="pol-min"
                inputMode="decimal"
                value={minAmount}
                onChange={(e) => setMinAmount(e.target.value)}
              />
            </Field>
            <Field label="Approvals needed" htmlFor="pol-count">
              <NativeSelect
                id="pol-count"
                value={requiredApprovals}
                onChange={(e) => setRequired(e.target.value)}
              >
                {[1, 2, 3].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </NativeSelect>
            </Field>
          </div>
          <div>
            <Button type="submit" disabled={!valid || create.isPending}>
              Add policy
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export function PoliciesSettingsPage() {
  const query = useApprovalPolicies();
  const remove = useDeleteApprovalPolicy();
  const canManage = usePermission('settings:manage');

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <QueryView
        query={query}
        resource="approval policies"
        isEmpty={(p) => p.length === 0}
        empty={
          <EmptyState
            icon={<ShieldCheck />}
            title="No approval policies"
            description="Every payment needs one owner or admin approval."
          />
        }
      >
        {(policies) => (
          <ul className="grid content-start gap-3" aria-label="Approval policies">
            {policies.map((p) => (
              <li key={p.id}>
                <Card className="gap-2 py-4">
                  <CardContent className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-medium">{p.name}</p>
                      <p className="text-sm text-muted-foreground">
                        From <Amount value={p.minAmount} assetCode={p.assetCode} /> ·{' '}
                        {p.requiredApprovals} {p.requiredApprovals === 1 ? 'approval' : 'approvals'}{' '}
                        by {p.approverRoles.map((r) => ROLE_LABELS[r]).join(', ')}
                      </p>
                    </div>
                    {canManage ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={remove.isPending}
                        onClick={() => remove.mutate(p.id)}
                      >
                        Delete
                      </Button>
                    ) : null}
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </QueryView>
      {canManage ? <NewPolicyForm /> : null}
    </div>
  );
}
