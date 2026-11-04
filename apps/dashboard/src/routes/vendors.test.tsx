import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { renderApp } from '../test/render';

const ADDRESS = 'GCJPBSAJ7JXSLUXIB2BU5YDYVMEG53GFFF5RTIQE5AAUBGXJT6CAABSK';

describe('vendors page', () => {
  it('lists vendors with their required memo', async () => {
    renderApp('/vendors', { as: 'viewer' });
    const row = (await screen.findByText('Nimbus Cloud')).closest('tr')!;
    expect(within(row).getByText('CLOUD-77')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /new vendor/i })).not.toBeInTheDocument();
  });

  it('validates the payout address and memo before saving', async () => {
    const user = userEvent.setup();
    renderApp('/vendors', { as: 'accountant' });
    await user.click(await screen.findByRole('button', { name: /new vendor/i }));
    const dialog = await screen.findByRole('dialog');
    await user.type(within(dialog).getByLabelText('Name'), 'Tailor Made');
    await user.type(within(dialog).getByLabelText('Payout address'), 'GBAD');
    await user.type(within(dialog).getByLabelText(/required memo/i), 'abc');
    await user.selectOptions(within(dialog).getByLabelText('Memo type'), 'id');
    await user.click(within(dialog).getByRole('button', { name: 'Add vendor' }));
    expect(await within(dialog).findByText('Enter a Stellar G-address')).toBeInTheDocument();
    expect(within(dialog).getByText(/not valid for the selected type/)).toBeInTheDocument();

    await user.clear(within(dialog).getByLabelText('Payout address'));
    await user.type(within(dialog).getByLabelText('Payout address'), ADDRESS);
    await user.clear(within(dialog).getByLabelText(/required memo/i));
    await user.type(within(dialog).getByLabelText(/required memo/i), '4242');
    await user.click(within(dialog).getByRole('button', { name: 'Add vendor' }));
    expect(await screen.findByText('Tailor Made')).toBeInTheDocument();
  });
});
