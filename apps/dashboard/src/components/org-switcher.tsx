import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@finance-os/ui';
import { Building2, ChevronsUpDown } from 'lucide-react';
import { useAuth } from '../auth/auth-context';
import { ROLE_LABELS } from '../auth/permissions';

export function OrgSwitcher() {
  const { memberships, membership, switchOrg } = useAuth();
  if (!membership) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-auto w-full justify-between px-3 py-2"
          aria-label="Switch organization"
        >
          <span className="flex min-w-0 items-center gap-2">
            <Building2 className="text-muted-foreground" />
            <span className="flex min-w-0 flex-col items-start">
              <span className="truncate text-sm font-semibold">{membership.orgName}</span>
              <span className="text-xs text-muted-foreground">{ROLE_LABELS[membership.role]}</span>
            </span>
          </span>
          <ChevronsUpDown className="text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel>Organizations</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={membership.orgId} onValueChange={switchOrg}>
          {memberships.map((m) => (
            <DropdownMenuRadioItem key={m.orgId} value={m.orgId}>
              {m.orgName}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
