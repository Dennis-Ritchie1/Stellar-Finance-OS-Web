import { NavLink, Outlet } from 'react-router';
import { cn, PageHeader } from '@finance-os/ui';

const TABS = [
  { to: '/settings', label: 'Organization', end: true },
  { to: '/settings/members', label: 'Members & roles' },
  { to: '/settings/treasury', label: 'Treasury accounts' },
  { to: '/settings/policies', label: 'Approval policies' },
  { to: '/settings/wallet', label: 'Linked wallet' },
];

export function SettingsLayout() {
  return (
    <>
      <PageHeader title="Settings" description="Your organization, team and treasury setup." />
      <nav aria-label="Settings" className="mb-6 flex gap-1 overflow-x-auto border-b">
        {TABS.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            end={t.end}
            className={({ isActive }) =>
              cn(
                '-mb-px border-b-2 px-3 py-2 text-sm whitespace-nowrap transition-colors',
                isActive
                  ? 'border-primary font-medium text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground',
              )
            }
          >
            {t.label}
          </NavLink>
        ))}
      </nav>
      <Outlet />
    </>
  );
}
