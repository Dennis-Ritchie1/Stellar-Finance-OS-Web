import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Address } from './address';
import { Amount } from './amount';

const G = 'GCHWRJPTFFVZWRMP2F5ZR5S7M6IXUDXCL4EMXHTWV2V3MJK4GJHZHHXS';

describe('Address', () => {
  it('truncates and links to the explorer', () => {
    render(<Address value={G} explorerBaseUrl="https://stellar.expert/explorer/testnet" />);
    expect(screen.getByText('GCHW…HHXS')).toHaveAttribute('title', G);
    expect(screen.getByRole('link', { name: 'View on explorer' })).toHaveAttribute(
      'href',
      `https://stellar.expert/explorer/testnet/account/${G}`,
    );
  });
});

describe('Amount', () => {
  it('formats with the asset code', () => {
    render(<Amount value="5000" assetCode="USDC" locale="en-US" />);
    expect(screen.getByText('5,000.00 USDC')).toBeInTheDocument();
  });
});
