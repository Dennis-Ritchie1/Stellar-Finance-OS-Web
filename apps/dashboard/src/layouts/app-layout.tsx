import { NavLink, Outlet } from 'react-router';
import { cn } from '@finance-os/ui';
import { NAV_ITEMS } from './nav';

export function AppLayout() {
  return (
    <div className="flex min-h-svh">
      <aside className="sticky top-0 hidden h-svh w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground md:flex">
        <div className="flex h-14 items-center px-5 text-base font-semibold">Finance OS</div>
        <nav aria-label="Main" className="flex-1 space-y-0.5 overflow-y-auto px-3 py-2">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                  isActive && 'bg-sidebar-accent font-medium text-sidebar-accent-foreground',
                )
              }
            >
              <Icon className="size-4" />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Tablet: compact horizontal nav. Full mobile nav + org switcher come in task #3. */}
        <nav aria-label="Main" className="flex gap-1 overflow-x-auto border-b px-4 py-2 md:hidden">
          {NAV_ITEMS.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                cn('whitespace-nowrap rounded-md px-3 py-1.5 text-sm', isActive ? 'bg-accent font-medium' : 'text-muted-foreground')
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
        <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
