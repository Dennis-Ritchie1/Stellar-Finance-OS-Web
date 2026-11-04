import { useState } from 'react';
import { Outlet } from 'react-router';
import { Button, Sheet, SheetContent, SheetTitle, SheetTrigger } from '@finance-os/ui';
import { Menu } from 'lucide-react';
import { NetworkBadge } from '../components/network-badge';
import { OrgSwitcher } from '../components/org-switcher';
import { UserMenu } from '../components/user-menu';
import { SidebarNav } from './sidebar-nav';

export function AppLayout() {
  const [navOpen, setNavOpen] = useState(false);

  return (
    <div className="flex min-h-svh">
      <aside className="sticky top-0 hidden h-svh w-60 shrink-0 flex-col gap-2 border-r border-sidebar-border bg-sidebar p-3 text-sidebar-foreground lg:flex">
        <div className="px-2 pt-1 pb-2 text-base font-semibold">Finance OS</div>
        <OrgSwitcher />
        <div className="flex-1 overflow-y-auto pt-2">
          <SidebarNav />
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:px-6">
          {/* Tablet and below: navigation lives in a drawer. */}
          <Sheet open={navOpen} onOpenChange={setNavOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                aria-label="Open navigation"
              >
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 bg-sidebar p-3">
              <SheetTitle className="px-2 pt-1 text-base">Finance OS</SheetTitle>
              <OrgSwitcher />
              <SidebarNav onNavigate={() => setNavOpen(false)} />
            </SheetContent>
          </Sheet>
          <div className="ml-auto flex items-center gap-2">
            <NetworkBadge />
            <UserMenu />
          </div>
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
