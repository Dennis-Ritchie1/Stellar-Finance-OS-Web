import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { describe, expect, it } from 'vitest';
import { Providers } from './providers';
import { routes } from './router';

function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  return render(
    <Providers>
      <RouterProvider router={router} />
    </Providers>,
  );
}

describe('dashboard routes', () => {
  it('renders the home screen inside the sidebar layout', async () => {
    renderAt('/');
    expect(await screen.findByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /new invoice/i })[0]).toHaveAttribute(
      'href',
      '/invoices/new',
    );
  });

  it('renders auth pages without the sidebar', async () => {
    renderAt('/login');
    expect(await screen.findByRole('heading', { name: 'Log in' })).toBeInTheDocument();
    expect(screen.queryByRole('navigation', { name: 'Main' })).not.toBeInTheDocument();
  });

  it('shows not-found for unknown routes', async () => {
    renderAt('/nope');
    expect(await screen.findByText('Page not found')).toBeInTheDocument();
  });
});
