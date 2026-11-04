import { Outlet } from 'react-router';

export function PayShell() {
  return (
    <div className="min-h-svh bg-muted/40">
      <main className="mx-auto w-full max-w-lg px-4 py-6 sm:py-10">
        <Outlet />
      </main>
      <footer className="pb-6 text-center text-xs text-muted-foreground">
        Secure payment on the Stellar network
      </footer>
    </div>
  );
}
