import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { renderApp } from './test/render';

describe('dashboard routes', () => {
  it('sends signed-out visitors to the login page', async () => {
    const { router } = renderApp('/invoices');
    expect(await screen.findByRole('heading', { name: 'Log in' })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/login');
  });

  it('logs in and returns to the page the user wanted', async () => {
    const user = userEvent.setup();
    const { router } = renderApp('/invoices');
    await user.type(await screen.findByLabelText('Email'), 'ada@acme.test');
    await user.type(screen.getByLabelText('Password'), 'password');
    await user.click(screen.getByRole('button', { name: 'Log in' }));
    expect(await screen.findByRole('heading', { name: 'Invoices' })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/invoices');
  });

  it('shows a server error for wrong credentials', async () => {
    const user = userEvent.setup();
    renderApp('/login');
    await user.type(await screen.findByLabelText('Email'), 'ada@acme.test');
    await user.type(screen.getByLabelText('Password'), 'wrong');
    await user.click(screen.getByRole('button', { name: 'Log in' }));
    expect(await screen.findByText('Email or password is incorrect.')).toBeInTheDocument();
  });

  it('validates the login form before calling the API', async () => {
    const user = userEvent.setup();
    renderApp('/login');
    await user.click(await screen.findByRole('button', { name: 'Log in' }));
    expect(await screen.findByText('Enter a valid email address')).toBeInTheDocument();
  });

  it('keeps signed-in users away from /login', async () => {
    renderApp('/login', { as: 'owner' });
    expect(await screen.findByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
  });

  it('shows not-found for unknown routes', async () => {
    renderApp('/nope', { as: 'owner' });
    expect(await screen.findByText('Page not found')).toBeInTheDocument();
  });
});
