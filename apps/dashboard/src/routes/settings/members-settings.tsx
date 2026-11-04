import { useState } from 'react';
import {
  useInviteMember,
  useMembers,
  useRemoveMember,
  useUpdateMemberRole,
  type Member,
  type Role,
} from '@finance-os/api-client';
import {
  Button,
  createDataTableColumns,
  DataTable,
  Field,
  Input,
  NativeSelect,
} from '@finance-os/ui';
import { useAuth } from '../../auth/auth-context';
import { ROLE_LABELS } from '../../auth/permissions';
import { usePermission } from '../../auth/use-permission';
import { FormError } from '../../components/forms/form-error';
import { QueryView } from '../../components/query-view';

const ROLES = Object.keys(ROLE_LABELS) as Role[];
const col = createDataTableColumns<Member>();

function InviteForm() {
  const invite = useInviteMember();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('accountant');
  const valid = /^\S+@\S+\.\S+$/.test(email);

  return (
    <form
      className="mb-6 grid gap-3 sm:grid-cols-[1fr_10rem_auto] sm:items-end"
      onSubmit={(e) => {
        e.preventDefault();
        if (valid) invite.mutate({ email, role }, { onSuccess: () => setEmail('') });
      }}
    >
      <Field label="Invite by email" htmlFor="invite-email">
        <Input
          id="invite-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </Field>
      <Field label="Role" htmlFor="invite-role">
        <NativeSelect
          id="invite-role"
          value={role}
          onChange={(e) => setRole(e.target.value as Role)}
        >
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {ROLE_LABELS[r]}
            </option>
          ))}
        </NativeSelect>
      </Field>
      <Button type="submit" disabled={!valid || invite.isPending}>
        {invite.isPending ? 'Inviting…' : 'Send invite'}
      </Button>
      <div className="sm:col-span-3">
        <FormError error={invite.error} />
      </div>
    </form>
  );
}

export function MembersSettingsPage() {
  const query = useMembers();
  const { user } = useAuth();
  const canManage = usePermission('settings:manage');
  const updateRole = useUpdateMemberRole();
  const remove = useRemoveMember();

  const columns = [
    col.accessor('name', {
      header: 'Name',
      sortFn: 'text',
      cell: ({ row }) => (
        <div>
          <p className="font-medium">
            {row.original.name}
            {row.original.userId === user?.id ? (
              <span className="text-muted-foreground"> (you)</span>
            ) : null}
          </p>
          <p className="text-sm text-muted-foreground">{row.original.email}</p>
        </div>
      ),
    }),
    col.accessor('status', {
      header: 'Status',
      cell: ({ getValue }) => (getValue() === 'invited' ? 'Invited' : 'Active'),
    }),
    col.accessor('role', {
      header: 'Role',
      cell: ({ row }) =>
        canManage ? (
          <NativeSelect
            aria-label={`Role for ${row.original.name}`}
            value={row.original.role}
            disabled={updateRole.isPending}
            onChange={(e) =>
              updateRole.mutate({ id: row.original.id, role: e.target.value as Role })
            }
            className="w-36"
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {ROLE_LABELS[r]}
              </option>
            ))}
          </NativeSelect>
        ) : (
          ROLE_LABELS[row.original.role]
        ),
    }),
    col.display({
      id: 'actions',
      header: () => <span className="sr-only">Actions</span>,
      meta: { className: 'w-0' },
      cell: ({ row }) =>
        canManage && row.original.userId !== user?.id ? (
          <Button
            variant="ghost"
            size="sm"
            disabled={remove.isPending}
            onClick={() => remove.mutate(row.original.id)}
            aria-label={`Remove ${row.original.name}`}
          >
            Remove
          </Button>
        ) : null,
    }),
  ];

  return (
    <>
      {canManage ? <InviteForm /> : null}
      <FormError error={updateRole.error ?? remove.error} />
      <QueryView query={query} resource="members">
        {(members) => (
          <DataTable aria-label="Members" columns={columns} data={members} getRowId={(m) => m.id} />
        )}
      </QueryView>
    </>
  );
}
