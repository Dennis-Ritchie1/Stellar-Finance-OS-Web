import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { renderApp } from '../test/render';
import { db } from '../test/server';

async function approveAs(who: 'approver' | 'approver2', vendor: string) {
  const user = userEvent.setup();
  const view = renderApp('/approvals', { as: who });
  const card = (await screen.findByText(new RegExp(`to ${vendor}`))).closest('li')!;
  await user.click(within(card).getByRole('button', { name: 'Approve' }));
  const dialog = await screen.findByRole('dialog');
  await user.type(within(dialog).getByLabelText(/comment/i), 'Looks right');
  await user.click(within(dialog).getByRole('button', { name: 'Approve' }));
  await screen.findByText("You're all caught up");
  view.unmount();
}

describe('payment requests and approvals', () => {
  it('goes from request → 2 approvals → approved', async () => {
    const user = userEvent.setup();
    const view = renderApp('/payments/outgoing', { as: 'accountant' });
    await user.click(await screen.findByRole('button', { name: /new payment request/i }));
    const dialog = await screen.findByRole('dialog');
    await user.selectOptions(within(dialog).getByLabelText('Vendor'), 'Pixel Print Co.');
    await user.type(within(dialog).getByLabelText('Amount'), '7200');
    await user.selectOptions(within(dialog).getByLabelText('Pay from'), 'Operating');
    await user.type(within(dialog).getByLabelText(/what is it for/i), 'Trade show booth');
    await user.click(within(dialog).getByRole('button', { name: 'Request approval' }));
    const row = (await screen.findByText('Trade show booth')).closest('tr')!;
    expect(within(row).getByText('Awaiting approval')).toBeInTheDocument();
    view.unmount();

    // Ben has other requests in his inbox too; approve the new one, then clear the rest.
    const created = db.paymentRequests.find((p) => p.description === 'Trade show booth')!;
    expect(created.requiredApprovals).toBe(2);
    db.paymentRequests = db.paymentRequests.filter(
      (p) => p === created || p.status !== 'pending_approval',
    );

    await approveAs('approver', 'Pixel Print Co.');
    expect(created.status).toBe('pending_approval');
    await approveAs('approver2', 'Pixel Print Co.');
    expect(created.status).toBe('approved');

    renderApp(`/payments/outgoing?request=${created.id}`, { as: 'accountant' });
    const drawer = await screen.findByRole('dialog');
    expect(await within(drawer).findByText('Approvals · 2 of 2')).toBeInTheDocument();
    expect(within(drawer).getByText('Approved')).toBeInTheDocument();
  });

  it('requires a reason to reject', async () => {
    const user = userEvent.setup();
    renderApp('/approvals', { as: 'approver2' });
    const card = (await screen.findByText(/to Okafor & Partners/)).closest('li')!;
    await user.click(within(card).getByRole('button', { name: 'Reject' }));
    const dialog = await screen.findByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: 'Reject' }));
    expect(await within(dialog).findByText('Tell the requester why')).toBeInTheDocument();
    await user.type(within(dialog).getByLabelText('Reason'), 'Not in budget');
    await user.click(within(dialog).getByRole('button', { name: 'Reject' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(screen.queryByText(/to Okafor & Partners/)).not.toBeInTheDocument();
    expect(db.paymentRequests.find((p) => p.id === 'pr_1')!.status).toBe('rejected');
  });

  it('shows an empty inbox to roles that cannot approve', async () => {
    renderApp('/approvals', { as: 'viewer' });
    expect(await screen.findByText("You're all caught up")).toBeInTheDocument();
  });
});
