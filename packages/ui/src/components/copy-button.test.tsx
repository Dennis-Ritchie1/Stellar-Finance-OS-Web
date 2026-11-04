import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { CopyButton } from './copy-button';

describe('CopyButton', () => {
  it('copies the value and confirms', async () => {
    const user = userEvent.setup();
    render(<CopyButton value="GABC" label="Copy address" />);
    await user.click(screen.getByRole('button', { name: 'Copy address' }));
    expect(await navigator.clipboard.readText()).toBe('GABC');
    expect(screen.getByText('Copied')).toBeInTheDocument();
  });
});
